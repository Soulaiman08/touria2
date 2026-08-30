import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { signOrderAccessToken } from '@/lib/auth'
import { isValidMoroccanPhone } from '@/lib/utils'

// Secure cross-device Guest Order Tracking.
//
// A guest who created an order on one device can track it from another by
// providing BOTH the order number and the phone used at checkout. Verification
// happens entirely server-side:
//   1. Resolve the order by order number.
//   2. Read the phone actually stored on the order.
//   3. Canonicalize both the input and the stored phone with the same rule used
//      at checkout (+212... <-> 0...).
//   4. Only on a match are order details returned and a short-lived access
//      cookie granted for that specific order.
//
// Security:
//  - Non-revealing: an unknown order, a phone mismatch, a malformed request and
//    rate-limit exhaustion all return the exact same generic 404, so an attacker
//    cannot tell whether the order exists or whether the phone was correct.
//  - Order number alone or phone alone is never enough.
//  - Rate limited per IP to slow brute forcing.
//  - Reuses the existing signed order_access_<orderId> cookie so we keep one
//    access mechanism instead of duplicating systems.
//  - The granted token binds the order id and an expiry and is verified for that
//    exact order; it cannot be used for any other order.
//
// NOTE: in-memory limiter (fine for a single server). On Vercel serverless it is
// per-instance, so orderNumber + phone matching is the real security boundary.

const LIMIT = 5
const WINDOW_MS = 15 * 60 * 1000
const TRACKING_SESSION_SECONDS = 86400 // 24h, then re-verification is required
const attempts = new Map<string, { count: number; resetAt: number }>()

function canonicalPhone(phone: string): string {
  let p = phone.replace(/[\s\-().]/g, '')
  if (p.startsWith('+212')) p = '0' + p.slice(4)
  return p
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local'
  )
}

export async function POST(request: Request) {
  let status = 404
  let payload: { error: string } = { error: 'ORDER_NOT_FOUND' }

  try {
    let body: { orderNumber?: unknown; phone?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(payload, { status })
    }

    const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim().toUpperCase() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''

    // Malformed requests get the same generic error as a real mismatch.
    if (!orderNumber || !phone || !isValidMoroccanPhone(phone)) {
      return NextResponse.json(payload, { status })
    }

    // Rate limiting (non-revealing — same generic error regardless of reason).
    const ip = getClientIp(request)
    const now = Date.now()
    let entry = attempts.get(ip)
    if (entry && now < entry.resetAt && entry.count >= LIMIT) {
      return NextResponse.json(payload, { status })
    }
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + WINDOW_MS }
      attempts.set(ip, entry)
    }

    // Resolve by order number (or raw id, mirroring the existing lookup).
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderNumber }, { orderNumber }] },
      select: { id: true, customerPhone: true, customerPhone2: true },
    })

    const canonicalInput = canonicalPhone(phone)
    const phoneMatches =
      !!order &&
      (canonicalPhone(order.customerPhone || '') === canonicalInput ||
        (!!order.customerPhone2 && canonicalPhone(order.customerPhone2) === canonicalInput))

    // Count every attempted verification; unknown order and mismatch are
    // indistinguishable to the caller.
    entry.count += 1

    if (!order || !phoneMatches) {
      return NextResponse.json(payload, { status })
    }

    // Grant a short-lived access session bound to this exact order only.
    const token = signOrderAccessToken(order.id, TRACKING_SESSION_SECONDS)
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === 'production'
    const response = NextResponse.json({ order })
    response.cookies.set(`order_access_${order.id}`, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: TRACKING_SESSION_SECONDS,
    })
    return response
  } catch (error) {
    console.error('[ORDERS] Guest tracking verification failed:', error instanceof Error ? error.message : 'unknown')
    // Infrastructure failure must stay a 503, not become "order not found".
    return NextResponse.json({ error: 'UNAVAILABLE' }, { status: 503 })
  }
}

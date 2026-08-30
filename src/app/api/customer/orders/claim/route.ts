import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCustomer } from '@/lib/customer-auth'
import { isValidMoroccanPhone } from '@/lib/utils'

// Strict, server-side Guest Order Claim.
//
// Rules:
//  - Only an authenticated customer may claim (customer_token + getCurrentCustomer).
//  - Requires BOTH orderNumber and the matching order phone. Never name-only,
//    never orderNumber-only, never phone-only.
//  - Responses are non-revealing: an unknown order and a phone mismatch return
//    the exact same generic error (we do not leak whether an order exists).
//  - Rate limited per IP to slow brute-forcing.
//  - Only guest orders (customerId = null) can be claimed. Owner can never be
//    overwritten: if the order already belongs to another customer the request
//    fails exactly like a mismatch.
//
// NOTE: This is an in-memory limiter (fine for a single server). On Vercel's
// serverless it is per-instance, so phone verification is the real security
// boundary. An SMS OTP would strengthen it but requires an SMS provider.

const CLAIM_LIMIT = 5
const CLAIM_WINDOW_MS = 15 * 60 * 1000
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
  const auth = await requireCustomer()
  if (!auth.ok) return auth.response

  try {
    let body: { orderNumber?: unknown; phone?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim().toUpperCase() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''

    if (!orderNumber || !phone || !isValidMoroccanPhone(phone)) {
      return NextResponse.json({ error: 'UNVERIFIED' }, { status: 400 })
    }

    // Rate limiting (non-revealing — same error regardless of the reason).
    const ip = getClientIp(request)
    const now = Date.now()
    const entry = attempts.get(ip)
    if (entry && now < entry.resetAt && entry.count >= CLAIM_LIMIT) {
      return NextResponse.json({ error: 'UNVERIFIED' }, { status: 400 })
    }
    if (!entry || now >= entry.resetAt) {
      attempts.set(ip, { count: 0, resetAt: now + CLAIM_WINDOW_MS })
    }

    // Resolve the guest order by orderNumber only (customerId must be null).
    const order = await prisma.order.findFirst({
      where: { orderNumber, customerId: null },
      select: { id: true, customerPhone: true, customerPhone2: true, customerId: true },
    })

    const canonicalInput = canonicalPhone(phone)
    const phoneMatches =
      !!order &&
      (canonicalPhone(order.customerPhone || '') === canonicalInput ||
        (!!order.customerPhone2 && canonicalPhone(order.customerPhone2) === canonicalInput))

    // Count every attempted verification, and treat unknown order and mismatch
    // identically so an attacker can't tell them apart.
    const cur = attempts.get(ip)
    if (cur) cur.count += 1

    if (!order || !phoneMatches) {
      return NextResponse.json({ error: 'UNVERIFIED' }, { status: 400 })
    }

    // Idempotent: already owned by this customer → success without changes.
    if (order.customerId === auth.customer.id) {
      return NextResponse.json({ success: true, alreadyLinked: true })
    }

    // By construction order.customerId is null here (see the findFirst above),
    // so this can never overwrite another customer's ownership.
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { customerId: auth.customer.id },
      })
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          note: 'Guest order claimed by account',
        },
      })
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error('[CUSTOMER_ORDERS] Claim failed:', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'UNAVAILABLE' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { signCustomerToken, CUSTOMER_COOKIE_NAME, customerCookieOptions } from '@/lib/customer-auth'

const attempts = new Map<string, { count: number; resetAt: number }>()
const SAFE_LOGIN_ERROR = 'Unable to sign in. Please try again.'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password || email.trim().length > 254 || password.length > 200) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const cleanEmail = email.trim().toLowerCase()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const attempt = attempts.get(ip)
  if (attempt && attempt.resetAt > now && attempt.count >= 10) {
    return NextResponse.json({ error: 'Too many login attempts' }, { status: 429, headers: { 'Retry-After': '900' } })
  }
  if (!attempt || attempt.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
  else attempt.count += 1

  let customer: { id: string; name: string; email: string | null; passwordHash: string | null; phone: string | null; avatarUrl: string | null } | null = null
  try {
    customer = await prisma.customer.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true, passwordHash: true, phone: true, avatarUrl: true },
    })
  } catch (e) {
    console.error('[CUSTOMER_AUTH] Database connection failed:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: SAFE_LOGIN_ERROR }, { status: 503 })
  }

  if (!customer || !customer.passwordHash || !verifyPassword(password, customer.passwordHash)) {
    console.warn('[CUSTOMER_AUTH] Login failed for email:', cleanEmail)
    return NextResponse.json({ error: SAFE_LOGIN_ERROR }, { status: 401 })
  }

  const token = signCustomerToken({ id: customer.id, email: customer.email ?? cleanEmail, name: customer.name })

  const response = NextResponse.json({
    success: true,
    user: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      avatarUrl: customer.avatarUrl,
    },
  })
  response.cookies.set(CUSTOMER_COOKIE_NAME, token, customerCookieOptions())
  response.headers.set('Cache-Control', 'no-store')
  return response
}
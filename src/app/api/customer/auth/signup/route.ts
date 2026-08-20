import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { signCustomerToken, CUSTOMER_COOKIE_NAME, customerCookieOptions } from '@/lib/customer-auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, email, password, confirmPassword } = (body ?? {}) as Record<string, unknown>

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return NextResponse.json({ error: 'Name must be between 2 and 100 characters' }, { status: 400 })
  }
  if (typeof email !== 'string' || email.trim().length > 254 || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 200) {
    return NextResponse.json({ error: 'Password must be between 8 and 200 characters' }, { status: 400 })
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
  }

  const cleanEmail = email.trim().toLowerCase()

  let existing: { id: string } | null = null
  try {
    existing = await prisma.customer.findUnique({ where: { email: cleanEmail }, select: { id: true } })
  } catch (e) {
    console.error('[CUSTOMER_AUTH] Database connection failed:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: 'Unable to create account. Please try again.' }, { status: 503 })
  }
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  let customer: { id: string; name: string; email: string | null; phone: string | null; avatarUrl: string | null; createdAt: Date }
  try {
    customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash: hashPassword(password),
      },
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true, createdAt: true },
    })
  } catch (e) {
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    console.error('[CUSTOMER_AUTH] Signup failed:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: 'Unable to create account. Please try again.' }, { status: 500 })
  }

  const token = signCustomerToken({ id: customer.id, email: customer.email ?? cleanEmail, name: customer.name })

  const response = NextResponse.json({ success: true, user: customer })
  response.cookies.set(CUSTOMER_COOKIE_NAME, token, customerCookieOptions())
  response.headers.set('Cache-Control', 'no-store')
  return response
}
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthDatabaseUnavailableError } from '@/lib/auth'

export const CUSTOMER_COOKIE_NAME = 'customer_token'

function getCustomerJwtSecret(): string {
  const secret = process.env.CUSTOMER_JWT_SECRET
  if (!secret) {
    throw new Error('CUSTOMER_JWT_SECRET is not set. Configure it in your environment variables.')
  }
  if (secret.length < 32) {
    throw new Error('CUSTOMER_JWT_SECRET must be at least 32 characters.')
  }
  return secret
}

export interface CustomerJwtPayload {
  id: string
  email: string
  name: string
  exp: number
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return Buffer.from(base64, 'base64').toString('utf-8')
}

export function signCustomerToken(payload: { id: string; email: string; name: string }, expiresInSeconds = 86400 * 30): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: CustomerJwtPayload = {
    ...payload,
    exp: now + expiresInSeconds,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))
  const data = `${encodedHeader}.${encodedPayload}`

  const signature = crypto
    .createHmac('sha256', getCustomerJwtSecret())
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${data}.${signature}`
}

export function verifyCustomerToken(token: string): CustomerJwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, signature] = parts
    const data = `${encodedHeader}.${encodedPayload}`

    const expectedSignature = crypto
      .createHmac('sha256', getCustomerJwtSecret())
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    const provided = Buffer.from(signature)
    const expected = Buffer.from(expectedSignature)
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) return null

    const payload: CustomerJwtPayload = JSON.parse(base64UrlDecode(encodedPayload))
    const now = Math.floor(Date.now() / 1000)
    if (!payload.id || !payload.email || !Number.isFinite(payload.exp) || payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}

export async function getCustomerFromCookie(): Promise<CustomerJwtPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value
    if (!token) return null
    return verifyCustomerToken(token)
  } catch {
    return null
  }
}

export async function getCurrentCustomer() {
  const payload = await getCustomerFromCookie()
  if (!payload) return null

  let customer
  try {
    customer = await prisma.customer.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    })
  } catch {
    throw new AuthDatabaseUnavailableError()
  }
  if (!customer || !customer.email || customer.email.toLowerCase() !== payload.email.toLowerCase()) return null
  return customer
}

export async function requireCustomer() {
  try {
    const customer = await getCurrentCustomer()
    if (!customer) {
      return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    return { ok: true as const, customer }
  } catch (error) {
    if (error instanceof AuthDatabaseUnavailableError) {
      return { ok: false as const, response: NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 }) }
    }
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
}

export function customerCookieOptions(maxAgeSeconds = 86400 * 30) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: maxAgeSeconds,
    path: '/',
  }
}
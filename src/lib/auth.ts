import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const COOKIE_NAME = 'admin_token'

function getJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) {
    throw new AuthConfigurationError('ADMIN_JWT_SECRET is not set. Configure it in your environment variables.')
  }
  if (secret.length < 32) {
    throw new AuthConfigurationError('ADMIN_JWT_SECRET must be at least 32 characters.')
  }
  return secret
}

export interface AdminJwtPayload {
  id: string
  email: string
  name: string
  role: string
  exp: number
}

export class AuthDatabaseUnavailableError extends Error {
  constructor() {
    super('Authentication database lookup unavailable')
    this.name = 'AuthDatabaseUnavailableError'
  }
}

export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthConfigurationError'
  }
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

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, originalHash] = combinedHash.split(':')
    if (!salt || !originalHash) return false
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'))
  } catch {
    return false
  }
}

export function signAdminToken(payload: { id: string; email: string; name: string; role: string }, expiresInSeconds = 86400 * 7): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: AdminJwtPayload = {
    ...payload,
    exp: now + expiresInSeconds,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))
  const data = `${encodedHeader}.${encodedPayload}`

  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${data}.${signature}`
}

export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, signature] = parts
    const data = `${encodedHeader}.${encodedPayload}`

    const expectedSignature = crypto
      .createHmac('sha256', getJwtSecret())
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    const provided = Buffer.from(signature)
    const expected = Buffer.from(expectedSignature)
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) return null

    const payload: AdminJwtPayload = JSON.parse(base64UrlDecode(encodedPayload))
    const now = Math.floor(Date.now() / 1000)
    if (!payload.id || !payload.email || !payload.role || !Number.isFinite(payload.exp) || payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}

export async function getCurrentAdmin() {
  const payload = await getAdminFromCookie()
  if (!payload) return null

  let admin
  try {
    admin = await prisma.adminUser.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, role: true, avatar: true },
    })
  } catch {
    throw new AuthDatabaseUnavailableError()
  }
  if (!admin || admin.email.toLowerCase() !== payload.email.toLowerCase()) return null
  return admin
}

export async function requireAdmin(allowedRoles?: string[]) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    if (allowedRoles && !allowedRoles.includes(admin.role.toUpperCase())) {
      return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }
    return { ok: true as const, admin }
  } catch (error) {
    if (error instanceof AuthDatabaseUnavailableError) {
      return { ok: false as const, response: NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 }) }
    }
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
}

export function signOrderAccessToken(orderId: string, expiresInSeconds = 86400 * 30): string {
  const payload = `${orderId}.${Math.floor(Date.now() / 1000) + expiresInSeconds}`
  const encoded = base64UrlEncode(payload)
  const signature = crypto.createHmac('sha256', getJwtSecret()).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

export function verifyOrderAccessToken(token: string, orderId: string): boolean {
  try {
    const [encoded, signature] = token.split('.')
    if (!encoded || !signature) return false
    const expected = crypto.createHmac('sha256', getJwtSecret()).update(encoded).digest('base64url')
    const providedBytes = Buffer.from(signature)
    const expectedBytes = Buffer.from(expected)
    if (providedBytes.length !== expectedBytes.length || !crypto.timingSafeEqual(providedBytes, expectedBytes)) return false
    const [tokenOrderId, expiry] = base64UrlDecode(encoded).split('.')
    return tokenOrderId === orderId && Number(expiry) >= Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export async function getAdminFromCookie(): Promise<AdminJwtPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyAdminToken(token)
  } catch {
    return null
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signAdminToken, COOKIE_NAME, AuthConfigurationError } from '@/lib/auth'

const attempts = new Map<string, { count: number; resetAt: number }>()
const SAFE_LOGIN_ERROR = 'Unable to sign in. Please try again.'
const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER', 'STAFF', 'STAFF MEMBER'])

function hasJwtSecretConfigured(): boolean {
  const secret = process.env.ADMIN_JWT_SECRET
  return typeof secret === 'string' && secret.length >= 32
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password || email.length > 254 || password.length > 200) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!hasJwtSecretConfigured()) {
      console.error('[ADMIN_AUTH] ADMIN_JWT_SECRET is not configured. Set it in Vercel environment variables (Production).')
      return NextResponse.json({ error: SAFE_LOGIN_ERROR }, { status: 503 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const now = Date.now()
    const attempt = attempts.get(ip)
    if (attempt && attempt.resetAt > now && attempt.count >= 10) {
      return NextResponse.json({ error: 'Too many login attempts' }, { status: 429, headers: { 'Retry-After': '900' } })
    }
    if (!attempt || attempt.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    else attempt.count += 1
    let admin
    try {
      admin = await prisma.adminUser.findUnique({
        where: { email: cleanEmail },
      })
    } catch (e) {
      console.error('[ADMIN_AUTH] Database connection failed:', e instanceof Error ? e.message : 'unknown')
      return NextResponse.json({ error: SAFE_LOGIN_ERROR }, { status: 503 })
    }

    if (!admin) {
      console.warn('[ADMIN_AUTH] Admin user not found')
      return NextResponse.json({ error: SAFE_LOGIN_ERROR }, { status: 401 })
    }

    if (!verifyPassword(password, admin.passwordHash)) {
      console.warn('[ADMIN_AUTH] Password verification failed')
      return NextResponse.json({ error: SAFE_LOGIN_ERROR }, { status: 401 })
    }

    if (!ADMIN_ROLES.has(admin.role.trim().toUpperCase())) {
      console.warn('[ADMIN_AUTH] Role validation failed')
      return NextResponse.json({ error: SAFE_LOGIN_ERROR }, { status: 401 })
    }

    let token: string
    try {
      token = signAdminToken({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      })
    } catch (error) {
      if (error instanceof AuthConfigurationError) {
        console.error('[ADMIN_AUTH] JWT signing failed - ADMIN_JWT_SECRET is not configured or insufficient. Set it in Vercel environment variables (Production).')
      } else {
        console.error('[ADMIN_AUTH] JWT creation failed:', error instanceof Error ? error.message : 'unknown')
      }
      return NextResponse.json({ error: SAFE_LOGIN_ERROR }, { status: 503 })
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        avatar: admin.avatar || null,
      },
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    response.headers.set('Cache-Control', 'no-store')

    return response
  } catch {
    console.error('[ADMIN_AUTH] Unexpected login failure')
    return NextResponse.json({ error: SAFE_LOGIN_ERROR }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, signAdminToken, COOKIE_NAME } from '@/lib/auth'

const attempts = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password || email.length > 254 || password.length > 200) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
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
    let admin = null

    // Attempt DB lookup with 2s timeout
    try {
      const dbPromise = prisma.adminUser.findUnique({
        where: { email: cleanEmail },
      })
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
      admin = await Promise.race([dbPromise, timeoutPromise])
    } catch {
      console.warn('⚠️ DB lookup failed or timed out')
    }

    if (admin) {
      const isValid = verifyPassword(password, admin.passwordHash)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signAdminToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    })

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
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

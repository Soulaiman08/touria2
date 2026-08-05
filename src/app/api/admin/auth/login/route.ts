import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, signAdminToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    let admin: { id: string; email: string; name: string; role: string; passwordHash: string; avatar?: string | null } | null = null

    // Attempt DB lookup with 1.5s timeout so offline DB doesn't freeze login
    try {
      const dbPromise = prisma.adminUser.findUnique({
        where: { email: cleanEmail },
      })
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500))
      admin = await Promise.race([dbPromise, timeoutPromise])
    } catch {
      console.warn('⚠️ DB lookup failed or timed out, falling back to seed credentials check')
    }

    // Direct check for fallback seed admin
    if (!admin && cleanEmail === 'admin@thuraya.com' && password === 'admin123') {
      const passwordHash = hashPassword('admin123')
      admin = {
        id: 'admin_seed',
        email: 'admin@thuraya.com',
        name: 'Thuraya Admin',
        role: 'SUPER_ADMIN',
        passwordHash,
      }

      // Try creating seed admin in background if DB comes online
      prisma.adminUser
        .create({
          data: {
            email: 'admin@thuraya.com',
            passwordHash,
            name: 'Thuraya Admin',
            role: 'SUPER_ADMIN',
          },
        })
        .catch(() => {})
    } else if (admin) {
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

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

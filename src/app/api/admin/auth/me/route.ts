import { NextResponse } from 'next/server'
import {
  requireAdmin,
  hashPassword,
  verifyPassword,
  signAdminToken,
  COOKIE_NAME,
  AuthDatabaseUnavailableError,
} from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER', 'STAFF', 'STAFF MEMBER']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET() {
  const auth = await requireAdmin(ADMIN_ALLOWED_ROLES)
  if (!auth.ok) return auth.response
  const response = NextResponse.json({ user: auth.admin })
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(ADMIN_ALLOWED_ROLES)
  if (!auth.ok) return auth.response

  try {
    let body: { name?: unknown; email?: unknown; currentPassword?: unknown; newPassword?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
    }

    const { name, email, currentPassword, newPassword } = body

    const admin = await prisma.adminUser.findUnique({
      where: { id: auth.admin.id },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updateData: Record<string, unknown> = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
        return NextResponse.json({ error: 'Name must be between 1 and 100 characters' }, { status: 400 })
      }
      if (name.trim() !== admin.name) {
        updateData.name = name.trim()
      }
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.trim().length > 254) {
        return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 })
      }
      const cleanEmail = email.toLowerCase().trim()
      if (cleanEmail !== admin.email.toLowerCase()) {
        const existingUser = await prisma.adminUser.findUnique({
          where: { email: cleanEmail },
        })
        if (existingUser && existingUser.id !== admin.id) {
          return NextResponse.json({ error: 'This email address is already in use by another admin account' }, { status: 400 })
        }
        updateData.email = cleanEmail
      }
    }

    if (newPassword !== undefined && newPassword !== '') {
      if (typeof newPassword !== 'string' || newPassword.length < 6 || newPassword.length > 200) {
        return NextResponse.json({ error: 'New password must be between 6 and 200 characters' }, { status: 400 })
      }
      if (typeof currentPassword !== 'string' || !currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 })
      }
      if (admin.passwordHash) {
        const isValid = verifyPassword(currentPassword, admin.passwordHash)
        if (!isValid) {
          return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
        }
      }
      updateData.passwordHash = hashPassword(newPassword)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          avatar: admin.avatar,
        },
      })
    }

    const updatedAdmin = await prisma.adminUser.update({
      where: { id: admin.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    })

    const token = signAdminToken({
      id: updatedAdmin.id,
      email: updatedAdmin.email,
      name: updatedAdmin.name,
      role: updatedAdmin.role,
    })

    const response = NextResponse.json({ success: true, user: updatedAdmin })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    response.headers.set('Cache-Control', 'no-store')

    return response
  } catch (error: unknown) {
    console.error('Error updating admin profile:', error)
    if (error instanceof AuthDatabaseUnavailableError) {
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 })
    }
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'This email address is already in use by another account' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

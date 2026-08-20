import { NextResponse } from 'next/server'
import { getCurrentAdmin, hashPassword, verifyPassword, signAdminToken, COOKIE_NAME, AuthDatabaseUnavailableError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ user: currentAdmin })
  } catch (error) {
    console.error('Failed to load admin profile:', error)
    if (error instanceof AuthDatabaseUnavailableError) {
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, currentPassword, newPassword } = body

    const admin = await prisma.adminUser.findUnique({
      where: { id: currentAdmin.id },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name

    if (email) {
      const cleanEmail = email.toLowerCase().trim()
      if (cleanEmail !== admin.email) {
        const existingUser = await prisma.adminUser.findUnique({
          where: { email: cleanEmail },
        })
        if (existingUser && existingUser.id !== admin.id) {
          return NextResponse.json({ error: 'This email address is already in use by another admin account' }, { status: 400 })
        }
        updateData.email = cleanEmail
      }
    }

    if (newPassword) {
      if (!currentPassword) {
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

    // Refresh auth cookie token with updated user details
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

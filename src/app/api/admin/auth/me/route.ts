import { NextResponse } from 'next/server'
import { getAdminFromCookie, hashPassword, verifyPassword, signAdminToken, COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const currentAdmin = await getAdminFromCookie()
  if (!currentAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let admin = await prisma.adminUser.findUnique({
      where: { id: currentAdmin.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    })

    if (!admin) {
      admin = await prisma.adminUser.findUnique({
        where: { email: currentAdmin.email.toLowerCase().trim() },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      })
    }

    if (!admin) {
      admin = await prisma.adminUser.findFirst({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      })
    }

    if (!admin) {
      return NextResponse.json({ user: currentAdmin })
    }

    return NextResponse.json({ user: admin })
  } catch {
    return NextResponse.json({ user: currentAdmin })
  }
}

export async function PUT(request: Request) {
  const currentAdmin = await getAdminFromCookie()
  if (!currentAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, currentPassword, newPassword } = body

    let admin = await prisma.adminUser.findUnique({
      where: { id: currentAdmin.id },
    })

    if (!admin) {
      admin = await prisma.adminUser.findUnique({
        where: { email: currentAdmin.email.toLowerCase().trim() },
      })
    }

    if (!admin) {
      admin = await prisma.adminUser.findFirst()
    }

    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (email) updateData.email = email.toLowerCase().trim()

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 })
      }
      if (admin && admin.passwordHash) {
        const isValid = verifyPassword(currentPassword, admin.passwordHash)
        if (!isValid) {
          return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
        }
      }
      updateData.passwordHash = hashPassword(newPassword)
    }

    let updatedAdmin

    if (admin) {
      updatedAdmin = await prisma.adminUser.update({
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
    } else {
      const newEmail = email ? email.toLowerCase().trim() : currentAdmin.email
      const newName = name || currentAdmin.name
      const newHash = newPassword ? hashPassword(newPassword) : hashPassword('admin123')

      updatedAdmin = await prisma.adminUser.create({
        data: {
          email: newEmail,
          name: newName,
          passwordHash: newHash,
          role: currentAdmin.role || 'SUPER_ADMIN',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
        },
      })
    }

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
  } catch (error) {
    console.error('Error updating admin profile:', error)
    const msg = error instanceof Error ? error.message : 'Failed to update profile'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

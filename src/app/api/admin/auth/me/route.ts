import { NextResponse } from 'next/server'
import { getAdminFromCookie, hashPassword, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const currentAdmin = await getAdminFromCookie()
  if (!currentAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = await prisma.adminUser.findUnique({
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

    const admin = await prisma.adminUser.findUnique({
      where: { id: currentAdmin.id },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found in database' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (email) updateData.email = email.toLowerCase().trim()

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 })
      }
      const isValid = verifyPassword(currentPassword, admin.passwordHash)
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
      updateData.passwordHash = hashPassword(newPassword)
    }

    const updated = await prisma.adminUser.update({
      where: { id: currentAdmin.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('Error updating admin profile:', error)
    const msg = error instanceof Error ? error.message : 'Failed to update profile'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

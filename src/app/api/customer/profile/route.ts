import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentCustomer } from '@/lib/customer-auth'

export async function PUT(request: Request) {
  const customer = await getCurrentCustomer()
  if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, phone, avatarUrl } = (body ?? {}) as Record<string, unknown>

  const updateData: Record<string, unknown> = {}

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json({ error: 'Name must be between 2 and 100 characters' }, { status: 400 })
    }
    updateData.name = name.trim()
  }

  if (phone !== undefined) {
    if (phone === null || phone === '') {
      updateData.phone = null
    } else if (typeof phone === 'string' && phone.trim().length >= 6 && phone.trim().length <= 30) {
      updateData.phone = phone.trim()
    } else {
      return NextResponse.json({ error: 'Phone must be between 6 and 30 characters' }, { status: 400 })
    }
  }

  if (avatarUrl !== undefined) {
    if (avatarUrl === null || avatarUrl === '') {
      updateData.avatarUrl = null
    } else if (typeof avatarUrl === 'string' && /^https:\/\/res\.cloudinary\.com\//.test(avatarUrl) && avatarUrl.length < 500) {
      updateData.avatarUrl = avatarUrl
    } else {
      return NextResponse.json({ error: 'Invalid avatar URL' }, { status: 400 })
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  try {
    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true, createdAt: true },
    })
    const response = NextResponse.json({ success: true, user: updated })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (e) {
    console.error('[CUSTOMER_PROFILE] Update failed:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
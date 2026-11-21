import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

function isSafeUrl(url: string): boolean {
  if (url.startsWith('/') && !url.startsWith('//')) return true
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
    }

    const existing = await prisma.banner.findUnique({ where: { id }, select: { id: true } })
    if (!existing) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) {
      const title = typeof body.title === 'string' ? body.title.trim() : ''
      if (!title) return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
      updateData.title = title
    }
    if (body.subtitle !== undefined) {
      updateData.subtitle = typeof body.subtitle === 'string' && body.subtitle.trim() ? body.subtitle.trim() : null
    }
    if (body.buttonText !== undefined) {
      updateData.buttonText = typeof body.buttonText === 'string' && body.buttonText.trim() ? body.buttonText.trim() : null
    }
    if (body.buttonUrl !== undefined) {
      const buttonUrl = typeof body.buttonUrl === 'string' ? body.buttonUrl.trim() : ''
      if (buttonUrl && !isSafeUrl(buttonUrl)) {
        return NextResponse.json({ error: 'Button URL must start with / or https://' }, { status: 400 })
      }
      updateData.buttonUrl = buttonUrl || null
    }
    if (body.imageUrl !== undefined) {
      const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : ''
      if (!imageUrl || !isSafeUrl(imageUrl)) {
        return NextResponse.json({ error: 'Valid image URL is required' }, { status: 400 })
      }
      updateData.imageUrl = imageUrl
    }
    if (body.sortOrder !== undefined) {
      const parsedOrder = Number.parseInt(String(body.sortOrder), 10)
      updateData.sortOrder = Number.isFinite(parsedOrder) ? parsedOrder : 0
    }
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive)

    const updated = await prisma.banner.update({ where: { id }, data: updateData })

    revalidatePath('/[locale]', 'page')

    return NextResponse.json({ success: true, banner: updated })
  } catch (error) {
    console.error('Failed to update banner:', error)
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    const existing = await prisma.banner.findUnique({ where: { id }, select: { id: true } })
    if (!existing) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    await prisma.banner.delete({ where: { id } })

    revalidatePath('/[locale]', 'page')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete banner:', error)
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
  }
}

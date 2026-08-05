import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json() as Record<string, unknown>

    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) updateData.title = body.title as string
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle as string | null
    if (body.buttonText !== undefined) updateData.buttonText = body.buttonText as string | null
    if (body.buttonUrl !== undefined) updateData.buttonUrl = body.buttonUrl as string | null
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl as string
    if (body.sortOrder !== undefined) updateData.sortOrder = parseInt(body.sortOrder as string, 10)
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive)

    const updated = await prisma.banner.update({ where: { id }, data: updateData })

    revalidatePath('/[locale]', 'page')

    return NextResponse.json({ success: true, banner: updated })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update banner'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.banner.delete({ where: { id } })

    revalidatePath('/[locale]', 'page')

    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to delete banner'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

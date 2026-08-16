import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    const body = await request.json() as Record<string, unknown>

    const updateData: Record<string, unknown> = {}

    if (body.nameAr) updateData.nameAr = body.nameAr as string
    if (body.nameFr) {
      updateData.nameFr = body.nameFr as string
      updateData.slug = slugify(body.nameFr as string)
    }
    if (body.nameEn) updateData.nameEn = body.nameEn as string
    if (body.slug) updateData.slug = slugify(body.slug as string)
    if (body.image !== undefined) updateData.image = body.image as string | null
    if (body.sortOrder !== undefined) updateData.sortOrder = parseInt(body.sortOrder as string, 10)
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive)

    const updated = await prisma.category.update({ where: { id }, data: updateData })

    revalidatePath('/[locale]/products', 'page')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/api/categories')

    return NextResponse.json({ success: true, category: updated })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update category'
    return NextResponse.json({ error: msg }, { status: 500 })
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

    // Don't delete if products are linked
    const productCount = await prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${productCount} product(s) are linked to this category` },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id } })

    revalidatePath('/[locale]/products', 'page')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/api/categories')

    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to delete category'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

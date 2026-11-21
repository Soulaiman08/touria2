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
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
    }

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (typeof body.nameAr === 'string' && body.nameAr.trim()) updateData.nameAr = body.nameAr.trim()
    if (typeof body.nameFr === 'string' && body.nameFr.trim()) updateData.nameFr = body.nameFr.trim()
    if (typeof body.nameEn === 'string' && body.nameEn.trim()) updateData.nameEn = body.nameEn.trim()

    if (body.descriptionAr !== undefined) {
      updateData.descriptionAr = typeof body.descriptionAr === 'string' && body.descriptionAr.trim() ? body.descriptionAr.trim() : null
    }
    if (body.descriptionFr !== undefined) {
      updateData.descriptionFr = typeof body.descriptionFr === 'string' && body.descriptionFr.trim() ? body.descriptionFr.trim() : null
    }
    if (body.descriptionEn !== undefined) {
      updateData.descriptionEn = typeof body.descriptionEn === 'string' && body.descriptionEn.trim() ? body.descriptionEn.trim() : null
    }

    if (typeof body.slug === 'string' && body.slug.trim()) {
      const candidateSlug = slugify(body.slug)
      if (!candidateSlug) {
        return NextResponse.json({ error: 'Slug must contain URL-safe characters' }, { status: 400 })
      }
      if (candidateSlug !== existing.slug) {
        const dup = await prisma.category.findUnique({ where: { slug: candidateSlug }, select: { id: true } })
        if (dup && dup.id !== id) {
          return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 400 })
        }
        updateData.slug = candidateSlug
      }
    }

    if (body.image !== undefined) {
      updateData.image = typeof body.image === 'string' && body.image.trim() ? body.image.trim() : null
    }
    if (body.sortOrder !== undefined) {
      const parsedOrder = Number.parseInt(String(body.sortOrder), 10)
      updateData.sortOrder = Number.isFinite(parsedOrder) ? parsedOrder : 0
    }
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive)

    const updated = await prisma.category.update({ where: { id }, data: updateData })

    revalidatePath('/[locale]/products', 'page')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/api/categories')

    return NextResponse.json({ success: true, category: updated })
  } catch (error: unknown) {
    console.error('Failed to update category:', error)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
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

    const existing = await prisma.category.findUnique({ where: { id }, select: { id: true } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

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
    console.error('Failed to delete category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}

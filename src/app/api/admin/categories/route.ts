import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { getCategoryConfigMap, saveCategoryConfig } from '@/lib/category-config.server'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    })

    const configMap = await getCategoryConfigMap(categories)

    const items = categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.nameFr || c.nameAr || c.nameEn,
      nameAr: c.nameAr,
      nameFr: c.nameFr,
      nameEn: c.nameEn,
      descriptionAr: c.descriptionAr,
      descriptionFr: c.descriptionFr,
      descriptionEn: c.descriptionEn,
      image: c.image,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      parentId: c.parentId ?? null,
      productsCount: c._count.products,
      config: configMap.get(c.id),
      createdAt: c.createdAt,
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Failed to load admin categories:', error)
    return NextResponse.json({ error: 'Unable to load categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
    }

    const {
      name,
      nameAr,
      nameFr,
      nameEn,
      descriptionAr,
      descriptionFr,
      descriptionEn,
      slug,
      image,
      sortOrder = 0,
      isActive = true,
      parentId,
      config: rawConfig,
    } = body as {
      name?: string
      nameAr?: string
      nameFr?: string
      nameEn?: string
      descriptionAr?: string
      descriptionFr?: string
      descriptionEn?: string
      slug?: string
      image?: string | null
      sortOrder?: string | number
      isActive?: boolean
      parentId?: string | null
      config?: unknown
    }

    const rawAr = typeof nameAr === 'string' ? nameAr.trim() : ''
    const rawFr = typeof nameFr === 'string' ? nameFr.trim() : ''
    const rawEn = typeof nameEn === 'string' ? nameEn.trim() : ''
    const rawFallback = typeof name === 'string' ? name.trim() : ''
    const primary = rawFr || rawAr || rawEn || rawFallback

    if (!primary) {
      return NextResponse.json({ error: 'At least one category name is required' }, { status: 400 })
    }

    const finalNameAr = rawAr || rawFallback || primary
    const finalNameFr = rawFr || rawFallback || primary
    const finalNameEn = rawEn || rawFallback || primary
    const finalSlug =
      (typeof slug === 'string' && slugify(slug)) ||
      slugify(finalNameFr) ||
      slugify(finalNameEn) ||
      `cat-${Date.now()}`

    const dup = await prisma.category.findUnique({ where: { slug: finalSlug }, select: { id: true } })
    if (dup) {
      return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 400 })
    }

    let safeParentId: string | null = null
    if (typeof parentId === 'string' && parentId.trim()) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId.trim() },
        select: { id: true },
      })
      if (!parentExists) {
        return NextResponse.json({ error: 'Selected parent category does not exist' }, { status: 400 })
      }
      safeParentId = parentExists.id
    }

    const parsedOrder = Number.parseInt(String(sortOrder ?? 0), 10)
    const safeSortOrder = Number.isFinite(parsedOrder) ? parsedOrder : 0

    const category = await prisma.category.create({
      data: {
        slug: finalSlug,
        nameAr: finalNameAr,
        nameFr: finalNameFr,
        nameEn: finalNameEn,
        descriptionAr: typeof descriptionAr === 'string' && descriptionAr.trim() ? descriptionAr.trim() : null,
        descriptionFr: typeof descriptionFr === 'string' && descriptionFr.trim() ? descriptionFr.trim() : null,
        descriptionEn: typeof descriptionEn === 'string' && descriptionEn.trim() ? descriptionEn.trim() : null,
        image: typeof image === 'string' && image.trim() ? image.trim() : null,
        sortOrder: safeSortOrder,
        isActive: Boolean(isActive),
        parentId: safeParentId,
      },
    })

    const savedConfig = await saveCategoryConfig(category, rawConfig)

    revalidatePath('/[locale]', 'layout')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/[locale]/products', 'layout')
    revalidatePath('/api/categories')
    revalidatePath('/api/products')

    return NextResponse.json({ success: true, category: { ...category, config: savedConfig } })
  } catch (error: unknown) {
    console.error('Failed to create category:', error)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

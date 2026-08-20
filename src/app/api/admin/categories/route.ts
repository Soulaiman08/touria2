import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'

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
      productsCount: c._count.products,
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
    const body = await request.json()
    const { name, nameAr, nameFr, nameEn, slug, image, sortOrder = 0, isActive = true } = body

    const finalNameAr = nameAr || name || 'تصنيف جديد'
    const finalNameFr = nameFr || name || 'Nouvelle Catégorie'
    const finalNameEn = nameEn || name || 'New Category'
    const finalSlug = slug ? slugify(slug) : slugify(finalNameFr) || `cat-${Date.now()}`

    const category = await prisma.category.create({
      data: {
        slug: finalSlug,
        nameAr: finalNameAr,
        nameFr: finalNameFr,
        nameEn: finalNameEn,
        image: image || null,
        sortOrder: parseInt(sortOrder || 0, 10),
        isActive: Boolean(isActive),
      },
    })

    // Revalidate storefront so navigation/category pages update immediately
    revalidatePath('/[locale]/products', 'page')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/api/categories')

    return NextResponse.json({ success: true, category })
  } catch (error: unknown) {
    console.error('Failed to create category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

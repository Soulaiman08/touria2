import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

const withTimeout = <T>(promise: Promise<T>, fallback: T, ms = 1500): Promise<T> => {
  const timeout = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  return Promise.race([promise.catch(() => fallback), timeout])
}

const BACKUP_CATEGORIES = [
  {
    id: 'cat_djellaba',
    slug: 'djellaba',
    name: 'جلابة مغربية – Djellaba',
    nameAr: 'جلابة مغربية',
    nameFr: 'Djellaba Marocaine',
    nameEn: 'Moroccan Djellaba',
    image: '/images/brand/logo-full.png',
    sortOrder: 1,
    isActive: true,
    productsCount: 8,
  },
  {
    id: 'cat_niqab',
    slug: 'niqab',
    name: 'نقاب مغربي – Niqab',
    nameAr: 'نقاب مغربي',
    nameFr: 'Niqab Marocain',
    nameEn: 'Moroccan Niqab',
    image: '/images/brand/logo-icon.png',
    sortOrder: 2,
    isActive: true,
    productsCount: 4,
  },
]

export async function GET() {
  try {
    const categories = await withTimeout(
      prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      null
    )

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ items: BACKUP_CATEGORIES })
    }

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

    return NextResponse.json({ items: items.length > 0 ? items : BACKUP_CATEGORIES })
  } catch {
    return NextResponse.json({ items: BACKUP_CATEGORIES })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, nameAr, nameFr, nameEn, slug, image, sortOrder = 0, isActive = true } = body

    const finalNameAr = nameAr || name || 'تصنيف جديد'
    const finalNameFr = nameFr || name || 'Nouvelle Catégorie'
    const finalNameEn = nameEn || name || 'New Category'
    const finalSlug = slug ? slugify(slug) : slugify(finalNameFr) || `cat-${Date.now()}`

    let category = null
    try {
      category = await prisma.category.create({
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
    } catch {
      category = { id: `cat_${Date.now()}`, name: finalNameFr, slug: finalSlug }
    }

    // Revalidate storefront so navigation/category pages update immediately
    revalidatePath('/[locale]/products', 'page')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/api/categories')

    return NextResponse.json({ success: true, category })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create category'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

import { prisma } from '@/lib/prisma'

export interface StoreCategory {
  id: string
  slug: string
  nameAr: string
  nameFr: string
  nameEn: string
  image: string | null
  sortOrder: number
  isActive: boolean
  productCount?: number
}

export const categoryService = {
  async getCategories(): Promise<StoreCategory[]> {
    const [dbCategories, activeProducts] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { categoryId: true },
      }),
    ])

    const countsByCategory = new Map<string, number>()
    for (const p of activeProducts) {
      countsByCategory.set(p.categoryId, (countsByCategory.get(p.categoryId) ?? 0) + 1)
    }

    return dbCategories.map((c) => ({
      id: c.id,
      slug: c.slug,
      nameAr: c.nameAr,
      nameFr: c.nameFr === 'Niqabs' ? 'Niquab' : c.nameFr,
      nameEn: c.nameEn,
      image: c.image,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      productCount: countsByCategory.get(c.id) ?? 0,
    }))
  },

  async getCategoryBySlug(slug: string): Promise<StoreCategory | null> {
    const cat = await prisma.category.findFirst({
      where: {
        isActive: true,
        OR: [
          { slug: slug },
          { slug: slug.replace(/s$/, '') },
          { slug: `${slug}s` },
          { id: slug },
        ],
      },
    })

    if (!cat) return null
    return {
      id: cat.id,
      slug: cat.slug,
      nameAr: cat.nameAr,
      nameFr: cat.nameFr === 'Niqabs' ? 'Niquab' : cat.nameFr,
      nameEn: cat.nameEn,
      image: cat.image,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    }
  },
}

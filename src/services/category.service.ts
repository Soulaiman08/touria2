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
}

export const categoryService = {
  async getCategories(): Promise<StoreCategory[]> {
    try {
      const dbCategories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      })

      return dbCategories.map((c) => ({
        id: c.id,
        slug: c.slug,
        nameAr: c.nameAr,
        nameFr: c.nameFr === 'Niqabs' ? 'Niquab' : c.nameFr,
        nameEn: c.nameEn,
        image: c.image,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      }))
    } catch (error) {
      console.warn('⚠️ Category query failed, returning empty list:', error)
      return []
    }
  },

  async getCategoryBySlug(slug: string): Promise<StoreCategory | null> {
    try {
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
    } catch (error) {
      console.warn('⚠️ Category query failed for slug:', error)
      return null
    }
  },
}

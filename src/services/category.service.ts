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

const BACKUP_CATEGORIES: StoreCategory[] = [
  {
    id: 'cat_djellaba',
    slug: 'djellaba',
    nameAr: 'الجلابات',
    nameFr: 'Djellabas',
    nameEn: 'Djellabas',
    image: '/images/brand/logo-full.png',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat_niqab',
    slug: 'niqab',
    nameAr: 'النقابات',
    nameFr: 'Niquab',
    nameEn: 'Niqabs',
    image: '/images/brand/logo-icon.png',
    sortOrder: 2,
    isActive: true,
  },
]

export const categoryService = {
  async getCategories(): Promise<StoreCategory[]> {
    try {
      const dbCategories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      })

      if (!dbCategories || dbCategories.length === 0) {
        return BACKUP_CATEGORIES
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
      }))
    } catch (error) {
      console.warn('⚠️ Category query failed, returning backup categories:', error)
      return BACKUP_CATEGORIES
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
    } catch {
      const found = BACKUP_CATEGORIES.find(
        (c) => c.slug === slug || c.slug === slug.replace(/s$/, '')
      )
      return found || null
    }
  },
}

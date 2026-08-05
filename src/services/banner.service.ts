import { prisma } from '@/lib/prisma'

export interface StoreBanner {
  id: string
  title: string
  subtitle?: string | null
  buttonText?: string | null
  buttonUrl?: string | null
  imageUrl: string
  sortOrder: number
  isActive: boolean
}

export const bannerService = {
  async getActiveBanners(): Promise<StoreBanner[]> {
    try {
      const dbBanners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      })

      return dbBanners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        buttonText: b.buttonText,
        buttonUrl: b.buttonUrl,
        imageUrl: b.imageUrl,
        sortOrder: b.sortOrder,
        isActive: b.isActive,
      }))
    } catch (error) {
      console.warn('⚠️ Banner query failed, returning empty list:', error)
      return []
    }
  },
}

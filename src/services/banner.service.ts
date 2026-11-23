import { prisma } from '@/lib/prisma'
import { resolveBannerForLocale, type BannerTranslations } from '@/lib/banner-i18n'
import { getBannerTranslationsMap } from '@/lib/banner-i18n.server'

export interface StoreBanner {
  id: string
  title: string
  subtitle?: string | null
  buttonText?: string | null
  buttonUrl?: string | null
  imageUrl: string
  sortOrder: number
  isActive: boolean
  isTextRTL: boolean
  translations: BannerTranslations
}

export const bannerService = {
  async getActiveBanners(locale = 'ar'): Promise<StoreBanner[]> {
    try {
      const dbBanners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      })

      const translationsMap = await getBannerTranslationsMap(dbBanners)

      return dbBanners.map((b) => {
        const translations = translationsMap.get(b.id)!
        const resolved = resolveBannerForLocale(translations, b, locale)

        return {
          id: b.id,
          title: resolved.title,
          subtitle: resolved.subtitle,
          buttonText: resolved.buttonText,
          buttonUrl: b.buttonUrl,
          imageUrl: b.imageUrl,
          sortOrder: b.sortOrder,
          isActive: b.isActive,
          isTextRTL: resolved.isTextRTL,
          translations,
        }
      })
    } catch (error) {
      console.warn('⚠️ Banner query failed, returning empty list:', error)
      return []
    }
  },
}

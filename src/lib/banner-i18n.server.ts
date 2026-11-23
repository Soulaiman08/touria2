import { prisma } from '@/lib/prisma'
import {
  BANNER_I18N_KEY_PREFIX,
  buildBannerTranslations,
  type BannerBaseRecord,
  type BannerTranslations,
} from '@/lib/banner-i18n'

export function bannerI18nKey(bannerId: string): string {
  return `${BANNER_I18N_KEY_PREFIX}${bannerId}`
}

export async function getBannerTranslationsMap(
  banners: BannerBaseRecord[]
): Promise<Map<string, BannerTranslations>> {
  const result = new Map<string, BannerTranslations>()
  if (banners.length === 0) return result

  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: { startsWith: BANNER_I18N_KEY_PREFIX },
      },
    })

    const rawById = new Map<string, unknown>()
    for (const row of rows) {
      const bannerId = row.key.slice(BANNER_I18N_KEY_PREFIX.length)
      if (!bannerId) continue
      try {
        rawById.set(bannerId, JSON.parse(row.value))
      } catch {
        // Ignore malformed JSON and fall back to base record
      }
    }

    for (const banner of banners) {
      result.set(banner.id, buildBannerTranslations(rawById.get(banner.id), banner))
    }
  } catch (error) {
    console.error('Failed to read banner translations from siteSetting:', error)
    for (const banner of banners) {
      result.set(banner.id, buildBannerTranslations(undefined, banner))
    }
  }

  return result
}

export async function saveBannerTranslations(
  banner: BannerBaseRecord,
  rawInput: unknown
): Promise<BannerTranslations> {
  const normalized = buildBannerTranslations(rawInput, banner)
  const key = bannerI18nKey(banner.id)
  const serialized = JSON.stringify(normalized)

  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: serialized },
    update: { value: serialized },
  })

  return normalized
}

export async function deleteBannerTranslations(bannerId: string): Promise<void> {
  try {
    await prisma.siteSetting.deleteMany({
      where: { key: bannerI18nKey(bannerId) },
    })
  } catch (error) {
    console.error('Failed to delete banner translations:', error)
  }
}

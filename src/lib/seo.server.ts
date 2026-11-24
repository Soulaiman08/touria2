import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/config/site'

export interface StoreSeoSettings {
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  storeName: string
  contactPhone: string
  address: string
  instagram: string
  facebook: string
  tiktok: string
  youtube: string
  whatsapp: string
}

export function parseSeoKeywords(raw?: string | null): string[] {
  if (!raw) return []
  return Array.from(
    new Set(
      raw
        .split(/[,،]+/)
        .map((k) => k.trim())
        .filter(Boolean)
    )
  )
}

export function resolveAbsoluteUrl(urlOrPath: string): string {
  if (!urlOrPath) return `${siteConfig.url}${siteConfig.ogImage}`
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath
  const normalized = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`
  return `${siteConfig.url}${normalized}`
}

export function getDefaultOgImages(alt?: string) {
  return [
    {
      url: resolveAbsoluteUrl(siteConfig.ogImage),
      width: 1200,
      height: 630,
      alt: alt || `${siteConfig.name} — ${siteConfig.tagline.ar}`,
    },
  ]
}

export function buildLocaleAlternates(path: string, locale: string) {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  const baseUrl = siteConfig.url
  return {
    canonical: `${baseUrl}/${locale}${cleanPath}`,
    languages: {
      ar: `${baseUrl}/ar${cleanPath}`,
      fr: `${baseUrl}/fr${cleanPath}`,
      en: `${baseUrl}/en${cleanPath}`,
      'x-default': `${baseUrl}/ar${cleanPath}`,
    },
  }
}

export async function getSeoSettings(): Promise<StoreSeoSettings> {
  const keys = [
    'seoTitle',
    'seoDescription',
    'seoKeywords',
    'storeName',
    'contactPhone',
    'address',
    'instagram',
    'facebook',
    'tiktok',
    'youtube',
    'whatsapp',
  ]

  const map = new Map<string, string>()
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: keys } },
    })
    for (const row of rows) {
      if (row.value && row.value.trim()) {
        map.set(row.key, row.value.trim())
      }
    }
  } catch {
    // Non-fatal fallback to siteConfig defaults
  }

  return {
    seoTitle: map.get('seoTitle') || '',
    seoDescription: map.get('seoDescription') || '',
    seoKeywords: parseSeoKeywords(map.get('seoKeywords')),
    storeName: map.get('storeName') || siteConfig.name,
    contactPhone: map.get('contactPhone') || siteConfig.contact.phone,
    address: map.get('address') || 'Morocco',
    instagram: map.get('instagram') || siteConfig.social.instagram,
    facebook: map.get('facebook') || siteConfig.social.facebook,
    tiktok: map.get('tiktok') || siteConfig.social.tiktok,
    youtube: map.get('youtube') || siteConfig.social.youtube,
    whatsapp: map.get('whatsapp') || siteConfig.contact.whatsapp,
  }
}

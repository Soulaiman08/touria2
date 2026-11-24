import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { siteConfig } from '@/config/site'

const DEFAULT_SETTINGS = {
  storeName: `${siteConfig.nameEn} | ${siteConfig.name}`,
  logo: siteConfig.logoFull,
  currency: siteConfig.currency.code,
  shippingCost: '35',

  contactEmail: siteConfig.contact.email,
  contactPhone: siteConfig.contact.phoneDisplay,
  address: 'Casablanca, Morocco',

  instagram: siteConfig.social.instagram,
  facebook: siteConfig.social.facebook,
  tiktok: siteConfig.social.tiktok,
  youtube: siteConfig.social.youtube,
  whatsapp: siteConfig.contact.whatsapp,

  seoTitle: 'ثريا المغربي – جلابات ونقابات مغربية أصيلة',
  seoDescription:
    'متجر ثريا المغربي للجلابيات والنقابات المغربية المصنوعة يدوياً بأجود الأقمشة وتطريز أصيل. تسوقي الآن مع توصيل سريع والدفع عند الاستلام.',
  seoKeywords: 'جلابة مغربية, نقاب, أزياء مغربية, ثريا المغربي, قفطان',
}

const SHIPPING_DEFAULT_KEY = 'shipping:default'

const ALLOWED_KEYS = new Set([
  'storeName',
  'logo',
  'currency',
  'shippingCost',
  'contactEmail',
  'contactPhone',
  'address',
  'instagram',
  'facebook',
  'tiktok',
  'youtube',
  'whatsapp',
  'seoTitle',
  'seoDescription',
  'seoKeywords',
])

const URL_KEYS = new Set(['logo', 'instagram', 'facebook', 'tiktok', 'youtube'])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidSettingUrl(val: string, allowRelative: boolean): boolean {
  if (!val) return true
  if (allowRelative && val.startsWith('/') && !val.startsWith('//')) return true
  try {
    const parsed = new URL(val)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const settingsList = await prisma.siteSetting.findMany()

    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS }
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value
    })

    if (
      settingsMap['shippingCost'] === DEFAULT_SETTINGS.shippingCost &&
      settingsMap[SHIPPING_DEFAULT_KEY] !== undefined
    ) {
      settingsMap['shippingCost'] = settingsMap[SHIPPING_DEFAULT_KEY]
    }

    return NextResponse.json({ settings: settingsMap })
  } catch (error) {
    console.error('Failed to load settings:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response

  try {
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 })
    }

    const sanitized: Record<string, string> = {}

    for (const [key, raw] of Object.entries(body)) {
      if (!ALLOWED_KEYS.has(key)) continue
      if (typeof raw !== 'string' && typeof raw !== 'number') continue
      const val = String(raw).trim()

      if (key === 'shippingCost') {
        const parsed = Number(val)
        if (val === '' || !Number.isFinite(parsed) || parsed < 0 || parsed > 9999) {
          return NextResponse.json({ error: 'Shipping cost must be between 0 and 9999 DH' }, { status: 400 })
        }
        sanitized[key] = String(parsed)
        continue
      }

      if (key === 'contactEmail' && val && !EMAIL_RE.test(val)) {
        return NextResponse.json({ error: 'Invalid contact email format' }, { status: 400 })
      }

      if (URL_KEYS.has(key) && val && !isValidSettingUrl(val, key === 'logo')) {
        return NextResponse.json({ error: `Invalid URL provided for ${key}` }, { status: 400 })
      }

      sanitized[key] = val
    }

    await prisma.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(sanitized)) {
        await tx.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      }

      if (sanitized['shippingCost'] !== undefined) {
        await tx.siteSetting.upsert({
          where: { key: SHIPPING_DEFAULT_KEY },
          update: { value: sanitized['shippingCost'] },
          create: { key: SHIPPING_DEFAULT_KEY, value: sanitized['shippingCost'] },
        })
      }
    })

    try {
      revalidatePath('/[locale]', 'layout')
      revalidatePath('/[locale]', 'page')
      revalidatePath('/[locale]/products', 'layout')
    } catch {
      // Non-fatal in non-Next-runtime calls
    }

    return NextResponse.json({ success: true, settings: sanitized })
  } catch (error) {
    console.error('Failed to update settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
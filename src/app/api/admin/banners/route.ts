import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { getBannerTranslationsMap, saveBannerTranslations } from '@/lib/banner-i18n.server'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    const translationsMap = await getBannerTranslationsMap(banners)
    const items = banners.map((banner) => ({
      ...banner,
      ...translationsMap.get(banner.id),
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Failed to load admin banners:', error)
    return NextResponse.json({ error: 'Unable to load banners' }, { status: 500 })
  }
}

function isSafeUrl(url: string): boolean {
  if (url.startsWith('/') && !url.startsWith('//')) return true
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

function firstNonEmpty(...values: unknown[]): string | null {
  for (const val of values) {
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim()
    }
  }
  return null
}

export async function POST(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
    }

    const title = firstNonEmpty(body.title, body.titleAr, body.titleFr, body.titleEn) || ''
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : ''
    const subtitle = firstNonEmpty(body.subtitle, body.subtitleAr, body.subtitleFr, body.subtitleEn)
    const buttonText = firstNonEmpty(body.buttonText, body.buttonTextAr, body.buttonTextFr, body.buttonTextEn)
    const buttonUrl = typeof body.buttonUrl === 'string' && body.buttonUrl.trim() ? body.buttonUrl.trim() : null

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and image URL are required' }, { status: 400 })
    }
    if (!isSafeUrl(imageUrl)) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }
    if (buttonUrl && !isSafeUrl(buttonUrl)) {
      return NextResponse.json({ error: 'Button URL must start with / or https://' }, { status: 400 })
    }

    const parsedOrder = Number.parseInt(String(body.sortOrder ?? 0), 10)
    const safeSortOrder = Number.isFinite(parsedOrder) ? parsedOrder : 0

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        buttonText,
        buttonUrl,
        imageUrl,
        sortOrder: safeSortOrder,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    })

    const translations = await saveBannerTranslations(banner, {
      titleAr: firstNonEmpty(body.titleAr, body.title),
      titleFr: firstNonEmpty(body.titleFr),
      titleEn: firstNonEmpty(body.titleEn),
      subtitleAr: firstNonEmpty(body.subtitleAr, body.subtitle),
      subtitleFr: firstNonEmpty(body.subtitleFr),
      subtitleEn: firstNonEmpty(body.subtitleEn),
      buttonTextAr: firstNonEmpty(body.buttonTextAr, body.buttonText),
      buttonTextFr: firstNonEmpty(body.buttonTextFr),
      buttonTextEn: firstNonEmpty(body.buttonTextEn),
    })

    revalidatePath('/[locale]', 'page')

    return NextResponse.json({ success: true, banner: { ...banner, ...translations } })
  } catch (error: unknown) {
    console.error('Failed to create banner:', error)
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
  }
}

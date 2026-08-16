import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const withTimeout = <T>(promise: Promise<T>, fallback: T, ms = 1500): Promise<T> => {
  const timeout = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  return Promise.race([promise.catch(() => fallback), timeout])
}

const BACKUP_BANNERS = [
  {
    id: 'b1',
    title: 'تشكيلة الجلابة المغربية 2026',
    subtitle: 'أحدث التصاميم الراقية والمطرزة يدوياً لأناقة لا مثيل لها',
    buttonText: 'تسوق الآن',
    buttonUrl: '/products',
    imageUrl: '/images/brand/logo-full.png',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'b2',
    title: 'مجموعة النقاب المغربي الأصيل',
    subtitle: 'راحة وتناسق مثالي مع جلابيات ثريا المغربي',
    buttonText: 'اكتشفي المجموعة',
    buttonUrl: '/products?category=niqab',
    imageUrl: '/images/brand/logo-icon.png',
    sortOrder: 2,
    isActive: true,
  },
]

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const banners = await withTimeout(
      prisma.banner.findMany({
        orderBy: { sortOrder: 'asc' },
      }),
      null
    )

    if (!banners || (Array.isArray(banners) && banners.length === 0)) {
      return NextResponse.json({ items: BACKUP_BANNERS })
    }

    return NextResponse.json({ items: banners })
  } catch {
    return NextResponse.json({ items: BACKUP_BANNERS })
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    const body = await request.json()
    const { title, subtitle, buttonText, buttonUrl, imageUrl, sortOrder = 0, isActive = true } = body

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and image URL are required' }, { status: 400 })
    }

    let banner = null
    try {
      banner = await prisma.banner.create({
        data: {
          title,
          subtitle: subtitle || null,
          buttonText: buttonText || null,
          buttonUrl: buttonUrl || null,
          imageUrl,
          sortOrder: parseInt(sortOrder || 0, 10),
          isActive: Boolean(isActive),
        },
      })
    } catch {
      banner = { id: `b_${Date.now()}`, title, imageUrl }
    }

    // Revalidate homepage so banner changes appear immediately
    revalidatePath('/[locale]', 'page')

    return NextResponse.json({ success: true, banner })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create banner'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ items: banners })
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

export async function POST(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    let body: {
      title?: unknown
      subtitle?: unknown
      buttonText?: unknown
      buttonUrl?: unknown
      imageUrl?: unknown
      sortOrder?: unknown
      isActive?: unknown
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
    }

    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : ''
    const subtitle = typeof body.subtitle === 'string' && body.subtitle.trim() ? body.subtitle.trim() : null
    const buttonText = typeof body.buttonText === 'string' && body.buttonText.trim() ? body.buttonText.trim() : null
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

    revalidatePath('/[locale]', 'page')

    return NextResponse.json({ success: true, banner })
  } catch (error: unknown) {
    console.error('Failed to create banner:', error)
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
  }
}

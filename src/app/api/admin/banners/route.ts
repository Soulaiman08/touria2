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

export async function POST(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    const body = await request.json()
    const { title, subtitle, buttonText, buttonUrl, imageUrl, sortOrder = 0, isActive = true } = body

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and image URL are required' }, { status: 400 })
    }

    const banner = await prisma.banner.create({
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

    // Revalidate homepage so banner changes appear immediately
    revalidatePath('/[locale]', 'page')

    return NextResponse.json({ success: true, banner })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create banner'
    console.error('Failed to create banner:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

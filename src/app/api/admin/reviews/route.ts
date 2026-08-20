import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')

  try {
    const reviews = await prisma.review.findMany({
      where: productId ? { productId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        customer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        product: { select: { id: true, nameAr: true, nameFr: true, nameEn: true, mainImage: true } },
      },
    })

    const count = await prisma.review.count({ where: productId ? { productId } : undefined })

    const response = NextResponse.json({ reviews, count })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (e) {
    console.error('[ADMIN_REVIEWS] List failed:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }
}
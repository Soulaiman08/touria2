import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCustomer } from '@/lib/customer-auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const [reviews, aggregate] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      prisma.review.aggregate({
        where: { productId },
        _count: true,
        _avg: { rating: true },
      }),
    ])

    const response = NextResponse.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        customer: review.customer,
      })),
      averageRating: aggregate._avg.rating,
      count: aggregate._count,
    })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (e) {
    console.error('[REVIEWS] List failed:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireCustomer()
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { productId, rating, comment } = (body ?? {}) as Record<string, unknown>

  if (typeof productId !== 'string' || !productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 })
  }
  if (typeof comment !== 'string' || comment.trim().length < 1 || comment.trim().length > 500) {
    return NextResponse.json({ error: 'Comment must be between 1 and 500 characters' }, { status: 400 })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    })
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const cleanComment = comment.trim()

    const existing = await prisma.review.findUnique({
      where: { customerId_productId: { customerId: auth.customer.id, productId } },
      select: { id: true },
    })

    let review
    if (existing) {
      review = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment: cleanComment },
        select: { id: true, rating: true, comment: true, createdAt: true, updatedAt: true },
      })
    } else {
      review = await prisma.review.create({
        data: { customerId: auth.customer.id, productId, rating, comment: cleanComment },
        select: { id: true, rating: true, comment: true, createdAt: true, updatedAt: true },
      })
    }

    const response = NextResponse.json({ success: true, review }, { status: existing ? 200 : 201 })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (e) {
    console.error('[REVIEWS] Create failed:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
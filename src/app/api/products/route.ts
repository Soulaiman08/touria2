import { NextResponse } from 'next/server'
import { productService } from '@/services/product.service'

function parsePagination(raw: string | null, fallback: number, min: number, max: number): number {
  if (raw === null || raw.trim() === '') return fallback
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.floor(parsed)))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category') || undefined
    const size = searchParams.get('size') || undefined
    const colorCode = searchParams.get('colorCode') || undefined
    const search = searchParams.get('search') || undefined
    const sortParam = searchParams.get('sort')
    const sort = sortParam === 'newest' || sortParam === 'priceAsc' || sortParam === 'priceDesc' || sortParam === 'featured'
      ? sortParam
      : undefined
    const page = parsePagination(searchParams.get('page'), 1, 1, 10000)
    const limit = parsePagination(searchParams.get('limit'), 12, 1, 48)
    const isNiqab = searchParams.get('isNiqab') ? searchParams.get('isNiqab') === 'true' : undefined
    const isFeatured = searchParams.get('isFeatured') ? searchParams.get('isFeatured') === 'true' : undefined

    const result = await productService.getProducts({
      category,
      size,
      colorCode,
      search,
      sort,
      page,
      limit,
      isNiqab,
      isFeatured,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to load products:', error)
    return NextResponse.json({ error: 'Failed to load products' }, { status: 503 })
  }
}
import { NextResponse } from 'next/server'
import { productService } from '@/services/product.service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const category = searchParams.get('category') || undefined
  const size = searchParams.get('size') || undefined
  const colorCode = searchParams.get('colorCode') || undefined
  const search = searchParams.get('search') || undefined
  const sortParam = searchParams.get('sort')
  const sort = sortParam === 'newest' || sortParam === 'priceAsc' || sortParam === 'priceDesc' || sortParam === 'featured'
    ? sortParam
    : undefined
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
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
}

import { NextResponse } from 'next/server'
import { categoryService } from '@/services/category.service'

/**
 * GET /api/categories
 * Public storefront categories endpoint - reads from Prisma
 */
export async function GET() {
  const categories = await categoryService.getCategories()
  return NextResponse.json({ categories })
}

import { NextResponse } from 'next/server'
import { categoryService } from '@/services/category.service'

/**
 * GET /api/categories
 * Public storefront categories endpoint - reads from Prisma
 */
export async function GET() {
  try {
    const categories = await categoryService.getCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Failed to load categories:', error)
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 503 })
  }
}
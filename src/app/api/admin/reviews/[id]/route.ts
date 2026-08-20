import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id) return NextResponse.json({ error: 'Review id is required' }, { status: 400 })

  try {
    const existing = await prisma.review.findUnique({ where: { id }, select: { id: true } })
    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    await prisma.review.delete({ where: { id } })

    const response = NextResponse.json({ success: true })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (e) {
    console.error('[ADMIN_REVIEWS] Delete failed:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
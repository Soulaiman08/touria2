import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const SETTING_KEY = 'stats:visitors:count'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const record = await prisma.siteSetting.findUnique({
      where: { key: SETTING_KEY },
    })

    const count = record ? Number(record.value) || 0 : 0
    return NextResponse.json({ count })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to get visitor count'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

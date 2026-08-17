import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const VISITOR_COOKIE = 'th_visitor_session'
const SETTING_KEY = 'stats:visitors:count'
const requests = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const referer = request.headers.get('referer') || ''
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const now = Date.now()
    const currentRate = requests.get(ip)
    if (currentRate && currentRate.resetAt > now && currentRate.count >= 30) {
      return NextResponse.json({ tracked: false, reason: 'rate_limited' }, { status: 429, headers: { 'Retry-After': '60' } })
    }
    if (!currentRate || currentRate.resetAt <= now) requests.set(ip, { count: 1, resetAt: now + 60_000 })
    else currentRate.count += 1
    // Strictly exclude admin visits
    if (referer.includes('/control-panel-ss7') || request.nextUrl.pathname.includes('/control-panel-ss7')) {
      return NextResponse.json({ tracked: false, reason: 'admin_excluded' })
    }

    // Check session deduplication cookie
    const hasVisited = request.cookies.get(VISITOR_COOKIE)?.value
    if (hasVisited) {
      return NextResponse.json({ tracked: false, reason: 'already_counted_session' })
    }

    // Increment visitor count in SiteSetting
    const current = await prisma.siteSetting.findUnique({
      where: { key: SETTING_KEY },
    })

    const newCount = (current ? Number(current.value) || 0 : 0) + 1

    await prisma.siteSetting.upsert({
      where: { key: SETTING_KEY },
      update: { value: String(newCount) },
      create: { key: SETTING_KEY, value: String(newCount) },
    })

    const response = NextResponse.json({ tracked: true, count: newCount })

    // Set deduplication cookie valid for 24 hours
    response.cookies.set(VISITOR_COOKIE, '1', {
      maxAge: 24 * 60 * 60,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('[/api/visitors/track]', error)
    return NextResponse.json({ tracked: false, error: 'failed' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isDatabaseConfigured, prisma } from '@/lib/prisma'

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

    // Never fabricate or expose a fake visitor counter in production when no DB is configured.
    if (!isDatabaseConfigured && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ tracked: false, reason: 'database_unconfigured' })
    }

    // Check session deduplication cookie
    const hasVisited = request.cookies.get(VISITOR_COOKIE)?.value
    if (hasVisited) {
      return NextResponse.json({ tracked: false, reason: 'already_counted_session' })
    }

    let newCount: number
    if (!isDatabaseConfigured) {
      // Development-only in-memory preview counter (does not persist across restarts).
      const existing = await prisma.siteSetting.findUnique({ where: { key: SETTING_KEY } })
      const current = existing ? Number(existing.value) : 0
      newCount = Number.isFinite(current) && current >= 0 ? current + 1 : 1
      await prisma.siteSetting.upsert({
        where: { key: SETTING_KEY },
        create: { key: SETTING_KEY, value: String(newCount) },
        update: { value: String(newCount) },
      })
    } else {
      // Production PostgreSQL: single atomic SQL UPDATE so concurrent requests never lose counts.
      newCount = await prisma.$transaction(async (tx) => {
        const updated = await tx.$executeRaw`UPDATE "site_settings" SET value = (COALESCE(NULLIF(value, '')::bigint, 0) + 1)::text WHERE key = ${SETTING_KEY}`
        if (updated === 0) {
          await tx.siteSetting.create({ data: { key: SETTING_KEY, value: '1' } })
          return 1
        }
        const row = await tx.siteSetting.findUnique({ where: { key: SETTING_KEY } })
        const parsed = row ? Number(row.value) : 1
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
      })
    }

    const response = NextResponse.json({
      tracked: true,
      count: newCount,
      ...(isDatabaseConfigured ? {} : { mode: 'memory' }),
    })

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

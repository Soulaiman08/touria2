import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'
import { verifyAdminTokenEdge, COOKIE_NAME } from './src/lib/auth-edge'

const handleIntl = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static uploads to pass through directly
  if (pathname.startsWith('/uploads')) {
    return NextResponse.next()
  }

  // ─── Admin API protection ───────────────────────────────────
  if (pathname.startsWith('/api/admin')) {
    // Login endpoint is always public
    if (pathname === '/api/admin/auth/login') {
      return NextResponse.next()
    }
    const token = request.cookies.get(COOKIE_NAME)?.value
    const payload = token ? await verifyAdminTokenEdge(token) : null
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // ─── Admin Page protection ──────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Login page: redirect to /admin if already authenticated
    if (pathname === '/admin/login') {
      const token = request.cookies.get(COOKIE_NAME)?.value
      const payload = token ? await verifyAdminTokenEdge(token) : null
      if (payload) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.next()
    }

    // All other /admin/* routes: require valid token
    const token = request.cookies.get(COOKIE_NAME)?.value
    const payload = token ? await verifyAdminTokenEdge(token) : null
    if (!payload) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // ─── Public storefront API routes ──────────────────────────
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // ─── Storefront localized routes (next-intl) ────────────────
  return handleIntl(request)
}

export const config = {
  matcher: [
    // Exclude static assets, next internals, and file uploads from middleware
    '/((?!_next/static|_next/image|favicon.ico|images|uploads|fonts|robots.txt|sitemap.xml).*)',
  ],
}

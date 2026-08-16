import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { verifyAdminTokenEdge, COOKIE_NAME } from './lib/auth-edge'

const handleIntl = createMiddleware(routing)

const isKnownAdminRole = (role: string) =>
  ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER', 'STAFF', 'STAFF MEMBER'].includes(role.trim().toUpperCase())

function unauthorizedResponse() {
  const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  response.cookies.delete(COOKIE_NAME)
  return response
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/uploads')) return NextResponse.next()

  if (pathname.startsWith('/api/admin')) {
    if (pathname === '/api/admin/auth/login') return NextResponse.next()
    const token = request.cookies.get(COOKIE_NAME)?.value
    const payload = token ? await verifyAdminTokenEdge(token) : null
    if (!payload || !isKnownAdminRole(payload.role)) {
      if (token && !payload) {
        console.error('[PROXY] Admin token verification failed for', pathname, '- check ADMIN_JWT_SECRET is configured in Vercel')
      }
      return unauthorizedResponse()
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      const token = request.cookies.get(COOKIE_NAME)?.value
      const payload = token ? await verifyAdminTokenEdge(token) : null
      if (payload && isKnownAdminRole(payload.role)) return NextResponse.redirect(new URL('/admin', request.url))
      return NextResponse.next()
    }

    const token = request.cookies.get(COOKIE_NAME)?.value
    const payload = token ? await verifyAdminTokenEdge(token) : null
    if (!payload || !isKnownAdminRole(payload.role)) {
      if (token && !payload) {
        console.error('[PROXY] Admin token verification failed for', pathname, '- check ADMIN_JWT_SECRET is configured in Vercel')
      }
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete(COOKIE_NAME)
      return response
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api')) return NextResponse.next()
  return handleIntl(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|uploads|fonts|robots.txt|sitemap.xml).*)'],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { verifyAdminTokenEdge, COOKIE_NAME } from './lib/auth-edge'

const handleIntl = createMiddleware(routing)

const ADMIN_PANEL = '/control-panel-ss7'
const ADMIN_LOGIN = '/control-panel-ss7/login'
const ONBOARDED_COOKIE = 'thuraya_onboarded'
const CUSTOMER_COOKIE = 'customer_token'

const isKnownAdminRole = (role: string) =>
  ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER', 'STAFF', 'STAFF MEMBER'].includes(role.trim().toUpperCase())

function unauthorizedResponse() {
  const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  response.cookies.delete(COOKIE_NAME)
  return response
}

function base64UrlToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function verifyCustomerTokenEdge(token: string): Promise<{ id: string; email: string; name: string } | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [encodedHeader, encodedPayload, signature] = parts
    const data = `${encodedHeader}.${encodedPayload}`
    const secret = process.env.CUSTOMER_JWT_SECRET
    if (!secret || secret.length < 32) return null
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    const valid = await crypto.subtle.verify('HMAC', key, base64UrlToUint8Array(signature), new TextEncoder().encode(data))
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(encodedPayload)))
    if (!payload.id || !payload.email || !Number.isFinite(payload.exp) || payload.exp < Math.floor(Date.now() / 1000)) return null
    return { id: payload.id, email: payload.email, name: payload.name }
  } catch {
    return null
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/uploads')) return NextResponse.next()

  // Legacy /admin paths → 404 (do not reveal control-panel-ss7)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

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

  if (pathname.startsWith(ADMIN_PANEL)) {
    if (pathname === ADMIN_LOGIN) {
      const token = request.cookies.get(COOKIE_NAME)?.value
      const payload = token ? await verifyAdminTokenEdge(token) : null
      if (payload && isKnownAdminRole(payload.role)) return NextResponse.redirect(new URL(ADMIN_PANEL, request.url))
      return NextResponse.next()
    }

    const token = request.cookies.get(COOKIE_NAME)?.value
    const payload = token ? await verifyAdminTokenEdge(token) : null
    if (!payload || !isKnownAdminRole(payload.role)) {
      if (token && !payload) {
        console.error('[PROXY] Admin token verification failed for', pathname, '- check ADMIN_JWT_SECRET is configured in Vercel')
      }
      const response = NextResponse.redirect(new URL(ADMIN_LOGIN, request.url))
      response.cookies.delete(COOKIE_NAME)
      return response
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api')) return NextResponse.next()

  // First-visit redirect: redirect to login if no onboarded cookie and no customer session
  const isHomepage = pathname === '/' || /^\/(ar|fr|en)\/?$/.test(pathname)
  if (isHomepage) {
    const hasOnboarded = request.cookies.get(ONBOARDED_COOKIE)?.value
    const hasCustomerToken = request.cookies.get(CUSTOMER_COOKIE)?.value
    if (!hasOnboarded && !hasCustomerToken) {
      const localeMatch = pathname.match(/^\/(ar|fr|en)/)
      const locale = localeMatch ? localeMatch[1] : 'ar'
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }
  }

  // Logged-in customer on login/signup page → redirect to account
  const isLoginPage = /^\/(ar|fr|en)\/login\/?$/.test(pathname)
  const isSignupPage = /^\/(ar|fr|en)\/signup\/?$/.test(pathname)
  if (isLoginPage || isSignupPage) {
    const customerToken = request.cookies.get(CUSTOMER_COOKIE)?.value
    if (customerToken) {
      const payload = await verifyCustomerTokenEdge(customerToken)
      if (payload) {
        const localeMatch = pathname.match(/^\/(ar|fr|en)/)
        const locale = localeMatch ? localeMatch[1] : 'ar'
        return NextResponse.redirect(new URL(`/${locale}/account`, request.url))
      }
    }
  }

  return handleIntl(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|uploads|fonts|robots.txt|sitemap.xml).*)'],
}

/**
 * Edge-compatible auth utilities for use in middleware.ts
 * Uses Web Crypto API (available on Edge Runtime) instead of Node.js crypto.
 */

export const COOKIE_NAME = 'admin_token'

export interface AdminJwtPayload {
  id: string
  email: string
  name: string
  role: string
  exp: number
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  // atob is available on Edge
  return atob(base64)
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function verifyAdminTokenEdge(token: string): Promise<AdminJwtPayload | null> {
  try {
    const secret = process.env.ADMIN_JWT_SECRET || 'thuraya_admin_secret_key_2026_super_secure'
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, signature] = parts
    const data = `${encodedHeader}.${encodedPayload}`

    const key = await getHmacKey(secret)
    const enc = new TextEncoder()

    // Decode the provided signature from base64url back to bytes
    let sigBase64 = signature.replace(/-/g, '+').replace(/_/g, '/')
    while (sigBase64.length % 4) sigBase64 += '='
    const sigBytes = Uint8Array.from(atob(sigBase64), (c) => c.charCodeAt(0))

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data))
    if (!isValid) return null

    const payload: AdminJwtPayload = JSON.parse(base64UrlDecode(encodedPayload))
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}

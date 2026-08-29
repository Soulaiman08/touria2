import { NextResponse } from 'next/server'
import { CUSTOMER_COOKIE_NAME } from '@/lib/customer-auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(CUSTOMER_COOKIE_NAME)
  response.headers.set('Cache-Control', 'no-store')
  return response
}
import { NextResponse } from 'next/server'
import { getCurrentCustomer, CUSTOMER_COOKIE_NAME } from '@/lib/customer-auth'

export async function GET() {
  const customer = await getCurrentCustomer()
  if (!customer) {
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    response.cookies.delete(CUSTOMER_COOKIE_NAME)
    response.headers.set('Cache-Control', 'no-store')
    return response
  }
  const response = NextResponse.json({ user: customer })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
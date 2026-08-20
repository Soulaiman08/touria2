import { NextResponse } from 'next/server'
import { getCurrentCustomer, CUSTOMER_COOKIE_NAME } from '@/lib/customer-auth'

export async function POST() {
  if (!(await getCurrentCustomer())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const response = NextResponse.json({ success: true })
  response.cookies.delete(CUSTOMER_COOKIE_NAME)
  return response
}
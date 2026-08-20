import { NextResponse } from 'next/server'
import { getCurrentCustomer } from '@/lib/customer-auth'

export async function GET() {
  const customer = await getCurrentCustomer()
  if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const response = NextResponse.json({ user: customer })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
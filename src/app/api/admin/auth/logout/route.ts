import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'
import { getCurrentAdmin } from '@/lib/auth'

export async function POST() {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}

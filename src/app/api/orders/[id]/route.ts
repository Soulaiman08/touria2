import { NextResponse } from 'next/server'
import { orderService } from '@/services/order.service'
import { cookies } from 'next/headers'
import { verifyOrderAccessToken } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const order = await orderService.getOrderById(id)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // The access cookie is keyed by the real order id; lookups by order
    // number are resolved above, so verify against the stored order id.
    const cookieStore = await cookies()
    const token = cookieStore.get(`order_access_${order.id}`)?.value
    if (!token || !verifyOrderAccessToken(token, order.id)) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to fetch order status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order status' },
      { status: 500 },
    )
  }
}
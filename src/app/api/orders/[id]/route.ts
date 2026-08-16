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
    const token = (await cookies()).get(`order_access_${id}`)?.value
    if (!token || !verifyOrderAccessToken(token, id)) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    const order = await orderService.getOrderById(id)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch order status'
    return NextResponse.json(
      { error: msg },
      { status: 500 },
    )
  }
}

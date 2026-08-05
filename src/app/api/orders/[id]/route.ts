import { NextResponse } from 'next/server'
import { orderService } from '@/services/order.service'

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

    return NextResponse.json(order)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch order status'
    return NextResponse.json(
      { error: msg },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCustomer } from '@/lib/customer-auth'

export async function GET() {
  const auth = await requireCustomer()
  if (!auth.ok) return auth.response

  try {
    const orders = await prisma.order.findMany({
      where: { customerId: auth.customer.id },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    })

    const response = NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        itemsCount: order.items.length,
        createdAt: order.createdAt,
      })),
    })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (e) {
    console.error('[CUSTOMER_ORDERS] List failed:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}
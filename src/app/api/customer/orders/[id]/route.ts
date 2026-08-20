import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCustomer } from '@/lib/customer-auth'
import type { ProductSnapshot } from '@/types/order'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireCustomer()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id) return NextResponse.json({ error: 'Order id is required' }, { status: 400 })

  try {
    const order = await prisma.order.findFirst({
      where: {
        customerId: auth.customer.id,
        OR: [{ id }, { orderNumber: id }],
      },
      include: { items: true, statusHistory: { orderBy: { createdAt: 'desc' } } },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const response = NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerPhone2: order.customerPhone2,
        customerEmail: order.customerEmail,
        region: order.region,
        city: order.city,
        district: order.district,
        address: order.address,
        postalCode: order.postalCode,
        notes: order.notes,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        discountAmount: Number(order.discountAmount),
        total: Number(order.total),
        locale: order.locale,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          productSnapshot: item.productSnapshot as unknown as ProductSnapshot,
        })),
        statusHistory: order.statusHistory,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (e) {
    console.error('[CUSTOMER_ORDERS] Detail failed:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 })
  }
}
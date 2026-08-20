import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true, variant: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    return NextResponse.json({
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        discountAmount: Number(order.discountAmount),
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          product: item.product ? {
            id: item.product.id, nameAr: item.product.nameAr, nameFr: item.product.nameFr,
            nameEn: item.product.nameEn, mainImage: item.product.mainImage, sku: item.product.sku,
          } : null,
          variant: item.variant ? {
            id: item.variant.id, size: item.variant.size, colorCode: item.variant.colorCode,
            colorNameAr: item.variant.colorNameAr, colorNameFr: item.variant.colorNameFr, colorNameEn: item.variant.colorNameEn,
          } : null,
        })),
      },
    })
  } catch (error) {
    console.error('Failed to load admin order:', error)
    return NextResponse.json({ error: 'Unable to load order' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    const { status, paymentStatus, adminNotes, note } = await request.json()
    const allowedStatuses = new Set(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'])
    const allowedPaymentStatuses = new Set(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'COD'])
    if (status !== undefined && !allowedStatuses.has(status)) return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
    if (paymentStatus !== undefined && !allowedPaymentStatuses.has(paymentStatus)) return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    const existing = await prisma.order.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const updateData: Record<string, unknown> = {}
    const statusChanged = status && status !== existing.status
    if (statusChanged) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes

    // Order status change + history entry happen atomically so the history
    // can never be missing/duplicated relative to the order state.
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({ where: { id }, data: updateData })
      if (statusChanged) {
        await tx.orderStatusHistory.create({
          data: { orderId: id, status, note: note || `Status updated to ${status} by admin` },
        })
      }
      return updated
    })
    return NextResponse.json({
      success: true,
      order: { ...updatedOrder, subtotal: Number(updatedOrder.subtotal), shippingCost: Number(updatedOrder.shippingCost), discountAmount: Number(updatedOrder.discountAmount), total: Number(updatedOrder.total) },
    })
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

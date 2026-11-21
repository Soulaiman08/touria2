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

import { revalidatePath } from 'next/cache'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    let body: { status?: unknown; paymentStatus?: unknown; adminNotes?: unknown; note?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
    }

    const { status, paymentStatus, adminNotes, note } = body
    const allowedStatuses = new Set(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'])
    const allowedPaymentStatuses = new Set(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'COD'])
    if (status !== undefined && (typeof status !== 'string' || !allowedStatuses.has(status))) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
    }
    if (paymentStatus !== undefined && (typeof paymentStatus !== 'string' || !allowedPaymentStatuses.has(paymentStatus))) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }
    if (adminNotes !== undefined && adminNotes !== null && typeof adminNotes !== 'string') {
      return NextResponse.json({ error: 'Invalid adminNotes value' }, { status: 400 })
    }

    const existing = await prisma.order.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const updateData: Record<string, unknown> = {}
    const hasNote = typeof note === 'string' && note.trim().length > 0
    const nextStatus = typeof status === 'string' ? status : undefined
    const statusChanged = Boolean(nextStatus && nextStatus !== existing.status)
    if (statusChanged && nextStatus) updateData.status = nextStatus
    if (typeof paymentStatus === 'string') updateData.paymentStatus = paymentStatus
    if (adminNotes !== undefined) updateData.adminNotes = typeof adminNotes === 'string' ? adminNotes : null

    const shouldRestoreStock =
      statusChanged &&
      (nextStatus === 'CANCELLED' || nextStatus === 'RETURNED') &&
      existing.status !== 'CANCELLED' &&
      existing.status !== 'RETURNED'

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated =
        Object.keys(updateData).length > 0
          ? await tx.order.update({ where: { id }, data: updateData })
          : existing

      if (shouldRestoreStock) {
        const orderItems = await tx.orderItem.findMany({ where: { orderId: id } })
        for (const item of orderItems) {
          if (item.variantId && item.quantity > 0) {
            await tx.productVariant.updateMany({
              where: { id: item.variantId },
              data: { stockQuantity: { increment: item.quantity } },
            })
          }
        }
      }

      if (statusChanged && nextStatus) {
        await tx.orderStatusHistory.create({
          data: { orderId: id, status: nextStatus as never, note: hasNote ? String(note).trim() : `Status updated to ${nextStatus} by admin` },
        })
      } else if (hasNote) {
        await tx.orderStatusHistory.create({
          data: { orderId: id, status: existing.status, note: String(note).trim() },
        })
      }
      return updated
    })

    if (shouldRestoreStock) {
      try {
        revalidatePath('/[locale]/products', 'layout')
        revalidatePath('/api/products')
      } catch {
        // Ignore outside Next runtime
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        subtotal: Number(updatedOrder.subtotal),
        shippingCost: Number(updatedOrder.shippingCost),
        discountAmount: Number(updatedOrder.discountAmount),
        total: Number(updatedOrder.total),
      },
    })
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

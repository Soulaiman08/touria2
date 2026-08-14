import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
  try {
    const { id } = await params
    const { status, paymentStatus, adminNotes, note } = await request.json()
    const existing = await prisma.order.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const updateData: Record<string, unknown> = {}
    const statusChanged = status && status !== existing.status
    if (statusChanged) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes

    const updatedOrder = await prisma.order.update({ where: { id }, data: updateData })
    if (statusChanged) {
      await prisma.orderStatusHistory.create({
        data: { orderId: id, status, note: note || `Status updated to ${status} by admin` },
      })
    }
    return NextResponse.json({
      success: true,
      order: { ...updatedOrder, subtotal: Number(updatedOrder.subtotal), shippingCost: Number(updatedOrder.shippingCost), discountAmount: Number(updatedOrder.discountAmount), total: Number(updatedOrder.total) },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10) || 10))
    const where: Record<string, unknown> = {}
    if (search) where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } }, { customerName: { contains: search, mode: 'insensitive' } },
      { customerPhone: { contains: search, mode: 'insensitive' } }, { customerEmail: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ]
    if (status && status !== 'all') where.status = status

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({ where, include: { items: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.order.count({ where }),
    ])
    return NextResponse.json({
      items: orders.map((order) => ({
        id: order.id, orderNumber: order.orderNumber, status: order.status, paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus, customerName: order.customerName, customerPhone: order.customerPhone,
        customerPhone2: order.customerPhone2, customerEmail: order.customerEmail, region: order.region, city: order.city,
        district: order.district, address: order.address, notes: order.notes, adminNotes: order.adminNotes,
        subtotal: Number(order.subtotal), shippingCost: Number(order.shippingCost), discountAmount: Number(order.discountAmount),
        total: Number(order.total), itemsCount: order.items.length,
        items: order.items.map((item) => ({ id: item.id, quantity: item.quantity, unitPrice: Number(item.unitPrice), totalPrice: Number(item.totalPrice), snapshot: item.productSnapshot })),
        createdAt: order.createdAt, updatedAt: order.updatedAt,
      })),
      total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (error) {
    console.error('Failed to load admin orders:', error)
    return NextResponse.json({ error: 'Unable to load orders' }, { status: 500 })
  }
}

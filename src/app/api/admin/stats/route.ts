import { OrderStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const [totalProducts, totalOrders, totalCustomers, allOrders, deliveredOrders, recentOrders] = await prisma.$transaction([
      prisma.product.count(),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.order.findMany({
        select: { customerPhone: true },
      }),
      prisma.order.findMany({
        where: { status: OrderStatus.DELIVERED },
        orderBy: { createdAt: 'desc' },
        select: {
          total: true,
          createdAt: true,
          items: {
            select: {
              productId: true,
              quantity: true,
              totalPrice: true,
              unitPrice: true,
              product: {
                select: {
                  nameAr: true,
                  nameFr: true,
                  nameEn: true,
                  mainImage: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          total: true,
          status: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      }),
    ])

    // Revenue is derived solely from each order's current status. Status
    // history is intentionally not queried, so reopening the dashboard can
    // never count an order more than once.
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + Number(order.total), 0)

    const salesMap = new Map<string, { date: string; sales: number; orders: number }>()
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const key = date.toISOString().slice(5, 10)
      salesMap.set(key, { date: key, sales: 0, orders: 0 })
    }

    for (const order of deliveredOrders) {
      const key = order.createdAt.toISOString().slice(5, 10)
      const day = salesMap.get(key)
      if (day) {
        day.sales += Number(order.total)
        day.orders += 1
      }
    }

    const productMap = new Map<string, {
      id: string
      name: string
      price: number
      salesCount: number
      totalRevenue: number
      image: string
    }>()
    for (const order of deliveredOrders) {
      for (const item of order.items) {
        const product = productMap.get(item.productId)
        if (product) {
          product.salesCount += item.quantity
          product.totalRevenue += Number(item.totalPrice)
          continue
        }

        productMap.set(item.productId, {
          id: item.productId,
          name: item.product.nameFr || item.product.nameAr || item.product.nameEn,
          price: Number(item.unitPrice),
          salesCount: item.quantity,
          totalRevenue: Number(item.totalPrice),
          image: item.product.mainImage,
        })
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.salesCount - a.salesCount || b.totalRevenue - a.totalRevenue)
      .slice(0, 5)

    const uniquePhones = new Set(allOrders.map((order) => order.customerPhone).filter(Boolean))

    return NextResponse.json({
      metrics: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalCustomers: Math.max(totalCustomers, uniquePhones.size),
        totalProducts,
      },
      charts: {
        salesChart: Array.from(salesMap.values()),
        topProducts,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt,
        itemsCount: order._count.items,
      })),
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Unable to load admin statistics' }, { status: 500 })
  }
}

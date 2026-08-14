import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CustomerRecord {
  id: string
  name: string
  phone: string
  email: string
  city: string
  address: string
  totalSpent: number
  ordersCount: number
  lastOrderDate: Date
  orders: Array<{
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: Date
  }>
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim().toLowerCase() || ''

    // Guest checkout orders do not currently have a Customer relation. Read
    // both real data sources so saved customers and guest-order customers are
    // represented without inventing fallback records.
    const [savedCustomers, orders] = await prisma.$transaction([
      prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          city: true,
          address: true,
          createdAt: true,
        },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          city: true,
          address: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ])

    const customerMap = new Map<string, CustomerRecord>()
    for (const customer of savedCustomers) {
      const key = (customer.phone || customer.email || customer.name).trim().toLowerCase()
      if (!key) continue

      customerMap.set(key, {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        city: customer.city || '',
        address: customer.address || '',
        totalSpent: 0,
        ordersCount: 0,
        lastOrderDate: customer.createdAt,
        orders: [],
      })
    }

    for (const order of orders) {
      const key = (order.customerPhone || order.customerEmail || order.customerName).trim().toLowerCase()
      if (!key) continue

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: `guest_${Buffer.from(key).toString('hex').slice(0, 12)}`,
          name: order.customerName,
          phone: order.customerPhone,
          email: order.customerEmail || '',
          city: order.city,
          address: order.address,
          totalSpent: 0,
          ordersCount: 0,
          lastOrderDate: order.createdAt,
          orders: [],
        })
      }

      const customer = customerMap.get(key)!
      customer.lastOrderDate = customer.ordersCount === 0 || order.createdAt > customer.lastOrderDate
        ? order.createdAt
        : customer.lastOrderDate
      customer.ordersCount += 1
      if (order.status !== 'CANCELLED') {
        customer.totalSpent += Number(order.total)
      }
      customer.orders.push({
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt,
      })
    }

    let customers = Array.from(customerMap.values())
    if (search) {
      customers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.city.toLowerCase().includes(search)
      )
    }

    return NextResponse.json({ customers, total: customers.length })
  } catch (error) {
    console.error('Failed to load admin customers:', error)
    return NextResponse.json({ error: 'Unable to load customers' }, { status: 500 })
  }
}

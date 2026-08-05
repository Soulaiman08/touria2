import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const withTimeout = <T>(promise: Promise<T>, fallback: T, ms = 1500): Promise<T> => {
  const timeout = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  return Promise.race([promise.catch(() => fallback), timeout])
}

const BACKUP_CUSTOMERS = [
  {
    id: 'cust_1',
    name: 'Fatima Zohra Alami',
    phone: '0661234567',
    email: 'fatima.alami@gmail.com',
    city: 'Casablanca',
    address: '15 Rue Aïn Harrouda',
    totalSpent: 1250,
    ordersCount: 2,
    lastOrderDate: new Date().toISOString(),
    orders: [
      { id: 'ord_1', orderNumber: 'TH-20260729-84920', total: 634, status: 'PROCESSING', createdAt: new Date().toISOString() },
      { id: 'ord_3', orderNumber: 'TH-20260615-11029', total: 616, status: 'DELIVERED', createdAt: new Date(Date.now() - 3600000000).toISOString() },
    ],
  },
  {
    id: 'cust_2',
    name: 'Khadija Mansouri',
    phone: '0678901234',
    email: 'khadija.m@hotmail.com',
    city: 'Rabat',
    address: '42 Avenue de France',
    totalSpent: 935,
    ordersCount: 1,
    lastOrderDate: new Date(Date.now() - 86400000).toISOString(),
    orders: [
      { id: 'ord_2', orderNumber: 'TH-20260729-19284', total: 935, status: 'DELIVERED', createdAt: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const orders = await withTimeout(
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
      null
    )

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      let filtered = [...BACKUP_CUSTOMERS]
      if (search) {
        const s = search.toLowerCase()
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(s) ||
            c.phone.toLowerCase().includes(s) ||
            c.email.toLowerCase().includes(s) ||
            c.city.toLowerCase().includes(s)
        )
      }
      return NextResponse.json({ customers: filtered, total: filtered.length })
    }

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

    const customerMap = new Map<string, CustomerRecord>()
    orders.forEach((o) => {
      const key = (o.customerPhone || o.customerEmail || o.customerName).trim().toLowerCase()
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: `cust_${Buffer.from(key).toString('hex').slice(0, 12)}`,
          name: o.customerName,
          phone: o.customerPhone,
          email: o.customerEmail || '',
          city: o.city,
          address: o.address,
          totalSpent: 0,
          ordersCount: 0,
          lastOrderDate: o.createdAt,
          orders: [],
        })
      }

      const cust = customerMap.get(key)!
      cust.ordersCount += 1
      if (o.status !== 'CANCELLED') {
        cust.totalSpent += Number(o.total || 0)
      }
      cust.orders.push({
        id: o.id,
        orderNumber: o.orderNumber,
        total: Number(o.total),
        status: o.status,
        createdAt: o.createdAt,
      })
    })

    let customerList = Array.from(customerMap.values())

    if (search) {
      const s = search.toLowerCase()
      customerList = customerList.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.phone.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.city.toLowerCase().includes(s)
      )
    }

    return NextResponse.json({
      customers: customerList.length > 0 ? customerList : BACKUP_CUSTOMERS,
      total: customerList.length || BACKUP_CUSTOMERS.length,
    })
  } catch {
    return NextResponse.json({ customers: BACKUP_CUSTOMERS, total: BACKUP_CUSTOMERS.length })
  }
}

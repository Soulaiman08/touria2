import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

interface CustomerRecord {
  id: string
  name: string
  phone: string
  email: string
  city: string
  address: string
  avatarUrl?: string | null
  isGuest: boolean
  guestLabel?: string
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
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim().toLowerCase() || ''

    // Registered customers: one row per real Customer.id, orders aggregated
    // through the customerId relation (the authoritative link). Avatar comes
    // from the Customer record. Never invent fallback identities.
    const [savedCustomers, guestOrders] = await prisma.$transaction([
      prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            select: { id: true, orderNumber: true, total: true, status: true, createdAt: true },
          },
        },
      }),
      prisma.order.findMany({
        where: { customerId: null },
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

    const customers: CustomerRecord[] = savedCustomers.map((customer) => {
      const orders = customer.orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: Number(o.total),
        status: o.status as string,
        createdAt: o.createdAt,
      }))
      const totalSpent = orders
        .filter((o) => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + Number(o.total), 0)
      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone || '',
        email: customer.email || '',
        city: customer.city || '',
        address: customer.address || '',
        avatarUrl: customer.avatarUrl,
        isGuest: false,
        totalSpent,
        ordersCount: orders.length,
        lastOrderDate: orders.length ? orders[0].createdAt : customer.createdAt,
        orders,
      }
    })

    // Guests: no Customer record is created (customerId stays null). Orders are
    // grouped by order phone/email so one guest with several orders is shown
    // once, but always labelled as a guest and never confused with an account.
    const guestMap = new Map<string, CustomerRecord>()
    for (const order of guestOrders) {
      // Guest identity proxy keyed by order phone/email (or the order id when
      // the guest left no contact info). Never creates a Customer record and
      // never merges with a registered account.
      const key = ((order.customerPhone || order.customerEmail || '')).trim().toLowerCase() || (order.customerName || '').trim().toLowerCase()
      const idKey = key
        ? `guest_${Buffer.from(key).toString('hex').slice(0, 12)}`
        : `guest_${order.id}`
      let group = guestMap.get(idKey)
      if (!group) {
        group = {
          id: idKey,
          name: order.customerName || '',
          phone: order.customerPhone || '',
          email: order.customerEmail || '',
          city: order.city || '',
          address: order.address || '',
          avatarUrl: null,
          isGuest: true,
          totalSpent: 0,
          ordersCount: 0,
          lastOrderDate: order.createdAt,
          orders: [],
        }
        guestMap.set(idKey, group)
      }
      group.lastOrderDate = group.ordersCount === 0 || order.createdAt > group.lastOrderDate
        ? order.createdAt
        : group.lastOrderDate
      group.ordersCount += 1
      if (order.status !== 'CANCELLED') {
        group.totalSpent += Number(order.total)
      }
      group.orders.push({
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt,
      })
    }

    const allCustomers = [...customers, ...guestMap.values()]

    let result = allCustomers
    if (search) {
      result = result.filter((customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.city.toLowerCase().includes(search)
      )
    }

    return NextResponse.json({ customers: result, total: result.length })
  } catch (error) {
    console.error('Failed to load admin customers:', error)
    return NextResponse.json({ error: 'Unable to load customers' }, { status: 500 })
  }
}

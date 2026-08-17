import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim().slice(0, 100)

    if (!q || q.length < 1) {
      return NextResponse.json({
        products: [],
        orders: [],
        customers: [],
        categories: [],
      })
    }

    const [products, orders, customers, categories] = await Promise.all([
      // Products search
      prisma.product.findMany({
        where: {
          OR: [
            { nameAr: { contains: q, mode: 'insensitive' } },
            { nameFr: { contains: q, mode: 'insensitive' } },
            { nameEn: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 6,
        select: {
          id: true,
          slug: true,
          nameAr: true,
          nameFr: true,
          nameEn: true,
          sku: true,
          basePrice: true,
          salePrice: true,
          mainImage: true,
          variants: {
            select: { stockQuantity: true },
          },
        },
      }),

      // Orders search
      prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: q, mode: 'insensitive' } },
            { customerName: { contains: q, mode: 'insensitive' } },
            { customerPhone: { contains: q, mode: 'insensitive' } },
            { customerEmail: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),

      // Customers search
      prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          city: true,
        },
      }),

      // Categories search
      prisma.category.findMany({
        where: {
          OR: [
            { nameAr: { contains: q, mode: 'insensitive' } },
            { nameFr: { contains: q, mode: 'insensitive' } },
            { nameEn: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: {
          id: true,
          slug: true,
          nameAr: true,
          nameFr: true,
          nameEn: true,
        },
      }),
    ])

    return NextResponse.json({
      products: products.map((p) => {
        const totalStock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0)
        return {
          id: p.id,
          name: p.nameAr || p.nameFr || p.nameEn,
          nameAr: p.nameAr,
          nameFr: p.nameFr,
          nameEn: p.nameEn,
          sku: p.sku,
          price: Number(p.salePrice ?? p.basePrice),
          stock: totalStock,
          image: p.mainImage,
          href: `/control-panel-ss7/products`,
        }
      }),
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        total: Number(o.total),
        status: o.status,
        createdAt: o.createdAt,
        href: `/control-panel-ss7/orders/${o.id}`,
      })),
      customers: customers.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        city: c.city,
        href: `/control-panel-ss7/customers`,
      })),
      categories: categories.map((cat) => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.nameAr || cat.nameFr || cat.nameEn,
        nameAr: cat.nameAr,
        nameFr: cat.nameFr,
        nameEn: cat.nameEn,
        href: `/control-panel-ss7/categories`,
      })),
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Search failed'
    console.error('[/api/admin/search]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

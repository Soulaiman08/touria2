import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'
import { getShippingCost } from '@/config/moroccan-cities'
import type { CreateOrderRequest, CreateOrderResponse, Order, ProductSnapshot } from '@/types/order'

const LOCAL_ORDERS_STORE = new Map<string, Order>()

const asNumber = (value: Prisma.Decimal | number) => Number(value)

export const orderService = {
  async createOrder(req: CreateOrderRequest): Promise<CreateOrderResponse> {
    if (!Array.isArray(req.items) || req.items.length === 0) throw new Error('Your cart is empty')
    const orderNumber = generateOrderNumber()

    const order = await prisma.$transaction(async (tx) => {
      const snapshots: Array<{ productId: string; variantId: string | null; quantity: number; unitPrice: number; totalPrice: number; snapshot: ProductSnapshot }> = []

      for (const requestedItem of req.items) {
        if (!Number.isInteger(requestedItem.quantity) || requestedItem.quantity < 1) throw new Error('Invalid product quantity')
        const product = await tx.product.findUnique({
          where: { id: requestedItem.productId },
          include: { variants: { where: { isActive: true } } },
        })
        if (!product || !product.isActive) throw new Error('A selected product is unavailable')
        if ((requestedItem.niqabItems?.length ?? 0) > 0 && !product.canAddNiqab) throw new Error('This product does not allow niqab add-ons')

        const variant = requestedItem.variantId
          ? product.variants.find((entry) => entry.id === requestedItem.variantId)
          : product.variants.length === 0 ? null : undefined
        if (variant === undefined) throw new Error('Please select a valid product variant')
        if (variant) {
          const result = await tx.productVariant.updateMany({
            where: { id: variant.id, stockQuantity: { gte: requestedItem.quantity } },
            data: { stockQuantity: { decrement: requestedItem.quantity } },
          })
          if (result.count !== 1) throw new Error('The requested product quantity is no longer in stock')
        }

        const unitPrice = asNumber(product.salePrice ?? product.basePrice) + (variant ? asNumber(variant.priceModifier) : 0)
        const niqabs: ProductSnapshot['niqabs'] = []
        for (const requestedNiqab of requestedItem.niqabItems ?? []) {
          if (!Number.isInteger(requestedNiqab.quantity) || requestedNiqab.quantity < 1) throw new Error('Invalid niqab quantity')
          const niqabProduct = await tx.product.findUnique({
            where: { id: requestedNiqab.productId },
            include: { variants: { where: { isActive: true } } },
          })
          if (!niqabProduct || !niqabProduct.isActive || !niqabProduct.isNiqab) throw new Error('A selected niqab is unavailable')
          const niqabVariant = requestedNiqab.variantId
            ? niqabProduct.variants.find((entry) => entry.id === requestedNiqab.variantId)
            : niqabProduct.variants.length === 0 ? null : undefined
          if (niqabVariant === undefined) throw new Error('Please select a valid niqab variant')
          if (niqabVariant) {
            const result = await tx.productVariant.updateMany({
              where: { id: niqabVariant.id, stockQuantity: { gte: requestedNiqab.quantity } },
              data: { stockQuantity: { decrement: requestedNiqab.quantity } },
            })
            if (result.count !== 1) throw new Error('The requested niqab quantity is no longer in stock')
          }
          const niqabUnitPrice = asNumber(niqabProduct.salePrice ?? niqabProduct.basePrice) + (niqabVariant ? asNumber(niqabVariant.priceModifier) : 0)
          niqabs.push({
            id: requestedNiqab.variantId ?? requestedNiqab.productId,
            productId: niqabProduct.id, variantId: niqabVariant?.id ?? null,
            nameAr: niqabProduct.nameAr, nameFr: niqabProduct.nameFr, nameEn: niqabProduct.nameEn,
            image: niqabVariant?.images[0] ?? niqabProduct.mainImage,
            color: { code: niqabVariant?.colorCode ?? '', nameAr: niqabVariant?.colorNameAr ?? '', nameFr: niqabVariant?.colorNameFr ?? '', nameEn: niqabVariant?.colorNameEn ?? '' },
            quantity: requestedNiqab.quantity, unitPrice: niqabUnitPrice, totalPrice: niqabUnitPrice * requestedNiqab.quantity,
          })
        }
        const totalPrice = unitPrice * requestedItem.quantity
        snapshots.push({
          productId: product.id, variantId: variant?.id ?? null, quantity: requestedItem.quantity, unitPrice, totalPrice,
          snapshot: {
            productId: product.id, variantId: variant?.id ?? null, nameAr: product.nameAr, nameFr: product.nameFr, nameEn: product.nameEn,
            mainImage: variant?.images[0] ?? product.mainImage, sku: product.sku,
            selectedSize: variant?.size ?? '', selectedColor: { code: variant?.colorCode ?? '', nameAr: variant?.colorNameAr ?? '', nameFr: variant?.colorNameFr ?? '', nameEn: variant?.colorNameEn ?? '' },
            quantity: requestedItem.quantity, unitPrice, totalPrice, niqabs,
          },
        })
      }

      const subtotal = snapshots.reduce((sum, item) => sum + item.totalPrice + item.snapshot.niqabs.reduce((addOnSum, niqab) => addOnSum + niqab.totalPrice, 0), 0)
      const shippingCost = getShippingCost(req.formData.city)
      const createdOrder = await tx.order.create({ data: {
        orderNumber, customerName: req.formData.customerName, customerPhone: req.formData.customerPhone,
        customerPhone2: req.formData.customerPhone2 || null, customerEmail: req.formData.customerEmail || null,
        region: req.formData.region || '', city: req.formData.city, district: req.formData.district || null,
        address: req.formData.address, postalCode: req.formData.postalCode || null, notes: req.formData.notes || null,
        subtotal, shippingCost, total: subtotal + shippingCost, locale: req.locale, paymentStatus: 'PENDING', status: 'PENDING',
      } })
      await Promise.all(snapshots.map((item) => tx.orderItem.create({ data: {
        orderId: createdOrder.id, productId: item.productId, variantId: item.variantId, quantity: item.quantity,
        unitPrice: item.unitPrice, totalPrice: item.totalPrice, productSnapshot: item.snapshot as unknown as Prisma.InputJsonValue,
      } })))
      await tx.orderStatusHistory.create({ data: { orderId: createdOrder.id, status: 'PENDING', note: 'Order placed by guest' } })
      return createdOrder
    })
    return { success: true, order: { id: order.id, orderNumber: order.orderNumber } }
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const dbOrder = await prisma.order.findUnique({ where: { id }, include: { items: true } })
      if (!dbOrder) return LOCAL_ORDERS_STORE.get(id) || null
      return { ...dbOrder, subtotal: Number(dbOrder.subtotal), shippingCost: Number(dbOrder.shippingCost), discountAmount: Number(dbOrder.discountAmount), total: Number(dbOrder.total), items: dbOrder.items.map((item) => ({ ...item, unitPrice: Number(item.unitPrice), totalPrice: Number(item.totalPrice), productSnapshot: item.productSnapshot as unknown as ProductSnapshot })) } as unknown as Order
    } catch { return LOCAL_ORDERS_STORE.get(id) || null }
  },
}

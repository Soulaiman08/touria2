import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'
import { DEFAULT_SHIPPING_PRICE, getCityByValue, MOROCCAN_CITIES } from '@/config/moroccan-cities'
import type { CreateOrderRequest, CreateOrderResponse, Order, ProductSnapshot } from '@/types/order'

const LOCAL_ORDERS_STORE = new Map<string, Order>()

const asNumber = (value: Prisma.Decimal | number) => Number(value)

const CITY_KEY_PREFIX = 'shipping:city:'
const DEFAULT_SHIPPING_KEY = 'shipping:default'

/**
 * Server-side shipping price lookup.
 * Reads from DB (SiteSetting), falls back to DEFAULT_SHIPPING_PRICE.
 * Also validates that the city is a known Moroccan city.
 *
 * @throws Error if city is unknown or region doesn't match
 */
async function resolveShippingCost(
  cityValue: string,
  regionValue: string,
  tx: Prisma.TransactionClient
): Promise<number> {
  // Validate city exists in our dataset
  const cityInfo = getCityByValue(cityValue)
  if (!cityInfo) {
    throw new Error('Invalid city selected')
  }

  // Validate region matches the city
  if (regionValue && cityInfo.regionId !== regionValue) {
    throw new Error('Selected city does not belong to the selected region')
  }

  // Look up city-specific price, then default, then hardcoded fallback
  const [cityRow, defaultRow] = await Promise.all([
    tx.siteSetting.findUnique({ where: { key: `${CITY_KEY_PREFIX}${cityValue}` } }),
    tx.siteSetting.findUnique({ where: { key: DEFAULT_SHIPPING_KEY } }),
  ])

  const defaultPrice = defaultRow ? (Number(defaultRow.value) || DEFAULT_SHIPPING_PRICE) : DEFAULT_SHIPPING_PRICE
  return cityRow ? (Number(cityRow.value) || defaultPrice) : defaultPrice
}

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
            isNiqab: product.isNiqab,
            selectedSize: product.isNiqab ? '' : (variant?.size ?? ''),
            selectedColor: { code: variant?.colorCode ?? '', nameAr: variant?.colorNameAr ?? '', nameFr: variant?.colorNameFr ?? '', nameEn: variant?.colorNameEn ?? '' },
            quantity: requestedItem.quantity, unitPrice, totalPrice, niqabs,
          },
        })
      }

      const subtotal = snapshots.reduce((sum, item) => sum + item.totalPrice + item.snapshot.niqabs.reduce((addOnSum, niqab) => addOnSum + niqab.totalPrice, 0), 0)

      // ── Server-side shipping price resolution (DB-backed, tamper-proof) ──
      const shippingCost = await resolveShippingCost(
        req.formData.city,
        req.formData.region || '',
        tx,
      )

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

      // Create Admin Notification for the new order
      try {
        await tx.adminNotification.create({
          data: {
            type: 'ORDER',
            title: `طلب جديد #${createdOrder.orderNumber}`,
            description: `${createdOrder.customerName} — ${Number(createdOrder.total)} د.م.`,
            targetUrl: `/admin/orders/${createdOrder.id}`,
            referenceId: `order-${createdOrder.id}`,
            isRead: false,
          },
        })
      } catch (err) {
        console.error('Failed to create order notification:', err)
      }

      // Check stock alerts for updated variants
      try {
        const variantIds = snapshots.map((s) => s.variantId).filter(Boolean) as string[]
        if (variantIds.length > 0) {
          const updatedVariants = await tx.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: { product: true },
          })
          for (const v of updatedVariants) {
            if (v.stockQuantity === 0) {
              await tx.adminNotification.create({
                data: {
                  type: 'OUT_OF_STOCK',
                  title: `المنتج نفد من المخزون`,
                  description: `${v.product.nameAr || v.product.nameFr} (${v.size} - ${v.colorNameAr})`,
                  targetUrl: `/admin/products`,
                  referenceId: `stock-out-${v.id}`,
                  isRead: false,
                },
              })
            } else if (v.stockQuantity > 0 && v.stockQuantity <= 3) {
              await tx.adminNotification.create({
                data: {
                  type: 'LOW_STOCK',
                  title: `المخزون منخفض`,
                  description: `${v.product.nameAr || v.product.nameFr} (${v.size} - ${v.colorNameAr}) — بقي ${v.stockQuantity} فقط`,
                  targetUrl: `/admin/products`,
                  referenceId: `stock-low-${v.id}-${v.stockQuantity}`,
                  isRead: false,
                },
              })
            }
          }
        }
      } catch (err) {
        console.error('Failed to create stock alert notifications:', err)
      }

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

// Re-export for any legacy usage
export { MOROCCAN_CITIES }

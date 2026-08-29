import { formatPrice } from '@/lib/utils'
import { resolveOrderColor } from '@/lib/color-names'

export interface WhatsAppProductSnapshot {
  nameAr?: string
  nameFr?: string
  nameEn?: string
  mainImage?: string
  sku?: string
  size?: string
  selectedSize?: string
  color?: unknown
  selectedColor?: unknown
  isNiqab?: boolean
  niqabs?: Array<{
    id?: string
    nameAr?: string
    nameFr?: string
    nameEn?: string
    color?: unknown
    quantity?: number
    unitPrice?: number
    totalPrice?: number
  }>
  [key: string]: unknown
}

export interface WhatsAppOrderItem {
  id?: string
  quantity: number
  unitPrice: number | string
  totalPrice: number | string
  productSnapshot?: WhatsAppProductSnapshot | Record<string, unknown> | null
  product?: {
    nameAr?: string
    nameFr?: string
    nameEn?: string
    [key: string]: unknown
  } | null
}

export interface WhatsAppOrderData {
  id?: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerPhone2?: string | null
  customerEmail?: string | null
  region?: string | null
  city: string
  district?: string | null
  address: string
  postalCode?: string | null
  notes?: string | null
  subtotal: number | string
  shippingCost: number | string
  discountAmount?: number | string | null
  total: number | string
  paymentMethod?: string | null
  paymentStatus?: string | null
  locale?: string | null
  createdAt?: string | Date | null
  items: WhatsAppOrderItem[]
}

const SEPARATOR = '━━━━━━━━━━━━━━━━━━'

function cleanStr(val: unknown): string {
  if (val === null || val === undefined) return ''
  const str = String(val).trim()
  if (['undefined', 'null', 'n/a', 'na', 'none'].includes(str.toLowerCase())) {
    return ''
  }
  return str
}

function formatDate(dateVal?: string | Date | null, locale: string = 'ar'): string {
  if (!dateVal) return ''
  try {
    const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal
    if (isNaN(d.getTime())) return ''

    const intlLocale = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-MA' : 'en-US'
    return new Intl.DateTimeFormat(intlLocale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d)
  } catch {
    return ''
  }
}

function isRealSize(sizeStr?: string): boolean {
  if (!sizeStr) return false
  const clean = sizeStr.toLowerCase().trim()
  const fakeSizes = ['standard', 'one size', 'onesize', 'n/a', 'na', 'none', 'undefined', 'null', '']
  return !fakeSizes.includes(clean)
}

/**
 * Generates a clean, beautifully formatted WhatsApp text message for an order.
 * Accurately displays: Quantity -> Unit Price -> Total for every item and Niqab add-on.
 * Works strictly on the client side with 100% null safety and localization support (AR, FR, EN).
 */
export function generateWhatsAppOrderMessage(order: WhatsAppOrderData): string {
  const rawLocale = cleanStr(order.locale).toLowerCase()
  const locale = rawLocale.startsWith('fr') ? 'fr' : rawLocale.startsWith('en') ? 'en' : 'ar'

  const lines: string[] = []

  // 1. Header & Store Branding
  lines.push(SEPARATOR)
  if (locale === 'fr') {
    lines.push('🛍️ *Nouvelle Commande - Thuraya Al Maghribi*')
  } else if (locale === 'en') {
    lines.push('🛍️ *New Order - Thuraya Al Maghribi*')
  } else {
    lines.push('🛍️ *طلب جديد - ثريا المغربي*')
  }
  lines.push(SEPARATOR)
  lines.push('')

  // 2. Order Information
  if (locale === 'fr') {
    lines.push('📦 *Informations de la commande*')
    lines.push(`N° de commande: #${cleanStr(order.orderNumber)}`)
    const formattedDate = formatDate(order.createdAt, 'fr')
    if (formattedDate) lines.push(`Date: ${formattedDate}`)
  } else if (locale === 'en') {
    lines.push('📦 *Order Information*')
    lines.push(`Order #: #${cleanStr(order.orderNumber)}`)
    const formattedDate = formatDate(order.createdAt, 'en')
    if (formattedDate) lines.push(`Date: ${formattedDate}`)
  } else {
    lines.push('📦 *معلومات الطلب*')
    lines.push(`رقم الطلب: #${cleanStr(order.orderNumber)}`)
    const formattedDate = formatDate(order.createdAt, 'ar')
    if (formattedDate) lines.push(`التاريخ: ${formattedDate}`)
  }
  lines.push('')

  // 3. Customer Information
  const customerName = cleanStr(order.customerName)
  const phone = cleanStr(order.customerPhone)
  const phone2 = cleanStr(order.customerPhone2)

  if (locale === 'fr') {
    lines.push('👤 *Client*')
    lines.push(`Nom: ${customerName}`)
    lines.push(`Téléphone: ${phone}`)
    if (phone2) lines.push(`Téléphone 2: ${phone2}`)
  } else if (locale === 'en') {
    lines.push('👤 *Customer*')
    lines.push(`Name: ${customerName}`)
    lines.push(`Phone: ${phone}`)
    if (phone2) lines.push(`Secondary Phone: ${phone2}`)
  } else {
    lines.push('👤 *العميل*')
    lines.push(`الاسم: ${customerName}`)
    lines.push(`الهاتف: ${phone}`)
    if (phone2) lines.push(`الهاتف الإضافي: ${phone2}`)
  }
  lines.push('')

  // 4. Delivery Address
  const region = cleanStr(order.region)
  const city = cleanStr(order.city)
  const district = cleanStr(order.district)
  const address = cleanStr(order.address)
  const postalCode = cleanStr(order.postalCode)

  if (locale === 'fr') {
    lines.push('📍 *Adresse de livraison*')
    if (region) lines.push(`Région: ${region}`)
    lines.push(`Ville: ${city}`)
    if (district) lines.push(`Quartier: ${district}`)
    lines.push(`Adresse: ${address}`)
    if (postalCode) lines.push(`Code postal: ${postalCode}`)
  } else if (locale === 'en') {
    lines.push('📍 *Delivery Address*')
    if (region) lines.push(`Region: ${region}`)
    lines.push(`City: ${city}`)
    if (district) lines.push(`District: ${district}`)
    lines.push(`Address: ${address}`)
    if (postalCode) lines.push(`Postal Code: ${postalCode}`)
  } else {
    lines.push('📍 *عنوان التوصيل*')
    if (region) lines.push(`الجهة: ${region}`)
    lines.push(`المدينة: ${city}`)
    if (district) lines.push(`الحي: ${district}`)
    lines.push(`العنوان: ${address}`)
    if (postalCode) lines.push(`الرمز البريدي: ${postalCode}`)
  }
  lines.push('')

  // 5. Products List
  if (locale === 'fr') {
    lines.push('🛒 *Produits*')
  } else if (locale === 'en') {
    lines.push('🛒 *Products*')
  } else {
    lines.push('🛒 *المنتجات*')
  }

  const items = Array.isArray(order.items) ? order.items : []
  for (const item of items) {
    const snap = (item.productSnapshot || {}) as WhatsAppProductSnapshot
    const nameAr = cleanStr(snap.nameAr) || cleanStr(item.product?.nameAr)
    const nameFr = cleanStr(snap.nameFr) || cleanStr(item.product?.nameFr)
    const nameEn = cleanStr(snap.nameEn) || cleanStr(item.product?.nameEn)

    let prodName = ''
    if (locale === 'fr') {
      prodName = nameFr || nameAr || nameEn || 'Produit'
    } else if (locale === 'en') {
      prodName = nameEn || nameAr || nameFr || 'Product'
    } else {
      prodName = nameAr || nameFr || nameEn || 'منتج'
    }

    lines.push(`• *${prodName}*`)

    // Size
    const rawSize = cleanStr(snap.selectedSize) || cleanStr(snap.size)
    const isNiqab = Boolean(
      snap.isNiqab ||
      /نقاب/i.test(nameAr) ||
      /niqab/i.test(nameFr) ||
      /niqab/i.test(nameEn)
    )
    if (!isNiqab && isRealSize(rawSize)) {
      if (locale === 'fr') {
        lines.push(`  Taille: ${rawSize}`)
      } else if (locale === 'en') {
        lines.push(`  Size: ${rawSize}`)
      } else {
        lines.push(`  المقاس: ${rawSize}`)
      }
    }

    // Color
    const colorInfo = resolveOrderColor(snap.selectedColor || snap.color, locale)
    if (colorInfo.name) {
      if (locale === 'fr') {
        lines.push(`  Couleur: ${colorInfo.name}`)
      } else if (locale === 'en') {
        lines.push(`  Color: ${colorInfo.name}`)
      } else {
        lines.push(`  اللون: ${colorInfo.name}`)
      }
    }

    // Quantity, Unit Price & Total Calculation
    const qty = Number(item.quantity) > 0 ? Number(item.quantity) : 1
    let unitPriceNum = Number(item.unitPrice) || 0
    let lineTotalNum = Number(item.totalPrice) || 0

    if (unitPriceNum === 0 && lineTotalNum > 0 && qty > 0) {
      unitPriceNum = lineTotalNum / qty
    } else if (lineTotalNum === 0 && unitPriceNum > 0) {
      lineTotalNum = unitPriceNum * qty
    } else if (lineTotalNum === 0 && unitPriceNum === 0) {
      lineTotalNum = 0
    }

    const formattedUnitPrice = formatPrice(unitPriceNum, locale)
    const formattedLineTotal = formatPrice(lineTotalNum, locale)

    if (locale === 'fr') {
      lines.push(`  Quantité: ${qty}`)
      lines.push(`  Prix unitaire: ${formattedUnitPrice}`)
      lines.push(`  Total: ${formattedLineTotal}`)
    } else if (locale === 'en') {
      lines.push(`  Quantity: ${qty}`)
      lines.push(`  Unit Price: ${formattedUnitPrice}`)
      lines.push(`  Total: ${formattedLineTotal}`)
    } else {
      lines.push(`  الكمية: ${qty}`)
      lines.push(`  سعر الوحدة: ${formattedUnitPrice}`)
      lines.push(`  الإجمالي: ${formattedLineTotal}`)
    }

    // Niqab Add-ons
    if (Array.isArray(snap.niqabs) && snap.niqabs.length > 0) {
      for (const niqab of snap.niqabs) {
        const niqabNameAr = cleanStr(niqab.nameAr)
        const niqabNameFr = cleanStr(niqab.nameFr)
        const niqabNameEn = cleanStr(niqab.nameEn)
        const niqabTitle =
          (locale === 'fr' ? (niqabNameFr || niqabNameAr) : locale === 'en' ? (niqabNameEn || niqabNameAr) : (niqabNameAr || niqabNameFr)) ||
          (locale === 'fr' ? 'Niqab' : locale === 'en' ? 'Niqab' : 'نقاب')

        const niqabColorInfo = resolveOrderColor(niqab.color, locale)
        const niqabQty = Number(niqab.quantity) > 0 ? Number(niqab.quantity) : 1
        let niqabUnitPrice = Number(niqab.unitPrice) || 0
        let niqabTotal = Number(niqab.totalPrice) || 0

        if (niqabUnitPrice === 0 && niqabTotal > 0 && niqabQty > 0) {
          niqabUnitPrice = niqabTotal / niqabQty
        } else if (niqabTotal === 0 && niqabUnitPrice > 0) {
          niqabTotal = niqabUnitPrice * niqabQty
        }

        const formattedNiqabUnitPrice = formatPrice(niqabUnitPrice, locale)
        const formattedNiqabTotal = formatPrice(niqabTotal, locale)

        if (locale === 'fr') {
          lines.push(`  • *Niqab:* ${niqabTitle}`)
          if (niqabColorInfo.name) lines.push(`    Couleur: ${niqabColorInfo.name}`)
          lines.push(`    Quantité: ${niqabQty}`)
          lines.push(`    Prix unitaire: ${formattedNiqabUnitPrice}`)
          lines.push(`    Total: ${formattedNiqabTotal}`)
        } else if (locale === 'en') {
          lines.push(`  • *Niqab:* ${niqabTitle}`)
          if (niqabColorInfo.name) lines.push(`    Color: ${niqabColorInfo.name}`)
          lines.push(`    Quantity: ${niqabQty}`)
          lines.push(`    Unit Price: ${formattedNiqabUnitPrice}`)
          lines.push(`    Total: ${formattedNiqabTotal}`)
        } else {
          lines.push(`  • *نقاب:* ${niqabTitle}`)
          if (niqabColorInfo.name) lines.push(`    اللون: ${niqabColorInfo.name}`)
          lines.push(`    الكمية: ${niqabQty}`)
          lines.push(`    سعر الوحدة: ${formattedNiqabUnitPrice}`)
          lines.push(`    الإجمالي: ${formattedNiqabTotal}`)
        }
      }
    }
  }

  lines.push('')
  lines.push(SEPARATOR)
  lines.push('')

  // 6. Order Summary
  const subtotalNum = Number(order.subtotal) || 0
  const shippingNum = Number(order.shippingCost) || 0
  const discountNum = Number(order.discountAmount) || 0
  const totalNum = Number(order.total) || 0

  if (locale === 'fr') {
    lines.push('💰 *Récapitulatif de la commande*')
    lines.push(`Sous-total: ${formatPrice(subtotalNum, 'fr')}`)
    lines.push(`Livraison: ${shippingNum === 0 ? 'Gratuite' : formatPrice(shippingNum, 'fr')}`)
    if (discountNum > 0) {
      lines.push(`Remise: -${formatPrice(discountNum, 'fr')}`)
    }
    lines.push(`*Total: ${formatPrice(totalNum, 'fr')}*`)
    lines.push('')
    lines.push('💳 Mode de paiement: Paiement à la livraison (COD)')
  } else if (locale === 'en') {
    lines.push('💰 *Order Summary*')
    lines.push(`Subtotal: ${formatPrice(subtotalNum, 'en')}`)
    lines.push(`Shipping: ${shippingNum === 0 ? 'Free' : formatPrice(shippingNum, 'en')}`)
    if (discountNum > 0) {
      lines.push(`Discount: -${formatPrice(discountNum, 'en')}`)
    }
    lines.push(`*Total: ${formatPrice(totalNum, 'en')}*`)
    lines.push('')
    lines.push('💳 Payment Method: Cash on Delivery (COD)')
  } else {
    lines.push('💰 *ملخص الطلب*')
    lines.push(`المجموع الفرعي: ${formatPrice(subtotalNum, 'ar')}`)
    lines.push(`الشحن: ${shippingNum === 0 ? 'مجانًا' : formatPrice(shippingNum, 'ar')}`)
    if (discountNum > 0) {
      lines.push(`الخصم: -${formatPrice(discountNum, 'ar')}`)
    }
    lines.push(`*الإجمالي: ${formatPrice(totalNum, 'ar')}*`)
    lines.push('')
    lines.push('💳 طريقة الدفع: الدفع نقدًا عند الاستلام (COD)')
  }

  // 7. Customer Notes (if present)
  const notes = cleanStr(order.notes)
  if (notes) {
    lines.push('')
    if (locale === 'fr') {
      lines.push('📝 *Remarques du client*')
      lines.push(notes)
    } else if (locale === 'en') {
      lines.push('📝 *Customer Notes*')
      lines.push(notes)
    } else {
      lines.push('📝 *ملاحظات العميل*')
      lines.push(notes)
    }
  }

  // 8. Footer Branding
  lines.push('')
  lines.push(SEPARATOR)
  if (locale === 'fr') {
    lines.push('Merci pour votre commande chez *Thuraya Al Maghribi* 🌸')
  } else if (locale === 'en') {
    lines.push('Thank you for ordering from *Thuraya Al Maghribi* 🌸')
  } else {
    lines.push('شكراً لطلبكم من *ثريا المغربي* 🌸')
  }
  lines.push(SEPARATOR)

  return lines.join('\n')
}

// ==========================================
// CART MATH
// ==========================================
//
// The same (shared) niqab selection used to be embedded inside EVERY
// djellaba cart item, causing it to be counted once per djellaba. To
// keep the cart consistent with how orders are stored (one standalone
// niqab order item), these helpers count each distinct niqab (product
// + variant) only ONCE across the whole cart, using the selection's
// quantity (all djellabas in one addition share the same quantity).

import type { CartItem, NiqabAddOn } from '@/types/cart'

// Aggregated niqab add-ons across all cart items, grouped by
// productId + variantId.
export function aggregateNiqabs(
  items: CartItem[],
): Array<NiqabAddOn & { quantity: number }> {
  const map = new Map<string, NiqabAddOn & { quantity: number }>()

  for (const item of items) {
    if (!Array.isArray(item.niqabItems)) continue
    for (const niqab of item.niqabItems) {
      const key = `${niqab.productId}:${niqab.variantId ?? ''}`
      const existing = map.get(key)
      if (existing) {
        existing.quantity = Math.max(existing.quantity, niqab.quantity)
      } else {
        map.set(key, {
          ...niqab,
          quantity: niqab.quantity,
        })
      }
    }
  }

  return Array.from(map.values())
}

// Subtotal that counts each distinct niqab only once across the cart.
// Standalone niqab cart items (isNiqab: true) already carry their own
// product price and are counted as products.
export function computeCartSubtotal(items: CartItem[]): number {
  const productsTotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  const niqabsTotal = aggregateNiqabs(items).reduce(
    (sum, niqab) => sum + niqab.unitPrice * niqab.quantity,
    0,
  )

  return productsTotal + niqabsTotal
}

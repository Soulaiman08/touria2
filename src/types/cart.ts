// ==========================================
// CART TYPES
// ==========================================

export interface CartItem {
  id: string // cart item UUID
  productId: string
  variantId?: string
  slug: string
  nameAr: string
  nameFr: string
  nameEn: string
  mainImage: string
  size: string
  colorCode: string
  colorNameAr: string
  colorNameFr: string
  colorNameEn: string
  quantity: number
  unitPrice: number
  isNiqab: boolean
  // linked niqab add-on (optional)
  niqabItem?: NiqabAddOn
}

export interface NiqabAddOn {
  productId: string
  variantId?: string
  nameAr: string
  nameFr: string
  nameEn: string
  mainImage: string
  colorCode: string
  colorNameAr: string
  colorNameFr: string
  colorNameEn: string
  unitPrice: number
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  // Computed
  totalItems: number
  subtotal: number
}

export interface CartSummary {
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  itemCount: number
}

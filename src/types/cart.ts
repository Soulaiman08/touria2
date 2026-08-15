// ==========================================
// CART TYPES
// ==========================================

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

  quantity: number
  unitPrice: number
}

export interface CartItem {
  id: string

  productId: string
  variantId?: string

  slug: string

  nameAr: string
  nameFr: string
  nameEn: string

  mainImage: string

  size?: string

  colorCode: string
  colorNameAr: string
  colorNameFr: string
  colorNameEn: string

  quantity: number
  unitPrice: number

  isNiqab: boolean

  // ==========================================
  // MULTIPLE NIQAB ADD-ONS
  // ==========================================
  //
  // مثال:
  //
  // أسود × 2
  // بني × 3
  // بيج × 1
  //
  niqabItems?: NiqabAddOn[]
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean

  // ==========================================
  // ACTIONS
  // ==========================================

  addItem: (item: Omit<CartItem, 'id'>) => void

  removeItem: (id: string) => void

  updateQuantity: (
    id: string,
    quantity: number,
  ) => void

  clearCart: () => void

  openCart: () => void

  closeCart: () => void

  toggleCart: () => void

  // ==========================================
  // COMPUTED
  // ==========================================

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
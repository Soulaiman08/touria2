// ==========================================
// ORDER TYPES
// ==========================================

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId?: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  productSnapshot: ProductSnapshot
  createdAt: Date
}

export interface ProductSnapshot {
  nameAr: string
  nameFr: string
  nameEn: string
  mainImage: string
  size: string
  colorCode: string
  colorNameAr: string
  colorNameFr: string
  colorNameEn: string
  sku: string
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentMethod: string
  paymentStatus: string
  customerName: string
  customerPhone: string
  customerPhone2?: string | null
  customerEmail?: string | null
  city: string
  district?: string | null
  address: string
  postalCode?: string | null
  notes?: string | null
  subtotal: number
  shippingCost: number
  discountAmount: number
  total: number
  locale: string
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderStatusHistory {
  id: string
  orderId: string
  status: OrderStatus
  note?: string | null
  createdAt: Date
}

// ==========================================
// CHECKOUT FORM TYPES
// ==========================================

export interface CheckoutFormData {
  // Personal info
  customerName: string
  customerPhone: string
  customerPhone2?: string
  customerEmail?: string
  // Address
  city: string
  district?: string
  address: string
  postalCode?: string
  notes?: string
}

// ==========================================
// CREATE ORDER REQUEST
// ==========================================

export interface CreateOrderRequest {
  formData: CheckoutFormData
  items: Array<{
    productId: string
    variantId?: string
    quantity: number
    unitPrice: number
    productSnapshot: ProductSnapshot
  }>
  subtotal: number
  shippingCost: number
  total: number
  locale: string
}

export interface CreateOrderResponse {
  success: boolean
  order?: {
    id: string
    orderNumber: string
  }
  error?: string
}

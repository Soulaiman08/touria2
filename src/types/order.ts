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
  productId: string
  variantId?: string | null
  nameAr: string
  nameFr: string
  nameEn: string
  mainImage: string
  selectedSize: string
  selectedColor: { code: string; nameAr: string; nameFr: string; nameEn: string }
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
  niqabs: Array<{
    id: string
    productId: string
    variantId?: string | null
    nameAr: string
    nameFr: string
    nameEn: string
    image: string
    color: { code: string; nameAr: string; nameFr: string; nameEn: string }
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
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
  region: string
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
  region: string
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
    niqabItems?: Array<{ productId: string; variantId?: string; quantity: number }>
  }>
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

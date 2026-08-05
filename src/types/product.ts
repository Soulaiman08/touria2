// ==========================================
// PRODUCT TYPES
// ==========================================

export interface Category {
  id: string
  slug: string
  nameAr: string
  nameFr: string
  nameEn: string
  descriptionAr?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  image?: string | null
  sortOrder: number
  isActive: boolean
  parentId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  productId: string
  size: string
  colorCode: string
  colorNameAr: string
  colorNameFr: string
  colorNameEn: string
  stockQuantity: number
  priceModifier: number | string
  images: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  slug: string
  sku: string
  nameAr: string
  nameFr: string
  nameEn: string
  descriptionAr: string
  descriptionFr: string
  descriptionEn: string
  basePrice: number | string
  salePrice?: number | string | null
  categoryId: string
  category?: Category
  isActive: boolean
  isFeatured: boolean
  isNiqab: boolean
  canAddNiqab: boolean
  mainImage: string
  images: string[]
  tags: string[]
  metaTitleAr?: string | null
  metaTitleFr?: string | null
  metaTitleEn?: string | null
  metaDescAr?: string | null
  metaDescFr?: string | null
  metaDescEn?: string | null
  sortOrder: number
  variants?: ProductVariant[]
  createdAt: Date
  updatedAt: Date
}

// Simplified product card type for listing
export interface ProductCard {
  id: string
  slug: string
  nameAr: string
  nameFr: string
  nameEn: string
  basePrice: number
  salePrice?: number | null
  mainImage: string
  isFeatured: boolean
  isNiqab: boolean
  canAddNiqab: boolean
  category?: Pick<Category, 'id' | 'slug' | 'nameAr' | 'nameFr' | 'nameEn'>
  availableColors?: Array<{
    code: string
    nameAr: string
    nameFr: string
    nameEn: string
  }>
  availableSizes?: string[]
}

// ==========================================
// PRODUCT FILTER TYPES
// ==========================================

export interface ProductFilters {
  category?: string
  size?: string
  colorCode?: string
  minPrice?: number
  maxPrice?: number
  isNiqab?: boolean
  isFeatured?: boolean
  search?: string
  sort?: 'newest' | 'priceAsc' | 'priceDesc' | 'featured'
  page?: number
  limit?: number
}

export interface PaginatedProducts {
  items: ProductCard[]
  total: number
  page: number
  limit: number
  totalPages: number
}

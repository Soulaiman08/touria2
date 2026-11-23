'use client'

import React, { Suspense, useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageSquare,
  Loader2,
  Palette,
  Ruler,
  ChevronDown,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { useAdminI18n } from '@/components/admin/providers/AdminI18nContext'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { ImageUploader } from '@/components/admin/ui/ImageUploader'
import { formatPrice } from '@/lib/utils'
import { getColorNames } from '@/lib/color-names'
import {
  getDefaultCategoryConfig,
  isNiqabIdentity,
  LETTER_PRESET_SIZES,
  NUMERIC_PRESET_SIZES,
  STANDARD_PRESET_SIZES,
  type CategoryConfig,
} from '@/lib/category-config'

interface ProductItem {
  id: string
  sku: string
  slug: string
  name: string
  nameAr?: string
  nameFr?: string
  nameEn?: string
  descriptionAr?: string
  descriptionFr?: string
  descriptionEn?: string
  basePrice: number
  salePrice: number | null
  stock: number
  categoryId: string
  category?: {
    id: string
    nameAr?: string
    nameFr?: string
    nameEn?: string
    name?: string
    slug: string
  }
  mainImage: string
  images: string[]
  colors: {
    code: string
    nameAr?: string
    nameFr?: string
    nameEn?: string
  }[]
  sizes: string[]
  isFeatured: boolean
  isActive: boolean
  canAddNiqab?: boolean
}

interface CategoryOption {
  id: string
  name?: string
  nameAr?: string
  nameFr?: string
  nameEn?: string
  slug: string
  config?: CategoryConfig
}

interface ReviewItem {
  id: string
  rating: number
  comment: string
  createdAt: string
  customer: {
    id: string
    name: string
    email: string | null
    avatarUrl: string | null
  }
}

interface ApiProductsResponse {
  items?: ProductItem[]
  products?: ProductItem[]
  totalPages?: number
  error?: string
  message?: string
}

interface ApiMessageResponse {
  error?: string
  message?: string
}

type LangTab = 'ar' | 'fr' | 'en'

const PRESET_COLORS = [
  '#000000',
  '#3B2316',
  '#6B1D2F',
  '#C4622D',
  '#C88B12',
  '#0F5132',
  '#1B2A4A',
  '#F2E4CE',
]

function resolveCategoryConfig(category?: CategoryOption | null): CategoryConfig {
  return category?.config ?? getDefaultCategoryConfig(category)
}

function parseColorTokens(str: string): string[] {
  return Array.from(
    new Set(
      str
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => (c.startsWith('#') ? c : `#${c}`).toUpperCase())
    )
  )
}

function parseSizeTokens(str: string): string[] {
  return Array.from(
    new Set(
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  )
}

async function fetchCategoriesApi(): Promise<CategoryOption[]> {
  try {
    const res = await fetch('/api/admin/categories', {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`Failed to fetch categories (${res.status})`)
    const data = (await res.json()) as {
      items?: CategoryOption[]
      categories?: CategoryOption[]
    }
    return Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.categories)
        ? data.categories
        : []
  } catch (err) {
    console.error('Error fetching categories:', err)
    return []
  }
}

function ProductContent({ initialSearch }: { initialSearch: string }) {
  const { tr, formatDate, isRTL, locale, dir } = useAdminI18n()
  const [products, setProducts] = useState<ProductItem[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [refreshTick, setRefreshTick] = useState(0)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeLangTab, setActiveLangTab] = useState<LangTab>('ar')
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Color & Size picker helpers
  const [pickerColor, setPickerColor] = useState('#C4622D')
  const [customSizeInput, setCustomSizeInput] = useState('')

  // Reviews modal state
  const [reviewsTarget, setReviewsTarget] = useState<ProductItem | null>(null)
  const [reviewsData, setReviewsData] = useState<ReviewItem[]>([])
  const [reviewsCount, setReviewsCount] = useState(0)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsDeleting, setReviewsDeleting] = useState<string | null>(null)
  const [reviewDeleteConfirm, setReviewDeleteConfirm] = useState<ReviewItem | null>(null)

  const [formData, setFormData] = useState({
    nameAr: '',
    nameFr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionFr: '',
    descriptionEn: '',
    sku: '',
    basePrice: '',
    salePrice: '',
    stock: '20',
    categoryId: '',
    mainImage: '',
    images: [] as string[],
    colors: '#C4622D, #F2E4CE, #000000',
    sizes: 'S, M, L, XL',
    isFeatured: false,
    isActive: true,
    canAddNiqab: true,
  })

  const { success, error } = useToast()
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft
  const NextIcon = isRTL ? ChevronLeft : ChevronRight

  const selectedFormCategory = categories.find((c) => c.id === formData.categoryId)
  const selectedCategoryConfig = resolveCategoryConfig(selectedFormCategory)
  const selectedCategoryIsNiqab = isNiqabIdentity(selectedFormCategory)
  const selectedCategoryHidesSizes = selectedCategoryConfig.sizingMode === 'bundle_no_size'

  const getCategoryDisplayName = (cat?: CategoryOption | ProductItem['category']) => {
    if (!cat) return tr('تصنيف', 'Category')
    if (locale === 'ar') return cat.nameAr || cat.name || cat.nameFr || cat.nameEn || cat.slug
    return cat.nameEn || cat.nameFr || cat.name || cat.nameAr || cat.slug
  }

  const getProductDisplayName = (prod: ProductItem): string => {
    if (locale === 'ar') return prod.nameAr || prod.name || prod.nameFr || prod.nameEn || prod.sku || 'Product'
    return prod.nameEn || prod.nameFr || prod.name || prod.nameAr || prod.sku || 'Product'
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const loadCategories = useCallback(async (): Promise<CategoryOption[]> => {
    const items = await fetchCategoriesApi()
    setCategories(items)
    return items
  }, [])

  useEffect(() => {
    let active = true
    fetchCategoriesApi().then((items) => {
      if (active) setCategories(items)
    })
    return () => {
      active = false
    }
  }, [refreshTick])

  useEffect(() => {
    let active = true
    async function loadProducts() {
      try {
        const params = new URLSearchParams()
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())
        if (selectedCategory !== 'all') params.set('category', selectedCategory)
        params.set('page', String(page))
        params.set('limit', '8')

        const res = await fetch(`/api/admin/products?${params.toString()}`, {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        })

        const contentType = res.headers.get('content-type') || ''
        let data: ApiProductsResponse | null = null
        if (contentType.includes('application/json')) {
          data = (await res.json()) as ApiProductsResponse
        } else {
          data = { error: await res.text() }
        }

        if (!res.ok) {
          throw new Error(
            data?.error || data?.message || `Products API returned HTTP ${res.status}`
          )
        }

        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.products)
            ? data.products
            : []

        if (active) {
          setProducts(items)
          setTotalPages(Number(data?.totalPages) > 0 ? Number(data?.totalPages) : 1)
        }
      } catch (err) {
        console.error('Error fetching products:', err)
        if (active) {
          setProducts([])
          setTotalPages(1)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadProducts()
    return () => {
      active = false
    }
  }, [debouncedSearch, selectedCategory, page, refreshTick])

  const openCreateModal = async () => {
    setEditingProduct(null)
    setActiveLangTab(locale === 'ar' ? 'ar' : 'en')
    setCustomSizeInput('')
    const freshCategories = await loadCategories()
    const pool = freshCategories.length > 0 ? freshCategories : categories
    const defaultCat = pool[0]
    const defaultCfg = resolveCategoryConfig(defaultCat)
    setFormData({
      nameAr: '',
      nameFr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionFr: '',
      descriptionEn: '',
      sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      basePrice: '',
      salePrice: '',
      stock: '20',
      categoryId: defaultCat?.id || '',
      mainImage: '',
      images: [],
      colors:
        defaultCfg.colorMode === 'single'
          ? defaultCfg.defaultColors[0] || '#000000'
          : defaultCfg.defaultColors.join(', '),
      sizes:
        defaultCfg.sizingMode === 'bundle_no_size'
          ? ''
          : defaultCfg.defaultSizes.join(', ') ||
            (defaultCfg.sizingMode === 'standard' ? 'Standard' : 'S, M, L, XL'),
      isFeatured: false,
      isActive: true,
      canAddNiqab: isNiqabIdentity(defaultCat) ? false : defaultCfg.allowMatchingNiqab,
    })
    setIsModalOpen(true)
  }

  const openEditModal = async (product: ProductItem) => {
    setEditingProduct(product)
    setActiveLangTab(locale === 'ar' ? 'ar' : 'en')
    setCustomSizeInput('')

    const [freshCategories, freshProduct] = await Promise.all([
      loadCategories(),
      (async (): Promise<ProductItem | null> => {
        try {
          const res = await fetch(`/api/admin/products/${product.id}`, {
            method: 'GET',
            credentials: 'same-origin',
            cache: 'no-store',
            headers: { Accept: 'application/json' },
          })
          if (res.ok) {
            const data = (await res.json()) as { product?: ProductItem | null }
            return data?.product ?? null
          }
        } catch (err) {
          console.error('Error fetching product detail:', err)
        }
        return null
      })(),
    ])

    const pool = freshCategories.length > 0 ? freshCategories : categories
    const resolved = freshProduct || product
    const category = pool.find((cat) => cat.id === resolved.categoryId)
    const catCfg = resolveCategoryConfig(category)
    const hideSizes = catCfg.sizingMode === 'bundle_no_size' || isNiqabIdentity(category)
    const initialColors =
      resolved.colors && resolved.colors.length > 0
        ? resolved.colors.map((color) => color.code)
        : catCfg.defaultColors

    setFormData({
      nameAr: resolved.nameAr || resolved.name || '',
      nameFr: resolved.nameFr || resolved.name || '',
      nameEn: resolved.nameEn || resolved.name || '',
      descriptionAr: resolved.descriptionAr || '',
      descriptionFr:
        resolved.descriptionFr || resolved.descriptionAr || resolved.descriptionEn || '',
      descriptionEn: resolved.descriptionEn || '',
      sku: resolved.sku,
      basePrice: String(resolved.basePrice),
      salePrice:
        resolved.salePrice !== null && resolved.salePrice !== undefined
          ? String(resolved.salePrice)
          : '',
      stock: String(resolved.stock),
      categoryId: resolved.categoryId,
      mainImage: resolved.mainImage,
      images: resolved.images || [],
      colors:
        catCfg.colorMode === 'single'
          ? initialColors[0] || '#000000'
          : initialColors.join(', '),
      sizes: hideSizes
        ? ''
        : resolved.sizes?.join(', ') || catCfg.defaultSizes.join(', ') || 'S, M, L, XL',
      isFeatured: resolved.isFeatured,
      isActive: resolved.isActive,
      canAddNiqab: isNiqabIdentity(category)
        ? false
        : (resolved.canAddNiqab ?? catCfg.allowMatchingNiqab),
    })
    setIsModalOpen(true)
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value
    const category = categories.find((cat) => cat.id === categoryId)
    const cfg = resolveCategoryConfig(category)
    const catIsNiqab = isNiqabIdentity(category)
    const nextSizes =
      cfg.sizingMode === 'bundle_no_size' || catIsNiqab
        ? ''
        : cfg.defaultSizes.join(', ') || (cfg.sizingMode === 'standard' ? 'Standard' : 'S, M, L, XL')

    setFormData((prev) => {
      const prevCategory = categories.find((cat) => cat.id === prev.categoryId)
      const prevCfg = resolveCategoryConfig(prevCategory)
      const shouldReplaceSizes =
        !editingProduct ||
        prevCfg.sizingMode !== cfg.sizingMode ||
        cfg.sizingMode === 'bundle_no_size' ||
        catIsNiqab

      const prevColors = parseColorTokens(prev.colors)
      const nextColors = editingProduct
        ? cfg.colorMode === 'single'
          ? prevColors[0] || cfg.defaultColors[0] || '#000000'
          : prev.colors
        : cfg.colorMode === 'single'
          ? cfg.defaultColors[0] || '#000000'
          : cfg.defaultColors.join(', ')

      return {
        ...prev,
        categoryId,
        sizes: shouldReplaceSizes ? nextSizes : prev.sizes,
        colors: nextColors,
        canAddNiqab: catIsNiqab ? false : cfg.allowMatchingNiqab,
      }
    })
  }

  const applySelectedCategoryDefaults = () => {
    const category = categories.find((cat) => cat.id === formData.categoryId)
    if (!category) return
    const cfg = resolveCategoryConfig(category)
    const catIsNiqab = isNiqabIdentity(category)
    const nextSizes =
      cfg.sizingMode === 'bundle_no_size' || catIsNiqab
        ? ''
        : cfg.defaultSizes.join(', ') || (cfg.sizingMode === 'standard' ? 'Standard' : 'S, M, L, XL')
    const nextColors =
      cfg.colorMode === 'single'
        ? cfg.defaultColors[0] || '#000000'
        : (cfg.defaultColors.length > 0 ? cfg.defaultColors : ['#000000']).join(', ')

    setFormData((prev) => ({
      ...prev,
      sizes: nextSizes,
      colors: nextColors,
      canAddNiqab: catIsNiqab ? false : cfg.allowMatchingNiqab,
    }))
    success(
      tr(
        'تم تطبيق مقاسات وألوان وقواعد التصنيف على هذا المنتج (احفظ لحفظ التغييرات)',
        'Applied category default sizes, colors & rules (click Save to persist)'
      )
    )
  }

  const toggleColorHex = (hex: string) => {
    const norm = (hex.startsWith('#') ? hex : `#${hex}`).toUpperCase()
    if (selectedCategoryConfig.colorMode === 'single') {
      setFormData((prev) => ({ ...prev, colors: norm }))
      return
    }
    const current = parseColorTokens(formData.colors)
    const next = current.includes(norm)
      ? current.filter((c) => c !== norm)
      : [...current, norm]
    setFormData((prev) => ({ ...prev, colors: next.join(', ') }))
  }

  const addCustomColor = (hex: string) => {
    const norm = (hex.startsWith('#') ? hex : `#${hex}`).toUpperCase()
    if (!/^#[0-9A-F]{3,8}$/.test(norm)) {
      error(tr(`كود لون غير صالح: ${hex}`, `Invalid hex color: ${hex}`))
      return
    }
    if (selectedCategoryConfig.colorMode === 'single') {
      setFormData((prev) => ({ ...prev, colors: norm }))
      return
    }
    const current = parseColorTokens(formData.colors)
    if (!current.includes(norm)) {
      setFormData((prev) => ({ ...prev, colors: [...current, norm].join(', ') }))
    }
  }

  const toggleSizeChip = (sizeVal: string) => {
    const current = parseSizeTokens(formData.sizes)
    const next = current.includes(sizeVal)
      ? current.filter((s) => s !== sizeVal)
      : [...current, sizeVal]
    setFormData((prev) => ({ ...prev, sizes: next.join(', ') }))
  }

  const addCustomSize = () => {
    const trimmed = customSizeInput.trim()
    if (!trimmed) return
    const current = parseSizeTokens(formData.sizes)
    if (!current.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, sizes: [...current, trimmed].join(', ') }))
    }
    setCustomSizeInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const primaryName =
      formData.nameFr.trim() || formData.nameAr.trim() || formData.nameEn.trim()
    if (!primaryName) {
      error(tr('يرجى إدخال اسم المنتج بلغة واحدة على الأقل', 'Please enter a product name in at least one language'))
      return
    }

    if (!formData.categoryId) {
      error(tr('يرجى اختيار تصنيف المنتج', 'Please select a product category'))
      return
    }

    const parsedBasePrice = Number(formData.basePrice)
    if (!Number.isFinite(parsedBasePrice) || parsedBasePrice < 0) {
      error(tr('السعر الأساسي يجب أن يكون رقماً صحيحاً غير سالب', 'Base price must be a valid non-negative number'))
      return
    }

    const parsedSalePrice = formData.salePrice.trim() ? Number(formData.salePrice.trim()) : null
    if (parsedSalePrice !== null) {
      if (!Number.isFinite(parsedSalePrice) || parsedSalePrice < 0) {
        error(tr('سعر التخفيض غير صالح', 'Sale price must be a valid non-negative number'))
        return
      }
      if (parsedSalePrice >= parsedBasePrice) {
        error(tr('يجب أن يكون سعر التخفيض أقل من السعر الأساسي', 'Sale price must be lower than base price'))
        return
      }
    }

    const parsedStock = Number.parseInt(formData.stock, 10)
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      error(tr('كمية المخزون يجب أن تكون رقماً صحيحاً غير سالب', 'Stock quantity must be a non-negative whole number'))
      return
    }

    const rawColorTokens = formData.colors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
    const seenColors = new Set<string>()
    const colorsArr: Array<{ code: string; nameAr: string; nameFr: string; nameEn: string }> = []
    for (const token of rawColorTokens) {
      const normalized = (token.startsWith('#') ? token : `#${token}`).toUpperCase()
      if (!/^#[0-9A-F]{3,8}$/.test(normalized)) {
        error(tr(`كود لون غير صالح: "${token}"`, `Invalid hex color code: "${token}"`))
        return
      }
      if (!seenColors.has(normalized)) {
        seenColors.add(normalized)
        const names = getColorNames(normalized)
        colorsArr.push({
          code: normalized,
          nameAr: names.ar,
          nameFr: names.fr,
          nameEn: names.en,
        })
      }
    }

    setSubmitting(true)

    try {
      const category = categories.find((cat) => cat.id === formData.categoryId)
      const catCfg = resolveCategoryConfig(category)
      const categoryIsNiqab = isNiqabIdentity(category)
      const effectiveColorsArr =
        catCfg.colorMode === 'single' ? colorsArr.slice(0, 1) : colorsArr
      const sizesArr =
        categoryIsNiqab || catCfg.sizingMode === 'bundle_no_size'
          ? []
          : parseSizeTokens(formData.sizes)

      const primaryDesc =
        formData.descriptionFr.trim() ||
        formData.descriptionAr.trim() ||
        formData.descriptionEn.trim()

      const payload = {
        nameAr: formData.nameAr.trim() || primaryName,
        nameFr: formData.nameFr.trim() || primaryName,
        nameEn: formData.nameEn.trim() || primaryName,
        descriptionAr: formData.descriptionAr.trim() || primaryDesc,
        descriptionFr: formData.descriptionFr.trim() || primaryDesc,
        descriptionEn: formData.descriptionEn.trim() || primaryDesc,
        sku: formData.sku.trim(),
        basePrice: parsedBasePrice,
        salePrice: parsedSalePrice,
        stock: parsedStock,
        categoryId: formData.categoryId,
        mainImage: formData.mainImage || formData.images[0] || '/images/brand/logo-full.png',
        images:
          formData.images.length > 0
            ? formData.images
            : [formData.mainImage || '/images/brand/logo-full.png'],
        colors: effectiveColorsArr,
        sizes: sizesArr,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        isNiqab: categoryIsNiqab,
        canAddNiqab: categoryIsNiqab ? false : formData.canAddNiqab,
      }

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const contentType = res.headers.get('content-type') || ''
      let responseData: ApiMessageResponse | null = null
      if (contentType.includes('application/json')) {
        responseData = (await res.json()) as ApiMessageResponse
      } else {
        responseData = { error: await res.text() }
      }

      if (!res.ok) {
        throw new Error(
          responseData?.error || responseData?.message || `Failed to save product (${res.status})`
        )
      }

      success(
        editingProduct
          ? tr('تم تحديث المنتج بنجاح', 'Product updated successfully')
          : tr('تم إنشاء المنتج بنجاح', 'Product created successfully')
      )
      setIsModalOpen(false)
      setEditingProduct(null)
      setRefreshTick((t) => t + 1)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : tr('فشل الحفظ', 'Action failed')
      error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })
      const contentType = res.headers.get('content-type') || ''
      let data: ApiMessageResponse | null = null
      if (contentType.includes('application/json')) {
        data = (await res.json()) as ApiMessageResponse
      } else {
        data = { error: await res.text() }
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Failed to delete product (${res.status})`)
      }

      success(tr('تم حذف المنتج بنجاح', 'Product deleted successfully'))
      setDeleteTarget(null)
      setRefreshTick((t) => t + 1)
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : tr('فشل حذف المنتج', 'Error deleting product'))
    } finally {
      setSubmitting(false)
    }
  }

  const loadReviews = useCallback(
    async (productId: string) => {
      setReviewsLoading(true)
      try {
        const res = await fetch(`/api/admin/reviews?productId=${encodeURIComponent(productId)}`, {
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`Failed to load reviews (${res.status})`)
        const data = await res.json()
        setReviewsData(data.reviews || [])
        setReviewsCount(data.count || 0)
      } catch (err: unknown) {
        setReviewsData([])
        setReviewsCount(0)
        error(err instanceof Error ? err.message : tr('فشل تحميل التقييمات', 'Failed to load reviews'))
      } finally {
        setReviewsLoading(false)
      }
    },
    [error, tr]
  )

  const openReviewsModal = (prod: ProductItem) => {
    setReviewsTarget(prod)
    setReviewsData([])
    setReviewsCount(0)
    loadReviews(prod.id)
  }

  const handleDeleteReview = async (reviewId: string) => {
    setReviewsDeleting(reviewId)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) {
        let message = `Failed to delete review (${res.status})`
        try {
          const data = await res.json()
          if (data?.error) message = data.error
        } catch {
          // ignore
        }
        throw new Error(message)
      }
      setReviewsData((current) => current.filter((r) => r.id !== reviewId))
      setReviewsCount((count) => Math.max(0, count - 1))
      setReviewDeleteConfirm(null)
      success(tr('تم حذف التقييم بنجاح', 'Review deleted successfully'))
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : tr('فشل حذف التقييم', 'Failed to delete review'))
    } finally {
      setReviewsDeleting(null)
    }
  }

  const currentColorList = parseColorTokens(formData.colors)
  const currentSizeList = parseSizeTokens(formData.sizes)
  const hasFilters = Boolean(search.trim()) || selectedCategory !== 'all'

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/12 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {tr('إدارة المنتجات', 'Product Management')}
            </h1>
            <p className="text-xs sm:text-[13px] text-zinc-400 mt-0.5">
              {tr(
                'إدارة الكتالوج، الأسعار، المخزون، الألوان والمقاسات',
                'Manage catalog, pricing, stock levels, colors, and sizes'
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{tr('إضافة منتج جديد', 'Add New Product')}</span>
        </button>
      </div>

      {/* ── Search & Category Filter ── */}
      <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl p-3.5 sm:p-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full md:flex-1 md:min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-500 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder={tr('ابحث باسم المنتج أو الرمز SKU...', 'Search by name or SKU...')}
            className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 rounded-xl ps-10 pe-10 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setPage(1)
              }}
              aria-label={tr('مسح البحث', 'Clear search')}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Filter className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setPage(1)
              }}
              aria-label={tr('تصفية حسب التصنيف', 'Filter by category')}
              className="appearance-none h-11 w-full sm:min-w-[178px] bg-[#111115] border border-zinc-700/80 focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 rounded-xl ps-3.5 pe-9 text-xs font-bold text-zinc-100 outline-none cursor-pointer transition-colors"
            >
              <option value="all">{tr('جميع التصنيفات', 'All Categories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getCategoryDisplayName(cat)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setSelectedCategory('all')
              setPage(1)
            }}
            className="h-11 px-3.5 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            {tr('مسح الفلاتر', 'Clear Filters')}
          </button>
        )}
      </div>

      {/* ── Products List / Table Card ── */}
      <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden">
        {/* Mobile Cards (< lg) */}
        <div className="lg:hidden divide-y divide-zinc-800/70">
          {loading ? (
            <div className="py-14 text-center text-zinc-400">
              <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-amber-400" />
              <p className="text-xs">{tr('جاري تحميل المنتجات...', 'Loading products catalog...')}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-14 px-4 text-center space-y-3">
              <p className="text-sm font-semibold text-zinc-400">
                {tr('لا توجد منتجات مطابقة.', 'No products found.')}
              </p>
              <button
                type="button"
                onClick={openCreateModal}
                className="h-9 px-4 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {tr('إضافة أول منتج', 'Add Product')}
              </button>
            </div>
          ) : (
            products.map((prod) => (
              <div key={prod.id} className="p-3.5 sm:p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="relative w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700/80 overflow-hidden shrink-0">
                    <Image
                      src={prod.mainImage || '/images/brand/logo-full.png'}
                      alt={getProductDisplayName(prod)}
                      fill
                      sizes="128px"
                      quality={92}
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-white truncate">
                        {getProductDisplayName(prod)}
                      </h3>
                      <span className="text-xs font-black text-amber-400 font-mono tabular-nums shrink-0">
                        {formatPrice(prod.salePrice || prod.basePrice, 'fr')}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      <span className="font-mono">{prod.sku}</span>
                      <span className="mx-1.5 text-zinc-600">·</span>
                      <span>{getCategoryDisplayName(prod.category)}</span>
                      <span className="mx-1.5 text-zinc-600">·</span>
                      <span
                        className={
                          prod.stock > 10
                            ? 'text-emerald-400'
                            : prod.stock > 0
                              ? 'text-amber-400'
                              : 'text-rose-400'
                        }
                      >
                        {prod.stock > 0
                          ? `${prod.stock} ${tr('قطعة', 'units')}`
                          : tr('نفد المخزون', 'Out of Stock')}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-zinc-800/70">
                  <div className="flex items-center gap-2">
                    {prod.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        {tr('نشط', 'Active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/12 text-rose-400 border border-rose-500/25 text-[11px] font-bold">
                        <XCircle className="w-3 h-3" />
                        {tr('مسودة', 'Draft')}
                      </span>
                    )}
                    {prod.isFeatured && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        {tr('مميز', 'Featured')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(prod)}
                      aria-label={tr('تعديل المنتج', 'Edit Product')}
                      className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openReviewsModal(prod)}
                      aria-label={tr('تقييمات المنتج', 'Product Reviews')}
                      className="h-9 w-9 rounded-lg bg-sky-500/12 border border-sky-500/25 text-sky-400 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(prod)}
                      aria-label={tr('حذف المنتج', 'Delete Product')}
                      className="h-9 w-9 rounded-lg bg-rose-500/12 border border-rose-500/25 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (>= lg) */}
        <div className="hidden lg:block overflow-x-auto admin-scroll">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-start">{tr('المنتج', 'Product')}</th>
                <th className="py-3.5 px-4 text-start">SKU</th>
                <th className="py-3.5 px-4 text-start">{tr('التصنيف', 'Category')}</th>
                <th className="py-3.5 px-4 text-start">{tr('السعر', 'Price')}</th>
                <th className="py-3.5 px-4 text-start">{tr('المخزون', 'Stock')}</th>
                <th className="py-3.5 px-4 text-start">{tr('الحالة', 'Status')}</th>
                <th className="py-3.5 px-4 text-end">{tr('إجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-14 px-4 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-amber-400" />
                    <p className="text-xs">{tr('جاري تحميل كتالوج المنتجات...', 'Loading products catalog...')}</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 px-4 text-center text-xs text-zinc-500">
                    {tr('لا توجد منتجات مطابقة لبحثك.', 'No products found matching your search.')}
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-800/35 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3.5 min-w-[210px]">
                        <div className="relative w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/80 overflow-hidden shrink-0">
                          <Image
                            src={prod.mainImage || '/images/brand/logo-full.png'}
                            alt={getProductDisplayName(prod)}
                            fill
                            sizes="128px"
                            quality={92}
                            referrerPolicy="no-referrer"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-sm truncate max-w-[240px]">
                            {getProductDisplayName(prod)}
                          </div>
                          {prod.isFeatured && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold mt-0.5">
                              <Star className="w-3 h-3 fill-current" />
                              {tr('منتج مميز', 'Featured')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-xs whitespace-nowrap">
                      {prod.sku}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 text-xs font-semibold">
                        {getCategoryDisplayName(prod.category)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono tabular-nums">
                      <div className="font-black text-amber-400">
                        {formatPrice(prod.salePrice || prod.basePrice, 'fr')}
                      </div>
                      {prod.salePrice && (
                        <div className="text-[11px] text-zinc-500 line-through">
                          {formatPrice(prod.basePrice, 'fr')}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                      <span
                        className={`text-xs font-bold ${
                          prod.stock > 10
                            ? 'text-emerald-400'
                            : prod.stock > 0
                              ? 'text-amber-400'
                              : 'text-rose-400'
                        }`}
                      >
                        {prod.stock > 0
                          ? `${prod.stock} ${tr('قطعة', 'units')}`
                          : tr('نفد المخزون', 'Out of Stock')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {prod.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          {tr('نشط', 'Active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/12 text-rose-400 border border-rose-500/25 text-[11px] font-bold">
                          <XCircle className="w-3 h-3" />
                          {tr('مسودة', 'Draft')}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-end whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(prod)}
                          title={tr('تعديل المنتج', 'Edit Product')}
                          aria-label={tr('تعديل المنتج', 'Edit Product')}
                          className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openReviewsModal(prod)}
                          title={tr('التقييمات', 'Reviews')}
                          aria-label={tr('تقييمات المنتج', 'Product Reviews')}
                          className="h-9 w-9 rounded-lg bg-sky-500/12 border border-sky-500/25 text-sky-400 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(prod)}
                          title={tr('حذف المنتج', 'Delete Product')}
                          aria-label={tr('حذف المنتج', 'Delete Product')}
                          className="h-9 w-9 rounded-lg bg-rose-500/12 border border-rose-500/25 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-400 font-medium tabular-nums">
            {tr(`صفحة ${page} من ${totalPages}`, `Page ${page} of ${totalPages}`)}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              aria-label={tr('الصفحة السابقة', 'Previous page')}
              className="h-9 w-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <PrevIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              aria-label={tr('الصفحة التالية', 'Next page')}
              className="h-9 w-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <NextIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Product Create / Edit Modal (Sticky Header & Footer + Language Tabs + Visual Pickers) ── */}
      {isModalOpen && (
        <div
          dir={dir}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-3xl max-h-[94dvh] sm:max-h-[90dvh] flex flex-col bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
            {/* Sticky Header */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
              <h2 className="text-base sm:text-lg font-black text-white">
                {editingProduct
                  ? tr('تعديل المنتج', 'Edit Product')
                  : tr('إضافة منتج جديد', 'Create New Product')}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label={tr('إغلاق النافذة', 'Close modal')}
                className="w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto admin-scroll p-4 sm:p-6 space-y-5 sm:space-y-6">
                {/* 3-Language Tabs for Name & Description */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-300">
                      {tr('الاسم والوصف حسب اللغة', 'Name & Description by Language')}
                    </span>
                    <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
                      {(['ar', 'fr', 'en'] as LangTab[]).map((tab) => {
                        const label =
                          tab === 'ar' ? 'العربية' : tab === 'fr' ? 'Français' : 'English'
                        return (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveLangTab(tab)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              activeLangTab === tab
                                ? 'bg-amber-500 text-zinc-950'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {activeLangTab === 'ar' && (
                    <div className="space-y-3" dir="rtl">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          {tr('اسم المنتج (بالعربية)', 'Product Name (Arabic)')}
                        </label>
                        <input
                          type="text"
                          value={formData.nameAr}
                          onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                          placeholder="جلابة مغربية ملكية"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          {tr('وصف المنتج (بالعربية)', 'Product Description (Arabic)')}
                        </label>
                        <textarea
                          rows={3}
                          value={formData.descriptionAr}
                          onChange={(e) =>
                            setFormData({ ...formData, descriptionAr: e.target.value })
                          }
                          placeholder="وصف تفصيلي للمنتج..."
                          className="w-full bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {activeLangTab === 'fr' && (
                    <div className="space-y-3" dir="ltr">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Nom du produit (Français)
                        </label>
                        <input
                          type="text"
                          value={formData.nameFr}
                          onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                          placeholder="Djellaba Royale"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Description (Français)
                        </label>
                        <textarea
                          rows={3}
                          value={formData.descriptionFr}
                          onChange={(e) =>
                            setFormData({ ...formData, descriptionFr: e.target.value })
                          }
                          placeholder="Description détaillée en français..."
                          className="w-full bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {activeLangTab === 'en' && (
                    <div className="space-y-3" dir="ltr">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Product Name (English)
                        </label>
                        <input
                          type="text"
                          value={formData.nameEn}
                          onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                          placeholder="Royal Moroccan Djellaba"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Description (English)
                        </label>
                        <textarea
                          rows={3}
                          value={formData.descriptionEn}
                          onChange={(e) =>
                            setFormData({ ...formData, descriptionEn: e.target.value })
                          }
                          placeholder="Detailed product description in English..."
                          className="w-full bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing, SKU, Stock & Category */}
                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      {tr('الرمز SKU', 'SKU')} *
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-xs font-mono text-zinc-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      {tr('السعر الأساسي (MAD)', 'Base Price (MAD)')} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      dir="ltr"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder="599"
                      className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm font-mono text-zinc-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      {tr('سعر التخفيض (اختياري)', 'Sale Price (Optional)')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      dir="ltr"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      placeholder="499"
                      className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm font-mono text-zinc-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      {tr('الكمية في المخزون', 'Stock Quantity')} *
                    </label>
                    <input
                      type="number"
                      required
                      dir="ltr"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm font-mono text-zinc-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    {tr('التصنيف', 'Category')} *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.categoryId}
                      onChange={handleCategoryChange}
                      className="appearance-none w-full h-11 bg-[#111115] border border-zinc-700/80 focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 rounded-xl ps-3.5 pe-10 text-sm text-zinc-100 outline-none cursor-pointer transition-colors"
                    >
                      <option value="">{tr('اختر التصنيف', 'Select Category')}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {getCategoryDisplayName(category)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {selectedFormCategory && (() => {
                    const catDefaultColors = (
                      selectedCategoryConfig.colorMode === 'single'
                        ? [selectedCategoryConfig.defaultColors[0] || '#000000']
                        : selectedCategoryConfig.defaultColors
                    ).map((c) => c.toUpperCase())
                    const catDefaultSizes =
                      selectedCategoryIsNiqab || selectedCategoryHidesSizes
                        ? []
                        : selectedCategoryConfig.defaultSizes
                    const colorsMatch =
                      currentColorList.length === catDefaultColors.length &&
                      catDefaultColors.every((c) => currentColorList.includes(c))
                    const sizesMatch =
                      selectedCategoryIsNiqab || selectedCategoryHidesSizes
                        ? true
                        : currentSizeList.length === catDefaultSizes.length &&
                          catDefaultSizes.every((s) => currentSizeList.includes(s))
                    const differsFromCategoryDefaults = !colorsMatch || !sizesMatch

                    return (
                      <div className="mt-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[11px] text-zinc-300 tabular-nums">
                            {tr('قواعد التصنيف المطبقة:', 'Category Rules:')}{' '}
                            <span className="text-amber-400 font-semibold">
                              {selectedCategoryConfig.sizingMode === 'bundle_no_size'
                                ? tr('بدون مقاس', 'No Size')
                                : selectedCategoryConfig.sizingMode === 'standard'
                                  ? tr('مقاس موحد', 'One Size')
                                  : selectedCategoryConfig.sizingMode === 'numeric'
                                    ? tr('مقاسات رقمية', 'Numeric')
                                    : tr('مقاسات حرفية', 'Letter Sizes')}
                              {' · '}
                              {selectedCategoryConfig.colorMode === 'single'
                                ? tr('لون موحد', 'Single Color')
                                : tr('ألوان متعددة', 'Multi-Color')}
                              {' · '}
                              {tr('نسبة', 'Frame')} {selectedCategoryConfig.cardAspectRatio}
                              {' · '}
                              {tr('الأدنى', 'Min')} {selectedCategoryConfig.minOrderQuantity}
                              {selectedCategoryConfig.maxOrderQuantity !== null
                                ? ` · ${tr('الأقصى', 'Max')} ${selectedCategoryConfig.maxOrderQuantity}`
                                : ''}
                              {' · '}
                              {selectedCategoryConfig.allowCustomNote
                                ? tr('ملاحظة تفصيل مفعلة', 'Custom note on')
                                : tr('بدون ملاحظة تفصيل', 'No custom note')}
                            </span>
                          </p>
                          <button
                            type="button"
                            onClick={applySelectedCategoryDefaults}
                            className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                              differsFromCategoryDefaults
                                ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                          >
                            {tr('تطبيق مقاسات وألوان التصنيف', 'Apply Category Defaults')}
                          </button>
                        </div>

                        {differsFromCategoryDefaults && (
                          <p className="text-[11px] text-amber-300/90 tabular-nums leading-relaxed">
                            {tr('القيم الافتراضية في التصنيف:', 'Category Defaults:')}{' '}
                            {!selectedCategoryIsNiqab && !selectedCategoryHidesSizes && (
                              <>
                                <span className="font-semibold">
                                  {catDefaultSizes.join(', ') || 'Standard'}
                                </span>
                                {' · '}
                              </>
                            )}
                            <span className="font-mono" dir="ltr">
                              {catDefaultColors.join(', ')}
                            </span>
                          </p>
                        )}
                      </div>
                    )
                  })()}
                </div>

                {/* Visual Color Swatches + Picker */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                        <Palette className="w-4 h-4 text-amber-400" />
                        {selectedCategoryConfig.colorMode === 'single'
                          ? tr('لون المنتج (لون موحّد)', 'Product Color (Single-Color Policy)')
                          : tr('ألوان المنتج', 'Product Colors')}
                      </span>
                      {selectedCategoryConfig.colorMode === 'single' && (
                        <p className="text-[11px] text-zinc-400">
                          {tr(
                            'التصنيف مضبوط على لون موحّد — يتم استبدال اللون باختيار لون آخر',
                            'Single-color category rule — selecting a color replaces the active color'
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pickerColor}
                        onChange={(e) => setPickerColor(e.target.value.toUpperCase())}
                        aria-label={tr('اختيار لون مخصص', 'Pick custom color')}
                        className="w-8 h-8 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => addCustomColor(pickerColor)}
                        className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
                      >
                        {selectedCategoryConfig.colorMode === 'single'
                          ? tr('تحديد اللون', 'Set Color')
                          : `+ ${tr('إضافة اللون', 'Add Color')}`}
                      </button>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map((hex) => {
                      const active = currentColorList.includes(hex.toUpperCase())
                      const info = getColorNames(hex)
                      return (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => toggleColorHex(hex)}
                          title={locale === 'ar' ? info.ar : info.en}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/60 shrink-0"
                            style={{ backgroundColor: hex }}
                          />
                          <span>{locale === 'ar' ? info.ar : info.en}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Active Color Chips + Manual Hex Input */}
                  {currentColorList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentColorList.map((hex) => {
                        const info = getColorNames(hex)
                        return (
                          <span
                            key={hex}
                            className="inline-flex items-center gap-1.5 ps-2 pe-1.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-200"
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-white/60 shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="font-semibold">
                              {locale === 'ar' ? info.ar : info.en}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500">{hex}</span>
                            <button
                              type="button"
                              onClick={() => toggleColorHex(hex)}
                              aria-label={tr(`إزالة ${hex}`, `Remove ${hex}`)}
                              className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}

                  <input
                    type="text"
                    dir="ltr"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    onBlur={() => {
                      if (selectedCategoryConfig.colorMode === 'single') {
                        const first = parseColorTokens(formData.colors)[0]
                        if (first && first !== formData.colors.trim().toUpperCase()) {
                          setFormData((prev) => ({ ...prev, colors: first }))
                        }
                      }
                    }}
                    placeholder={
                      selectedCategoryConfig.colorMode === 'single'
                        ? '#000000'
                        : '#C4622D, #F2E4CE, #000000'
                    }
                    className="w-full h-10 bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500/70 rounded-xl px-3.5 text-xs font-mono text-zinc-300 outline-none"
                  />
                </div>

                {/* Interactive Size Chips (Driven by Category sizingMode) */}
                {!selectedCategoryIsNiqab && !selectedCategoryHidesSizes && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                        <Ruler className="w-4 h-4 text-amber-400" />
                        {tr('المقاسات المتاحة', 'Available Sizes')}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {selectedCategoryConfig.sizingMode === 'numeric'
                          ? tr('مقاسات طولية (50–60)', 'Length sizes')
                          : selectedCategoryConfig.sizingMode === 'standard'
                            ? tr('مقاس موحّد', 'Standard size')
                            : tr('مقاسات حرفية', 'Letter sizes')}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(selectedCategoryConfig.sizingMode === 'numeric'
                        ? NUMERIC_PRESET_SIZES
                        : selectedCategoryConfig.sizingMode === 'standard'
                          ? STANDARD_PRESET_SIZES
                          : LETTER_PRESET_SIZES
                      ).map((sz) => {
                        const active = currentSizeList.includes(sz)
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSizeChip(sz)}
                            className={`h-8 px-3 rounded-lg border text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                              active
                                ? 'bg-amber-500 text-zinc-950 border-amber-500'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            {sz}
                          </button>
                        )
                      })}
                      {currentSizeList
                        .filter(
                          (sz) =>
                            !(
                              selectedCategoryConfig.sizingMode === 'numeric'
                                ? NUMERIC_PRESET_SIZES
                                : selectedCategoryConfig.sizingMode === 'standard'
                                  ? STANDARD_PRESET_SIZES
                                  : LETTER_PRESET_SIZES
                            ).includes(sz)
                        )
                        .map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSizeChip(sz)}
                            className="h-8 px-3 rounded-lg border border-amber-500 bg-amber-500/20 text-amber-300 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{sz}</span>
                            <X className="w-3 h-3" />
                          </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomSize()
                          }
                        }}
                        placeholder={tr('أضف مقاساً مخصصاً (مثلاً 54 أو 56)...', 'Add custom size (e.g., 54, 56)...')}
                        className="flex-1 min-w-0 h-9 bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500/70 rounded-xl px-3 text-xs text-zinc-100 outline-none"
                      />
                      <button
                        type="button"
                        onClick={addCustomSize}
                        className="h-9 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold cursor-pointer shrink-0"
                      >
                        {tr('إضافة', 'Add')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2">
                    {tr('صور المنتج', 'Product Images')}
                  </label>
                  <ImageUploader
                    images={formData.images}
                    mainImage={formData.mainImage}
                    onChange={(updatedImages, updatedMain) => {
                      setFormData({
                        ...formData,
                        images: updatedImages,
                        mainImage: updatedMain,
                      })
                    }}
                  />
                </div>

                {/* Visibility & Feature Switches */}
                <div className="flex flex-wrap items-center gap-5 pt-2">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span>{tr('منتج مميز', 'Featured Product')}</span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs font-bold text-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span>{tr('منشور في المتجر', 'Published / Active')}</span>
                  </label>

                  {!selectedCategoryIsNiqab && (
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-zinc-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.canAddNiqab}
                        onChange={(e) =>
                          setFormData({ ...formData, canAddNiqab: e.target.checked })
                        }
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <span>{tr('إتاحة إضافة نقاب مطابق', 'Can Add Matching Niqab')}</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-zinc-800 bg-zinc-950/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {tr('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? tr('جاري الحفظ...', 'Saving...')
                    : editingProduct
                      ? tr('حفظ التعديلات', 'Update Product')
                      : tr('إنشاء المنتج', 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reviews Dialog ── */}
      {reviewsTarget && (
        <div
          dir={dir}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setReviewsTarget(null)}
        >
          <div
            className="w-full max-w-xl max-h-[88dvh] sm:max-h-[82dvh] flex flex-col rounded-2xl border border-zinc-700/80 bg-zinc-900 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
                <h3 className="text-sm font-extrabold text-white truncate">
                  {tr('التقييمات', 'Reviews')} — {getProductDisplayName(reviewsTarget)}
                </h3>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/12 border border-amber-500/25 rounded-full px-2 py-0.5 tabular-nums shrink-0">
                  {reviewsCount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReviewsTarget(null)}
                aria-label={tr('إغلاق', 'Close')}
                className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 admin-scroll">
              {reviewsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                </div>
              ) : reviewsData.length === 0 ? (
                <p className="py-10 text-center text-xs text-zinc-400">
                  {tr('لا توجد تقييمات لهذا المنتج بعد.', 'No reviews for this product yet.')}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {reviewsData.map((review) => (
                    <div
                      key={review.id}
                      className="flex flex-col gap-2 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {review.customer.avatarUrl ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-700">
                              <Image
                                src={review.customer.avatarUrl}
                                alt={review.customer.name}
                                fill
                                sizes="96px"
                                quality={92}
                                referrerPolicy="no-referrer"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 text-xs font-black flex items-center justify-center shrink-0">
                              {review.customer.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-100 truncate">
                              {review.customer.name}
                            </p>
                            <p className="text-[11px] text-zinc-500 truncate">
                              {review.customer.email || '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="flex items-center gap-0.5" dir="ltr">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`w-3.5 h-3.5 ${
                                  n <= review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-zinc-600'
                                }`}
                              />
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => setReviewDeleteConfirm(review)}
                            disabled={reviewsDeleting === review.id}
                            title={tr('حذف التقييم', 'Delete Review')}
                            aria-label={tr('حذف التقييم', 'Delete Review')}
                            className="w-8 h-8 rounded-lg bg-rose-500/12 border border-rose-500/25 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {reviewsDeleting === review.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed break-words">
                        {review.comment}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {formatDate(review.createdAt, true)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Review Confirmation */}
      <ConfirmModal
        isOpen={!!reviewDeleteConfirm}
        title={tr('حذف التقييم', 'Delete Review')}
        message={tr(
          `هل أنت متأكد من حذف تقييم "${reviewDeleteConfirm?.customer.name}"؟`,
          `Are you sure you want to delete this review by "${reviewDeleteConfirm?.customer.name}"?`
        )}
        confirmText={tr('حذف التقييم', 'Delete Review')}
        variant="danger"
        isLoading={Boolean(reviewsDeleting)}
        onConfirm={() => {
          if (reviewDeleteConfirm) handleDeleteReview(reviewDeleteConfirm.id)
        }}
        onCancel={() => setReviewDeleteConfirm(null)}
      />

      {/* Delete Product Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={tr('حذف المنتج', 'Delete Product')}
        message={tr(
          `هل أنت متأكد من حذف "${deleteTarget ? getProductDisplayName(deleteTarget) : ''}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
          `Are you sure you want to permanently delete "${deleteTarget ? getProductDisplayName(deleteTarget) : ''}"? This action cannot be undone.`
        )}
        confirmText={tr('حذف المنتج', 'Delete Product')}
        variant="danger"
        isLoading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function ProductsWithSearchParams() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  return <ProductContent key={initialSearch} initialSearch={initialSearch} />
}

export default function AdminProductsPage() {
  return (
    <ToastProvider>
      <AdminLayout>
        <Suspense fallback={null}>
          <ProductsWithSearchParams />
        </Suspense>
      </AdminLayout>
    </ToastProvider>
  )
}

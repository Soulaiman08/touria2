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
} from 'lucide-react'

import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import {
  ToastProvider,
  useToast,
} from '@/components/admin/providers/ToastContext'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { ImageUploader } from '@/components/admin/ui/ImageUploader'
import { formatPrice } from '@/lib/utils'
import { getColorNames } from '@/lib/color-names'

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

/*
 * =========================================================
 * Category
 * =========================================================
 *
 * بعض APIs ترجع:
 * name
 *
 * وبعضها ترجع:
 * nameAr / nameFr / nameEn
 *
 * لذلك ندعم كل الاحتمالات.
 */
interface CategoryOption {
  id: string
  name?: string
  nameAr?: string
  nameFr?: string
  nameEn?: string
  slug: string
}

/*
 * =========================================================
 * NIQAB HELPER
 * =========================================================
 *
 * هذا هو الـhelper الوحيد المسؤول عن معرفة هل الفئة نقاب.
 *
 * يدعم:
 * - niqab
 * - Niqab
 * - نقاب
 * - slug = niqab
 * - nameAr = نقاب
 * - nameFr = Niqab
 * - nameEn = Niqab
 */
const isNiqabCategory = (
  category?: CategoryOption | null
): boolean => {
  if (!category) {
    return false
  }

  const values = [
    category.slug,
    category.name,
    category.nameAr,
    category.nameFr,
    category.nameEn,
  ]
    .filter(Boolean)
    .map((value) =>
      String(value)
        .trim()
        .toLowerCase()
    )

  return values.some(
    (value) =>
      value === 'niqab' ||
      value === 'نقاب' ||
      value.includes('niqab') ||
      value.includes('نقاب')
  )
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

function ProductContent({ initialSearch }: { initialSearch: string }) {
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
  const [editingProduct, setEditingProduct] =
    useState<ProductItem | null>(null)
  const [deleteTarget, setDeleteTarget] =
    useState<ProductItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Reviews modal state
  const [reviewsTarget, setReviewsTarget] =
    useState<ProductItem | null>(null)
  const [reviewsData, setReviewsData] = useState<Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    customer: { id: string; name: string; email: string | null; avatarUrl: string | null }
  }>>([])
  const [reviewsCount, setReviewsCount] = useState(0)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsDeleting, setReviewsDeleting] = useState<string | null>(null)

  // Form fields
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

  /*
   * =========================================================
   * Selected Form Category
   * =========================================================
   *
   * نبحث عن الفئة المختارة حاليًا.
   */
  const selectedFormCategory = categories.find(
    (category) =>
      category.id === formData.categoryId
  )

  /*
   * =========================================================
   * Is current selected category Niqab?
   * =========================================================
   *
   * نستعمل الـhelper الوحيد هنا.
   */
  const selectedCategoryIsNiqab =
    isNiqabCategory(selectedFormCategory)

  /*
   * =========================================================
   * Fetch Categories
   * =========================================================
   */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/categories', {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) {
          throw new Error(`Failed to fetch categories (${res.status})`)
        }
        const data = (await res.json()) as { items?: CategoryOption[]; categories?: CategoryOption[] }
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.categories)
            ? data.categories
            : []
        if (active) setCategories(items)
      } catch (err) {
        console.error('Error fetching categories:', err)
        if (active) setCategories([])
      }
    }
    loadCategories()
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    async function loadProducts() {
      try {
        const params = new URLSearchParams()
        if (debouncedSearch.trim()) {
          params.set('search', debouncedSearch.trim())
        }
        if (selectedCategory !== 'all') {
          params.set('category', selectedCategory)
        }
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
          throw new Error(data?.error || data?.message || `Products API returned HTTP ${res.status}`)
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
    return () => { active = false }
  }, [debouncedSearch, selectedCategory, page, refreshTick])

  const openCreateModal = () => {
    setEditingProduct(null)

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

      categoryId: categories[0]?.id || '',

      mainImage: '',
      images: [],

      colors: '#C4622D, #F2E4CE, #000000',

      sizes: 'S, M, L, XL',

      isFeatured: false,
      isActive: true,
      canAddNiqab: true,
    })

    setIsModalOpen(true)
  }

  /*
   * =========================================================
   * Edit Modal
   * =========================================================
   */

  const openEditModal = async (product: ProductItem) => {
    setEditingProduct(product)

    let fresh: ProductItem | null = null
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        const data = (await res.json()) as { product?: ProductItem | null }
        fresh = data?.product ?? null
      }
    } catch (err) {
      console.error('Error fetching product detail:', err)
    }

    const resolved = fresh || product
    const category = categories.find((cat) => cat.id === resolved.categoryId)
    const categoryIsNiqab = isNiqabCategory(category)

    setFormData({
      nameAr: resolved.nameAr || resolved.name || '',
      nameFr: resolved.nameFr || resolved.name || '',
      nameEn: resolved.nameEn || resolved.name || '',

      descriptionAr: resolved.descriptionAr || '',
      descriptionFr: resolved.descriptionFr || resolved.descriptionAr || resolved.descriptionEn || '',
      descriptionEn: resolved.descriptionEn || '',

      sku: resolved.sku,
      basePrice: String(resolved.basePrice),
      salePrice: resolved.salePrice !== null && resolved.salePrice !== undefined ? String(resolved.salePrice) : '',
      stock: String(resolved.stock),
      categoryId: resolved.categoryId,
      mainImage: resolved.mainImage,
      images: resolved.images || [],
      colors: resolved.colors?.map((color: { code: string }) => color.code).join(', ') || '',
      sizes: categoryIsNiqab ? '' : resolved.sizes?.join(', ') || 'S, M, L, XL',
      isFeatured: resolved.isFeatured,
      isActive: resolved.isActive,
      canAddNiqab: resolved.canAddNiqab ?? true,
    })

    setIsModalOpen(true)
  }

  /*
   * =========================================================
   * Category Change
   * =========================================================
   */

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const categoryId =
      e.target.value

    const category =
      categories.find(
        (cat) =>
          cat.id === categoryId
      )

    /*
     * استعمال الـhelper الوحيد.
     */
    const categoryIsNiqab =
      isNiqabCategory(category)

    setFormData((prev) => ({
      ...prev,

      categoryId,

      /*
       * نقاب = لا Sizes
       *
       * أي اختيار نقاب يمسح
       * المقاسات مباشرة.
       */
      sizes: categoryIsNiqab
        ? ''
        : prev.sizes ||
        'S, M, L, XL',
    }))
  }

  /*
   * =========================================================
   * Submit
   * =========================================================
   */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedBasePrice = Number(formData.basePrice)
    if (!Number.isFinite(parsedBasePrice) || parsedBasePrice < 0) {
      error('Base price must be a valid non-negative number')
      return
    }

    const parsedSalePrice = formData.salePrice.trim() ? Number(formData.salePrice.trim()) : null
    if (parsedSalePrice !== null) {
      if (!Number.isFinite(parsedSalePrice) || parsedSalePrice < 0) {
        error('Sale price must be a valid non-negative number')
        return
      }
      if (parsedSalePrice >= parsedBasePrice) {
        error('Sale price must be lower than base price')
        return
      }
    }

    const parsedStock = Number.parseInt(formData.stock, 10)
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      error('Stock quantity must be a non-negative whole number')
      return
    }

    const rawColorTokens = formData.colors.split(',').map((c) => c.trim()).filter(Boolean)
    const seenColors = new Set<string>()
    const colorsArr: Array<{ code: string; nameAr: string; nameFr: string; nameEn: string }> = []
    for (const token of rawColorTokens) {
      const normalized = (token.startsWith('#') ? token : `#${token}`).toUpperCase()
      if (!/^#[0-9A-F]{3,8}$/.test(normalized)) {
        error(`Invalid hex color code: "${token}"`)
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
      const categoryIsNiqab = isNiqabCategory(category)

      const sizesArr = categoryIsNiqab
        ? []
        : Array.from(new Set(formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)))

      const payload = {
        nameAr: formData.nameAr.trim() || formData.nameFr.trim(),
        nameFr: formData.nameFr.trim(),
        nameEn: formData.nameEn.trim() || formData.nameFr.trim(),
        descriptionAr: formData.descriptionAr.trim() || formData.descriptionFr.trim(),
        descriptionFr: formData.descriptionFr.trim(),
        descriptionEn: formData.descriptionEn.trim() || formData.descriptionFr.trim(),
        sku: formData.sku.trim(),
        basePrice: parsedBasePrice,
        salePrice: parsedSalePrice,
        stock: parsedStock,
        categoryId: formData.categoryId,
        mainImage: formData.mainImage || formData.images[0] || '/images/brand/logo-full.png',
        images: formData.images.length > 0
          ? formData.images
          : [formData.mainImage || '/images/brand/logo-full.png'],
        colors: colorsArr,
        sizes: sizesArr,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
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

      success(editingProduct ? 'Product updated successfully' : 'Product created successfully')
      setIsModalOpen(false)
      setEditingProduct(null)
      setRefreshTick((t) => t + 1)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed'
      console.error('Error saving product:', err)
      error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  /*
   * =========================================================
   * Delete
   * =========================================================
   */

  const handleDelete =
    async () => {
      if (!deleteTarget) {
        return
      }

      setSubmitting(true)

      try {
        /*
         * إصلاح الـURL هنا أيضًا.
         */
        const url =
          `/api/admin/products/${deleteTarget.id}`

        const res =
          await fetch(url, {
            method: 'DELETE',

            headers: {
              Accept:
                'application/json',
            },
          })

        const contentType =
          res.headers.get(
            'content-type'
          ) || ''

        let data: ApiMessageResponse | null = null

        if (contentType.includes('application/json')) {
          data = (await res.json()) as ApiMessageResponse
        } else {
          data = { error: await res.text() }
        }

        if (!res.ok) {
          throw new Error(
            data?.error ||
            data?.message ||
            `Failed to delete product (${res.status})`
          )
        }

        success('Product deleted successfully')
        setDeleteTarget(null)
        setRefreshTick((t) => t + 1)
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Error deleting product'

        console.error(
          'Error deleting product:',
          err
        )

        error(errorMessage)
      } finally {
        setSubmitting(false)
      }
    }

  /*
   * =========================================================
   * Reviews
   * =========================================================
   */

  const loadReviews = useCallback(
    async (productId: string) => {
      setReviewsLoading(true)
      try {
        const res = await fetch(`/api/admin/reviews?productId=${encodeURIComponent(productId)}`, {
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) {
          throw new Error(`Failed to load reviews (${res.status})`)
        }
        const data = await res.json()
        setReviewsData(data.reviews)
        setReviewsCount(data.count)
      } catch (err: unknown) {
        console.error('Error loading reviews:', err)
        setReviewsData([])
        setReviewsCount(0)
        error(err instanceof Error ? err.message : 'Failed to load reviews')
      } finally {
        setReviewsLoading(false)
      }
    },
    [error]
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
        } catch { /* ignore */ }
        throw new Error(message)
      }
      setReviewsData((current) => current.filter((r) => r.id !== reviewId))
      setReviewsCount((count) => Math.max(0, count - 1))
      success('Review deleted successfully')
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : 'Failed to delete review')
    } finally {
      setReviewsDeleting(null)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        width: '100%',
      }}
    >
      {/* =====================================================
          Header
          ===================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          paddingBottom: 16,
          borderBottom:
            '1px solid rgba(63,63,70,0.6)',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 10,
              borderRadius: 12,
              background:
                'rgba(245,158,11,0.12)',
              border:
                '1px solid rgba(245,158,11,0.25)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'center',
            }}
          >
            <Package
              style={{
                width: 22,
                height: 22,
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection:
                'column',
              gap: 4,
            }}
          >
            <h1
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#fff',
                letterSpacing:
                  '-0.02em',
              }}
            >
              Product Management
            </h1>

            <p
              style={{
                fontSize: 12,
                color: '#71717a',
                fontWeight: 500,
              }}
            >
              Manage catalog, pricing,
              stock levels, variants,
              and visibility
            </p>
          </div>
        </div>

        <button
          onClick={
            openCreateModal
          }
          style={{
            display:
              'inline-flex',
            alignItems:
              'center',
            gap: 8,
            padding:
              '10px 18px',
            borderRadius: 12,
            background:
              'linear-gradient(90deg, #f59e0b, #d97706)',
            color: '#09090b',
            fontWeight: 900,
            fontSize: 12,
            border: 'none',
            cursor: 'pointer',
            boxShadow:
              '0 4px 20px rgba(245,158,11,0.25)',
          }}
        >
          <Plus
            style={{
              width: 16,
              height: 16,
            }}
          />

          <span>
            Add New Product
          </span>
        </button>
      </div>

      {/* =====================================================
          Search & Filter
          ===================================================== */}

      <div
        style={{
          background:
            'rgb(24,24,27)',
          border:
            '1px solid rgba(63,63,70,0.6)',
          borderRadius: 16,
          padding:
            '16px 20px',
          boxShadow:
            '0 4px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems:
            'center',
          justifyContent:
            'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div
          style={{
            position: 'relative',
            minWidth: 0,
            width: '100%',
            flex: '1 1 220px',
          }}
        >
          <Search
            style={{
              position:
                'absolute',
              left: 14,
              top: 12,
              width: 16,
              height: 16,
              color: '#71717a',
            }}
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              )

              setPage(1)
            }}
            placeholder="Search by name or SKU..."
            style={{
              width: '100%',
              background:
                'rgb(9,9,11)',
              border:
                '1px solid rgba(63,63,70,0.8)',
              borderRadius: 12,
              padding:
                '10px 14px 10px 40px',
              fontSize: 12,
              color: '#f4f4f5',
              outline: 'none',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems:
              'center',
            gap: 12,
          }}
        >
          <div
            style={{
              display:
                'flex',
              alignItems:
                'center',
              gap: 6,
              fontSize: 12,
              color: '#a1a1aa',
              fontWeight: 600,
            }}
          >
            <Filter
              style={{
                width: 14,
                height: 14,
                color: '#fbbf24',
              }}
            />

            Filter Category:
          </div>

          <select
            value={
              selectedCategory
            }
            onChange={(e) => {
              setSelectedCategory(
                e.target.value
              )

              setPage(1)
            }}
            style={{
              background:
                'rgb(9,9,11)',
              border:
                '1px solid rgba(63,63,70,0.8)',
              borderRadius: 12,
              padding:
                '10px 14px',
              fontSize: 12,
              fontWeight: 700,
              color:
                '#f4f4f5',
              outline: 'none',
              cursor:
                'pointer',
            }}
          >
            <option value="all">
              All Categories
            </option>

            {categories.map(
              (cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                >
                  {cat.name ||
                    cat.nameFr ||
                    cat.nameAr ||
                    cat.nameEn ||
                    cat.slug}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* =====================================================
          Products Table
          ===================================================== */}

      <div
        style={{
          background:
            'rgb(24,24,27)',
          border:
            '1px solid rgba(63,63,70,0.6)',
          borderRadius: 20,
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection:
            'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse:
                'collapse',
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    'rgba(9,9,11,0.6)',
                  borderBottom:
                    '1px solid rgba(63,63,70,0.6)',
                }}
              >
                {[
                  'Product',
                  'SKU',
                  'Category',
                  'Price',
                  'Stock',
                  'Status',
                  'Actions',
                ].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding:
                        '14px 18px',
                      textAlign:
                        i === 6
                          ? 'right'
                          : 'left',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#71717a',
                      textTransform:
                        'uppercase',
                      letterSpacing:
                        '0.08em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding:
                        '48px 18px',
                      textAlign:
                        'center',
                      color:
                        '#71717a',
                    }}
                  >
                    <span
                      style={{
                        display:
                          'inline-block',
                        width: 24,
                        height: 24,
                        border:
                          '2px solid #fbbf24',
                        borderTopColor:
                          'transparent',
                        borderRadius:
                          '50%',
                        animation:
                          'spin 1s linear infinite',
                        marginBottom: 8,
                      }}
                    />

                    <p
                      style={{
                        fontSize: 12,
                      }}
                    >
                      Loading products
                      catalog...
                    </p>
                  </td>
                </tr>
              ) : products.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding:
                        '48px 18px',
                      textAlign:
                        'center',
                      fontSize: 12,
                      color:
                        '#3f3f46',
                    }}
                  >
                    No products found
                    matching your search.
                  </td>
                </tr>
              ) : (
                products.map(
                  (prod) => (
                    <tr
                      key={prod.id}
                      style={{
                        borderBottom:
                          '1px solid rgba(63,63,70,0.4)',
                      }}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td
                        style={{
                          padding:
                            '16px 18px',
                        }}
                      >
                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap: 14,
                            minWidth:
                              200,
                          }}
                        >
                          <div
                            style={{
                              position: 'relative',
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: '#27272a',
                              border: '1px solid rgba(63,63,70,0.8)',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            <Image
                              src={prod.mainImage || '/images/brand/logo-full.png'}
                              alt={prod.name}
                              fill
                              sizes="44px"
                              referrerPolicy="no-referrer"
                              className="object-cover"
                            />
                          </div>

                          <div
                            style={{
                              display:
                                'flex',
                              flexDirection:
                                'column',
                              gap: 4,
                            }}
                          >
                            <div
                              style={{
                                fontWeight:
                                  700,
                                color:
                                  '#fff',
                                fontSize:
                                  14,
                              }}
                            >
                              {
                                prod.name
                              }
                            </div>

                            {prod.isFeatured && (
                              <span
                                style={{
                                  display:
                                    'inline-flex',
                                  alignItems:
                                    'center',
                                  gap: 4,
                                  fontSize:
                                    10,
                                  color:
                                    '#fbbf24',
                                  fontWeight:
                                    700,
                                }}
                              >
                                <Star
                                  style={{
                                    width:
                                      12,
                                    height:
                                      12,
                                    fill:
                                      'currentColor',
                                  }}
                                />

                                Featured
                                Item
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td
                        style={{
                          padding:
                            '16px 18px',
                          color:
                            '#71717a',
                          fontFamily:
                            'monospace',
                          fontSize: 12,
                        }}
                      >
                        {
                          prod.sku
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            '16px 18px',
                        }}
                      >
                        <span
                          style={{
                            padding:
                              '4px 10px',
                            borderRadius:
                              8,
                            background:
                              'rgba(63,63,70,0.4)',
                            color:
                              '#d4d4d8',
                            border:
                              '1px solid rgba(63,63,70,0.6)',
                            fontSize:
                              11,
                            fontWeight:
                              600,
                          }}
                        >
                          {prod.category
                            ?.nameFr ||
                            prod.category
                              ?.nameAr ||
                            prod.category
                              ?.name ||
                            prod.category
                              ?.nameEn ||
                            'Category'}
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            '16px 18px',
                        }}
                      >
                        <div
                          style={{
                            fontWeight:
                              900,
                            color:
                              '#fbbf24',
                          }}
                        >
                          {formatPrice(
                            prod.salePrice ||
                            prod.basePrice,
                            'fr'
                          )}
                        </div>

                        {prod.salePrice && (
                          <div
                            style={{
                              fontSize:
                                11,
                              color:
                                '#71717a',
                              textDecoration:
                                'line-through',
                            }}
                          >
                            {formatPrice(
                              prod.basePrice,
                              'fr'
                            )}
                          </div>
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            '16px 18px',
                        }}
                      >
                        <span
                          style={{
                            fontWeight:
                              700,
                            color:
                              prod.stock >
                                10
                                ? '#34d399'
                                : prod.stock >
                                  0
                                  ? '#fbbf24'
                                  : '#f87171',
                          }}
                        >
                          {prod.stock >
                            0
                            ? `${prod.stock} units`
                            : 'Out of Stock'}
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            '16px 18px',
                        }}
                      >
                        {prod.isActive ? (
                          <span
                            style={{
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              gap: 4,
                              padding:
                                '4px 10px',
                              borderRadius:
                                999,
                              background:
                                'rgba(52,211,153,0.12)',
                              color:
                                '#34d399',
                              border:
                                '1px solid rgba(52,211,153,0.25)',
                              fontSize:
                                10,
                              fontWeight:
                                800,
                              textTransform:
                                'uppercase',
                            }}
                          >
                            <CheckCircle2
                              style={{
                                width:
                                  12,
                                height:
                                  12,
                              }}
                            />

                            Active
                          </span>
                        ) : (
                          <span
                            style={{
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              gap: 4,
                              padding:
                                '4px 10px',
                              borderRadius:
                                999,
                              background:
                                'rgba(248,113,113,0.12)',
                              color:
                                '#f87171',
                              border:
                                '1px solid rgba(248,113,113,0.25)',
                              fontSize:
                                10,
                              fontWeight:
                                800,
                              textTransform:
                                'uppercase',
                            }}
                          >
                            <XCircle
                              style={{
                                width:
                                  12,
                                height:
                                  12,
                              }}
                            />

                            Draft
                          </span>
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            '16px 18px',
                          textAlign:
                            'right',
                        }}
                      >
                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'flex-end',
                            gap: 8,
                          }}
                        >
                          <button
                            onClick={() =>
                              openEditModal(
                                prod
                              )
                            }
                            style={{
                              padding:
                                8,
                              borderRadius:
                                10,
                              background:
                                'rgba(63,63,70,0.6)',
                              border:
                                'none',
                              color:
                                '#d4d4d8',
                              cursor:
                                'pointer',
                            }}
                            className="hover:bg-amber-500 hover:text-zinc-950 transition-all"
                            title="Edit Product"
                          >
                            <Edit2
                              style={{
                                width:
                                  15,
                                height:
                                  15,
                              }}
                            />
                          </button>

                          <button
                            onClick={() =>
                              openReviewsModal(
                                prod
                              )
                            }
                            style={{
                              padding:
                                8,
                              borderRadius:
                                10,
                              background:
                                'rgba(59,130,246,0.12)',
                              border:
                                '1px solid rgba(59,130,246,0.25)',
                              color:
                                '#60a5fa',
                              cursor:
                                'pointer',
                            }}
                            className="hover:bg-blue-500 hover:text-white transition-all"
                            title="Reviews"
                          >
                            <MessageSquare
                              style={{
                                width:
                                  15,
                                height:
                                  15,
                              }}
                            />
                          </button>

                          <button
                            onClick={() =>
                              setDeleteTarget(
                                prod
                              )
                            }
                            style={{
                              padding:
                                8,
                              borderRadius:
                                10,
                              background:
                                'rgba(239,68,68,0.12)',
                              border:
                                '1px solid rgba(239,68,68,0.25)',
                              color:
                                '#f87171',
                              cursor:
                                'pointer',
                            }}
                            className="hover:bg-rose-600 hover:text-white transition-all"
                            title="Delete Product"
                          >
                            <Trash2
                              style={{
                                width:
                                  15,
                                height:
                                  15,
                              }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* =====================================================
            Pagination
            ===================================================== */}

        <div
          style={{
            padding:
              '14px 20px',
            background:
              'rgba(9,9,11,0.6)',
            borderTop:
              '1px solid rgba(63,63,70,0.6)',
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'space-between',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: '#71717a',
              fontWeight: 500,
            }}
          >
            Page {page} of{' '}
            {totalPages}
          </div>

          <div
            style={{
              display:
                'flex',
              alignItems:
                'center',
              gap: 8,
            }}
          >
            <button
              disabled={
                page <= 1
              }
              onClick={() =>
                setPage(
                  page - 1
                )
              }
              style={{
                padding: 8,
                borderRadius: 10,
                background:
                  'rgba(63,63,70,0.6)',
                border:
                  'none',
                color:
                  '#d4d4d8',
                cursor:
                  page <= 1
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  page <= 1
                    ? 0.4
                    : 1,
              }}
            >
              <ChevronLeft
                style={{
                  width: 16,
                  height: 16,
                }}
              />
            </button>

            <button
              disabled={
                page >=
                totalPages
              }
              onClick={() =>
                setPage(
                  page + 1
                )
              }
              style={{
                padding: 8,
                borderRadius: 10,
                background:
                  'rgba(63,63,70,0.6)',
                border:
                  'none',
                color:
                  '#d4d4d8',
                cursor:
                  page >=
                    totalPages
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  page >=
                    totalPages
                    ? 0.4
                    : 1,
              }}
            >
              <ChevronRight
                style={{
                  width: 16,
                  height: 16,
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          Product Create / Edit Modal
          ===================================================== */}

      {isModalOpen && (
        <div
          style={{
            position:
              'fixed',
            inset: 0,
            zIndex: 50,
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding: 16,
            background:
              'rgba(0,0,0,0.75)',
            backdropFilter:
              'blur(6px)',
          }}
        >
          <div
            className="p-4 sm:p-8"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 760,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'rgb(24,24,27)',
              border: '1px solid rgba(63,63,70,0.8)',
              borderRadius: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              color: '#f4f4f5',
            }}
          >
            <button
              onClick={() =>
                setIsModalOpen(
                  false
                )
              }
              style={{
                position:
                  'absolute',
                top: 24,
                right: 24,
                padding: 8,
                borderRadius:
                  10,
                background:
                  'none',
                border:
                  'none',
                color:
                  '#71717a',
                cursor:
                  'pointer',
              }}
            >
              <X
                style={{
                  width: 20,
                  height: 20,
                }}
              />
            </button>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: '#fff',
                marginBottom: 24,
              }}
            >
              {editingProduct
                ? 'Edit Product'
                : 'Create New Product'}
            </h2>

            <form
              onSubmit={
                handleSubmit
              }
              style={{
                display:
                  'flex',
                flexDirection:
                  'column',
                gap: 20,
              }}
            >
              {/* =================================================
                  Product Names
                  ================================================= */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Arabic */}
                <div>
                  <label
                    style={{
                      display:
                        'block',
                      fontSize:
                        12,
                      fontWeight:
                        700,
                      color:
                        '#d4d4d8',
                      marginBottom:
                        6,
                    }}
                  >
                    Name (Arabic)
                  </label>

                  <input
                    type="text"
                    value={
                      formData.nameAr
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nameAr:
                          e.target.value,
                      })
                    }
                    placeholder="جلابة مغربية"
                    style={{
                      width:
                        '100%',
                      background:
                        'rgb(9,9,11)',
                      border:
                        '1px solid rgba(63,63,70,0.8)',
                      borderRadius:
                        12,
                      padding:
                        '10px 14px',
                      fontSize:
                        12,
                      color:
                        '#f4f4f5',
                      outline:
                        'none',
                    }}
                  />
                </div>

                {/* French */}
                <div>
                  <label
                    style={{
                      display:
                        'block',
                      fontSize:
                        12,
                      fontWeight:
                        700,
                      color:
                        '#d4d4d8',
                      marginBottom:
                        6,
                    }}
                  >
                    Name
                    (French/Primary)
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      formData.nameFr
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nameFr:
                          e.target.value,
                      })
                    }
                    placeholder="Djellaba Royale"
                    style={{
                      width:
                        '100%',
                      background:
                        'rgb(9,9,11)',
                      border:
                        '1px solid rgba(63,63,70,0.8)',
                      borderRadius:
                        12,
                      padding:
                        '10px 14px',
                      fontSize:
                        12,
                      color:
                        '#f4f4f5',
                      outline:
                        'none',
                    }}
                  />
                </div>

                {/* English */}
                <div>
                  <label
                    style={{
                      display:
                        'block',
                      fontSize:
                        12,
                      fontWeight:
                        700,
                      color:
                        '#d4d4d8',
                      marginBottom:
                        6,
                    }}
                  >
                    Name (English)
                  </label>

                  <input
                    type="text"
                    value={
                      formData.nameEn
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nameEn:
                          e.target.value,
                      })
                    }
                    placeholder="Royal Djellaba"
                    style={{
                      width:
                        '100%',
                      background:
                        'rgb(9,9,11)',
                      border:
                        '1px solid rgba(63,63,70,0.8)',
                      borderRadius:
                        12,
                      padding:
                        '10px 14px',
                      fontSize:
                        12,
                      color:
                        '#f4f4f5',
                      outline:
                        'none',
                    }}
                  />
                </div>
              </div>

              {/* =================================================
                  Pricing, SKU, Stock
                  ================================================= */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* SKU */}
                <div>
                  <label
                    style={{
                      display:
                        'block',
                      fontSize:
                        12,
                      fontWeight:
                        700,
                      color:
                        '#d4d4d8',
                      marginBottom:
                        6,
                    }}
                  >
                    SKU
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      formData.sku
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sku:
                          e.target.value,
                      })
                    }
                    style={{
                      width:
                        '100%',
                      background:
                        'rgb(9,9,11)',
                      border:
                        '1px solid rgba(63,63,70,0.8)',
                      borderRadius:
                        12,
                      padding:
                        '10px 14px',
                      fontSize:
                        12,
                      color:
                        '#f4f4f5',
                      outline:
                        'none',
                      fontFamily:
                        'monospace',
                    }}
                  />
                </div>

                {/* Base Price */}
                <div>
                  <label
                    style={{
                      display:
                        'block',
                      fontSize:
                        12,
                      fontWeight:
                        700,
                      color:
                        '#d4d4d8',
                      marginBottom:
                        6,
                    }}
                  >
                    Base Price
                    (DH)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    required
                    value={
                      formData.basePrice
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        basePrice:
                          e.target.value,
                      })
                    }
                    placeholder="599"
                    style={{
                      width:
                        '100%',
                      background:
                        'rgb(9,9,11)',
                      border:
                        '1px solid rgba(63,63,70,0.8)',
                      borderRadius:
                        12,
                      padding:
                        '10px 14px',
                      fontSize:
                        12,
                      color:
                        '#f4f4f5',
                      outline:
                        'none',
                    }}
                  />
                </div>

                {/* Sale Price */}
                <div>
                  <label
                    style={{
                      display:
                        'block',
                      fontSize:
                        12,
                      fontWeight:
                        700,
                      color:
                        '#d4d4d8',
                      marginBottom:
                        6,
                    }}
                  >
                    Sale Price
                    (DH)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={
                      formData.salePrice
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salePrice:
                          e.target.value,
                      })
                    }
                    placeholder="499 (Optional)"
                    style={{
                      width:
                        '100%',
                      background:
                        'rgb(9,9,11)',
                      border:
                        '1px solid rgba(63,63,70,0.8)',
                      borderRadius:
                        12,
                      padding:
                        '10px 14px',
                      fontSize:
                        12,
                      color:
                        '#f4f4f5',
                      outline:
                        'none',
                    }}
                  />
                </div>

                {/* Stock */}
                <div>
                  <label
                    style={{
                      display:
                        'block',
                      fontSize:
                        12,
                      fontWeight:
                        700,
                      color:
                        '#d4d4d8',
                      marginBottom:
                        6,
                    }}
                  >
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    required
                    value={
                      formData.stock
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock:
                          e.target.value,
                      })
                    }
                    style={{
                      width:
                        '100%',
                      background:
                        'rgb(9,9,11)',
                      border:
                        '1px solid rgba(63,63,70,0.8)',
                      borderRadius:
                        12,
                      padding:
                        '10px 14px',
                      fontSize:
                        12,
                      color:
                        '#f4f4f5',
                      outline:
                        'none',
                    }}
                  />
                </div>
              </div>

              {/* =================================================
                  Category
                  ================================================= */}

              <div>
                <label
                  style={{
                    display:
                      'block',
                    fontSize:
                      12,
                    fontWeight:
                      700,
                    color:
                      '#d4d4d8',
                    marginBottom:
                      6,
                  }}
                >
                  Category
                </label>

                <select
                  value={
                    formData.categoryId
                  }
                  onChange={
                    handleCategoryChange
                  }
                  style={{
                    width:
                      '100%',
                    background:
                      'rgb(9,9,11)',
                    border:
                      '1px solid rgba(63,63,70,0.8)',
                    borderRadius:
                      12,
                    padding:
                      '10px 14px',
                    fontSize:
                      12,
                    color:
                      '#f4f4f5',
                    outline:
                      'none',
                  }}
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {category.name ||
                          category.nameFr ||
                          category.nameAr ||
                          category.nameEn ||
                          category.slug}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* =================================================
                  Description
                  ================================================= */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>
                    Description (Arabic)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder="وصف المنتج بالعربية..."
                    style={{
                      width: '100%',
                      background: 'rgb(9,9,11)',
                      border: '1px solid rgba(63,63,70,0.8)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontSize: 12,
                      color: '#f4f4f5',
                      outline: 'none',
                      resize: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>
                    Description (French/Primary)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descriptionFr}
                    onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                    placeholder="Description détaillée en français..."
                    style={{
                      width: '100%',
                      background: 'rgb(9,9,11)',
                      border: '1px solid rgba(63,63,70,0.8)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontSize: 12,
                      color: '#f4f4f5',
                      outline: 'none',
                      resize: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>
                    Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder="Detailed product description in English..."
                    style={{
                      width: '100%',
                      background: 'rgb(9,9,11)',
                      border: '1px solid rgba(63,63,70,0.8)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontSize: 12,
                      color: '#f4f4f5',
                      outline: 'none',
                      resize: 'none',
                    }}
                  />
                </div>
              </div>

              <div className={selectedCategoryIsNiqab ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
                {/* =================================================
                    Colors
                    ================================================= */}

                <div>
                  <label
                    style={{
                      display:
                        'block',
                      fontSize:
                        12,
                      fontWeight:
                        700,
                      color:
                        '#d4d4d8',
                      marginBottom:
                        6,
                    }}
                  >
                    Colors (Comma
                    separated hex
                    codes)
                  </label>

                  <input
                    type="text"
                    value={
                      formData.colors
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        colors:
                          e.target.value,
                      })
                    }
                    placeholder="#C4622D, #F2E4CE, #000000"
                    style={{
                      width:
                        '100%',
                      background:
                        'rgb(9,9,11)',
                      border:
                        '1px solid rgba(63,63,70,0.8)',
                      borderRadius:
                        12,
                      padding:
                        '10px 14px',
                      fontSize:
                        12,
                      color:
                        '#f4f4f5',
                      outline:
                        'none',
                      fontFamily:
                        'monospace',
                    }}
                  />
                </div>

                {/* =================================================
                    SIZES
                    =================================================
                    
                    هذا العنصر لا يتم رسمه نهائيًا
                    إذا كانت الفئة Niqab.
                    ================================================= */}

                {!selectedCategoryIsNiqab && (
                  <div>
                    <label
                      style={{
                        display:
                          'block',
                        fontSize:
                          12,
                        fontWeight:
                          700,
                        color:
                          '#d4d4d8',
                        marginBottom:
                          6,
                      }}
                    >
                      Sizes (Comma
                      separated)
                    </label>

                    <input
                      type="text"
                      value={
                        formData.sizes
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sizes:
                            e.target.value,
                        })
                      }
                      placeholder="S, M, L, XL, Standard"
                      style={{
                        width:
                          '100%',
                        background:
                          'rgb(9,9,11)',
                        border:
                          '1px solid rgba(63,63,70,0.8)',
                        borderRadius:
                          12,
                        padding:
                          '10px 14px',
                        fontSize:
                          12,
                        color:
                          '#f4f4f5',
                        outline:
                          'none',
                        fontFamily:
                          'monospace',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* =================================================
                  Image Upload
                  ================================================= */}

              <div>
                <label
                  style={{
                    display:
                      'block',
                    fontSize:
                      12,
                    fontWeight:
                      700,
                    color:
                      '#d4d4d8',
                    marginBottom:
                      8,
                  }}
                >
                  Product Images
                  (Drag & Drop or
                  Click)
                </label>

                <ImageUploader
                  images={
                    formData.images
                  }
                  mainImage={
                    formData.mainImage
                  }
                  onChange={(
                    updatedImages,
                    updatedMain
                  ) => {
                    setFormData({
                      ...formData,
                      images:
                        updatedImages,
                      mainImage:
                        updatedMain,
                    })
                  }}
                />
              </div>

              {/* =================================================
                  Switches
                  ================================================= */}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 24,
                  paddingTop: 6,
                }}
              >
                {/* Featured */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#d4d4d8',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: '#f59e0b' }}
                  />
                  <span>Featured Product</span>
                </label>

                {/* Active */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#d4d4d8',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: '#34d399' }}
                  />
                  <span>Published / Active</span>
                </label>

                {!selectedCategoryIsNiqab && (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#d4d4d8',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.canAddNiqab}
                      onChange={(e) => setFormData({ ...formData, canAddNiqab: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: '#fbbf24' }}
                    />
                    <span>Can Add Matching Niqab</span>
                  </label>
                )}
              </div>

              {/* =================================================
                  Action Buttons
                  ================================================= */}

              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'flex-end',
                  gap: 12,
                  paddingTop:
                    20,
                  borderTop:
                    '1px solid rgba(63,63,70,0.8)',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(
                      false
                    )
                  }
                  style={{
                    padding:
                      '10px 18px',
                    borderRadius:
                      12,
                    background:
                      'none',
                    border:
                      'none',
                    fontSize:
                      12,
                    fontWeight:
                      600,
                    color:
                      '#a1a1aa',
                    cursor:
                      'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  style={{
                    padding:
                      '10px 24px',
                    borderRadius:
                      12,
                    background:
                      'linear-gradient(90deg, #f59e0b, #d97706)',
                    color:
                      '#09090b',
                    fontWeight:
                      900,
                    fontSize:
                      12,
                    border:
                      'none',
                    cursor:
                      submitting
                        ? 'not-allowed'
                        : 'pointer',
                    boxShadow:
                      '0 4px 20px rgba(245,158,11,0.2)',
                    opacity:
                      submitting
                        ? 0.6
                        : 1,
                  }}
                >
                  {submitting
                    ? 'Saving...'
                    : editingProduct
                      ? 'Update Product'
                      : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          Reviews Dialog
          ===================================================== */}

      {reviewsTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(0,0,0,0.72)',
          }}
          onClick={() => setReviewsTarget(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 560,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 16,
              border: '1px solid rgba(63,63,70,0.8)',
              background: 'linear-gradient(145deg, rgba(26,28,30,0.99), rgba(13,15,17,0.99))',
              boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(63,63,70,0.6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare style={{ width: 17, height: 17, color: '#60a5fa' }} />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#f4f4f5' }}>
                  Reviews — {reviewsTarget.name}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fbbf24',
                    background: 'rgba(251,191,36,0.12)',
                    border: '1px solid rgba(251,191,36,0.3)',
                    borderRadius: 999,
                    padding: '2px 8px',
                  }}
                >
                  {reviewsCount}
                </span>
              </div>
              <button
                onClick={() => setReviewsTarget(null)}
                style={{
                  padding: 7,
                  borderRadius: 9,
                  background: 'rgba(63,63,70,0.6)',
                  border: 'none',
                  color: '#d4d4d8',
                  cursor: 'pointer',
                }}
                className="hover:bg-zinc-600 transition-all"
                aria-label="Close"
              >
                <X style={{ width: 15, height: 15 }} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              {reviewsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <Loader2 className="animate-spin" style={{ width: 22, height: 22, color: '#fbbf24' }} />
                </div>
              ) : reviewsData.length === 0 ? (
                <p style={{ margin: 0, padding: '24px 0', textAlign: 'center', fontSize: 13, color: '#71717a' }}>
                  No reviews for this product yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reviewsData.map((review) => (
                    <div
                      key={review.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: 'rgba(9,9,11,0.6)',
                        border: '1px solid rgba(63,63,70,0.5)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          {review.customer.avatarUrl ? (
                            <div style={{ position: 'relative', width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                              <Image
                                src={review.customer.avatarUrl}
                                alt={review.customer.name}
                                fill
                                sizes="30px"
                                referrerPolicy="no-referrer"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#fbbf24',
                                color: '#090909',
                                fontSize: 13,
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {review.customer.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#f4f4f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {review.customer.name}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {review.customer.email || '—'}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} dir="ltr">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                style={{
                                  width: 13,
                                  height: 13,
                                  fill: n <= review.rating ? '#fbbf24' : 'transparent',
                                  color: n <= review.rating ? '#fbbf24' : '#52525b',
                                }}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={reviewsDeleting === review.id}
                            style={{
                              padding: 6,
                              borderRadius: 8,
                              background: 'rgba(239,68,68,0.12)',
                              border: '1px solid rgba(239,68,68,0.25)',
                              color: '#f87171',
                              cursor: 'pointer',
                            }}
                            className="hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                            title="Delete Review"
                          >
                            {reviewsDeleting === review.id ? (
                              <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} />
                            ) : (
                              <Trash2 style={{ width: 13, height: 13 }} />
                            )}
                          </button>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: '#d4d4d8', lineHeight: 1.6, wordBreak: 'break-word' }}>
                        {review.comment}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: '#71717a' }}>
                        {new Date(review.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          Delete Confirmation
          ===================================================== */}

      <ConfirmModal
        isOpen={
          !!deleteTarget
        }
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}" ? This action cannot be undone.`}
        confirmText="Delete Product"
        variant="danger"
        isLoading={
          submitting
        }
        onConfirm={
          handleDelete
        }
        onCancel={() =>
          setDeleteTarget(
            null
          )
        }
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

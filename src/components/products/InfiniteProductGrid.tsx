'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ProductCard } from '@/components/shared/ProductCard'
import type { ProductCard as ProductCardType, ProductFilters } from '@/types/product'
import { Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InfiniteProductGridProps {
  initialProducts: ProductCardType[]
  initialTotal: number
  locale: string
  filters?: ProductFilters
  isNew?: boolean
  gridClassName?: string
}

export function InfiniteProductGrid({
  initialProducts,
  initialTotal,
  locale,
  filters,
  isNew,
  gridClassName,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState<ProductCardType[]>(initialProducts)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialProducts.length < initialTotal)
  const [error, setError] = useState(false)

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Reset state when server-provided initial props / filters change
  useEffect(() => {
    setProducts(initialProducts)
    setPage(1)
    setTotal(initialTotal)
    setHasMore(initialProducts.length < initialTotal)
    setError(false)
    setLoading(false)
  }, [
    initialProducts,
    initialTotal,
    filters?.category,
    filters?.size,
    filters?.colorCode,
    filters?.search,
    filters?.sort,
    filters?.isFeatured,
    filters?.isNiqab,
  ])

  // Fetch next batch of products
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    setError(false)

    try {
      const nextPage = page + 1
      const params = new URLSearchParams()
      params.set('page', String(nextPage))
      params.set('limit', '12')

      if (filters?.category) params.set('category', filters.category)
      if (filters?.size) params.set('size', filters.size)
      if (filters?.colorCode) params.set('colorCode', filters.colorCode)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.sort) params.set('sort', filters.sort)
      if (filters?.isFeatured !== undefined) params.set('isFeatured', String(filters.isFeatured))
      if (filters?.isNiqab !== undefined) params.set('isNiqab', String(filters.isNiqab))

      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load products')

      const data = await res.json()
      const newItems: ProductCardType[] = Array.isArray(data.items) ? data.items : []

      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id))
        const uniqueNew = newItems.filter((p) => !existingIds.has(p.id))
        const combined = [...prev, ...uniqueNew]

        if (combined.length >= data.total || newItems.length === 0) {
          setHasMore(false)
        }
        return combined
      })

      setTotal(data.total || 0)
      setPage(nextPage)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, filters])

  // IntersectionObserver to trigger loading when reaching near bottom
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || loading) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && !error) {
          loadMore()
        }
      },
      {
        root: null,
        rootMargin: '350px',
        threshold: 0.1,
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, error, loadMore])

  const tLoading =
    locale === 'ar'
      ? 'جاري تحميل المزيد من المنتجات...'
      : locale === 'fr'
      ? 'Chargement de plus de produits...'
      : 'Loading more products...'

  const tError =
    locale === 'ar'
      ? 'تعذر تحميل المزيد من المنتجات'
      : locale === 'fr'
      ? 'Échec du chargement des produits'
      : 'Failed to load more products'

  const tRetry =
    locale === 'ar' ? 'إعادة المحاولة' : locale === 'fr' ? 'Réessayer' : 'Try Again'

  return (
    <div className="w-full">
      {/* ── Products Grid ───────────────────────────────────────────── */}
      <div
        className={cn(
          gridClassName || 'grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3'
        )}
      >
        {products.map((product, idx) => (
          <div
            key={product.id}
            className="animate-fade-in-up"
            style={{
              animationDelay: `${(idx % 12) * 40}ms`,
              animationFillMode: 'both',
            }}
          >
            <ProductCard
              product={product}
              locale={locale}
              isNew={isNew}
            />
          </div>
        ))}
      </div>

      {/* ── Sentinel & Infinite Scroll Feedback ─────────────────────── */}
      <div
        ref={sentinelRef}
        className="w-full flex flex-col items-center justify-center py-8 min-h-[60px]"
      >
        {loading && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-xs font-semibold text-[var(--accent)] shadow-xs animate-in fade-in duration-200">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
            <span>{tLoading}</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 py-2 animate-in fade-in duration-200">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">{tError}</p>
            <button
              type="button"
              onClick={loadMore}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{tRetry}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

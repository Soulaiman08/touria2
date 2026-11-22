'use client'

import { useState, useMemo } from 'react'
import { ShoppingBag } from 'lucide-react'
import type { ProductCard as ProductCardType } from '@/types/product'
import type { StoreCategory } from '@/services/category.service'
import { ProductCard } from '@/components/shared/ProductCard'
import { ForwardButton } from '@/components/shared/PageNavigation'
import { cn } from '@/lib/utils'

interface FeaturedCollectionShowcaseProps {
  locale: string
  initialFeatured: ProductCardType[]
  initialCatalogProducts: ProductCardType[]
  categories: StoreCategory[]
  allCatalogCount: number
  labels: {
    eyebrow: string
    title: string
    subtitle: string
    allCatalog: string
    viewAll: string
    empty: string
  }
}

export function FeaturedCollectionShowcase({
  locale,
  initialFeatured,
  initialCatalogProducts,
  categories,
  allCatalogCount,
  labels,
}: FeaturedCollectionShowcaseProps) {
  const isRTL = locale === 'ar'
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [fetchedByCategory, setFetchedByCategory] = useState<Record<string, ProductCardType[]>>({})
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)

  const visibleCategories = useMemo(
    () => categories.filter((cat) => cat.config?.showInHomeTabs !== false),
    [categories]
  )

  const preloadedByCategory = useMemo(() => {
    const map: Record<string, ProductCardType[]> = {}
    for (const product of initialCatalogProducts) {
      const slug = product.category?.slug
      if (!slug) continue
      if (!map[slug]) map[slug] = []
      map[slug].push(product)
    }
    return map
  }, [initialCatalogProducts])

  const allTabProducts = useMemo(() => {
    if (initialFeatured.length > 0) return initialFeatured
    return initialCatalogProducts.slice(0, 4)
  }, [initialFeatured, initialCatalogProducts])

  const displayedProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return allTabProducts
    }
    const cached = fetchedByCategory[activeCategory]
    if (cached) return cached
    return (preloadedByCategory[activeCategory] ?? []).slice(0, 8)
  }, [activeCategory, allTabProducts, fetchedByCategory, preloadedByCategory])

  const viewAllHref =
    activeCategory === 'all'
      ? `/${locale}/products`
      : `/${locale}/products?category=${encodeURIComponent(activeCategory)}`

  const handleSelectCategory = async (slug: string, expectedCount = 0) => {
    setActiveCategory(slug)
    if (slug === 'all') return

    const alreadyHasPreloaded = (preloadedByCategory[slug]?.length ?? 0) > 0
    const alreadyFetched = fetchedByCategory[slug] !== undefined
    if (alreadyHasPreloaded || alreadyFetched || expectedCount === 0) return

    setLoadingSlug(slug)
    try {
      const res = await fetch(`/api/products?category=${encodeURIComponent(slug)}&limit=8`)
      if (res.ok) {
        const data = (await res.json()) as { items?: ProductCardType[] }
        if (Array.isArray(data.items)) {
          setFetchedByCategory((prev) => ({ ...prev, [slug]: data.items! }))
        }
      }
    } catch {
      // Keep graceful UI fallback if offline/network error
    } finally {
      setLoadingSlug((current) => (current === slug ? null : current))
    }
  }

  const isLoadingActive = activeCategory !== 'all' && loadingSlug === activeCategory

  return (
    <section className="home-section" aria-label={labels.title}>
      <div className="container-brand space-y-4 sm:space-y-6">
        <div className="space-y-2.5 sm:space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Masthead Row: Heading + Mobile View All */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
              <span className="w-5 h-px bg-[var(--gold)]/60" aria-hidden="true" />
              <span>{labels.eyebrow}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl sm:text-3xl font-bold text-[var(--text-primary)] truncate m-0">
                {labels.title}
              </h2>

              <div className="sm:hidden flex-shrink-0">
                <ForwardButton
                  href={viewAllHref}
                  label={labels.viewAll}
                  locale={locale}
                  size="sm"
                />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed m-0">
              {labels.subtitle}
            </p>
          </div>

          {/* Unified Underline Category Tabs + Desktop View All */}
          <div className="flex items-end justify-between gap-4 border-b border-[var(--border)]">
            {visibleCategories.length > 0 ? (
              <div
                role="tablist"
                aria-label={labels.allCatalog}
                className="flex items-center gap-5 sm:gap-7 overflow-x-auto scrollbar-hidden min-w-0"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === 'all'}
                  onClick={() => handleSelectCategory('all', allCatalogCount)}
                  className={cn(
                    'inline-flex items-center gap-1.5 py-2.5 text-xs sm:text-[13px] border-b-2 -mb-px whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer bg-transparent',
                    activeCategory === 'all'
                      ? 'font-semibold text-[var(--accent)] border-[var(--accent)]'
                      : 'font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] border-transparent'
                  )}
                >
                  <span>{labels.allCatalog}</span>
                  {allCatalogCount > 0 && (
                    <span
                      className={cn(
                        'tabular-nums text-[11px]',
                        activeCategory === 'all' ? 'opacity-80' : 'opacity-70'
                      )}
                    >
                      ({allCatalogCount})
                    </span>
                  )}
                </button>

                {visibleCategories.map((cat) => {
                  const isActive = activeCategory === cat.slug
                  const catLabel =
                    locale === 'ar'
                      ? cat.nameAr
                      : locale === 'fr'
                        ? cat.nameFr
                        : cat.nameEn
                  const catCount = cat.productCount ?? 0

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectCategory(cat.slug, catCount)}
                      className={cn(
                        'inline-flex items-center gap-1.5 py-2.5 text-xs sm:text-[13px] border-b-2 -mb-px whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer bg-transparent',
                        isActive
                          ? 'font-semibold text-[var(--accent)] border-[var(--accent)]'
                          : 'font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] border-transparent'
                      )}
                    >
                      <span>{catLabel}</span>
                      {catCount > 0 && (
                        <span
                          className={cn(
                            'tabular-nums text-[11px]',
                            isActive ? 'opacity-80' : 'opacity-70'
                          )}
                        >
                          ({catCount})
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              <span />
            )}

            <div className="hidden sm:block pb-2 flex-shrink-0">
              <ForwardButton
                href={viewAllHref}
                label={labels.viewAll}
                locale={locale}
              />
            </div>
          </div>
        </div>

        {/* Filtered Collection Grid */}
        {isLoadingActive ? (
          <div
            className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-7"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden animate-pulse"
              >
                <div className="aspect-[3/4] bg-[var(--bg-muted)]" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3 w-1/3 rounded bg-[var(--bg-muted)]" />
                  <div className="h-4 w-3/4 rounded bg-[var(--bg-muted)]" />
                  <div className="h-4 w-1/2 rounded bg-[var(--bg-muted)]" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div
            className="text-center py-16 px-6 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] space-y-4"
            role="status"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
              <ShoppingBag className="w-6 h-6" />
            </div>

            <p className="text-sm font-medium text-[var(--text-muted)]">
              {labels.empty}
            </p>
          </div>
        ) : (
          <div
            key={activeCategory}
            role="tabpanel"
            className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-7"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {displayedProducts.map((p, i) => (
              <div
                key={p.id}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${i * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <ProductCard product={p} locale={locale} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

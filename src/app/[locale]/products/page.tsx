import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SlidersHorizontal, ShoppingBag, ArrowUpDown, X } from 'lucide-react'

import { productService } from '@/services/product.service'
import { categoryService } from '@/services/category.service'
import { siteConfig } from '@/config/site'
import { InfiniteProductGrid } from '@/components/products/InfiniteProductGrid'

import type { ProductFilters } from '@/types/product'

interface ProductsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

export async function generateMetadata({
  params,
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params
  const resolved = await searchParams
  const baseUrl = siteConfig.url

  const categorySlug =
    typeof resolved.category === 'string' ? resolved.category : undefined

  let categoryName: Record<string, string> | undefined
  if (categorySlug) {
    const cat = await categoryService.getCategoryBySlug(categorySlug)
    if (cat) {
      categoryName = { ar: cat.nameAr, fr: cat.nameFr, en: cat.nameEn }
    }
  }

  const titles: Record<string, string> = categoryName
    ? {
        ar: `${categoryName.ar} | ثريا المغربي`,
        fr: `${categoryName.fr} | Thuraya Al-Maghribi`,
        en: `${categoryName.en} | Thuraya Al-Maghribi`,
      }
    : {
        ar: 'جميع المنتجات | جلابات ونقابات مغربية | ثريا المغربي',
        fr: 'Tous les produits | Djellabas & Niqabs | Thuraya Al-Maghribi',
        en: 'All Products | Moroccan Djellabas & Niqabs | Thuraya Al-Maghribi',
      }

  const descriptions: Record<string, string> = categoryName
    ? {
        ar: `تسوقي ${categoryName.ar} المغربية الأصيلة في متجر ثريا المغربي. جودة عالية وتصاميم أنيقة.`,
        fr: `Découvrez notre collection de ${categoryName.fr} marocains chez Thuraya Al-Maghribi. Qualité et élégance.`,
        en: `Shop our ${categoryName.en} collection at Thuraya Al-Maghribi. Authentic Moroccan quality and elegant designs.`,
      }
    : {
        ar: 'تسوقي جميع منتجات ثريا المغربي — جلابات مغربية ونقابات وملابس تقليدية بتصاميم أنيقة وجودة عالية.',
        fr: 'Explorez tous les produits Thuraya Al-Maghribi – djellabas, niqabs et vêtements traditionnels marocains.',
        en: 'Browse all Thuraya Al-Maghribi products — Moroccan djellabas, niqabs, and traditional clothing.',
      }

  const title = titles[locale] ?? titles.ar
  const description = descriptions[locale] ?? descriptions.ar

  const canonicalPath = categorySlug
    ? `${baseUrl}/${locale}/products?category=${categorySlug}`
    : `${baseUrl}/${locale}/products`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        ar: categorySlug
          ? `${baseUrl}/ar/products?category=${categorySlug}`
          : `${baseUrl}/ar/products`,
        fr: categorySlug
          ? `${baseUrl}/fr/products?category=${categorySlug}`
          : `${baseUrl}/fr/products`,
        en: categorySlug
          ? `${baseUrl}/en/products?category=${categorySlug}`
          : `${baseUrl}/en/products`,
        'x-default': categorySlug
          ? `${baseUrl}/ar/products?category=${categorySlug}`
          : `${baseUrl}/ar/products`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: 'website',
    },
  }
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  const category =
    typeof resolvedSearchParams.category === 'string'
      ? resolvedSearchParams.category
      : undefined

  const size =
    typeof resolvedSearchParams.size === 'string'
      ? resolvedSearchParams.size
      : undefined

  const rawColor =
    typeof resolvedSearchParams.color === 'string'
      ? resolvedSearchParams.color
      : undefined
  const colorCode = rawColor ? `#${rawColor}` : undefined

  const search =
    typeof resolvedSearchParams.q === 'string'
      ? resolvedSearchParams.q
      : undefined

  const sort =
    typeof resolvedSearchParams.sort === 'string'
      ? (resolvedSearchParams.sort as ProductFilters['sort'])
      : undefined

  const pt = await getTranslations({
    locale,
    namespace: 'products',
  })

  const [productsResponse, dbCategories] = await Promise.all([
    productService.getProducts({
      category,
      size,
      colorCode,
      search,
      sort,
    }),
    categoryService.getCategories(),
  ])

  const isRTL = locale === 'ar'

  const currentCategory = category
    ? dbCategories.find(
        (c) => c.slug === category || c.slug === category.replace(/s$/, '')
      )
    : undefined

  const pageTitle = currentCategory
    ? locale === 'ar'
      ? currentCategory.nameAr
      : locale === 'fr'
        ? currentCategory.nameFr
        : currentCategory.nameEn
    : pt('title')

  const hasFilters = Boolean(category || size || colorCode || search || sort)

  const buildFilterUrl = (overrides: {
    category?: string | null
    size?: string | null
    sort?: string | null
    q?: string | null
    color?: string | null
  }) => {
    const query = new URLSearchParams()
    const nextCategory =
      overrides.category === undefined ? category : overrides.category
    const nextSize = overrides.size === undefined ? size : overrides.size
    const nextSort = overrides.sort === undefined ? sort : overrides.sort
    const nextSearch = overrides.q === undefined ? search : overrides.q
    const nextColor = overrides.color === undefined ? rawColor : overrides.color

    if (nextCategory) query.set('category', nextCategory)
    if (nextSize) query.set('size', nextSize)
    if (nextSort) query.set('sort', nextSort)
    if (nextSearch) query.set('q', nextSearch)
    if (nextColor) query.set('color', nextColor)

    const qs = query.toString()
    return qs ? `/${locale}/products?${qs}` : `/${locale}/products`
  }

  const sortOptions: Array<{
    key: NonNullable<ProductFilters['sort']>
    label: string
  }> = [
    { key: 'featured', label: pt('sortBy.featured') },
    { key: 'newest', label: pt('sortBy.newest') },
    { key: 'priceAsc', label: pt('sortBy.priceAsc') },
    { key: 'priceDesc', label: pt('sortBy.priceDesc') },
  ]

  const categoryHeading =
    locale === 'ar'
      ? 'التصنيف'
      : locale === 'fr'
        ? 'Catégorie'
        : 'Category'

  const eyebrowLabel =
    locale === 'ar'
      ? 'مجموعة الدار'
      : locale === 'fr'
        ? 'Collection complète'
        : 'Atelier Catalog'

  const countLabel =
    locale === 'ar'
      ? 'قطع متوفرة'
      : locale === 'fr'
        ? 'articles disponibles'
        : 'items available'

  return (
    <div
      className="container-brand page-shell space-y-5 sm:space-y-8 pb-20 sm:pb-24"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ==========================================
          PAGE HEADER & SORT BAR
      ========================================== */}
      <div className="space-y-3 sm:space-y-4 border-b border-[var(--border)] pb-4 sm:pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
              <span className="w-5 h-px bg-[var(--gold)]/60" aria-hidden="true" />
              <span>{eyebrowLabel}</span>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {pageTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--text-muted)]">
                <span className="tabular-nums font-semibold text-[var(--text-primary)]">
                  {productsResponse.total}
                </span>
                <span>{countLabel}</span>

                {search && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-[var(--accent)]">
                      “{search}”
                      <Link
                        href={buildFilterUrl({ q: null })}
                        className="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-[var(--accent-light)]"
                        aria-label={pt('filters.clear')}
                      >
                        <X className="w-3 h-3" />
                      </Link>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Horizontal Sort Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hidden pb-0.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] whitespace-nowrap flex-shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{pt('sort')}:</span>
            </span>

            {sortOptions.map((opt) => {
              const isActive = sort === opt.key
              return (
                <Link
                  key={opt.key}
                  href={buildFilterUrl({ sort: isActive ? null : opt.key })}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap flex-shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-ring)] font-semibold'
                      : 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {opt.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Mobile Quick Filter Bar (< lg) */}
        <div className="lg:hidden space-y-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden pb-0.5">
            <Link
              href={buildFilterUrl({ category: null })}
              className={`px-3 py-1.5 rounded-lg text-xs border whitespace-nowrap flex-shrink-0 transition-colors ${
                !category
                  ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-ring)] font-semibold'
                  : 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border)]'
              }`}
            >
              {pt('filters.all')}
            </Link>
            {dbCategories.map((cat) => {
              const isActive =
                category === cat.slug || category === `${cat.slug}s`
              const label =
                locale === 'ar'
                  ? cat.nameAr
                  : locale === 'fr'
                    ? cat.nameFr
                    : cat.nameEn
              return (
                <Link
                  key={cat.id}
                  href={buildFilterUrl({ category: isActive ? null : cat.slug })}
                  className={`px-3 py-1.5 rounded-lg text-xs border whitespace-nowrap flex-shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-ring)] font-semibold'
                      : 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border)]'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden pb-0.5">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] whitespace-nowrap flex-shrink-0 me-1">
              {pt('filters.size')}:
            </span>
            {SIZES.map((s) => {
              const isActive = size === s
              return (
                <Link
                  key={s}
                  href={buildFilterUrl({ size: isActive ? null : s })}
                  className={`min-w-7 h-7 px-2 rounded-lg border flex items-center justify-center text-[11px] font-semibold flex-shrink-0 transition-colors ${
                    isActive
                      ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] bg-[var(--card-bg)]'
                  }`}
                >
                  {s}
                </Link>
              )
            })}
            {hasFilters && (
              <Link
                href={`/${locale}/products`}
                className="px-2.5 py-1 text-xs font-semibold text-[var(--accent)] whitespace-nowrap flex-shrink-0 ms-auto"
              >
                {pt('filters.clear')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          PRODUCTS LAYOUT
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Desktop Sticky Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-xs lg:sticky lg:top-24 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent-ring)] flex items-center justify-center flex-shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </div>

              <h2 className="font-bold text-base text-[var(--text-primary)]">
                {pt('filter')}
              </h2>
            </div>

            {hasFilters && (
              <Link
                href={`/${locale}/products`}
                className="text-xs font-semibold text-[var(--accent)] hover:underline whitespace-nowrap"
              >
                {pt('filters.clear')}
              </Link>
            )}
          </div>

          {/* Size Filter */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider mb-3 text-[var(--text-primary)]">
              {pt('filters.size')}
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((s) => {
                const isActive = size === s
                return (
                  <Link
                    key={s}
                    href={buildFilterUrl({ size: isActive ? null : s })}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center text-xs font-semibold transition-colors ${
                      isActive
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-subtle)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                    }`}
                  >
                    {s}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Category Filter */}
          <div className="pt-5 border-t border-[var(--border)]">
            <h3 className="font-semibold text-xs uppercase tracking-wider mb-3 text-[var(--text-primary)]">
              {categoryHeading}
            </h3>

            <div className="space-y-1">
              <Link
                href={buildFilterUrl({ category: null })}
                className={`flex items-center justify-between text-xs py-2 px-3 rounded-lg transition-colors ${
                  !category
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-bold border border-[var(--accent-ring)]'
                    : 'hover:bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                }`}
              >
                <span>{pt('filters.all')}</span>
              </Link>

              {dbCategories.map((cat) => {
                const isActive =
                  category === cat.slug || category === `${cat.slug}s`

                const label =
                  locale === 'ar'
                    ? cat.nameAr
                    : locale === 'fr'
                      ? cat.nameFr
                      : cat.nameEn

                return (
                  <Link
                    key={cat.id}
                    href={buildFilterUrl({
                      category: isActive ? null : cat.slug,
                    })}
                    className={`flex items-center justify-between text-xs py-2 px-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[var(--accent-light)] text-[var(--accent)] font-bold border border-[var(--accent-ring)]'
                        : 'hover:bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Products Grid */}
        <div className="lg:col-span-9 min-w-0">
          {productsResponse.items.length === 0 ? (
            <div className="text-center py-20 px-6 space-y-4 border border-[var(--border)] rounded-2xl bg-[var(--card-bg)] shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                <ShoppingBag className="w-6 h-6" />
              </div>

              <p className="font-semibold text-sm text-[var(--text-primary)]">
                {pt('noResults')}
              </p>

              {hasFilters && (
                <Link
                  href={`/${locale}/products`}
                  className="btn btn-primary btn-sm btn-round px-6"
                >
                  {pt('filters.clear')}
                </Link>
              )}
            </div>
          ) : (
            <InfiniteProductGrid
              initialProducts={productsResponse.items}
              initialTotal={productsResponse.total}
              locale={locale}
              filters={{
                category,
                size,
                colorCode,
                search,
                sort,
              }}
              gridClassName="grid grid-cols-1 min-[340px]:grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3"
            />
          )}
        </div>
      </div>
    </div>
  )
}
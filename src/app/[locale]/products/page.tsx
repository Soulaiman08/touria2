import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SlidersHorizontal, ShoppingBag, ArrowUpDown, X } from 'lucide-react'

import { productService } from '@/services/product.service'
import { categoryService } from '@/services/category.service'
import { siteConfig } from '@/config/site'
import { InfiniteProductGrid } from '@/components/products/InfiniteProductGrid'
import { BreadcrumbBar } from '@/components/shared/PageNavigation'
import { CatalogMobileControls } from '@/components/products/CatalogMobileControls'
import { LETTER_PRESET_SIZES, NUMERIC_PRESET_SIZES, normalizeSizeToken, sortSizesCanonical } from '@/lib/category-config'
import { getDefaultOgImages } from '@/lib/seo.server'

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

  const brandSuffix = locale === 'ar' ? 'ثريا المغربي' : 'Thuraya Al-Maghribi'

  const titles: Record<string, string> = categoryName
    ? {
        ar: categoryName.ar,
        fr: categoryName.fr,
        en: categoryName.en,
      }
    : {
        ar: 'جميع المنتجات — جلابات ونقابات مغربية',
        fr: 'Tous les produits — Djellabas & Niqabs',
        en: 'All Products — Moroccan Djellabas & Niqabs',
      }

  const descriptions: Record<string, string> = categoryName
    ? {
        ar: `تسوقي ${categoryName.ar} المغربية الأصيلة في متجر ثريا المغربي. جودة عالية وتصاميم أنيقة مع توصيل لجميع المدن.`,
        fr: `Découvrez notre collection de ${categoryName.fr} marocains chez Thuraya Al-Maghribi. Qualité, élégance et livraison au Maroc.`,
        en: `Shop our ${categoryName.en} collection at Thuraya Al-Maghribi. Authentic Moroccan quality, elegant designs, and delivery across Morocco.`,
      }
    : {
        ar: 'تسوقي جميع منتجات ثريا المغربي — جلابات مغربية ونقابات وملابس تقليدية بتصاميم أنيقة وجودة عالية وتوصيل لجميع المدن.',
        fr: 'Explorez tous les produits Thuraya Al-Maghribi – djellabas, niqabs et vêtements traditionnels marocains avec livraison au Maroc.',
        en: 'Browse all Thuraya Al-Maghribi products — Moroccan djellabas, niqabs, and traditional clothing delivered across Morocco.',
      }

  const title = titles[locale] ?? titles.ar
  const fullSocialTitle = `${title} | ${brandSuffix}`
  const description = descriptions[locale] ?? descriptions.ar
  const ogImages = getDefaultOgImages(fullSocialTitle)

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
      title: fullSocialTitle,
      description,
      url: canonicalPath,
      siteName: brandSuffix,
      locale: locale === 'ar' ? 'ar_MA' : locale === 'fr' ? 'fr_MA' : 'en_US',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullSocialTitle,
      description,
      images: ogImages.map((img) => img.url),
    },
  }
}

const SIZES = LETTER_PRESET_SIZES

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

  const rawColorParam =
    typeof resolvedSearchParams.color === 'string'
      ? resolvedSearchParams.color.replace(/^#/, '').trim()
      : undefined
  const rawColor =
    rawColorParam && /^[0-9a-fA-F]{3,8}$/.test(rawColorParam)
      ? rawColorParam
      : undefined
  const colorCode = rawColor ? `#${rawColor}` : undefined

  const search =
    typeof resolvedSearchParams.q === 'string'
      ? resolvedSearchParams.q
      : undefined

  const rawSort =
    typeof resolvedSearchParams.sort === 'string'
      ? resolvedSearchParams.sort
      : undefined
  const sort: ProductFilters['sort'] =
    rawSort === 'newest' ||
    rawSort === 'priceAsc' ||
    rawSort === 'priceDesc' ||
    rawSort === 'featured' ||
    rawSort === 'sale'
      ? rawSort
      : undefined

  const pt = await getTranslations({
    locale,
    namespace: 'products',
  })

  const [productsResponse, dbCategories, availableColors] = await Promise.all([
    productService.getProducts({
      category,
      size,
      colorCode,
      search,
      sort,
    }),
    categoryService.getCategories(),
    productService.getAvailableColors(),
  ])

  const isRTL = locale === 'ar'

  const currentCategory = category
    ? dbCategories.find(
        (c) =>
          c.slug === category ||
          c.slug === category.replace(/s$/, '') ||
          c.slug === `${category}s`
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
  const hasSidebarFilters = Boolean(category || size || colorCode || search)

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
    { key: 'sale', label: pt('sortBy.sale') },
    { key: 'priceAsc', label: pt('sortBy.priceAsc') },
    { key: 'priceDesc', label: pt('sortBy.priceDesc') },
  ]

  const showSizeFilter = currentCategory
    ? currentCategory.config?.showSizeFilter !== false
    : true

  const activeSizes: readonly string[] = sortSizesCanonical((() => {
    if (!currentCategory?.config) return SIZES
    if (currentCategory.config.sizingMode === 'bundle_no_size') {
      return []
    }
    if (currentCategory.config.sizingMode === 'standard') {
      return currentCategory.config.defaultSizes.length > 0
        ? currentCategory.config.defaultSizes
        : ['Standard']
    }
    if (currentCategory.config.sizingMode === 'numeric') {
      return currentCategory.config.defaultSizes.length > 0
        ? currentCategory.config.defaultSizes
        : NUMERIC_PRESET_SIZES
    }
    if (
      currentCategory.config.sizingMode === 'letter' &&
      currentCategory.config.defaultSizes.length > 0
    ) {
      return currentCategory.config.defaultSizes
    }
    return SIZES
  })())

  const categoryOptions = dbCategories.map((cat) => {
    const catSizes = sortSizesCanonical(
      cat.config?.sizingMode === 'bundle_no_size'
        ? []
        : cat.config?.sizingMode === 'standard'
          ? cat.config.defaultSizes.length > 0
            ? cat.config.defaultSizes
            : ['Standard']
          : cat.config?.sizingMode === 'numeric'
            ? cat.config.defaultSizes.length > 0
              ? cat.config.defaultSizes
              : [...NUMERIC_PRESET_SIZES]
            : cat.config?.sizingMode === 'letter' && cat.config.defaultSizes.length > 0
              ? cat.config.defaultSizes
              : [...SIZES]
    )

    return {
      id: cat.id,
      slug: cat.slug,
      label:
        locale === 'ar' ? cat.nameAr : locale === 'fr' ? cat.nameFr : cat.nameEn,
      count: cat.productCount ?? 0,
      showSizeFilter: cat.config?.showSizeFilter !== false,
      sizes: catSizes,
    }
  })

  const allCatalogCount =
    categoryOptions.reduce((sum, c) => sum + c.count, 0) || productsResponse.total

  const colorOptions = availableColors.map((col) => ({
    code: col.code,
    label:
      locale === 'ar' ? col.nameAr : locale === 'fr' ? col.nameFr : col.nameEn,
  }))

  const activeColorObj = rawColor
    ? colorOptions.find(
        (c) => c.code.replace('#', '').toLowerCase() === rawColor.toLowerCase()
      )
    : undefined

  const categoryHeading =
    locale === 'ar'
      ? 'التصنيف'
      : locale === 'fr'
        ? 'Catégorie'
        : 'Category'

  const colorHeading =
    locale === 'ar' ? 'اللون' : locale === 'fr' ? 'Couleur' : 'Color'

  const allSizesLabel =
    locale === 'ar' ? 'الكل' : locale === 'fr' ? 'Tous' : 'All'

  const allColorsLabel =
    locale === 'ar'
      ? 'جميع الألوان'
      : locale === 'fr'
        ? 'Toutes les couleurs'
        : 'All colors'

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

  const mobileApplyLabel =
    locale === 'ar'
      ? 'تطبيق الفلترة'
      : locale === 'fr'
        ? 'Appliquer les filtres'
        : 'Apply Filters'

  const mobileResetLabel =
    locale === 'ar'
      ? 'إعادة ضبط'
      : locale === 'fr'
        ? 'Réinitialiser'
        : 'Reset'

  return (
    <div
      className="container-brand page-shell space-y-4 sm:space-y-6 lg:space-y-7 pb-20 sm:pb-24"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Top Hairline Navigation Utility Strip ─────────────────── */}
      <BreadcrumbBar
        locale={locale}
        items={[
          {
            label: isRTL ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home',
            href: `/${locale}`,
          },
          currentCategory
            ? { label: pt('title'), href: `/${locale}/products` }
            : { label: pt('title') },
          ...(currentCategory ? [{ label: pageTitle }] : []),
        ]}
        backHref={currentCategory ? `/${locale}/products` : `/${locale}`}
        backLabel={
          currentCategory
            ? isRTL
              ? 'جميع المنتجات'
              : locale === 'fr'
                ? 'Tous les produits'
                : 'All Products'
            : isRTL
              ? 'العودة للرئيسية'
              : locale === 'fr'
                ? "Retour à l'accueil"
                : 'Back to Home'
        }
      />

      {/* ==========================================
          EDITORIAL PAGE MASTHEAD
      ========================================== */}
      <header className="space-y-1.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
          <span className="w-5 h-px bg-[var(--gold)]/60" aria-hidden="true" />
          <span>{eyebrowLabel}</span>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] m-0">
            {pageTitle}
          </h1>

          {/* Mobile & Tablet Quiet Count */}
          <p className="lg:hidden text-xs sm:text-sm font-medium text-[var(--text-muted)] m-0 whitespace-nowrap flex-shrink-0">
            <span className="tabular-nums font-semibold text-[var(--text-primary)]">
              {productsResponse.total}
            </span>{' '}
            <span>{countLabel}</span>
          </p>
        </div>
      </header>

      {/* ==========================================
          MOBILE & TABLET DEDICATED CONTROLS (< lg)
      ========================================== */}
      <CatalogMobileControls
        locale={locale}
        categories={categoryOptions}
        sizes={activeSizes}
        colors={colorOptions}
        sortOptions={sortOptions}
        activeCategory={category}
        activeSize={size}
        activeColor={rawColor}
        activeSort={sort}
        activeSearch={search}
        allCount={allCatalogCount}
        showSizeFilter={showSizeFilter}
        labels={{
          allCategories: pt('filters.all'),
          filter: pt('filter'),
          sort: pt('sort'),
          category: categoryHeading,
          size: pt('filters.size'),
          color: colorHeading,
          clear: pt('filters.clear'),
          apply: mobileApplyLabel,
          reset: mobileResetLabel,
          allSizes: allSizesLabel,
          allColors: allColorsLabel,
        }}
      />

      {/* ==========================================
          DESKTOP 2-COLUMN WORKSPACE (lg+)
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Desktop Sticky Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden shadow-xs lg:sticky lg:top-24">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-subtle)]/55 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
              <h2 className="font-bold text-sm text-[var(--text-primary)] m-0">
                {pt('filter')}
              </h2>
            </div>

            {hasSidebarFilters && (
              <Link
                href={`/${locale}/products`}
                className="text-xs font-semibold text-[var(--accent)] hover:underline whitespace-nowrap no-underline"
              >
                {pt('filters.clear')}
              </Link>
            )}
          </div>

          <div className="p-5 space-y-5">
            {/* 1. Category Directory (Primary First) */}
            <div className="space-y-2.5">
              <h3 className="font-semibold text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] m-0">
                {categoryHeading}
              </h3>

              <div className="space-y-1">
                <Link
                  href={buildFilterUrl({ category: null })}
                  className={`flex items-center justify-between text-xs py-2 px-3 rounded-lg transition-colors no-underline ${
                    !category
                      ? 'bg-[var(--accent-light)] text-[var(--accent)] font-bold border border-[var(--accent-ring)]'
                      : 'hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium border border-transparent'
                  }`}
                >
                  <span>{pt('filters.all')}</span>
                  <span className="tabular-nums text-[11px] opacity-75">
                    {allCatalogCount}
                  </span>
                </Link>

                {categoryOptions.map((cat) => {
                  const isActive =
                    category === cat.slug ||
                    category === `${cat.slug}s` ||
                    category === cat.slug.replace(/s$/, '')

                  return (
                    <Link
                      key={cat.id}
                      href={buildFilterUrl({
                        category: isActive ? null : cat.slug,
                      })}
                      className={`flex items-center justify-between text-xs py-2 px-3 rounded-lg transition-colors no-underline ${
                        isActive
                          ? 'bg-[var(--accent-light)] text-[var(--accent)] font-bold border border-[var(--accent-ring)]'
                          : 'hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium border border-transparent'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="tabular-nums text-[11px] opacity-75">
                        {cat.count}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* 2. Color Swatches (When Available) */}
            {colorOptions.length > 0 && (
              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] m-0">
                    {colorHeading}
                  </h3>
                  <span className="text-[11px] font-medium text-[var(--text-secondary)] truncate">
                    {activeColorObj ? activeColorObj.label : allColorsLabel}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((col) => {
                    const hexParam = col.code.replace('#', '')
                    const isActive =
                      rawColor?.toLowerCase() === hexParam.toLowerCase()
                    return (
                      <Link
                        key={col.code}
                        href={buildFilterUrl({ color: isActive ? null : hexParam })}
                        aria-label={col.label}
                        title={col.label}
                        className={`w-7 h-7 rounded-full border transition-transform ${
                          isActive
                            ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--card-bg)] scale-105'
                            : 'border-[var(--border)] hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.code }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. Size (Symmetrical Grid driven by active category rules) */}
            {showSizeFilter && activeSizes.length > 0 && (
              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                <h3 className="font-semibold text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] m-0">
                  {pt('filters.size')}
                </h3>

                <div className="grid grid-cols-4 gap-1.5">
                  <Link
                    href={buildFilterUrl({ size: null })}
                    className={`h-9 rounded-lg border flex items-center justify-center text-xs font-semibold transition-colors no-underline ${
                      !size
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)] font-bold'
                        : 'border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-subtle)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                    }`}
                  >
                    {allSizesLabel}
                  </Link>

                  {activeSizes.map((s) => {
                    const isActive = size
                      ? normalizeSizeToken(size) === normalizeSizeToken(s)
                      : false
                    return (
                      <Link
                        key={s}
                        href={buildFilterUrl({ size: isActive ? null : s })}
                        className={`h-9 rounded-lg border flex items-center justify-center text-xs font-semibold tabular-nums transition-colors no-underline ${
                          isActive
                            ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)] font-bold'
                            : 'border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-subtle)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                        }`}
                      >
                        {s}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Products Column */}
        <div className="lg:col-span-9 min-w-0 space-y-5">
          {/* Desktop Results & Segmented Sort Bar */}
          <div className="hidden lg:flex items-center justify-between gap-4 pb-1">
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--text-muted)] min-w-0">
              <span className="font-medium whitespace-nowrap">
                <span className="tabular-nums font-bold text-[var(--text-primary)]">
                  {productsResponse.total}
                </span>{' '}
                {countLabel}
              </span>

              {search && (
                <Link
                  href={buildFilterUrl({ q: null })}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-primary)] font-medium no-underline hover:border-[var(--accent)]"
                >
                  <span>“{search}”</span>
                  <X className="w-3 h-3 text-[var(--text-muted)]" />
                </Link>
              )}

              {size && (
                <Link
                  href={buildFilterUrl({ size: null })}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-primary)] font-medium no-underline hover:border-[var(--accent)]"
                >
                  <span>
                    {pt('filters.size')}: {size}
                  </span>
                  <X className="w-3 h-3 text-[var(--text-muted)]" />
                </Link>
              )}

              {rawColor && (
                <Link
                  href={buildFilterUrl({ color: null })}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-primary)] font-medium no-underline hover:border-[var(--accent)]"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-[var(--border)]"
                    style={{ backgroundColor: `#${rawColor}` }}
                  />
                  <span>{activeColorObj?.label ?? `#${rawColor}`}</span>
                  <X className="w-3 h-3 text-[var(--text-muted)]" />
                </Link>
              )}
            </div>

            {/* Unified Segmented Sort Strip */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] whitespace-nowrap">
                <ArrowUpDown className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>{pt('sort')}:</span>
              </span>

              <div className="inline-flex items-center p-1 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]">
                {sortOptions.map((opt) => {
                  const isActive =
                    sort === opt.key || (!sort && opt.key === 'featured')
                  return (
                    <Link
                      key={opt.key}
                      href={buildFilterUrl({
                        sort: opt.key === 'featured' ? null : opt.key,
                      })}
                      className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all no-underline ${
                        isActive
                          ? 'bg-[var(--card-bg)] text-[var(--accent)] border border-[var(--border)] shadow-xs font-semibold'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent font-medium'
                      }`}
                    >
                      {opt.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

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
                  className="btn btn-primary btn-sm rounded-xl px-6"
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
              prioritizeCount={2}
              gridClassName="grid grid-cols-1 min-[350px]:grid-cols-2 gap-2.5 min-[400px]:gap-3 sm:gap-5 lg:grid-cols-3 xl:gap-6"
            />
          )}
        </div>
      </div>
    </div>
  )
}
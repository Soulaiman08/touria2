import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SlidersHorizontal } from 'lucide-react'
import { productService } from '@/services/product.service'
import { categoryService } from '@/services/category.service'
import { ProductCard } from '@/components/shared/ProductCard'
import type { ProductFilters } from '@/types/product'

interface ProductsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined
  const size = typeof resolvedSearchParams.size === 'string' ? resolvedSearchParams.size : undefined
  const colorCode = typeof resolvedSearchParams.color === 'string' ? `#${resolvedSearchParams.color}` : undefined
  const search = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined
  const sort = typeof resolvedSearchParams.sort === 'string'
    ? (resolvedSearchParams.sort as ProductFilters['sort'])
    : undefined

  const pt = await getTranslations({ locale, namespace: 'products' })

  // Fetch products and live categories from DB in parallel
  const [productsResponse, dbCategories] = await Promise.all([
    productService.getProducts({ category, size, colorCode, search, sort }),
    categoryService.getCategories(),
  ])

  const isRTL = locale === 'ar'

  return (
    <div className="container-brand py-12 space-y-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="space-y-3 border-b pb-8" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          {category
            ? (dbCategories.find((c) => c.slug === category || c.slug === category.replace(/s$/, ''))
              ? (locale === 'ar'
                ? dbCategories.find((c) => c.slug === category || c.slug === category.replace(/s$/, ''))!.nameAr
                : locale === 'fr'
                  ? dbCategories.find((c) => c.slug === category || c.slug === category.replace(/s$/, ''))!.nameFr
                  : dbCategories.find((c) => c.slug === category || c.slug === category.replace(/s$/, ''))!.nameEn)
              : pt('title'))
            : pt('title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {productsResponse.total}{' '}
          {locale === 'ar' ? 'قطع متوفرة' : locale === 'fr' ? 'articles disponibles' : 'items available'}
        </p>
      </div>

      {/* ── Category Quick Filters — Dynamic from DB ───────────── */}
      <div className="flex flex-wrap gap-2.5">
        <Link
          href={`/${locale}/products`}
          className={`px-5 py-2 text-xs font-semibold rounded-full border transition-all duration-200 ${
            !category
              ? 'bg-[#C4622D] text-white border-transparent shadow-sm'
              : 'hover:bg-[rgba(196,98,45,0.05)] hover:border-[#C4622D] hover:text-[#C4622D]'
          }`}
          style={{
            borderColor: !category ? 'transparent' : 'var(--border)',
            color: !category ? '#ffffff' : 'var(--muted-foreground)',
          }}
        >
          {pt('filters.all')}
        </Link>

        {dbCategories.map((cat) => {
          const isActive = category === cat.slug || category === `${cat.slug}s`
          const label = locale === 'ar' ? cat.nameAr : locale === 'fr' ? cat.nameFr : cat.nameEn
          return (
            <Link
              key={cat.id}
              href={`/${locale}/products?category=${cat.slug}`}
              className={`px-5 py-2 text-xs font-semibold rounded-full border transition-all duration-200 ${
                isActive
                  ? 'bg-[#C4622D] text-white border-transparent shadow-sm'
                  : 'hover:bg-[rgba(196,98,45,0.05)] hover:border-[#C4622D] hover:text-[#C4622D]'
              }`}
              style={{
                borderColor: isActive ? 'transparent' : 'var(--border)',
                color: isActive ? '#ffffff' : 'var(--muted-foreground)',
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* ── Products Layout ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        {/* Desktop filter sidebar */}
        <aside
          className="hidden lg:block p-8 rounded-2xl border space-y-8"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <div className="flex items-center gap-2 font-semibold text-sm border-b pb-4" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <SlidersHorizontal className="w-4 h-4 text-[#C4622D]" />
            {pt('filter')}
          </div>

          {/* Size filter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>
              {pt('filters.size')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((s) => (
                <Link
                  key={s}
                  href={`/${locale}/products?size=${s}${category ? `&category=${category}` : ''}`}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-semibold transition-colors ${
                    size === s
                      ? 'border-[#C4622D] text-[#C4622D] bg-[rgba(196,98,45,0.05)] font-bold shadow-sm'
                      : 'hover:border-[#C4622D] hover:text-[#C4622D]'
                  }`}
                  style={{
                    borderColor: size === s ? '#C4622D' : 'var(--border)',
                    color: size === s ? '#C4622D' : 'var(--muted-foreground)',
                  }}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* Category filter in sidebar */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>
              {locale === 'ar' ? 'التصنيف' : locale === 'fr' ? 'Catégorie' : 'Category'}
            </h3>
            <div className="space-y-2">
              {dbCategories.map((cat) => {
                const isActive = category === cat.slug || category === `${cat.slug}s`
                const label = locale === 'ar' ? cat.nameAr : locale === 'fr' ? cat.nameFr : cat.nameEn
                return (
                  <Link
                    key={cat.id}
                    href={`/${locale}/products?category=${cat.slug}`}
                    className="flex items-center gap-2 text-sm py-1.5 transition-colors"
                    style={{ color: isActive ? '#C4622D' : 'var(--muted-foreground)', fontWeight: isActive ? 600 : 400 }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: isActive ? '#C4622D' : 'var(--border)' }}
                    />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {productsResponse.items.length === 0 ? (
            <div className="text-center py-20 space-y-4 border rounded-2xl" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <div className="text-5xl text-[#C4622D]">🌸</div>
              <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{pt('noResults')}</p>
              {(category || size || colorCode || search) ? (
                <Link
                  href={`/${locale}/products`}
                  className="btn btn-primary btn-sm btn-round"
                >
                  {pt('filters.clear')}
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {productsResponse.items.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

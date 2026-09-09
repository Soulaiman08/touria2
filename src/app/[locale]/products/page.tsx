import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SlidersHorizontal } from 'lucide-react'

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

// ─────────────────────────────────────────────────────────────
// Products page metadata — dynamic per locale + category
// ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params
  const resolved = await searchParams
  const baseUrl = siteConfig.url

  const categorySlug =
    typeof resolved.category === 'string' ? resolved.category : undefined

  // Fetch category name if filter is active
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
        'ar': categorySlug
          ? `${baseUrl}/ar/products?category=${categorySlug}`
          : `${baseUrl}/ar/products`,
        'fr': categorySlug
          ? `${baseUrl}/fr/products?category=${categorySlug}`
          : `${baseUrl}/fr/products`,
        'en': categorySlug
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


export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  // ==========================================
  // FILTERS
  // ==========================================

  const category =
    typeof resolvedSearchParams.category === 'string'
      ? resolvedSearchParams.category
      : undefined

  const size =
    typeof resolvedSearchParams.size === 'string'
      ? resolvedSearchParams.size
      : undefined

  const colorCode =
    typeof resolvedSearchParams.color === 'string'
      ? `#${resolvedSearchParams.color}`
      : undefined

  const search =
    typeof resolvedSearchParams.q === 'string'
      ? resolvedSearchParams.q
      : undefined

  const sort =
    typeof resolvedSearchParams.sort === 'string'
      ? (resolvedSearchParams.sort as ProductFilters['sort'])
      : undefined

  // ==========================================
  // TRANSLATIONS
  // ==========================================

  const pt = await getTranslations({
    locale,
    namespace: 'products',
  })

  // ==========================================
  // FETCH DATA
  // ==========================================

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

  // ==========================================
  // CURRENT CATEGORY
  // ==========================================

  const currentCategory = category
    ? dbCategories.find(
      (c) =>
        c.slug === category ||
        c.slug === category.replace(/s$/, ''),
    )
    : undefined

  const pageTitle = currentCategory
    ? locale === 'ar'
      ? currentCategory.nameAr
      : locale === 'fr'
        ? currentCategory.nameFr
        : currentCategory.nameEn
    : pt('title')

  const hasFilters =
    Boolean(category) ||
    Boolean(size) ||
    Boolean(colorCode) ||
    Boolean(search)

  return (
    <div
      className="container-brand page-shell space-y-5 sm:space-y-8"
      style={{
        paddingBottom: '100px',
        marginBottom: '40px',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ==========================================
          PAGE HEADER
          ========================================== */}

      <div
        className="space-y-2 border-b pb-5 sm:pb-8"
        style={{
          borderColor: 'var(--border)',
        }}
      >
        <h1
          className="text-2xl md:text-4xl font-extrabold tracking-tight"
          style={{
            color: 'var(--foreground)',
          }}
        >
          {pageTitle}
        </h1>

        <p
          className="text-xs sm:text-sm font-medium"
          style={{
            color: 'var(--muted-foreground)',
          }}
        >
          {productsResponse.total}{' '}
          {locale === 'ar'
            ? 'قطع متوفرة'
            : locale === 'fr'
              ? 'articles disponibles'
              : 'items available'}
        </p>
      </div>

      {/* ==========================================
          PRODUCTS LAYOUT
          ========================================== */}

      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start"
        style={{
          marginTop: '20px',
          paddingTop: '12px',
        }}
      >
        {/* ========================================
            DESKTOP FILTER SIDEBAR
            ======================================== */}

        <aside
          className="
            hidden
            lg:block
            lg:col-span-3
            border
            bg-[var(--card)]
            shadow-xs
            lg:sticky
            lg:top-24
          "
          style={{
            borderColor: 'var(--border)',
            borderRadius: '24px',
            padding: '24px',
          }}
        >
          {/* Sidebar Header */}

          <div
            className="
              flex
              items-center
              justify-between
              pb-4
              border-b
            "
            style={{
              borderColor: 'var(--border)',
              marginBottom: '20px',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  w-9
                  h-9
                  rounded-2xl
                  bg-[#C4622D]/10
                  text-[#C4622D]
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                "
              >
                <SlidersHorizontal className="w-4.5 h-4.5" />
              </div>

              <h2 className="font-bold text-base text-[var(--foreground)]">
                {pt('filter')}
              </h2>
            </div>

            {hasFilters ? (
              <Link
                href={`/${locale}/products`}
                className="
                  text-xs
                  font-semibold
                  text-[#C4622D]
                  hover:underline
                "
              >
                {pt('filters.clear')}
              </Link>
            ) : null}
          </div>

          {/* ========================================
              SIZE FILTER
              ======================================== */}

          <div style={{ marginBottom: '20px' }}>
            <h3
              className="
                font-bold
                text-xs
                uppercase
                tracking-wider
                mb-3
                text-[var(--foreground)]
              "
            >
              {pt('filters.size')}
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {[
                'XS',
                'S',
                'M',
                'L',
                'XL',
                'XXL',
                'XXXL',
              ].map((s) => (
                <Link
                  key={s}
                  href={`/${locale}/products?size=${s}${category
                      ? `&category=${category}`
                      : ''
                    }`}
                  className={`
                    w-8
                    h-8
                    rounded-lg
                    border
                    flex
                    items-center
                    justify-center
                    text-xs
                    font-bold
                    transition-all
                    ${size === s
                      ? 'border-[#C4622D] text-[#C4622D] bg-[#C4622D]/10 shadow-xs'
                      : 'hover:border-[#C4622D] hover:text-[#C4622D] bg-[var(--bg-subtle)]'
                    }
                  `}
                  style={{
                    borderColor:
                      size === s
                        ? '#C4622D'
                        : 'var(--border)',
                    color:
                      size === s
                        ? '#C4622D'
                        : 'var(--muted-foreground)',
                  }}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* ========================================
              CATEGORY FILTER
              ======================================== */}

          <div
            className="pt-4 border-t"
            style={{
              borderColor: 'var(--border)',
            }}
          >
            <h3
              className="
                font-bold
                text-xs
                uppercase
                tracking-wider
                mb-2.5
                text-[var(--foreground)]
              "
            >
              {locale === 'ar'
                ? 'التصنيف'
                : locale === 'fr'
                  ? 'Catégorie'
                  : 'Category'}
            </h3>

            <div className="space-y-1">
              {/* All */}

              <Link
                href={`/${locale}/products`}
                className={`
                  flex
                  items-center
                  justify-between
                  text-xs
                  py-1.5
                  px-3
                  rounded-lg
                  transition-all
                  ${!category
                    ? 'bg-[#C4622D]/10 text-[#C4622D] font-bold'
                    : 'hover:bg-[var(--bg-subtle)] text-[var(--muted-foreground)]'
                  }
                `}
              >
                <span>{pt('filters.all')}</span>
              </Link>

              {/* Categories */}

              {dbCategories.map((cat) => {
                const isActive =
                  category === cat.slug ||
                  category === `${cat.slug}s`

                const label =
                  locale === 'ar'
                    ? cat.nameAr
                    : locale === 'fr'
                      ? cat.nameFr
                      : cat.nameEn

                return (
                  <Link
                    key={cat.id}
                    href={`/${locale}/products?category=${cat.slug}`}
                    className={`
                      flex
                      items-center
                      justify-between
                      text-xs
                      py-1.5
                      px-3
                      rounded-lg
                      transition-all
                      ${isActive
                        ? 'bg-[#C4622D]/10 text-[#C4622D] font-bold'
                        : 'hover:bg-[var(--bg-subtle)] text-[var(--muted-foreground)]'
                      }
                    `}
                  >
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>

        {/* ========================================
            MAIN PRODUCTS SECTION
            ======================================== */}

        <div className="lg:col-span-9 min-w-0">
          {productsResponse.items.length === 0 ? (
            /* ======================================
               NO RESULTS
               ====================================== */

            <div
              className="
                text-center
                py-20
                space-y-4
                border
                rounded-3xl
                bg-[var(--card)]
                shadow-xs
              "
              style={{
                borderColor: 'var(--border)',
              }}
            >
              <div className="text-5xl text-[#C4622D]">
                🌸
              </div>

              <p
                className="font-semibold text-sm"
                style={{
                  color: 'var(--foreground)',
                }}
              >
                {pt('noResults')}
              </p>

              {hasFilters ? (
                <Link
                  href={`/${locale}/products`}
                  className="btn btn-primary btn-sm btn-round px-6"
                >
                  {pt('filters.clear')}
                </Link>
              ) : null}
            </div>
          ) : (
            /* ======================================
               PRODUCTS GRID (Infinite Scroll)
               ====================================== */

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
              gridClassName="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3"
            />
          )}
        </div>
      </div>
    </div>
  )
}
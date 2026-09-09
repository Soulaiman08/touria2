import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { productService } from '@/services/product.service'
import { siteConfig } from '@/config/site'
import { ProductDetail } from '@/features/products/components/ProductDetail/ProductDetail'

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>
}

// ─────────────────────────────────────────────────────────────
// Pre-render known product slugs at build time
// ─────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  try {
    const { items } = await productService.getProducts({ limit: 200 })
    const locales = ['ar', 'fr', 'en']
    return locales.flatMap((locale) =>
      items.map((p) => ({ locale, slug: p.slug }))
    )
  } catch {
    return []
  }
}

// ─────────────────────────────────────────────────────────────
// Dynamic per-product metadata
// ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await productService.getProductBySlug(slug)

  if (!product) {
    return { title: 'المنتج غير موجود | ثريا المغربي' }
  }

  const baseUrl = siteConfig.url

  const name =
    locale === 'ar' ? product.nameAr : locale === 'fr' ? product.nameFr : product.nameEn

  const categoryName =
    locale === 'ar'
      ? product.category?.nameAr
      : locale === 'fr'
      ? product.category?.nameFr
      : product.category?.nameEn

  const titles: Record<string, string> = {
    ar: categoryName
      ? `${name} — ${categoryName} | ثريا المغربي`
      : `${name} | ثريا المغربي`,
    fr: categoryName
      ? `${product.nameFr} — ${product.category?.nameFr ?? ''} | Thuraya Al-Maghribi`
      : `${product.nameFr} | Thuraya Al-Maghribi`,
    en: categoryName
      ? `${product.nameEn} — ${product.category?.nameEn ?? ''} | Thuraya Al-Maghribi`
      : `${product.nameEn} | Thuraya Al-Maghribi`,
  }

  const descriptions: Record<string, string> = {
    ar: `${name}${categoryName ? ` من ${categoryName}` : ''} — متجر ثريا المغربي للجلابات والنقابات المغربية الأصيلة. اطلبي الآن بالدفع عند الاستلام.`,
    fr: `${product.nameFr}${product.category?.nameFr ? ` — ${product.category.nameFr}` : ''} chez Thuraya Al-Maghribi. Paiement à la livraison dans tout le Maroc.`,
    en: `${product.nameEn}${product.category?.nameEn ? ` — ${product.category.nameEn}` : ''} at Thuraya Al-Maghribi. Cash on delivery across Morocco.`,
  }

  const title = titles[locale] ?? titles.ar
  const description = descriptions[locale] ?? descriptions.ar
  const productUrl = `${baseUrl}/${locale}/products/${slug}`
  const ogImage = product.mainImage || siteConfig.ogImage

  return {
    title,
    description,
    alternates: {
      canonical: productUrl,
      languages: {
        'ar': `${baseUrl}/ar/products/${slug}`,
        'fr': `${baseUrl}/fr/products/${slug}`,
        'en': `${baseUrl}/en/products/${slug}`,
        'x-default': `${baseUrl}/ar/products/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: productUrl,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 800,
          alt: name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

// ─────────────────────────────────────────────────────────────
// JSON-LD: Product + Offer + BreadcrumbList
// ─────────────────────────────────────────────────────────────
function ProductStructuredData({
  product,
  locale,
  slug,
}: {
  product: Awaited<ReturnType<typeof productService.getProductBySlug>>
  locale: string
  slug: string
}) {
  if (!product) return null

  const baseUrl = siteConfig.url
  const name =
    locale === 'ar' ? product.nameAr : locale === 'fr' ? product.nameFr : product.nameEn
  const categoryName =
    locale === 'ar'
      ? product.category?.nameAr
      : locale === 'fr'
      ? product.category?.nameFr
      : product.category?.nameEn

  const price = product.salePrice ?? product.basePrice
  const inStock =
    Array.isArray(product.variants) && product.variants.length > 0

  const productSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${baseUrl}/${locale}/products/${slug}#product`,
        name,
        image: [product.mainImage, ...(product.images ?? [])].filter(Boolean),
        brand: {
          '@type': 'Brand',
          name: 'ثريا المغربي',
        },
        ...(categoryName && {
          category: categoryName,
        }),
        offers: {
          '@type': 'Offer',
          url: `${baseUrl}/${locale}/products/${slug}`,
          priceCurrency: 'MAD',
          price: Number(price).toFixed(2),
          availability: inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'ثريا المغربي',
          },
          priceValidUntil: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          )
            .toISOString()
            .split('T')[0],
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home',
            item: `${baseUrl}/${locale}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: locale === 'ar' ? 'المنتجات' : locale === 'fr' ? 'Produits' : 'Products',
            item: `${baseUrl}/${locale}/products`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name,
            item: `${baseUrl}/${locale}/products/${slug}`,
          },
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  )
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params

  // Fetch product data
  const product = await productService.getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const isRTL = locale === 'ar'
  const productName = locale === 'ar' ? product.nameAr : locale === 'fr' ? product.nameFr : product.nameEn

  return (
    <div className="container-brand page-shell product-page-shell" dir={isRTL ? 'rtl' : 'ltr'}>
      <ProductStructuredData product={product} locale={locale} slug={slug} />

      {/* ── Breadcrumbs ────────────────────────────────────────── */}
      <nav
        aria-label={locale === 'ar' ? 'مسار التنقل' : locale === 'fr' ? 'Fil d\'Ariane' : 'Breadcrumb'}
        className="product-breadcrumb flex items-center gap-2 text-xs"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <Link href={`/${locale}`} className="hover:text-[#C4622D] transition-colors">
          {locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home'}
        </Link>
        <ChevronRight className="w-3 h-3 rtl-flip" />
        <Link href={`/${locale}/products`} className="hover:text-[#C4622D] transition-colors">
          {locale === 'ar' ? 'المنتجات' : locale === 'fr' ? 'Produits' : 'Products'}
        </Link>
        <ChevronRight className="w-3 h-3 rtl-flip" />
        <span className="font-semibold text-gradient">{productName}</span>
      </nav>

      {/* ── Back to catalog link ────────────────────────────────── */}
      <div>
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:text-[#C4622D] transition-colors"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
          {locale === 'ar' ? 'العودة لجميع المنتجات' : locale === 'fr' ? 'Retour aux produits' : 'Back to products'}
        </Link>
      </div>

      {/* ── Product Info Section ───────────────────────────────── */}
      <ProductDetail product={product} locale={locale} />
    </div>
  )
}

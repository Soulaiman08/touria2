import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { productService } from '@/services/product.service'
import { siteConfig } from '@/config/site'
import { BreadcrumbBar } from '@/components/shared/PageNavigation'
import { ProductDetail } from '@/features/products/components/ProductDetail/ProductDetail'
import { buildLocaleAlternates, resolveAbsoluteUrl } from '@/lib/seo.server'

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
    return {
      title: locale === 'ar' ? 'المنتج غير موجود' : locale === 'fr' ? 'Produit introuvable' : 'Product Not Found',
      robots: { index: false, follow: false },
    }
  }

  const baseUrl = siteConfig.url
  const brandSuffix = locale === 'ar' ? 'ثريا المغربي' : 'Thuraya Al-Maghribi'

  const name =
    locale === 'ar' ? product.nameAr : locale === 'fr' ? product.nameFr : product.nameEn

  const categoryName =
    locale === 'ar'
      ? product.category?.nameAr
      : locale === 'fr'
      ? product.category?.nameFr
      : product.category?.nameEn

  const customMetaTitle =
    locale === 'ar'
      ? product.metaTitleAr?.trim()
      : locale === 'fr'
      ? product.metaTitleFr?.trim()
      : product.metaTitleEn?.trim()

  const customMetaDesc =
    locale === 'ar'
      ? product.metaDescAr?.trim()
      : locale === 'fr'
      ? product.metaDescFr?.trim()
      : product.metaDescEn?.trim()

  const defaultPageTitle = categoryName ? `${name} — ${categoryName}` : name
  const socialTitle = customMetaTitle || `${defaultPageTitle} | ${brandSuffix}`

  const defaultDescription =
    locale === 'ar'
      ? `${name}${categoryName ? ` من ${categoryName}` : ''} — من متجر ثريا المغربي للأزياء المغربية الأصيلة. خامات فاخرة وتفصيل متقن مع الدفع عند الاستلام.`
      : locale === 'fr'
      ? `${product.nameFr}${product.category?.nameFr ? ` — ${product.category.nameFr}` : ''} chez Thuraya Al-Maghribi. Paiement à la livraison dans tout le Maroc.`
      : `${product.nameEn}${product.category?.nameEn ? ` — ${product.category.nameEn}` : ''} at Thuraya Al-Maghribi. Cash on delivery across Morocco.`

  const description = customMetaDesc || defaultDescription
  const productUrl = `${baseUrl}/${locale}/products/${slug}`
  const ogImage = resolveAbsoluteUrl(product.mainImage || siteConfig.ogImage)

  return {
    title: customMetaTitle ? { absolute: customMetaTitle } : defaultPageTitle,
    description,
    alternates: buildLocaleAlternates(`/products/${slug}`, locale),
    openGraph: {
      title: socialTitle,
      description,
      url: productUrl,
      siteName: brandSuffix,
      locale: locale === 'ar' ? 'ar_MA' : locale === 'fr' ? 'fr_MA' : 'en_US',
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
      title: socialTitle,
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

  const productDescription =
    locale === 'ar'
      ? product.descriptionAr
      : locale === 'fr'
      ? product.descriptionFr
      : product.descriptionEn

  const productImages = Array.from(
    new Set([product.mainImage, ...(product.images ?? [])].filter(Boolean))
  ).map(resolveAbsoluteUrl)

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
        ...(productDescription ? { description: productDescription } : {}),
        ...(product.sku ? { sku: product.sku } : {}),
        image: productImages,
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

      {/* ── Top Navigation Bar (Breadcrumbs + Back Button) ──────── */}
      <BreadcrumbBar
        className="product-breadcrumb"
        locale={locale}
        items={[
          {
            label: locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home',
            href: `/${locale}`,
          },
          {
            label: locale === 'ar' ? 'المنتجات' : locale === 'fr' ? 'Produits' : 'Products',
            href: `/${locale}/products`,
          },
          { label: productName },
        ]}
        backHref={`/${locale}/products`}
        backLabel={
          locale === 'ar'
            ? 'العودة لجميع المنتجات'
            : locale === 'fr'
              ? 'Retour aux produits'
              : 'Back to products'
        }
      />

      {/* ── Product Info Section ───────────────────────────────── */}
      <ProductDetail product={product} locale={locale} />
    </div>
  )
}

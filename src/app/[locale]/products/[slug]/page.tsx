import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { productService } from '@/services/product.service'
import { ProductDetail } from '@/features/products/components/ProductDetail/ProductDetail'

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>
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
    <div className="container-brand py-8 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Breadcrumbs ────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
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

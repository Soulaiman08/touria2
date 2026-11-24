import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Sparkles,
  Truck,
  Heart,
  Phone,
} from 'lucide-react'
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaFacebookF,
  FaYoutube,
} from 'react-icons/fa6'
import { productService } from '@/services/product.service'
import { categoryService } from '@/services/category.service'
import { bannerService } from '@/services/banner.service'
import { siteConfig } from '@/config/site'
import { prisma } from '@/lib/prisma'
import { InfiniteProductGrid } from '@/components/products/InfiniteProductGrid'
import { FeaturedCollectionShowcase } from '@/components/home/FeaturedCollectionShowcase'
import { BannersRow } from '@/components/home/BannersRow'
import { HeroShowcase } from '@/components/home/HeroShowcase'
import { ForwardButton } from '@/components/shared/PageNavigation'
import {
  buildLocaleAlternates,
  getDefaultOgImages,
  getSeoSettings,
} from '@/lib/seo.server'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = siteConfig.url
  const seo = await getSeoSettings()

  const titles: Record<string, string> = {
    ar: seo.seoTitle || 'ثريا المغربي | جلابات ونقابات مغربية أصيلة',
    fr: 'Thuraya Al-Maghribi | Djellabas et Niqabs Marocains Artisanaux',
    en: 'Thuraya Al-Maghribi | Authentic Moroccan Djellabas & Niqabs',
  }

  const descriptions: Record<string, string> = {
    ar:
      seo.seoDescription ||
      'متجر ثريا المغربي للجلابات والنقابات المغربية التقليدية. جلابة مغربية مصنوعة يدوياً بأجود الخامات، بتصاميم أنيقة تجمع بين الأصالة والرقي. توصيل لجميع مدن المملكة.',
    fr: 'Thuraya Al-Maghribi – Boutique en ligne de djellabas et niqabs marocains artisanaux. Vêtements traditionnels marocains de qualité, livraison dans tout le Maroc.',
    en: 'Thuraya Al-Maghribi – Shop handcrafted Moroccan djellabas and niqabs online. Traditional Moroccan clothing with elegant designs, delivered nationwide.',
  }

  const title = titles[locale] ?? titles.ar
  const description = descriptions[locale] ?? descriptions.ar
  const ogImages = getDefaultOgImages(title)
  const brandName = locale === 'ar' ? 'ثريا المغربي' : 'Thuraya Al-Maghribi'

  return {
    title: {
      absolute: title,
    },
    description,
    ...(seo.seoKeywords.length > 0 ? { keywords: seo.seoKeywords } : {}),
    alternates: buildLocaleAlternates('', locale),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: brandName,
      locale: locale === 'ar' ? 'ar_MA' : locale === 'fr' ? 'fr_MA' : 'en_US',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  }
}

type SiteSettings = {
  contactPhone?: string
  whatsapp?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  youtube?: string
  contactEmail?: string
}

const DEFAULT_SETTINGS: SiteSettings = {
  contactPhone: siteConfig.contact.phoneDisplay,
  whatsapp: siteConfig.contact.whatsapp,
  instagram: siteConfig.social.instagram,
  facebook: siteConfig.social.facebook,
  tiktok: siteConfig.social.tiktok,
  youtube: siteConfig.social.youtube || '',
  contactEmail: '',
}

async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settingsList = await prisma.siteSetting.findMany()
    const settings: SiteSettings = { ...DEFAULT_SETTINGS }

    for (const item of settingsList) {
      if (item.key in settings) {
        settings[item.key as keyof SiteSettings] = item.value
      }
    }

    return settings
  } catch (error) {
    console.error('Failed to load site settings:', error)
    return DEFAULT_SETTINGS
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  const isRTL = locale === 'ar'

  const [featured, catalogPreviewResponse, newestResponse, categories, banners, settings] = await Promise.all([
    productService.getFeaturedProducts(),
    productService.getProducts({ limit: 24 }),
    productService.getProducts({ sort: 'newest', limit: 8 }),
    categoryService.getCategories(),
    bannerService.getActiveBanners(locale),
    getSiteSettings(),
  ])

  const whatsappNumber = (settings.whatsapp || '').replace(/[^0-9]/g, '')
  const allCatalogCount = categories.reduce((sum, c) => sum + (c.productCount ?? 0), 0)

  const heroProducts = featured.length > 0 ? featured : newestResponse.items.slice(0, 8)

  const labels = {
    heroEyebrow:
      locale === 'ar'
        ? 'دار ثريا المغربي · خياطة تقليدية أصيلة'
        : locale === 'fr'
          ? 'Maison Thuraya · Haute Couture Marocaine'
          : 'Maison Thuraya · Moroccan Craft Atelier',

    heroTitle1:
      locale === 'ar'
        ? 'الأناقة المغربية'
        : locale === 'fr'
          ? "L'élégance"
          : 'Moroccan',

    heroTitle2:
      locale === 'ar'
        ? 'في أبهى صورها'
        : locale === 'fr'
          ? 'marocaine authentique'
          : 'Elegance Redefined',

    heroSub:
      locale === 'ar'
        ? 'جلابيات ونقابات مغربية مصنوعة يدوياً بأجود الخامات وأرقى القصات، تجمع بين هيبة التراث والراحة اليومية.'
        : locale === 'fr'
          ? 'Djellabas et niqabs marocains confectionnés à la main avec des tissus nobles, alliant héritage et allure contemporaine.'
          : 'Handcrafted Moroccan djellabas and niqabs tailored in noble fabrics, uniting heritage craft with everyday grace.',

    heroCta:
      locale === 'ar'
        ? 'تصفحي المجموعة'
        : locale === 'fr'
          ? 'Découvrir la collection'
          : 'Shop Collection',

    heroSec:
      locale === 'ar'
        ? 'قصة الدار'
        : locale === 'fr'
          ? 'Notre savoir-faire'
          : 'Our Craft',

    trustLine:
      locale === 'ar'
        ? ['صنع يدوي مغربي', 'الدفع عند الاستلام', 'توصيل لجميع المدن']
        : locale === 'fr'
          ? ['Artisanat marocain', 'Paiement à la livraison', 'Livraison nationale']
          : ['Handcrafted in Morocco', 'Cash on Delivery', 'Nationwide Shipping'],

    featuredPieceLabel:
      locale === 'ar'
        ? 'قطعة مميزة'
        : locale === 'fr'
          ? 'Pièce signature'
          : 'Signature Piece',

    bestEyebrow:
      locale === 'ar'
        ? 'مختارات الدار'
        : locale === 'fr'
          ? 'Sélection signature'
          : 'Atelier Selection',

    bestSellers:
      locale === 'ar'
        ? 'الأكثر مبيعًا'
        : locale === 'fr'
          ? 'Meilleures ventes'
          : 'Best Sellers',

    bestSub:
      locale === 'ar'
        ? 'اختيارات مميزة من أرقى جلابياتنا المغربية'
        : locale === 'fr'
          ? 'Nos créations les plus appréciées'
          : 'Our most beloved handcrafted pieces',

    newEyebrow:
      locale === 'ar'
        ? 'إصدارات حديثة'
        : locale === 'fr'
          ? 'Dernières créations'
          : 'Freshly Crafted',

    newCol:
      locale === 'ar'
        ? 'الوصول الجديد'
        : locale === 'fr'
          ? 'Nouveautés'
          : 'New Arrivals',

    newSub:
      locale === 'ar'
        ? 'أحدث إضافات مجموعتنا الحصرية'
        : locale === 'fr'
          ? 'Les dernières additions à notre collection'
          : 'The latest additions to our exclusive collection',

    viewAll:
      locale === 'ar'
        ? 'عرض الكل'
        : locale === 'fr'
          ? 'Voir tout'
          : 'View All',

    allCatalog:
      locale === 'ar'
        ? 'جميع التصاميم'
        : locale === 'fr'
          ? 'Toute la collection'
          : 'All Pieces',

    empty:
      locale === 'ar'
        ? 'سيتم إضافة المنتجات قريبًا.'
        : locale === 'fr'
          ? 'Les produits seront bientôt disponibles.'
          : 'Products will be available soon.',

    storyQuote:
      locale === 'ar'
        ? '"كل جلابة تحكي قصة من تراثنا المغربي الأصيل"'
        : locale === 'fr'
          ? '"Chaque djellaba raconte une histoire de notre patrimoine marocain"'
          : '"Every djellaba tells a story of our authentic Moroccan heritage"',

    contactEyebrow:
      locale === 'ar'
        ? 'خدمة الزبونات'
        : locale === 'fr'
          ? 'Conciergerie'
          : 'Atelier Concierge',

    contactTitle:
      locale === 'ar'
        ? 'تواصلي معنا'
        : locale === 'fr'
          ? 'Contactez-nous'
          : 'Get in Touch',

    contactSub:
      locale === 'ar'
        ? 'يسعدنا مساعدتك في اختيار المقاس أو اللون المناسب لطلبك.'
        : locale === 'fr'
          ? 'Nous vous conseillons avec plaisir sur les tailles et coloris.'
          : 'We are delighted to assist with sizing, colors, or custom inquiries.',

    whatsappCta:
      locale === 'ar'
        ? 'محادثة عبر واتساب'
        : locale === 'fr'
          ? 'Discuter sur WhatsApp'
          : 'Chat on WhatsApp',

    callCta:
      locale === 'ar'
        ? 'اتصال هاتفي'
        : locale === 'fr'
          ? 'Appeler'
          : 'Call Atelier',

    followLabel:
      locale === 'ar'
        ? 'حساباتنا'
        : locale === 'fr'
          ? 'Réseaux'
          : 'Socials',
  }

  const pillars = [
    {
      icon: Sparkles,
      title:
        locale === 'ar'
          ? 'صنع يدوي أصيل'
          : locale === 'fr'
            ? 'Artisanat authentique'
            : 'Authentic Handmade',
      desc:
        locale === 'ar'
          ? 'خياطة متقنة بحرفية مغربية متوارثة'
          : locale === 'fr'
            ? 'Finitions soignées par nos artisans'
            : 'Tailored with traditional Moroccan craft',
    },
    {
      icon: Heart,
      title:
        locale === 'ar'
          ? 'أجود الأقمشة'
          : locale === 'fr'
            ? 'Tissus nobles'
            : 'Premium Fabrics',
      desc:
        locale === 'ar'
          ? 'خامات مختارة للراحة والأناقة الدائمة'
          : locale === 'fr'
            ? 'Matières choisies pour le confort'
            : 'Selected textiles for lasting comfort',
    },
    {
      icon: Truck,
      title:
        locale === 'ar'
          ? 'توصيل لجميع المدن'
          : locale === 'fr'
            ? 'Livraison nationale'
            : 'Nationwide Delivery',
      desc:
        locale === 'ar'
          ? 'شحن سريع وآمن لكافة مدن المملكة'
          : locale === 'fr'
            ? 'Expédition dans tout le Maroc'
            : 'Fast delivery across all Moroccan cities',
    },
    {
      icon: Banknote,
      title:
        locale === 'ar'
          ? 'الدفع عند الاستلام'
          : locale === 'fr'
            ? 'Paiement à la réception'
            : 'Cash on Delivery',
      desc:
        locale === 'ar'
          ? 'معاينة وأداء آمن عند استلام الطلب'
          : locale === 'fr'
            ? 'Réglez en toute confiance à l’arrivée'
            : 'Pay securely upon receiving your order',
    },
  ]

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        locale === 'ar'
          ? 'مرحباً، أريد الاستفسار عن منتجاتكم'
          : locale === 'fr'
            ? 'Bonjour, je souhaite me renseigner sur vos produits'
            : 'Hello, I would like to inquire about your products'
      )}`
    : '#'

  const socialLinks = [
    {
      href: settings.instagram || '',
      icon: FaInstagram,
      label: 'Instagram',
      colorClass: 'social-brand-instagram',
      surfaceClass: '',
    },
    {
      href: settings.tiktok || '',
      icon: FaTiktok,
      label: 'TikTok',
      colorClass: 'social-brand-tiktok',
      surfaceClass: '',
    },
    {
      href: settings.facebook || '',
      icon: FaFacebookF,
      label: 'Facebook',
      colorClass: 'social-brand-facebook',
      surfaceClass: '',
    },
    {
      href: settings.youtube || '',
      icon: FaYoutube,
      label: 'YouTube',
      colorClass: 'social-brand-youtube',
      surfaceClass: '',
    },
  ].filter((s) => Boolean(s.href && s.href !== '#'))

  return (
    <>
      {/* ===================================================
          1. ARCHITECTURAL MOROCCAN ARCH HERO
      =================================================== */}
      <section
        className="home-hero relative overflow-hidden pt-3 pb-4 sm:py-4 md:py-5 lg:py-6"
        aria-label={isRTL ? 'الرئيسية' : 'Hero'}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 55% at 75% 40%, rgba(158, 67, 33, 0.055) 0%, rgba(154, 116, 56, 0.03) 50%, transparent 72%)',
          }}
        />

        <div className="container-brand relative z-10">
          <div
            className="grid grid-cols-12 items-center gap-x-3 gap-y-4 sm:gap-6 md:gap-8 lg:gap-10"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Editorial Copy Column */}
            <div className="col-span-7 flex flex-col items-start text-start space-y-2.5 sm:space-y-3.5 lg:space-y-4 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-3 text-[0.5625rem] min-[390px]:text-[0.625rem] sm:text-xs font-semibold uppercase tracking-[0.08em] sm:tracking-[0.14em] text-[var(--gold)] max-w-full">
                <span className="w-3 sm:w-6 h-px bg-[var(--gold)]/60 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{labels.heroEyebrow}</span>
              </div>

              <h1
                className="font-extrabold tracking-tight leading-[1.15] text-balance text-[var(--text-primary)] text-[clamp(1.2rem,5.2vw,1.75rem)] sm:text-[clamp(1.75rem,3vw,3.15rem)]"
                style={{
                  fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                }}
              >
                {labels.heroTitle1}
                <span className="block mt-0.5 sm:mt-1 gradient-text">
                  {labels.heroTitle2}
                </span>
              </h1>

              <p className="text-[0.75rem] sm:text-sm lg:text-base max-w-md lg:max-w-lg leading-[1.45] sm:leading-relaxed line-clamp-3 sm:line-clamp-none text-[var(--text-muted)]">
                {labels.heroSub}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-2.5 lg:gap-3.5 pt-0.5 sm:pt-1 w-full">
                <Link
                  href={`/${locale}/products`}
                  className="btn btn-primary rounded-xl sm:flex-initial lg:min-w-[11rem] !min-h-[2.375rem] sm:!min-h-[2.75rem] !py-2 sm:!py-2.5 !px-3.5 sm:!px-5 lg:!px-6 text-[0.75rem] sm:text-xs lg:text-sm justify-center group whitespace-nowrap max-w-full"
                >
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:scale-105 flex-shrink-0" />
                  <span>{labels.heroCta}</span>
                </Link>

                <Link
                  href={`/${locale}/about`}
                  className="btn btn-outline rounded-xl sm:flex-initial lg:min-w-[9.5rem] !min-h-[2.375rem] sm:!min-h-[2.75rem] !py-2 sm:!py-2.5 !px-3.5 sm:!px-5 lg:!px-6 text-[0.75rem] sm:text-xs lg:text-sm justify-center group whitespace-nowrap max-w-full"
                >
                  <span>{labels.heroSec}</span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 transition-transform duration-200 ${
                      isRTL
                        ? 'rotate-180 group-hover:-translate-x-0.5'
                        : 'group-hover:translate-x-0.5'
                    }`}
                  />
                </Link>
              </div>

              {/* Clean Typographic Assurances (Desktop & Tablet inside copy column) */}
              <div className="hidden sm:flex flex-wrap items-center justify-start gap-x-3 lg:gap-x-4 gap-y-1 pt-2.5 border-t border-[var(--border-subtle)] text-xs font-medium text-[var(--text-muted)] w-full max-w-lg">
                {labels.trustLine.map((item, idx) => (
                  <span key={item} className="inline-flex items-center gap-3 lg:gap-4">
                    {idx > 0 && (
                      <span className="text-[var(--gold)]/60" aria-hidden="true">
                        ·
                      </span>
                    )}
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Moroccan Architectural Arch Editorial Showcase */}
            <div className="col-span-5 relative flex justify-end min-w-0">
              <HeroShowcase
                products={heroProducts}
                locale={locale}
                featuredPieceLabel={labels.featuredPieceLabel}
                fallbackName={siteConfig.name}
              />
            </div>

            {/* Clean Typographic Assurances (Mobile full-width compact row below columns) */}
            <div className="col-span-12 flex sm:hidden flex-wrap items-center justify-center gap-x-2 gap-y-1 pt-2.5 border-t border-[var(--border-subtle)] text-[0.625rem] min-[390px]:text-[0.6875rem] font-medium text-[var(--text-muted)] w-full">
              {labels.trustLine.map((item, idx) => (
                <span key={item} className="inline-flex items-center gap-2">
                  {idx > 0 && (
                    <span className="text-[var(--gold)]/60" aria-hidden="true">
                      ·
                    </span>
                  )}
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          2. FEATURED BANNERS (only when active in DB)
      =================================================== */}
      <BannersRow banners={banners} locale={locale} />

      {/* ===================================================
          3. COLLECTIONS & BEST SELLERS (In-page category filter tabs)
      =================================================== */}
      <FeaturedCollectionShowcase
        locale={locale}
        initialFeatured={featured.slice(0, 8)}
        initialCatalogProducts={catalogPreviewResponse.items}
        categories={categories}
        allCatalogCount={allCatalogCount}
        labels={{
          eyebrow: labels.bestEyebrow,
          title: labels.bestSellers,
          subtitle: labels.bestSub,
          allCatalog: labels.allCatalog,
          viewAll: labels.viewAll,
          empty: labels.empty,
        }}
      />

      {/* ===================================================
          4. NEW ARRIVALS COLLECTION
      =================================================== */}
      <section
        className="home-section home-section-muted"
        aria-label={labels.newCol}
      >
        <div className="container-brand space-y-4 sm:space-y-6">
          <div
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 pb-1"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
                <span className="w-5 h-px bg-[var(--gold)]/60" aria-hidden="true" />
                <span>{labels.newEyebrow}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-3xl font-bold text-[var(--text-primary)] truncate m-0">
                  {labels.newCol}
                </h2>

                <div className="sm:hidden flex-shrink-0">
                  <ForwardButton
                    href={`/${locale}/products?sort=newest`}
                    label={labels.viewAll}
                    locale={locale}
                    size="sm"
                  />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed m-0">
                {labels.newSub}
              </p>
            </div>

            <div className="hidden sm:block flex-shrink-0">
              <ForwardButton
                href={`/${locale}/products?sort=newest`}
                label={labels.viewAll}
                locale={locale}
              />
            </div>
          </div>

          {newestResponse.items.length === 0 ? (
            <EmptyState message={labels.empty} />
          ) : (
            <InfiniteProductGrid
              initialProducts={newestResponse.items}
              initialTotal={newestResponse.total}
              locale={locale}
              filters={{ sort: 'newest' }}
              isNew
              gridClassName="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-7"
            />
          )}
        </div>
      </section>

      {/* ===================================================
          5. UNIFIED ATELIER STORY & CONCIERGE SPLIT
      =================================================== */}
      <section
        id="contact"
        className="home-section scroll-mt-24"
        style={{ scrollMarginTop: '6rem' }}
        aria-label={labels.contactTitle}
      >
        <div className="container-brand">
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Story Quote + 2x2 Craft Pillars */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
                  <span className="w-5 h-px bg-[var(--gold)]/60" aria-hidden="true" />
                  <span>{labels.heroSec}</span>
                </div>

                <blockquote
                  className="text-xl sm:text-3xl font-bold leading-relaxed text-balance text-[var(--text-primary)]"
                  style={{
                    fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                  }}
                >
                  {labels.storyQuote}
                </blockquote>

                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                  — {siteConfig.name}
                </p>
              </div>

              <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-3 sm:gap-6 pt-5 sm:pt-6 border-t border-[var(--border)]">
                {pillars.map((pillar, index) => {
                  const Icon = pillar.icon
                  return (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-3.5 p-3.5 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-[var(--border)] bg-[var(--card-bg)] sm:bg-transparent"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent-ring)] flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                          {pillar.title}
                        </h3>
                        <p className="text-[0.6875rem] sm:text-xs text-[var(--text-muted)] leading-relaxed">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Single Calm Atelier Concierge Card */}
            <div className="lg:col-span-5">
              <div
                className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 sm:p-8 space-y-5 sm:space-y-6"
                style={{ boxShadow: 'var(--card-shadow)' }}
              >
                <div className="space-y-1.5 border-b border-[var(--border)] pb-5">
                  <div className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
                    <span className="w-4 h-px bg-[var(--gold)]/60" aria-hidden="true" />
                    <span>{labels.contactEyebrow}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    {labels.contactTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    {labels.contactSub}
                  </p>
                </div>

                <div className="space-y-3">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--accent-ring)] bg-[var(--accent-light)] hover:border-[var(--accent)] transition-colors no-underline group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105">
                        <FaWhatsapp className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-sm font-bold text-[var(--text-primary)]">
                          {labels.whatsappCta}
                        </span>
                        <span
                          className="block text-xs text-[var(--text-muted)] tabular-nums truncate"
                          dir="ltr"
                        >
                          {settings.whatsapp || settings.contactPhone || ''}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className={`w-4 h-4 text-[var(--accent)] flex-shrink-0 ${isRTL ? '-scale-x-100' : ''}`} />
                  </a>

                  <a
                    href={`tel:${(settings.contactPhone || '').replace(/\s+/g, '')}`}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] hover:border-[var(--accent)] transition-colors no-underline group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-sm font-bold text-[var(--text-primary)]">
                          {labels.callCta}
                        </span>
                        <span
                          className="block text-xs text-[var(--text-muted)] tabular-nums truncate"
                          dir="ltr"
                        >
                          {settings.contactPhone || ''}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className={`w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] flex-shrink-0 ${isRTL ? '-scale-x-100' : ''}`} />
                  </a>
                </div>

                {socialLinks.length > 0 && (
                  <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      {labels.followLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      {socialLinks.map((item) => {
                        const Icon = item.icon
                        return (
                          <a
                            key={item.label}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={item.label}
                            title={item.label}
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 ${item.surfaceClass} ${item.colorClass}`}
                          >
                            <Icon className="w-4 h-4" />
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="text-center py-16 px-6 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] space-y-4"
      role="status"
    >
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
        <ShoppingBag className="w-6 h-6" />
      </div>

      <p className="text-sm font-medium text-[var(--text-muted)]">
        {message}
      </p>
    </div>
  )
}
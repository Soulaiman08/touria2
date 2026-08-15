import Image from 'next/image'
import Link from 'next/link'
import { productService } from '@/services/product.service'
import { bannerService } from '@/services/banner.service'
import { siteConfig } from '@/config/site'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/shared/ProductCard'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

type SiteSettings = {
  contactPhone?: string
  whatsapp?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  contactEmail?: string
}

const DEFAULT_SETTINGS: SiteSettings = {
  contactPhone: siteConfig.contact.phoneDisplay,
  whatsapp: siteConfig.contact.whatsapp,
  instagram: siteConfig.social.instagram,
  facebook: siteConfig.social.facebook,
  tiktok: siteConfig.social.tiktok,
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

  const [featured, newest, banners, settings] = await Promise.all([
    productService.getFeaturedProducts(),
    productService.getProducts({ sort: 'newest', limit: 4 }).then(r => r.items),
    bannerService.getActiveBanners(),
    getSiteSettings(),
  ])

  const whatsappNumber = (settings.whatsapp || '').replace(/[^0-9]/g, '')

  const labels = {
    heroBadge:
      locale === 'ar'
        ? 'أناقة مغربية أصيلة'
        : locale === 'fr'
          ? 'Élégance marocaine authentique'
          : 'Authentic Moroccan Elegance',

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
        ? 'جلابيات ونقابات مغربية مصنوعة يدوياً بأجود الخامات وأرقى التصاميم، تجمع بين التراث الأصيل والذوق الرفيع.'
        : locale === 'fr'
          ? 'Djellabas et niqabs marocains artisanaux, alliant héritage authentique et goût raffiné.'
          : 'Handcrafted Moroccan djellabas and niqabs blending authentic heritage with refined taste.',

    heroCta:
      locale === 'ar'
        ? 'ابدأي التسوق'
        : locale === 'fr'
          ? 'Commencer vos achats'
          : 'Start Shopping',

    heroSec:
      locale === 'ar'
        ? 'اكتشفي المجموعة'
        : locale === 'fr'
          ? 'Découvrir la collection'
          : 'Discover the Collection',

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
          : 'Our most beloved creations',

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

    empty:
      locale === 'ar'
        ? 'سيتم إضافة المنتجات قريبًا.'
        : locale === 'fr'
          ? 'Les produits seront bientôt disponibles.'
          : 'Products will be available soon.',

    contactTitle:
      locale === 'ar'
        ? 'تواصلي معنا'
        : locale === 'fr'
          ? 'Contactez-nous'
          : 'Get in Touch',

    contactSub:
      locale === 'ar'
        ? 'نحن هنا للإجابة على استفساراتكم'
        : locale === 'fr'
          ? 'Nous sommes là pour vous aider'
          : "We're here to answer your questions",

    whatsappCta:
      locale === 'ar'
        ? 'تواصل عبر واتساب'
        : locale === 'fr'
          ? 'Contacter via WhatsApp'
          : 'Contact via WhatsApp',

    callCta:
      locale === 'ar'
        ? 'اتصل بنا'
        : locale === 'fr'
          ? 'Appeler'
          : 'Call Us',
  }

  const features = [
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
      ),
      title:
        locale === 'ar'
          ? 'صنع يدوي أصيل'
          : locale === 'fr'
            ? 'Artisanat authentique'
            : 'Authentic Handmade',
      desc:
        locale === 'ar'
          ? 'كل قطعة تُصنع بعناية فائقة وحرفية متوارثة'
          : locale === 'fr'
            ? 'Chaque pièce est fabriquée avec un soin exceptionnel'
            : 'Every piece crafted with exceptional care',
    },

    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      ),
      title:
        locale === 'ar'
          ? 'أجود الخامات'
          : locale === 'fr'
            ? 'Matériaux premium'
            : 'Premium Materials',
      desc:
        locale === 'ar'
          ? 'أقمشة مختارة بعناية لضمان الراحة والمتانة'
          : locale === 'fr'
            ? 'Tissus sélectionnés pour le confort et la durabilité'
            : 'Carefully selected fabrics for comfort and durability',
    },

    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
          />
        </svg>
      ),
      title:
        locale === 'ar'
          ? 'توصيل لجميع المدن'
          : locale === 'fr'
            ? 'Livraison nationale'
            : 'Nationwide Delivery',
      desc:
        locale === 'ar'
          ? 'نوصل لجميع مدن المملكة المغربية'
          : locale === 'fr'
            ? 'Livraison dans toutes les villes du Maroc'
            : 'Delivery to all Moroccan cities',
    },

    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
          />
        </svg>
      ),
      title:
        locale === 'ar'
          ? 'الدفع عند الاستلام'
          : locale === 'fr'
            ? 'Paiement à la livraison'
            : 'Cash on Delivery',
      desc:
        locale === 'ar'
          ? 'ادفعي عند استلام طلبك بكل أمان وسهولة'
          : locale === 'fr'
            ? 'Payez en toute sécurité à la réception'
            : 'Pay securely when you receive your order',
    },
  ]

  return (
    <>
      {/* HERO SECTION */}
      <section
        className="home-hero relative overflow-hidden"
        style={{
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label={isRTL ? 'الرئيسية' : 'Hero'}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 pattern-moroccan pointer-events-none" />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 70% at 78% 45%, rgba(245,158,11,0.10) 0%, transparent 68%)',
          }}
        />

        <div
          className="absolute pointer-events-none"
          style={{
            width: 420,
            height: 420,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(184,150,90,0.08) 0%, transparent 70%)',
            right: isRTL ? 'auto' : '-120px',
            left: isRTL ? '-120px' : 'auto',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />

        <div className="container-brand relative z-10 w-full py-6 sm:py-8 md:py-10">
          <div
            className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10"
            style={{ width: '100%' }}
          >
            {/* =========================
          HERO CONTENT
      ========================== */}
            <div
              className="lg:col-span-7 xl:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-start animate-fade-in-up"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Small badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold tracking-wide mb-5"
                style={{
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-ring)',
                }}
              >
                <span style={{ color: 'var(--gold)' }}>✦</span>
                {labels.heroBadge}
                <span style={{ color: 'var(--gold)' }}>✦</span>
              </div>

              {/* Main title */}
              <h1
                className="font-extrabold tracking-tight leading-[1.12] max-w-3xl"
                style={{
                  fontSize: 'clamp(2rem, 4.2vw, 3.8rem)',
                  color: 'var(--text-primary)',
                  fontFamily: isRTL
                    ? 'var(--font-arabic)'
                    : 'var(--font-display)',
                }}
              >
                {labels.heroTitle1}
                <br />
                <span className="gradient-text">
                  {labels.heroTitle2}
                </span>
              </h1>

              {/* Elegant separator */}
              <div
                className="flex items-center gap-3 my-5"
                aria-hidden="true"
              >
                <span
                  className="h-px w-10 sm:w-14"
                  style={{ background: 'var(--accent-ring)' }}
                />
                <span
                  className="text-sm"
                  style={{ color: 'var(--gold)' }}
                >
                  ✦
                </span>
                <span
                  className="h-px w-10 sm:w-14"
                  style={{ background: 'var(--accent-ring)' }}
                />
              </div>

              {/* Description */}
              <p
                className="text-sm sm:text-base lg:text-lg max-w-xl leading-7 sm:leading-8"
                style={{ color: 'var(--text-muted)' }}
              >
                {labels.heroSub}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mt-7 w-full sm:w-auto">
                <Link
                  href={`/${locale}/products`}
                  className="btn btn-primary btn-lg btn-round w-full sm:w-auto"
                  style={{
                    minWidth: 165,
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-[18px] h-[18px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                    />
                  </svg>

                  {labels.heroCta}
                </Link>

                <Link
                  href={`/${locale}/about`}
                  className="btn btn-outline btn-lg btn-round w-full sm:w-auto"
                  style={{
                    minWidth: 165,
                    justifyContent: 'center',
                  }}
                >
                  {labels.heroSec}

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className={`w-[16px] h-[16px] ${isRTL ? 'rotate-180' : ''
                      }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </div>

              {/* Trust indicators */}
              <div
                className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 mt-6"
                dir="ltr"
              >
                {[
                  {
                    icon: '🇲🇦',
                    text:
                      locale === 'ar'
                        ? 'صنع في المغرب'
                        : 'Made in Morocco',
                  },
                  {
                    icon: '✦',
                    text:
                      locale === 'ar'
                        ? 'صنع يدوي'
                        : locale === 'fr'
                          ? 'Artisanal'
                          : 'Handmade',
                  },
                  {
                    icon: '🚚',
                    text:
                      locale === 'ar'
                        ? 'توصيل لكل المدن'
                        : locale === 'fr'
                          ? 'Livraison nationale'
                          : 'Nationwide',
                  },
                ].map((item, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span>{item.icon}</span>
                    {item.text}
                  </span>
                ))}
              </div>
            </div>

            {/* =========================
          HERO VISUAL
      ========================== */}
            <div
              className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end animate-fade-in delay-200"
              dir="ltr"
            >
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: 'clamp(240px, 32vw, 350px)',
                  aspectRatio: '1 / 1',
                }}
              >
                {/* Soft outer glow */}
                <div
                  className="absolute inset-2 rounded-full pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(184,150,90,0.12) 0%, rgba(184,150,90,0.03) 55%, transparent 72%)',
                    filter: 'blur(4px)',
                  }}
                />

                {/* Decorative ring */}
                <div
                  className="absolute inset-3 rounded-full pointer-events-none"
                  style={{
                    border: '1px solid var(--accent-ring)',
                    opacity: 0.65,
                  }}
                />

                {/* Second decorative ring */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    inset: 13,
                    border: '1px dashed rgba(184,150,90,0.35)',
                  }}
                />

                {/* Logo / image */}
                <div
                  className="relative rounded-full overflow-hidden shadow-2xl"
                  style={{
                    width: 'clamp(205px, 27vw, 310px)',
                    height: 'clamp(205px, 27vw, 310px)',
                    background: 'var(--bg-muted)',
                    boxShadow: 'var(--shadow-gold)',
                    border: '5px solid var(--bg-base)',
                  }}
                >
                  <Image
                    src="/images/brand/logo-full.png"
                    alt={siteConfig.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 280px, 310px"
                    className="object-cover"
                    style={{
                      background: 'var(--bg-subtle)',
                    }}
                  />
                </div>

                {/* COD badge */}
                <div
                  className="absolute bottom-0 end-0 sm:bottom-1 sm:end-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg whitespace-nowrap min-w-max z-20"
                  style={{
                    background: 'var(--accent)',
                    color: '#fff',
                    boxShadow: 'var(--shadow-md)',
                    lineHeight: 1.4,
                  }}
                >
                  {locale === 'ar'
                    ? 'الدفع عند الاستلام ✓'
                    : 'COD ✓'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANNERS */}
      {banners.length > 0 && (
        <section
          className="home-section home-section-banners section-gap"
          aria-label={isRTL ? 'العروض الرئيسية' : 'Featured Banners'}
        >
          <div className="container-brand">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="relative overflow-hidden rounded-3xl shadow-xl"
                  style={{ minHeight: 200, background: 'var(--bg-muted)' }}
                >
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
                    }}
                  />

                  <div
                    className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 space-y-2 sm:space-y-3"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <h3
                      className="text-xl font-bold text-white leading-tight"
                      style={{
                        fontFamily: isRTL
                          ? 'var(--font-arabic)'
                          : 'var(--font-display)',
                      }}
                    >
                      {banner.title}
                    </h3>

                    {banner.subtitle && (
                      <p className="text-sm text-white/80">
                        {banner.subtitle}
                      </p>
                    )}

                    {banner.buttonText && banner.buttonUrl && (
                      <Link
                        href={banner.buttonUrl}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-colors"
                        style={{
                          background: 'var(--accent)',
                          color: '#fff',
                        }}
                      >
                        {banner.buttonText}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BEST SELLERS */}
      <section className="home-section section-gap" aria-label={labels.bestSellers}>
        <div className="container-brand space-y-8">
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="text-center sm:text-start">
              <div className="section-eyebrow mb-2">
                <span>✦</span>
                {labels.bestSellers}
                <span>✦</span>
              </div>

              <h2
                className="text-xl sm:text-4xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {labels.bestSellers}
              </h2>

              <p
                className="text-sm sm:text-base mt-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {labels.bestSub}
              </p>
            </div>

            <Link
              href={`/${locale}/products`}
              className="btn btn-outline btn-sm btn-round flex-shrink-0"
            >
              {labels.viewAll}

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>

          {featured.length === 0 ? (
            <EmptyState message={labels.empty} />
          ) : (
            <div
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6 md:gap-7"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {featured.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-fade-in-up"
                  style={{
                    animationDelay: `${i * 60}ms`,
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

      {/* NEW ARRIVALS */}
      <section
        className="home-section home-section-muted section-gap"
        aria-label={labels.newCol}
      >
        <div className="container-brand space-y-8">
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="text-center sm:text-start">
              <div className="section-eyebrow mb-2">
                <span>✦</span>
                {locale === 'ar' ? 'جديد' : 'Nouveau'}
                <span>✦</span>
              </div>

              <h2
                className="text-xl sm:text-4xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {labels.newCol}
              </h2>

              <p
                className="text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {labels.newSub}
              </p>
            </div>

            <Link
              href={`/${locale}/products?sort=newest`}
              className="btn btn-outline btn-sm btn-round flex-shrink-0"
            >
              {labels.viewAll}

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>

          {newest.length === 0 ? (
            <EmptyState message={labels.empty} />
          ) : (
            <div
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {newest.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-fade-in-up"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <ProductCard product={p} locale={locale} isNew />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GOLD ORNAMENT BANNER */}
      <section
        className="home-brand-story py-14"
        style={{
          background:
            'linear-gradient(135deg, #3D1F0A 0%, #6B3A2A 50%, #3D1F0A 100%)',
        }}
        aria-label={isRTL ? 'رسالتنا' : 'Our mission'}
      >
        <div
          className="container-brand text-center space-y-6"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="ornament justify-center" style={{ color: '#000000' }}>
            <span style={{ fontSize: '1.5rem' }}>✦</span>
          </div>

          <blockquote
            className="text-xl sm:text-2xl font-bold leading-relaxed max-w-2xl mx-auto"
            style={{
              color: 'var(--text-primary)',
              fontFamily: isRTL
                ? 'var(--font-arabic)'
                : 'var(--font-display)',
            }}
          >
            {locale === 'ar'
              ? '"كل جلابة تحكي قصة من تراثنا المغربي الأصيل"'
              : locale === 'fr'
                ? '"Chaque djellaba raconte une histoire de notre patrimoine marocain"'
                : '"Every djellaba tells a story of our authentic Moroccan heritage"'}
          </blockquote>

          <p className="text-sm" style={{ color: '#964B00' }}>
            — {siteConfig.name}
          </p>

          <div className="ornament justify-center" style={{ color: '#000000' }}>
            <span style={{ fontSize: '1.5rem' }}>✦</span>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="home-section section-gap home-contact-section" aria-label={labels.contactTitle}>
        <div className="container-brand">
          <div className="section-heading mb-12 home-contact-heading" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="section-eyebrow mb-2">
              <span>✦</span>
              {labels.contactTitle}
              <span>✦</span>
            </div>

            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {labels.contactTitle}
            </h2>

            <p
              className="text-sm mt-2"
              style={{ color: 'var(--text-muted)' }}
            >
              {labels.contactSub}
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto home-contact-grid"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* WhatsApp */}
            <a
              href={
                whatsappNumber
                  ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    locale === 'ar'
                      ? 'مرحباً، أريد الاستفسار عن منتجاتكم'
                      : locale === 'fr'
                        ? 'Bonjour, je souhaite me renseigner sur vos produits'
                        : 'Hello, I would like to inquire about your products'
                  )}`
                  : '#'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="card p-7 text-center space-y-4 group no-underline hover:shadow-lg transition-all home-contact-card"
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-transform group-hover:scale-105 home-contact-icon"
                style={{
                  background: 'rgba(37,211,102,0.1)',
                  color: '#25D366',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>

              <p
                className="font-bold text-base home-contact-label"
                style={{ color: 'var(--text-primary)' }}
              >
                WhatsApp
              </p>

              <p
                className="text-sm home-contact-detail"
                style={{ color: 'var(--text-muted)' }}
                dir="ltr"
              >
                {settings.whatsapp || settings.contactPhone || ''}
              </p>
            </a>

            {/* Phone */}
            <a
              href={`tel:${settings.contactPhone || ''}`}
              className="card p-7 text-center space-y-4 group no-underline hover:shadow-lg transition-all home-contact-card"
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-transform group-hover:scale-105 home-contact-icon"
                style={{
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
              </div>

              <p
                className="font-bold text-base home-contact-label"
                style={{ color: 'var(--text-primary)' }}
              >
                {labels.callCta}
              </p>

              <p
                className="text-sm home-contact-detail"
                style={{ color: 'var(--text-muted)' }}
                dir="ltr"
              >
                {settings.contactPhone || ''}
              </p>
            </a>

            {/* Instagram */}
            <a
              href={settings.instagram || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-7 text-center space-y-4 group no-underline hover:shadow-lg transition-all home-contact-card"
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-transform group-hover:scale-105 home-contact-icon"
                style={{
                  background: 'rgba(225,48,108,0.08)',
                  color: '#E1306C',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>

              <p
                className="font-bold text-base home-contact-label"
                style={{ color: 'var(--text-primary)' }}
              >
                Instagram
              </p>

              <p
                className="text-sm home-contact-detail"
                style={{ color: 'var(--text-muted)' }}
              >
                @thuraya.almaghribi
              </p>
            </a>

            {/* TikTok */}
            <a
              href={settings.tiktok || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-7 text-center space-y-4 group no-underline hover:shadow-lg transition-all home-contact-card"
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-transform group-hover:scale-105 home-contact-icon"
                style={{
                  background: 'rgba(0,0,0,0.06)',
                  color: 'var(--text-primary)',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.38a8.16 8.16 0 004.77 1.52V7.47a4.85 4.85 0 01-1-.78z" />
                </svg>
              </div>

              <p
                className="font-bold text-base home-contact-label"
                style={{ color: 'var(--text-primary)' }}
              >
                TikTok
              </p>

              <p
                className="text-sm home-contact-detail"
                style={{ color: 'var(--text-muted)' }}
              >
                @thuraya.almaghribi
              </p>
            </a>

            {/* Facebook */}
            <a
              href={settings.facebook || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-7 text-center space-y-4 group no-underline hover:shadow-lg transition-all home-contact-card"
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-transform group-hover:scale-105 home-contact-icon"
                style={{
                  background: 'rgba(24,119,242,0.08)',
                  color: '#1877F2',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>

              <p
                className="font-bold text-base home-contact-label"
                style={{ color: 'var(--text-primary)' }}
              >
                Facebook
              </p>

              <p
                className="text-sm home-contact-detail"
                style={{ color: 'var(--text-muted)' }}
              >
                thuraya.almaghribi
              </p>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com/@thuraya.almaghribi"
              target="_blank"
              rel="noopener noreferrer"
              className="card p-7 text-center space-y-4 group no-underline hover:shadow-lg transition-all home-contact-card"
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-transform group-hover:scale-105 home-contact-icon"
                style={{
                  background: 'rgba(255,0,0,0.08)',
                  color: '#FF0000',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>

              <p
                className="font-bold text-base home-contact-label"
                style={{ color: 'var(--text-primary)' }}
              >
                YouTube
              </p>

              <p
                className="text-sm home-contact-detail"
                style={{ color: 'var(--text-muted)' }}
              >
                @thuraya.almaghribi
              </p>
            </a>
          </div>
        </div>
      </section>

      <section className="home-features-bottom section-gap" aria-label={isRTL ? 'مميزات المتجر' : 'Store features'}>
        <div className="container-brand">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {features.map((feature, index) => (
              <div key={index} className="card p-7 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20 space-y-3" role="status">
      <div className="text-5xl mb-4">🌸</div>

      <p
        className="text-base font-medium"
        style={{ color: 'var(--text-muted)' }}
      >
        {message}
      </p>
    </div>
  )
}
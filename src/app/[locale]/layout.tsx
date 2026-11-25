import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { siteConfig } from '@/config/site'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { MotionProvider } from '@/components/providers/MotionProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/features/cart/components/CartDrawer'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { VisitorTracker } from '@/components/shared/VisitorTracker'

import { CustomerAuthProvider } from '@/components/providers/CustomerAuthProvider'
import { LocaleDocumentSync } from '@/components/shared/LocaleDocumentSync'
import { categoryService } from '@/services/category.service'
import {
  buildLocaleAlternates,
  getDefaultOgImages,
  getSeoSettings,
} from '@/lib/seo.server'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = siteConfig.url
  const seo = await getSeoSettings()

  const titles: Record<string, string> = {
    ar: seo.seoTitle || 'ثريا المغربي | جلابات ونقابات مغربية',
    fr: 'Thuraya Al-Maghribi | Djellabas et Niqabs Marocains',
    en: 'Thuraya Al-Maghribi | Moroccan Djellabas & Niqabs',
  }

  const descriptions: Record<string, string> = {
    ar:
      seo.seoDescription ||
      'متجر ثريا المغربي للجلابات والنقابات المغربية التقليدية. جلابة مغربية مصنوعة يدوياً بأجود الخامات. توصيل لجميع مدن المملكة.',
    fr: 'Thuraya Al-Maghribi – Votre boutique de djellabas et niqabs marocains artisanaux. Livraison dans tout le Maroc.',
    en: 'Thuraya Al-Maghribi – Shop authentic handcrafted Moroccan djellabas and niqabs. Traditional Moroccan clothing delivered nationwide.',
  }

  const baseKeywords: Record<string, string[]> = {
    ar: ['جلابة مغربية', 'جلابات مغربية', 'نقاب مغربي', 'ملابس مغربية تقليدية', 'ثريا المغربي', 'أثواب مغربية', 'جلابية مغربية'],
    fr: ['djellaba marocaine', 'niqab marocain', 'vêtements marocains', 'Thuraya Al-Maghribi', 'djellaba artisanale', 'tenue traditionnelle marocaine'],
    en: ['moroccan djellaba', 'moroccan niqab', 'traditional moroccan clothing', 'Thuraya Al-Maghribi', 'moroccan abaya', 'handmade djellaba'],
  }

  const title = titles[locale] ?? titles.ar
  const description = descriptions[locale] ?? descriptions.ar
  const brandSuffix = locale === 'ar' ? 'ثريا المغربي' : 'Thuraya Al-Maghribi'
  const ogImages = getDefaultOgImages(title)
  const mergedKeywords = Array.from(
    new Set([...(seo.seoKeywords || []), ...(baseKeywords[locale] ?? baseKeywords.ar)])
  )

  return {
    title: {
      default: title,
      template: `%s | ${brandSuffix}`,
    },
    description,
    keywords: mergedKeywords,
    openGraph: {
      title,
      description,
      siteName: brandSuffix,
      locale: locale === 'ar' ? 'ar_MA' : locale === 'fr' ? 'fr_MA' : 'en_US',
      url: `${baseUrl}/${locale}`,
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
    alternates: buildLocaleAlternates('', locale),
  }
}

// ─────────────────────────────────────────────────────────────
// JSON-LD: Organization + WebSite (placed in layout so it
// appears on every storefront page)
// ─────────────────────────────────────────────────────────────
function OrganizationSchema({
  locale,
  seo,
}: {
  locale: string
  seo: Awaited<ReturnType<typeof getSeoSettings>>
}) {
  const baseUrl = siteConfig.url
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: seo.storeName || 'ثريا المغربي',
        alternateName: ['Thuraya Al-Maghribi', 'Thuraya Al Maghribi', 'ثريا مغربي'],
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}${siteConfig.logoFull}`,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: seo.contactPhone || siteConfig.contact.phone,
          contactType: 'customer service',
          availableLanguage: ['Arabic', 'French', 'English'],
        },
        sameAs: [
          seo.instagram,
          seo.facebook,
          seo.tiktok,
          seo.youtube,
        ].filter(Boolean),
        areaServed: 'MA',
        foundingLocation: {
          '@type': 'Country',
          name: 'Morocco',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'ثريا المغربي',
        description:
          locale === 'ar'
            ? 'متجر ثريا المغربي للجلابات والنقابات المغربية التقليدية'
            : locale === 'fr'
            ? 'Boutique Thuraya Al-Maghribi pour djellabas et niqabs marocains'
            : 'Thuraya Al-Maghribi store for traditional Moroccan djellabas and niqabs',
        publisher: { '@id': `${baseUrl}/#organization` },
        inLanguage: locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr' : 'en',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/${locale}/products?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  // Validate locale
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound()
  }

  const messages = await getMessages()
  const isRTL = locale === 'ar'

  let seoSettings: Awaited<ReturnType<typeof getSeoSettings>>
  let footerCategories: Array<{
    slug: string
    nameAr: string
    nameFr: string
    nameEn: string
  }> = []
  try {
    const [allCategories, loadedSeo] = await Promise.all([
      categoryService.getCategories(),
      getSeoSettings(),
    ])
    seoSettings = loadedSeo
    footerCategories = allCategories
      .filter((cat) => cat.config?.showInFooter !== false)
      .map((cat) => ({
        slug: cat.slug,
        nameAr: cat.nameAr,
        nameFr: cat.nameFr,
        nameEn: cat.nameEn,
      }))
  } catch {
    seoSettings = await getSeoSettings()
    footerCategories = []
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <MotionProvider>
        <ThemeProvider>
          <CartProvider>
            <CustomerAuthProvider locale={locale}>
              <LocaleDocumentSync locale={locale} />
              <div
                className="storefront-shell flex min-h-screen flex-col relative w-full"
                dir={isRTL ? 'rtl' : 'ltr'}
                lang={locale}
              >
                {/* Skip to content for accessibility */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg"
                >
                  {isRTL ? 'انتقل إلى المحتوى' : locale === 'fr' ? 'Aller au contenu' : 'Skip to content'}
                </a>

                <OrganizationSchema locale={locale} seo={seoSettings} />

                <Header locale={locale} />

                <main id="main-content" className="flex-1 w-full relative">
                  {children}
                </main>

                <Footer locale={locale} categories={footerCategories} />
                <CartDrawer locale={locale} />
                <WhatsAppButton />
                <VisitorTracker />
              </div>
            </CustomerAuthProvider>
          </CartProvider>
        </ThemeProvider>
      </MotionProvider>
    </NextIntlClientProvider>
  )
}

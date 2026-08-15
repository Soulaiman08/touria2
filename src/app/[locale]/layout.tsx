import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { siteConfig } from '@/config/site'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/features/cart/components/CartDrawer'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'

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
  const t = await getTranslations({ locale, namespace: 'site' })

  const description = {
    ar: siteConfig.description.ar,
    fr: siteConfig.description.fr,
    en: siteConfig.description.en,
  }[locale] ?? siteConfig.description.ar

  return {
    title: {
      default: `${siteConfig.name} – ${t('tagline')}`,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    openGraph: {
      title: `${siteConfig.name} – ${t('tagline')}`,
      description,
      locale: locale === 'ar' ? 'ar_MA' : locale === 'fr' ? 'fr_MA' : 'en_US',
      url: `${siteConfig.url}/${locale}`,
    },
    alternates: {
      canonical: `${siteConfig.url}/${locale}`,
      languages: {
        ar: `${siteConfig.url}/ar`,
        fr: `${siteConfig.url}/fr`,
        en: `${siteConfig.url}/en`,
      },
    },
  }
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

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <CartProvider>
          <div className="storefront-shell flex min-h-screen flex-col relative w-full">
            {/* Skip to content for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg"
            >
              {locale === 'ar' ? 'انتقل إلى المحتوى' : locale === 'fr' ? 'Aller au contenu' : 'Skip to content'}
            </a>

            <Header locale={locale} />

            <main id="main-content" className="flex-1 w-full relative">
              {children}
            </main>

            <Footer locale={locale} />
            <CartDrawer locale={locale} />
            <WhatsAppButton />
          </div>
        </CartProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}

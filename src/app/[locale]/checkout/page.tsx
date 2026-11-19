import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BreadcrumbBar } from '@/components/shared/PageNavigation'
import { CheckoutForm } from '@/features/checkout/components/CheckoutForm/CheckoutForm'

interface CheckoutPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    ar: 'إتمام الطلب | ثريا المغربي',
    fr: 'Finaliser la commande | Thuraya Al-Maghribi',
    en: 'Checkout | Thuraya Al-Maghribi',
  }

  return {
    title: titles[locale] ?? titles.ar,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'checkout' })
  const isRTL = locale === 'ar'

  return (
    <div
      className="container-brand page-shell page-stack"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Breadcrumb + Back Button Row ───────────────────── */}
      <BreadcrumbBar
        locale={locale}
        items={[
          {
            label: locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home',
            href: `/${locale}`,
          },
          { label: t('title') },
        ]}
        backHref={`/${locale}/products`}
        backLabel={
          locale === 'ar'
            ? 'العودة للتسوق'
            : locale === 'fr'
              ? 'Continuer vos achats'
              : 'Continue shopping'
        }
      />

      {/* ── Page Title ─────────────────────────────────────── */}
      <div className="pb-6 border-b border-[var(--border)]">
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2 leading-tight"
          style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
        >
          {t('title')}
        </h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xl">
          {locale === 'ar'
            ? 'يرجى ملء المعلومات أدناه لتأكيد طلبك وتوصيله إليكِ.'
            : locale === 'fr'
              ? 'Veuillez remplir les informations ci-dessous pour confirmer votre commande.'
              : 'Please fill in the information below to confirm and deliver your order.'}
        </p>
      </div>

      {/* ── Checkout Form (or Empty Cart state) ──────────── */}
      <CheckoutForm locale={locale} />
    </div>
  )
}

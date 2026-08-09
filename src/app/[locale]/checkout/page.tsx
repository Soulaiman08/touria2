import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { CheckoutForm } from '@/features/checkout/components/CheckoutForm/CheckoutForm'

interface CheckoutPageProps {
  params: Promise<{ locale: string }>
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
      {/* ── Header Top Nav ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <nav className="flex items-center gap-2.5 text-xs text-[var(--text-muted)]">
          <Link href={`/${locale}`} className="hover:text-[#C4622D] transition-colors font-medium">
            {locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home'}
          </Link>
          <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="font-semibold text-[#C4622D]">{t('title')}</span>
        </nav>

        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[#C4622D] transition-colors px-3 py-2 sm:px-4.5 sm:py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[#C4622D]/40 shadow-xs"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
          {locale === 'ar' ? 'العودة للتسوق' : locale === 'fr' ? 'Continuer vos achats' : 'Continue shopping'}
        </Link>
      </div>

      {/* ── Page Title Header ─────────────────────────────────────── */}
      <div className="space-y-2.5 sm:space-y-3.5 text-start pb-5 sm:pb-8 border-b border-[var(--border)]">
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
          {t('title')}
        </h1>
        <p className="text-sm md:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
          {locale === 'ar'
            ? 'يرجى ملء المعلومات أدناه لتأكيد طلبك وتوصيله إليكِ.'
            : locale === 'fr'
            ? 'Veuillez remplir les informations ci-dessous pour confirmer votre commande.'
            : 'Please fill in the information below to confirm and deliver your order.'}
        </p>
      </div>

      {/* ── Checkout Form Container ──────────────────────────────── */}
      <div>
        <CheckoutForm locale={locale} />
      </div>
    </div>
  )
}

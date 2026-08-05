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
    <div className="container-brand py-8 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Breadcrumbs ────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <Link href={`/${locale}`} className="hover:text-[#C4622D] transition-colors">
          {locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home'}
        </Link>
        <ChevronRight className="w-3 h-3 rtl-flip" />
        <span className="font-semibold text-gradient">{t('title')}</span>
      </nav>

      {/* ── Return back link ────────────────────────────────────── */}
      <div>
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:text-[#C4622D] transition-colors"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
          {locale === 'ar' ? 'العودة للتسوق' : locale === 'fr' ? 'Continuer vos achats' : 'Continue shopping'}
        </Link>
      </div>

      <div className="space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          {t('title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {locale === 'ar' ? 'يرجى ملء المعلومات أدناه لتأكيد طلبك وتوصيله إليكِ.' : 'Veuillez remplir les informations ci-dessous pour confirmer votre commande.'}
        </p>
      </div>

      <CheckoutForm locale={locale} />
    </div>
  )
}

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
      {/* ── Breadcrumb + Back Button Row ───────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          paddingBlock: '4px',
        }}
      >
        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <Link
            href={`/${locale}`}
            style={{
              color: 'var(--text-muted)',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            className="hover:text-[#C4622D]"
          >
            {locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home'}
          </Link>
          <ChevronRight
            aria-hidden="true"
            style={{
              width: 13,
              height: 13,
              opacity: 0.5,
              transform: isRTL ? 'rotate(180deg)' : 'none',
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 600, color: '#C4622D' }}>{t('title')}</span>
        </nav>

        {/* Back button */}
        <Link
          href={`/${locale}/products`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            paddingInline: '14px',
            paddingBlock: '8px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
          className="hover:text-[#C4622D] hover:border-[#C4622D]/40"
        >
          <ArrowLeft
            aria-hidden="true"
            style={{
              width: 13,
              height: 13,
              flexShrink: 0,
              transform: isRTL ? 'rotate(180deg)' : 'none',
            }}
          />
          {locale === 'ar'
            ? 'العودة للتسوق'
            : locale === 'fr'
              ? 'Continuer vos achats'
              : 'Continue shopping'}
        </Link>
      </div>

      {/* ── Page Title ─────────────────────────────────────── */}
      <div
        style={{
          paddingBottom: '28px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 800,
            color: 'var(--foreground)',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
            lineHeight: 1.2,
          }}
        >
          {t('title')}
        </h1>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            lineHeight: 1.65,
            maxWidth: '520px',
          }}
        >
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

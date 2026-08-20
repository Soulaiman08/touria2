'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { Truck, Check, Package, ShoppingBag, Clock, ArrowLeft, type LucideIcon } from 'lucide-react'
import type { Order, OrderStatus } from '@/types/order'

interface TrackingPageProps {
  params: Promise<{ locale: string; id: string }>
}

const STEPS: Array<{ status: OrderStatus; labelAr: string; labelFr: string; labelEn: string; icon: LucideIcon }> = [
  { status: 'PENDING', labelAr: 'في الانتظار', labelFr: 'En attente', labelEn: 'Pending', icon: Clock },
  { status: 'CONFIRMED', labelAr: 'تم التأكيد', labelFr: 'Confirmé', labelEn: 'Confirmed', icon: Check },
  { status: 'PROCESSING', labelAr: 'قيد التجهيز', labelFr: 'En préparation', labelEn: 'Processing', icon: Package },
  { status: 'SHIPPED', labelAr: 'تم الشحن', labelFr: 'Expédié', labelEn: 'Shipped', icon: Truck },
  { status: 'DELIVERED', labelAr: 'تم التوصيل', labelFr: 'Livré', labelEn: 'Delivered', icon: Check },
]

export default function OrderTrackingPage({ params }: TrackingPageProps) {
  const { locale, id } = use(params)

  const t = useTranslations('tracking')
  const cartT = useTranslations('cart')

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const isRTL = locale === 'ar'

  useEffect(() => {
    let isMounted = true
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found')
        return res.json()
      })
      .then((res) => {
        if (isMounted) { setOrder(res); setLoading(false) }
      })
      .catch(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [id])

  if (loading) {
    return (
      <div className="container-brand py-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C4622D] mx-auto" />
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{cartT('loading')}</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-brand py-20 text-center space-y-4">
        <div className="text-4xl text-red-500">❌</div>
        <h2 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
          {t('notFound')}
        </h2>
        <Link
          href={`/${locale}`}
          className="inline-block px-6 py-2.5 rounded-xl text-white font-medium hover:bg-[#A34E23]"
          style={{ background: '#C4622D' }}
        >
          {locale === 'ar' ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
        </Link>
      </div>
    )
  }

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status)

  return (
    <div
      className="container-brand page-shell"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ maxWidth: 640, paddingLeft: 'max(16px, 5vw)', paddingRight: 'max(16px, 5vw)' }}
    >
      {/* ── Back link ─────────────────────────────────────────────── */}
      <Link
        href={`/${locale}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 700,
          color: '#C4622D',
          textDecoration: 'none',
          marginBottom: 20,
          border: '1px solid #C4622D',
          borderRadius: 12,
          transition: 'background 0.2s',
        }}
      >
        <ArrowLeft style={{ width: 16, height: 16, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
        {locale === 'ar' ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
      </Link>

      <div
        style={{
          borderRadius: 24,
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* ── Page Header ───────────────────────────────────────────── */}
        <div
          style={{
            padding: '24px 24px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(135deg, rgba(196,98,45,0.04) 0%, transparent 100%)',
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--foreground)', margin: '0 0 4px' }}>
            {t('title')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0 }}>
            {t('orderNumber')}:{' '}
            <span style={{ color: '#C4622D', fontWeight: 800, fontFamily: 'monospace' }}>
              {order.orderNumber}
            </span>
          </p>
        </div>

        {/* ── Status Timeline ────────────────────────────────────────── */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)' }}>
          {/* Progress bar background */}
          <div style={{ position: 'relative', paddingBottom: 4 }}>
            {/* Track line */}
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: isRTL ? 0 : '10%',
                right: isRTL ? '10%' : 0,
                height: 3,
                background: 'var(--border)',
                borderRadius: 99,
                zIndex: 0,
              }}
            />
            {/* Filled track */}
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: isRTL ? 'auto' : '10%',
                right: isRTL ? '10%' : 'auto',
                height: 3,
                width: `${(currentStepIndex / (STEPS.length - 1)) * 80}%`,
                background: 'linear-gradient(90deg, #C4622D, #d97b4a)',
                borderRadius: 99,
                zIndex: 1,
                transition: 'width 0.5s ease',
              }}
            />

            {/* Steps */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', zIndex: 2 }}>
              {STEPS.map((step, idx) => {
                const StepIcon = step.icon
                const isCompleted = idx <= currentStepIndex
                const isCurrent = idx === currentStepIndex
                const stepLabel = locale === 'ar' ? step.labelAr : locale === 'fr' ? step.labelFr : step.labelEn

                return (
                  <div key={step.status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isCompleted ? '#C4622D' : 'var(--bg-subtle)',
                        border: isCurrent ? '3px solid #C4622D' : `2px solid ${isCompleted ? '#C4622D' : 'var(--border)'}`,
                        boxShadow: isCurrent ? '0 0 0 4px rgba(196,98,45,0.12)' : 'none',
                        transition: 'all 0.3s',
                        flexShrink: 0,
                      }}
                    >
                      <StepIcon
                        style={{
                          width: 15,
                          height: 15,
                          color: isCompleted ? '#fff' : 'var(--muted-foreground)',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: isCompleted ? 700 : 500,
                        color: isCompleted ? 'var(--foreground)' : 'var(--muted-foreground)',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {stepLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Order Items ────────────────────────────────────────────── */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>
            {locale === 'ar' ? 'تفاصيل طلبكِ' : 'Détails de votre commande'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {order.items.map((item, idx) => {
              const snap = item.productSnapshot
              const rawSize = snap.selectedSize || ''
              const isNiqabItem = Boolean(
                snap.isNiqab ||
                (snap.nameAr && /نقاب/i.test(snap.nameAr)) ||
                (snap.nameFr && /niqab/i.test(snap.nameFr))
              )
              const hasRealSize =
                !isNiqabItem &&
                rawSize &&
                !['standard', 'one size', 'n/a', 'undefined', 'null'].includes(rawSize.toLowerCase().trim())

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: idx < order.items.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', margin: '0 0 4px', lineHeight: 1.3 }}>
                      {locale === 'ar' ? snap.nameAr : locale === 'fr' ? snap.nameFr : snap.nameEn}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--muted-foreground)', margin: 0 }}>
                      {hasRealSize && (
                        <>
                          <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{rawSize}</span>
                          {' · '}
                        </>
                      )}
                      {cartT('quantity')}: <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{item.quantity}</span>
                    </p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#C4622D', flexShrink: 0 }}>
                    {formatPrice(item.totalPrice, locale)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Price Summary ──────────────────────────────────────────── */}
        <div style={{ padding: '16px 24px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted-foreground)' }}>
              <span>{cartT('subtotal')}</span>
              <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{formatPrice(order.subtotal, locale)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted-foreground)' }}>
              <span>{cartT('shipping')}</span>
              <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{formatPrice(order.shippingCost, locale)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 12,
                marginTop: 4,
                borderTop: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--foreground)' }}>{cartT('total')}</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#C4622D' }}>{formatPrice(order.total, locale)}</span>
            </div>
          </div>

          {/* ── Return button ───────────────────────────────────────── */}
          <div style={{ marginTop: 20 }}>
            <Link
              href={`/${locale}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 20px',
                borderRadius: 12,
                background: 'linear-gradient(90deg, #C4622D, #d97b4a)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(196,98,45,0.22)',
              }}
            >
              <ShoppingBag style={{ width: 15, height: 15 }} />
              {locale === 'ar' ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

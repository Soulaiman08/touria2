'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { CheckCircle2, Truck, ShoppingBag, ArrowRight, Phone, MapPin, User } from 'lucide-react'
import type { Order } from '@/types/order'

interface SuccessPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function CheckoutSuccessPage({ params, searchParams }: SuccessPageProps) {
  const { locale } = use(params)
  const resolvedSearchParams = use(searchParams)
  const orderId = typeof resolvedSearchParams.orderId === 'string' ? resolvedSearchParams.orderId : undefined

  const t = useTranslations('confirmation')
  const cartT = useTranslations('cart')

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(orderId))

  const isRTL = locale === 'ar'

  useEffect(() => {
    if (!orderId) return
    let isMounted = true
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found')
        return res.json()
      })
      .then((res) => {
        if (isMounted) { setOrder(res); setLoading(false) }
      })
      .catch(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [orderId])

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
          {locale === 'ar' ? 'لم يتم العثور على الطلب' : 'Commande introuvable'}
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

  return (
    <div
      className="container-brand page-shell"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ maxWidth: 560, paddingLeft: 'max(16px, 5vw)', paddingRight: 'max(16px, 5vw)' }}
    >
      <div
        style={{
          borderRadius: 24,
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* ── Success Header ──────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(196,98,45,0.06) 0%, rgba(196,98,45,0.02) 100%)',
            padding: '32px 28px 24px',
            textAlign: 'center',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(34,197,94,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 style={{ width: 34, height: 34, color: '#22c55e' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--foreground)', margin: '0 0 6px' }}>
            {t('title')}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted-foreground)', margin: 0 }}>
            {t('subtitle')}
          </p>
        </div>

        {/* ── Order Number ─────────────────────────────────────────── */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(196,98,45,0.04)',
              border: '1px solid rgba(196,98,45,0.15)',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('orderNumber')}
            </span>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#C4622D', fontFamily: 'monospace' }}>
              {order.orderNumber}
            </span>
          </div>
        </div>

        {/* ── Customer Info ─────────────────────────────────────────── */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>
            {locale === 'ar' ? 'معلومات الطلب' : locale === 'fr' ? 'Informations de commande' : 'Order Info'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Name */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User style={{ width: 14, height: 14, color: 'var(--muted-foreground)' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {locale === 'ar' ? 'الاسم' : 'Nom'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)', marginTop: 2 }}>
                  {order.customerName}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone style={{ width: 14, height: 14, color: 'var(--muted-foreground)' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {locale === 'ar' ? 'الهاتف' : 'Téléphone'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)', marginTop: 2, fontFamily: 'monospace' }}>
                  {order.customerPhone}
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin style={{ width: 14, height: 14, color: 'var(--muted-foreground)' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {locale === 'ar' ? 'العنوان' : 'Adresse'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', marginTop: 2, lineHeight: 1.4 }}>
                  {order.address}
                  <span style={{ color: '#C4622D', fontWeight: 700 }}> — {order.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Total ─────────────────────────────────────────────────── */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{cartT('total')}</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#C4622D' }}>{formatPrice(order.total, locale)}</span>
          </div>
        </div>

        {/* ── Info Message ──────────────────────────────────────────── */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)' }}>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(184,150,90,0.3)',
              background: 'rgba(184,150,90,0.05)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <Truck style={{ width: 16, height: 16, color: '#C4622D', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)', margin: '0 0 2px' }}>{t('message')}</p>
              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: 0 }}>
                {t('estimatedDelivery')}: {t('deliveryDays')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────────────────── */}
        <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            href={`/${locale}/orders/${order.id}`}
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
              boxShadow: '0 4px 16px rgba(196,98,45,0.25)',
            }}
          >
            {t('trackOrder')}
            <ArrowRight style={{ width: 15, height: 15, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
          </Link>

          <Link
            href={`/${locale}/products`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 20px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              background: 'var(--bg-subtle)',
            }}
          >
            <ShoppingBag style={{ width: 14, height: 14 }} />
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  )
}

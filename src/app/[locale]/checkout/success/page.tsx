'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { CheckCircle2, Truck, ShoppingBag, ArrowRight, XCircle } from 'lucide-react'
import type { Order } from '@/types/order'
import { BackButton } from '@/components/shared/PageNavigation'

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
        if (isMounted) {
          setOrder(res)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="container-brand py-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--border)] border-t-[var(--accent)] mx-auto" />
        <p className="text-sm text-[var(--text-muted)]">{cartT('loading')}</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-brand py-20 text-center space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error)]">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="font-bold text-lg text-[var(--text-primary)]">
          {locale === 'ar' ? 'لم يتم العثور على الطلب' : locale === 'fr' ? 'Commande introuvable' : 'Order not found'}
        </h2>
        <div className="pt-1 flex justify-center">
          <BackButton
            href={`/${locale}`}
            locale={locale}
            label={locale === 'ar' ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className="container-brand page-shell"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ maxWidth: '35rem' }}
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden shadow-[var(--shadow-sm)]">
        {/* ── Atelier Receipt Header ──────────────────────────────── */}
        <div className="px-6 py-7 text-center border-b border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="w-14 h-16 rounded-t-[999px] rounded-b-xl mx-auto mb-4 flex items-center justify-center bg-[var(--success-bg)] border border-[var(--success-border)]">
            <CheckCircle2 className="w-7 h-7 text-[var(--success)]" />
          </div>
          <h1
            className="text-2xl font-extrabold text-[var(--text-primary)] mb-1.5 text-balance"
            style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
          >
            {t('title')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] m-0 leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* ── Order Number Band ───────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--accent-light)]">
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            {t('orderNumber')}
          </span>
          <span dir="ltr" className="inline-block tabular-nums font-mono text-base font-extrabold text-[var(--accent)]">
            #{order.orderNumber}
          </span>
        </div>

        {/* ── Clean Key-Value Recipient Summary ───────────────────── */}
        <div className="px-6 py-4 border-b border-[var(--border)] divide-y divide-[var(--border-subtle)]">
          <div className="flex justify-between items-center gap-4 py-2.5">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {locale === 'ar' ? 'المستلم' : locale === 'fr' ? 'Destinataire' : 'Recipient'}
            </span>
            <span className="text-sm font-bold text-[var(--text-primary)] text-end">
              {order.customerName}
            </span>
          </div>

          <div className="flex justify-between items-center gap-4 py-2.5">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {locale === 'ar' ? 'الهاتف' : locale === 'fr' ? 'Téléphone' : 'Phone'}
            </span>
            <span dir="ltr" className="tabular-nums font-mono text-sm font-bold text-[var(--text-primary)]">
              {order.customerPhone}
            </span>
          </div>

          <div className="flex justify-between items-start gap-4 py-2.5">
            <span className="text-xs font-medium text-[var(--text-muted)] shrink-0">
              {locale === 'ar' ? 'العنوان' : locale === 'fr' ? 'Adresse' : 'Address'}
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)] text-end leading-snug">
              {order.address} — <span className="text-[var(--accent)] font-bold">{order.city}</span>
            </span>
          </div>
        </div>

        {/* ── Total Row ───────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
          <span className="text-sm font-bold text-[var(--text-primary)]">{cartT('total')}</span>
          <span className="tabular-nums text-xl font-extrabold text-[var(--accent)]">{formatPrice(order.total, locale)}</span>
        </div>

        {/* ── Delivery Reassurance ────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-subtle)]/50">
          <div className="flex items-start gap-2.5">
            <Truck className="w-4 h-4 text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)] m-0 mb-0.5">{t('message')}</p>
              <p className="tabular-nums text-xs text-[var(--text-muted)] m-0">
                {t('estimatedDelivery')}: {t('deliveryDays')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 flex flex-col gap-2.5">
          <Link
            href={`/${locale}/orders/${order.id}`}
            className="btn btn-primary w-full justify-center h-11 rounded-xl text-sm font-bold"
          >
            <span>{t('trackOrder')}</span>
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>

          <Link
            href={`/${locale}/products`}
            className="btn btn-outline w-full justify-center h-11 rounded-xl text-sm font-semibold"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('continueShopping')}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

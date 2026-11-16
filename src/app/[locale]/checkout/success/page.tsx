'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { CheckCircle2, Truck, ShoppingBag, ArrowRight, Phone, MapPin, User, XCircle } from 'lucide-react'
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
        <Link href={`/${locale}`} className="btn btn-primary btn-round">
          {locale === 'ar' ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
        </Link>
      </div>
    )
  }

  return (
    <div
      className="container-brand page-shell"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ maxWidth: 560 }}
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] shadow-sm overflow-hidden">
        {/* ── Success Header ──────────────────────────────────────── */}
        <div className="p-7 text-center border-b border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-[var(--success-bg)] border border-[var(--success-border)]">
            <CheckCircle2 className="w-8 h-8 text-[var(--success)]" />
          </div>
          <h1
            className="text-2xl font-extrabold text-[var(--text-primary)] mb-1.5"
            style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
          >
            {t('title')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] m-0">
            {t('subtitle')}
          </p>
        </div>

        {/* ── Order Number ─────────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-[var(--border)]">
          <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)]">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              {t('orderNumber')}
            </span>
            <span className="tabular-nums font-mono text-base font-extrabold text-[var(--accent)]">
              {order.orderNumber}
            </span>
          </div>
        </div>

        {/* ── Customer Info ─────────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-[var(--border)]">
          <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3.5">
            {locale === 'ar' ? 'معلومات الطلب' : locale === 'fr' ? 'Informations de commande' : 'Order Info'}
          </h2>

          <div className="flex flex-col gap-3">
            {/* Name */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {locale === 'ar' ? 'الاسم' : locale === 'fr' ? 'Nom' : 'Name'}
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                  {order.customerName}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {locale === 'ar' ? 'الهاتف' : locale === 'fr' ? 'Téléphone' : 'Phone'}
                </div>
                <div dir="ltr" className="tabular-nums font-mono text-sm font-bold text-[var(--text-primary)] mt-0.5 text-start">
                  {order.customerPhone}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {locale === 'ar' ? 'العنوان' : locale === 'fr' ? 'Adresse' : 'Address'}
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5 leading-snug">
                  {order.address}
                  <span className="text-[var(--accent)] font-bold"> — {order.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Total ─────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
          <span className="text-sm font-bold text-[var(--text-primary)]">{cartT('total')}</span>
          <span className="tabular-nums text-xl font-extrabold text-[var(--accent)]">{formatPrice(order.total, locale)}</span>
        </div>

        {/* ── Info Message ──────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <div className="p-3.5 rounded-xl border border-[var(--accent-ring)] bg-[var(--accent-light)] flex items-start gap-2.5">
            <Truck className="w-4 h-4 text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)] m-0 mb-0.5">{t('message')}</p>
              <p className="text-[11.5px] text-[var(--text-muted)] m-0">
                {t('estimatedDelivery')}: {t('deliveryDays')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────────────────── */}
        <div className="p-6 flex flex-col gap-2.5">
          <Link
            href={`/${locale}/orders/${order.id}`}
            className="btn btn-primary w-full justify-center py-3 rounded-xl text-sm font-bold"
          >
            <span>{t('trackOrder')}</span>
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>

          <Link
            href={`/${locale}/products`}
            className="btn btn-outline w-full justify-center py-3 rounded-xl text-sm font-semibold"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('continueShopping')}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

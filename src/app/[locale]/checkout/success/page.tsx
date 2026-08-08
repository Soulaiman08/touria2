'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { CheckCircle2, Truck, ShoppingBag, ArrowRight } from 'lucide-react'
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
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
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
    <div className="container-brand page-shell max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-8 rounded-3xl border text-center space-y-6 shadow-xl" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-green-50 dark:bg-green-950/20 text-green-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--foreground)' }}>{t('title')}</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{t('subtitle')}</p>
        </div>

        {/* Order Number Box */}
        <div className="p-4 rounded-2xl bg-[rgba(196,98,45,0.04)] border border-[rgba(196,98,45,0.15)] flex justify-between items-center text-sm font-semibold">
          <span style={{ color: 'var(--muted-foreground)' }}>{t('orderNumber')}</span>
          <span className="text-[#C4622D]">{order.orderNumber}</span>
        </div>

        {/* Order Details Details */}
        <div className="border-t pt-6 space-y-4 text-start text-sm" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-foreground)' }}>{locale === 'ar' ? 'الاسم' : 'Nom'}</span>
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-foreground)' }}>{locale === 'ar' ? 'الهاتف' : 'Téléphone'}</span>
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>{order.customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-foreground)' }}>{locale === 'ar' ? 'العنوان' : 'Adresse'}</span>
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
              {order.address}, {order.city}
            </span>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <span>{cartT('total')}</span>
            <span className="text-[#C4622D]">{formatPrice(order.total, locale)}</span>
          </div>
        </div>

        {/* Info Message Box */}
        <div className="p-4 rounded-xl border flex gap-3 text-start" style={{ borderColor: '#b8965a', background: 'rgba(184,150,90,0.04)' }}>
          <Truck className="w-5 h-5 text-[#C4622D] flex-shrink-0" />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{t('message')}</p>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
              {t('estimatedDelivery')}: {t('deliveryDays')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href={`/${locale}/products`}
            className="flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:bg-[#A34E23] flex items-center justify-center gap-2"
            style={{ background: '#C4622D' }}
          >
            <ShoppingBag className="w-5 h-5" />
            {t('continueShopping')}
          </Link>
          <Link
            href={`/${locale}/orders/${order.id}`}
            className="flex-1 py-3 rounded-xl font-semibold border transition-all duration-200 hover:bg-[rgba(196,98,45,0.05)] flex items-center justify-center gap-1.5"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            {t('trackOrder')}
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>
    </div>
  )
}

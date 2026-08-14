'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { Truck, Check, Package, ShoppingBag, Clock, type LucideIcon } from 'lucide-react'
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

  // Get index of current step
  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status)

  return (
    <div className="container-brand page-shell max-w-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-6 md:p-8 rounded-3xl border space-y-8 shadow-xl" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        {/* Header Title */}
        <div className="text-center space-y-2 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--foreground)' }}>{t('title')}</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {t('orderNumber')}: <span className="font-semibold text-[#C4622D]">{order.orderNumber}</span>
          </p>
        </div>

        {/* ── Status Timeline/Tracker ─────────────────────────── */}
        <div className="relative py-4" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Progress bar line */}
          <div
            className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-muted rounded pointer-events-none"
            style={{ background: 'var(--muted)' }}
          />
          <div
            className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-[#C4622D] rounded transition-all duration-500 pointer-events-none"
            style={{
              width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
              left: isRTL ? 'auto' : 0,
              right: isRTL ? 0 : 'auto',
            }}
          />

          {/* Timeline Nodes */}
          <div className="relative flex justify-between">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon
              const isCompleted = idx <= currentStepIndex
              const isCurrent = idx === currentStepIndex
              const stepLabel = locale === 'ar' ? step.labelAr : locale === 'fr' ? step.labelFr : step.labelEn

              return (
                <div key={step.status} className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#C4622D] border-transparent text-white scale-110 shadow-md'
                        : 'bg-white dark:bg-[#2a1508] border-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-4 ring-orange-100 dark:ring-orange-950' : ''}`}
                    style={{ borderColor: isCompleted ? 'transparent' : 'var(--border)' }}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {stepLabel}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Order Summary Detail lists ──────────────────────── */}
        <div className="space-y-4 border-t pt-6 text-sm" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>
            {locale === 'ar' ? 'تفاصيل طلبكِ' : 'Détails de votre commande'}
          </h3>

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {order.items.map((item) => {
              const snap = item.productSnapshot
              return (
                <div key={item.id} className="py-3.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {locale === 'ar' ? snap.nameAr : locale === 'fr' ? snap.nameFr : snap.nameEn}
                    </p>
                    <p className="mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {cartT('size')}: {snap.selectedSize} | {cartT('quantity')}: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                    {formatPrice(item.totalPrice, locale)}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="border-t pt-4 space-y-2 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            <div className="flex justify-between">
              <span>{cartT('subtotal')}</span>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {formatPrice(order.subtotal, locale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{cartT('shipping')}</span>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {formatPrice(order.shippingCost, locale)}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-sm" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              <span>{cartT('total')}</span>
              <span className="text-[#C4622D]">{formatPrice(order.total, locale)}</span>
            </div>
          </div>
        </div>

        {/* Home Link */}
        <div className="pt-4 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex py-3 px-8 rounded-xl font-semibold text-white transition-all duration-200 hover:bg-[#A34E23] items-center gap-2"
            style={{ background: '#C4622D' }}
          >
            <ShoppingBag className="w-5 h-5" />
            {locale === 'ar' ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
          </Link>
        </div>
      </div>
    </div>
  )
}

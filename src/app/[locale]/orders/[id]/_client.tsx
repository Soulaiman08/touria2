'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/utils'
import { Truck, Check, Package, ShoppingBag, Clock, ArrowLeft, XCircle, type LucideIcon } from 'lucide-react'
import type { Order, OrderStatus, ProductSnapshot } from '@/types/order'

interface TrackingPageProps {
  params: Promise<{ locale: string; id: string }>
}

const STEPS: Array<{ status: OrderStatus; labelAr: string; labelFr: string; labelEn: string; icon: LucideIcon }> = [
  { status: 'PENDING', labelAr: 'الانتظار', labelFr: 'En attente', labelEn: 'Pending', icon: Clock },
  { status: 'CONFIRMED', labelAr: 'التأكيد', labelFr: 'Confirmé', labelEn: 'Confirmed', icon: Check },
  { status: 'PROCESSING', labelAr: 'التجهيز', labelFr: 'Préparation', labelEn: 'Processing', icon: Package },
  { status: 'SHIPPED', labelAr: 'الشحن', labelFr: 'Expédié', labelEn: 'Shipped', icon: Truck },
  { status: 'DELIVERED', labelAr: 'التوصيل', labelFr: 'Livré', labelEn: 'Delivered', icon: Check },
]

export function OrderTrackingPageClient({ params }: TrackingPageProps) {
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
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id])

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
          {t('notFound')}
        </h2>
        <Link href={`/${locale}`} className="btn btn-primary btn-round">
          {locale === 'ar' ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
        </Link>
      </div>
    )
  }

  const currentStepIndex = Math.max(0, STEPS.findIndex((s) => s.status === order.status))

  return (
    <div
      className="container-brand page-shell"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ maxWidth: '41.25rem' }}
    >
      {/* ── Back link ─────────────────────────────────────────────── */}
      <div className="mb-5">
        <Link href={`/${locale}/orders`} className="btn btn-outline btn-sm btn-round">
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{locale === 'ar' ? 'طلباتي' : locale === 'fr' ? 'Mes commandes' : 'My Orders'}</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
        {/* ── Page Header ───────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 border-b border-[var(--border)] bg-[var(--bg-subtle)] flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1
              className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] mb-1"
              style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
            >
              {t('title')}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] m-0">
              {t('orderNumber')}:{' '}
              <span className="tabular-nums font-mono text-[var(--accent)] font-extrabold">
                #{order.orderNumber}
              </span>
            </p>
          </div>
        </div>

        {/* ── Mobile-Safe 5-Step Status Timeline ───────────────────── */}
        <div className="px-3 py-6 sm:p-6 border-b border-[var(--border)]">
          <div className="relative">
            {/* Track background */}
            <div
              className="absolute top-[17px] h-[2px] bg-[var(--border)] rounded-full z-0"
              style={{
                left: '10%',
                right: '10%',
              }}
            />
            {/* Filled progress track */}
            <div
              className="absolute top-[17px] h-[2px] bg-[var(--accent)] rounded-full z-[1] transition-all duration-500"
              style={{
                left: isRTL ? 'auto' : '10%',
                right: isRTL ? '10%' : 'auto',
                width: `${(currentStepIndex / (STEPS.length - 1)) * 80}%`,
              }}
            />

            {/* Steps Grid */}
            <div className="relative grid grid-cols-5 gap-1 z-[2]">
              {STEPS.map((step, idx) => {
                const StepIcon = step.icon
                const isCompleted = idx <= currentStepIndex
                const isCurrent = idx === currentStepIndex
                const stepLabel = locale === 'ar' ? step.labelAr : locale === 'fr' ? step.labelFr : step.labelEn

                return (
                  <div key={step.status} className="flex flex-col items-center gap-2 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 border-2 ${
                        isCompleted
                          ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                          : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-muted)]'
                      }`}
                      style={{
                        boxShadow: isCurrent ? '0 0 0 4px var(--accent-light)' : 'none',
                      }}
                    >
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs text-center leading-tight px-0.5 ${
                        isCompleted ? 'font-bold text-[var(--text-primary)]' : 'font-medium text-[var(--text-muted)]'
                      }`}
                    >
                      {stepLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Status History Remarks ─────────────────────────────────── */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="px-5 py-5 sm:px-6 border-b border-[var(--border)]">
            <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3.5">
              {locale === 'ar' ? 'سجل تحديثات الحالة' : locale === 'fr' ? 'Historique des statuts' : 'Status update history'}
            </h2>
            <div className="border-s-2 border-[var(--border)] ps-4 ms-1.5 flex flex-col gap-3.5">
              {order.statusHistory.map((hist) => {
                const stepObj = STEPS.find((s) => s.status === hist.status)
                const statusLabel = stepObj
                  ? (locale === 'ar' ? stepObj.labelAr : locale === 'fr' ? stepObj.labelFr : stepObj.labelEn)
                  : hist.status === 'CANCELLED'
                    ? (locale === 'ar' ? 'ملغى' : locale === 'fr' ? 'Annulée' : 'Cancelled')
                    : hist.status === 'RETURNED'
                      ? (locale === 'ar' ? 'مُرجَع' : locale === 'fr' ? 'Retournée' : 'Returned')
                      : hist.status

                return (
                  <div key={hist.id} className="relative flex flex-col gap-1">
                    <div
                      className="absolute -start-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--accent)] border-2 border-[var(--card-bg)]"
                    />
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      {statusLabel}
                    </div>
                    <span className="tabular-nums text-[11px] text-[var(--text-muted)]">
                      {new Date(hist.createdAt).toLocaleString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')}
                    </span>
                    {hist.note?.trim() && (
                      <p className="text-xs text-[var(--text-primary)] leading-relaxed mt-1 mb-0 whitespace-pre-wrap break-words bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl px-3 py-2">
                        {hist.note}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Order Items ────────────────────────────────────────────── */}
        <div className="px-5 py-5 sm:px-6 border-b border-[var(--border)]">
          <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3.5">
            {locale === 'ar' ? 'تفاصيل طلبكِ' : locale === 'fr' ? 'Détails de votre commande' : 'Order details'}
          </h2>

          <div className="flex flex-col divide-y divide-[var(--border)]">
            {order.items.map((item) => {
              const snap = item.productSnapshot as ProductSnapshot
              const rawSize = snap.selectedSize || ''
              const isNiqabItem = Boolean(snap.isNiqab)
              const hasRealSize =
                !isNiqabItem &&
                rawSize &&
                !['standard', 'one size', 'n/a', 'undefined', 'null'].includes(rawSize.toLowerCase().trim())
              const colorName = snap.selectedColor?.nameAr || snap.selectedColor?.nameFr || snap.selectedColor?.nameEn || ''
              const niqabs = Array.isArray(snap.niqabs) ? snap.niqabs : []
              const itemName = locale === 'ar' ? snap.nameAr : locale === 'fr' ? snap.nameFr : snap.nameEn

              return (
                <div key={item.id} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
                  {snap.mainImage ? (
                    <Image
                      src={snap.mainImage}
                      alt={itemName}
                      width={56}
                      height={72}
                      referrerPolicy="no-referrer"
                      className="w-14 h-[72px] rounded-xl object-cover flex-shrink-0 border border-[var(--border)] bg-[var(--bg-muted)]"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = '/images/brand/logo-icon.png'
                      }}
                    />
                  ) : (
                    <div className="w-14 h-[72px] rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center flex-shrink-0 border border-[var(--border)] text-[var(--text-muted)]">
                      <ShoppingBag className="w-5 h-5 opacity-50" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--text-primary)] mb-1 leading-snug">
                      {itemName}
                    </p>
                    <p className="tabular-nums text-xs text-[var(--text-muted)] m-0">
                      {[
                        hasRealSize ? rawSize : '',
                        colorName,
                        `${cartT('quantity')}: ${item.quantity}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>

                    {niqabs.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        {niqabs.map((niqab, nIdx) => {
                          const niqabName = locale === 'ar' ? niqab.nameAr : locale === 'fr' ? niqab.nameFr : niqab.nameEn
                          const niqabColor = niqab.color?.nameAr || niqab.color?.nameFr || niqab.color?.nameEn || ''
                          return (
                            <div
                              key={`${niqab.id}-${nIdx}`}
                              className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-lg border border-[var(--border)]"
                            >
                              {niqab.image && (
                                <Image
                                  src={niqab.image}
                                  alt={niqabName}
                                  width={20}
                                  height={20}
                                  referrerPolicy="no-referrer"
                                  className="rounded object-cover flex-shrink-0"
                                  onError={(e) => {
                                    ;(e.currentTarget as HTMLImageElement).src = '/images/brand/logo-icon.png'
                                  }}
                                />
                              )}
                              <span className="font-semibold text-[var(--accent)]">
                                {locale === 'ar' ? 'نقاب' : 'Niqab'}: {niqabName}
                              </span>
                              {niqabColor && (
                                <>
                                  <span className="opacity-50">·</span>
                                  <span>{niqabColor}</span>
                                </>
                              )}
                              <span className="tabular-nums">×{niqab.quantity}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <span className="tabular-nums text-sm font-extrabold text-[var(--accent)] flex-shrink-0">
                    {formatPrice(item.totalPrice, locale)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Delivery & Admin Notes ─────────────────────────────────── */}
        {order.notes?.trim() && (
          <div className="px-5 py-4 sm:px-6 border-b border-[var(--border)] bg-[var(--bg-subtle)]">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
              {locale === 'ar' ? 'ملاحظات التوصيل' : locale === 'fr' ? 'Notes de livraison' : 'Delivery notes'}
            </h3>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed m-0 whitespace-pre-wrap break-words">
              {order.notes}
            </p>
          </div>
        )}

        {order.adminNotes?.trim() && (
          <div className="px-5 py-4 sm:px-6 border-b border-[var(--border)] bg-[var(--accent-light)]">
            <h3 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-1.5">
              {locale === 'ar' ? 'ملاحظات الإدارة' : locale === 'fr' ? 'Notes de l\'administration' : 'Admin notes'}
            </h3>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed m-0 whitespace-pre-wrap break-words">
              {order.adminNotes}
            </p>
          </div>
        )}

        {/* ── Price Summary ──────────────────────────────────────────── */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-[var(--text-muted)]">
              <span>{cartT('subtotal')}</span>
              <span className="tabular-nums font-semibold text-[var(--text-primary)]">{formatPrice(order.subtotal, locale)}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--text-muted)]">
              <span>{cartT('shipping')}</span>
              <span className="tabular-nums font-semibold text-[var(--text-primary)]">{formatPrice(order.shippingCost, locale)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 mt-1 border-t border-[var(--border)]">
              <span className="text-base font-extrabold text-[var(--text-primary)]">{cartT('total')}</span>
              <span className="tabular-nums text-xl font-extrabold text-[var(--accent)]">{formatPrice(order.total, locale)}</span>
            </div>
          </div>

          <div className="mt-5">
            <Link href={`/${locale}`} className="btn btn-primary w-full justify-center h-11 rounded-xl text-sm font-bold">
              <ShoppingBag className="w-4 h-4" />
              <span>{locale === 'ar' ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

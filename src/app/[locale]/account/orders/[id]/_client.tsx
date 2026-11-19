'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Clock, RefreshCw, Truck, XCircle } from 'lucide-react'
import type { ProductSnapshot } from '@/types/order'
import { BackButton } from '@/components/shared/PageNavigation'

interface AccountOrderDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

interface AccountOrder {
  id: string
  orderNumber: string
  status: string
  customerName: string
  customerPhone: string
  customerPhone2: string | null
  customerEmail: string | null
  region: string
  city: string
  district: string | null
  address: string
  postalCode: string | null
  notes: string | null
  subtotal: number
  shippingCost: number
  discountAmount: number
  total: number
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    productSnapshot: ProductSnapshot
  }>
  statusHistory: Array<{ id: string; status: string; note: string | null; createdAt: string }>
  createdAt: string
}

const STATUS_LABELS: Record<string, [string, string, string]> = {
  PENDING: ['في الانتظار', 'En attente', 'Pending'],
  CONFIRMED: ['تم التأكيد', 'Confirmé', 'Confirmed'],
  PROCESSING: ['قيد التجهيز', 'En préparation', 'Processing'],
  SHIPPED: ['تم الشحن', 'Expédié', 'Shipped'],
  DELIVERED: ['تم التوصيل', 'Livré', 'Delivered'],
  CANCELLED: ['ملغى', 'Annulé', 'Cancelled'],
  RETURNED: ['مُرجَع', 'Retourné', 'Returned'],
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'DELIVERED':
      return {
        icon: CheckCircle2,
        color: 'var(--success)',
        bg: 'var(--success-bg)',
        border: 'var(--success-border)',
      }
    case 'SHIPPED':
    case 'PROCESSING':
    case 'CONFIRMED':
      return {
        icon: status === 'SHIPPED' ? Truck : RefreshCw,
        color: 'var(--accent)',
        bg: 'var(--accent-light)',
        border: 'var(--accent-ring)',
      }
    case 'CANCELLED':
    case 'RETURNED':
      return {
        icon: XCircle,
        color: 'var(--error)',
        bg: 'var(--error-bg)',
        border: 'var(--error-border)',
      }
    default:
      return {
        icon: Clock,
        color: 'var(--gold)',
        bg: 'var(--gold-bg)',
        border: 'var(--gold-ring)',
      }
  }
}

export function AccountOrderDetailPageClient({ params }: AccountOrderDetailPageProps) {
  const { locale, id } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<AccountOrder | null>(null)

  const t = (key: string): string => {
    const map: Record<string, [string, string, string]> = {
      title: ['تفاصيل الطلب', 'Détails de la commande', 'Order details'],
      loading: ['جاري التحميل...', 'Chargement...', 'Loading...'],
      notFound: ['الطلب غير موجود', 'Commande introuvable', 'Order not found'],
      notFoundDesc: ['لا يمكنك الوصول إلى هذا الطلب', 'Vous ne pouvez pas accéder à cette commande', 'You cannot access this order'],
      backOrders: ['العودة لطلباتي', 'Retour à mes commandes', 'Back to my orders'],
      items: ['المنتجات', 'Articles', 'Items'],
      address: ['عنوان التوصيل', 'Adresse de livraison', 'Shipping address'],
      payment: ['الدفع', 'Paiement', 'Payment'],
      cod: ['الدفع عند الاستلام', 'Paiement à la livraison', 'Cash on delivery'],
      subtotal: ['المجموع الفرعي', 'Sous-total', 'Subtotal'],
      shipping: ['التوصيل', 'Livraison', 'Shipping'],
      total: ['المجموع', 'Total', 'Total'],
      quantity: ['الكمية', 'Quantité', 'Qty'],
      orderDate: ['تاريخ الطلب', 'Date de la commande', 'Order date'],
      notes: ['ملاحظات', 'Notes', 'Notes'],
    }
    const entry = map[key]
    if (!entry) return key
    return locale === 'ar' ? entry[0] : locale === 'fr' ? entry[1] : entry[2]
  }

  useEffect(() => {
    let isMounted = true
    fetch(`/api/customer/orders/${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then((res) => {
        if (res.status === 401) throw new Error('not-authenticated')
        if (!res.ok) throw new Error('not-found')
        return res.json()
      })
      .then((data) => {
        if (isMounted) setOrder(data.order)
      })
      .catch((err: Error) => {
        if (!isMounted) return
        if (err.message === 'not-authenticated') {
          router.replace(`/${locale}/login`)
        } else {
          setOrder(null)
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id, locale, router])

  const statusLabel = (status: string) => {
    const entry = STATUS_LABELS[status]
    if (!entry) return status
    return locale === 'ar' ? entry[0] : locale === 'fr' ? entry[1] : entry[2]
  }

  const fmt = (n: number) => n.toLocaleString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')

  if (loading) {
    return (
      <div className="container-brand py-20 text-center space-y-4">
        <div className="animate-spin mx-auto h-10 w-10 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
        <p className="text-sm text-[var(--text-muted)]">{t('loading')}</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-brand py-20 text-center space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error)]">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('notFound')}</h2>
        <p className="text-sm text-[var(--text-muted)]">{t('notFoundDesc')}</p>
        <Link href={`/${locale}/account/orders`} className="btn btn-primary btn-round">
          {t('backOrders')}
        </Link>
      </div>
    )
  }

  const snapshotName = (snap: ProductSnapshot) =>
    (locale === 'ar' ? snap.nameAr : locale === 'fr' ? snap.nameFr : snap.nameEn) || snap.nameAr || snap.nameFr || snap.nameEn || ''

  const addressParts = [
    order.address,
    order.district,
    order.city,
    order.region,
    order.postalCode,
  ].filter(Boolean)

  const st = getStatusStyle(order.status)
  const StatusIcon = st.icon

  return (
    <div className="container-brand page-shell" dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: '46.25rem' }}>
      <div className="mb-5">
        <BackButton href={`/${locale}/account/orders`} locale={locale} label={t('backOrders')} />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1
          className="tabular-nums text-2xl font-extrabold text-[var(--text-primary)] m-0"
          style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
        >
          {t('title')}{' '}
          <span dir="ltr" className="inline-block font-mono text-[var(--accent)]">
            #{order.orderNumber}
          </span>
        </h1>
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border"
          style={{
            color: st.color,
            background: st.bg,
            borderColor: st.border,
          }}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusLabel(order.status)}</span>
        </span>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-bold text-[var(--text-primary)]">{t('items')}</h2>
          <div className="divide-y divide-[var(--border)]">
            {order.items.map((item) => {
              const snap = item.productSnapshot
              const colorName = locale === 'ar'
                ? snap.selectedColor?.nameAr
                : locale === 'fr'
                  ? snap.selectedColor?.nameFr
                  : snap.selectedColor?.nameEn
              return (
                <div key={item.id} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
                  {snap.mainImage ? (
                    <Image
                      src={snap.mainImage}
                      alt={snapshotName(snap)}
                      width={60}
                      height={76}
                      referrerPolicy="no-referrer"
                      className="w-[3.75rem] h-[4.75rem] rounded-xl object-cover border border-[var(--border)] bg-[var(--bg-muted)] flex-shrink-0"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = '/images/brand/logo-icon.png'
                      }}
                    />
                  ) : (
                    <div className="flex w-[3.75rem] h-[4.75rem] items-center justify-center rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-[var(--text-primary)] m-0 leading-snug">{snapshotName(snap)}</p>
                    <p className="tabular-nums mt-1 text-xs text-[var(--text-muted)] m-0">
                      {[
                        snap.selectedSize || '',
                        colorName || snap.selectedColor?.nameAr || '',
                        `${t('quantity')}: ${item.quantity}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    {snap.niqabs && snap.niqabs.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {snap.niqabs.map((n, nIdx) => {
                          const niqabName = locale === 'ar' ? n.nameAr : locale === 'fr' ? n.nameFr : n.nameEn
                          const niqabColor = n.color?.nameAr || n.color?.nameFr || n.color?.nameEn || ''
                          return (
                            <div
                              key={`${n.id}-${nIdx}`}
                              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs bg-[var(--bg-subtle)] border border-[var(--border)]"
                            >
                              {n.image && (
                                <Image
                                  src={n.image}
                                  alt={niqabName}
                                  width={20}
                                  height={20}
                                  referrerPolicy="no-referrer"
                                  className="w-5 h-5 rounded object-cover flex-shrink-0"
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
                                  <span className="text-[var(--text-muted)]">·</span>
                                  <span className="text-[var(--text-muted)]">{niqabColor}</span>
                                </>
                              )}
                              <span className="tabular-nums text-[var(--text-muted)]">×{n.quantity}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <p className="tabular-nums font-extrabold text-sm text-[var(--accent)] whitespace-nowrap m-0">
                    {fmt(item.totalPrice)} MAD
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 space-y-2 border-t border-[var(--border)] pt-4">
            <div className="flex justify-between text-sm text-[var(--text-muted)]">
              <span>{t('subtotal')}</span>
              <span className="tabular-nums font-medium text-[var(--text-primary)]">{fmt(order.subtotal)} MAD</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--text-muted)]">
              <span>{t('shipping')}</span>
              <span className="tabular-nums font-medium text-[var(--text-primary)]">{fmt(order.shippingCost)} MAD</span>
            </div>
            <div className="flex justify-between font-extrabold text-base text-[var(--text-primary)] pt-2 border-t border-[var(--border-subtle)]">
              <span>{t('total')}</span>
              <span className="tabular-nums text-[var(--accent)]">{fmt(order.total)} MAD</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-bold text-[var(--text-primary)]">{t('address')}</h2>
            <p className="text-sm font-semibold text-[var(--text-primary)] m-0">{order.customerName}</p>
            <p className="tabular-nums mt-1 text-sm text-[var(--text-muted)] m-0" dir="ltr" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {order.customerPhone}
              {order.customerPhone2 ? ` · ${order.customerPhone2}` : ''}
            </p>
            <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed m-0">{addressParts.join(' — ')}</p>
            {order.notes && (
              <p className="mt-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] p-3 text-xs m-0">
                <span className="font-bold text-[var(--text-primary)]">{t('notes')}: </span>
                <span className="text-[var(--text-muted)]">{order.notes}</span>
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-bold text-[var(--text-primary)]">{t('payment')}</h2>
            <p className="text-sm text-[var(--text-muted)] m-0">{t('cod')}</p>
            <p className="tabular-nums mt-3 text-xs text-[var(--text-muted)] m-0">
              {t('orderDate')}: {new Date(order.createdAt).toLocaleString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

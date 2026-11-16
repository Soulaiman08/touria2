'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, XCircle } from 'lucide-react'
import type { ProductSnapshot } from '@/types/order'

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

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#A68246',
  CONFIRMED: '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED: '#0ea5e9',
  DELIVERED: '#16a34a',
  CANCELLED: '#dc2626',
  RETURNED: '#dc2626',
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
      status: ['الحالة', 'Statut', 'Status'],
      items: ['المنتجات', 'Articles', 'Items'],
      address: ['عنوان التوصيل', 'Adresse de livraison', 'Shipping address'],
      payment: ['الدفع', 'Paiement', 'Payment'],
      cod: ['الدفع عند الاستلام', 'Paiement à la livraison', 'Cash on delivery'],
      subtotal: ['المجموع الفرعي', 'Sous-total', 'Subtotal'],
      shipping: ['التوصيل', 'Livraison', 'Shipping'],
      total: ['المجموع', 'Total', 'Total'],
      quantity: ['الكمية', 'Quantité', 'Qty'],
      unitPrice: ['سعر الوحدة', 'Prix unitaire', 'Unit price'],
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

  return (
    <div className="container-brand page-shell" dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: 720 }}>
      <Link href={`/${locale}/account/orders`} className="btn btn-outline btn-sm btn-round mb-5">
        <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
        <span>{t('backOrders')}</span>
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1
          className="tabular-nums text-2xl font-extrabold text-[var(--text-primary)]"
          style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
        >
          {t('title')} #{order.orderNumber}
        </h1>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ background: STATUS_COLORS[order.status] ?? '#6b7280' }}
        >
          {statusLabel(order.status)}
        </span>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6">
          <h2 className="mb-4 font-bold text-[var(--text-primary)]">{t('items')}</h2>
          <div className="space-y-4">
            {order.items.map((item) => {
              const snap = item.productSnapshot
              return (
                <div key={item.id} className="flex items-start gap-4">
                  {snap.mainImage ? (
                    <Image
                      src={snap.mainImage}
                      alt={snapshotName(snap)}
                      width={64}
                      height={64}
                      referrerPolicy="no-referrer"
                      className="rounded-xl object-cover border border-[var(--border)] bg-[var(--bg-muted)]"
                      style={{ width: 64, height: 64 }}
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = '/images/brand/logo-icon.png'
                      }}
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--bg-muted)] border border-[var(--border)]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-[var(--text-primary)]">{snapshotName(snap)}</p>
                    <p className="tabular-nums mt-0.5 text-xs text-[var(--text-muted)]">
                      {snap.selectedSize ? ` ${snap.selectedSize}` : ''}
                      {snap.selectedColor?.nameAr ? ` · ${snap.selectedColor.nameAr}` : ''}
                      {' · '}{t('quantity')}: {item.quantity}
                    </p>
                    {snap.niqabs && snap.niqabs.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        {snap.niqabs.map((n, nIdx) => {
                          const niqabName = locale === 'ar' ? n.nameAr : locale === 'fr' ? n.nameFr : n.nameEn
                          const niqabColor = n.color?.nameAr || n.color?.nameFr || n.color?.nameEn || ''
                          return (
                            <div
                              key={`${n.id}-${nIdx}`}
                              className="flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs bg-[var(--accent-light)] border border-[var(--accent-ring)]"
                            >
                              {n.image && (
                                <Image
                                  src={n.image}
                                  alt={niqabName}
                                  width={20}
                                  height={20}
                                  referrerPolicy="no-referrer"
                                  className="rounded object-cover"
                                  style={{ width: 20, height: 20, flexShrink: 0 }}
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
                                  <span className="text-[var(--text-muted)]">—</span>
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
                  <p className="tabular-nums font-extrabold text-sm text-[var(--accent)] whitespace-nowrap">
                    {fmt(item.totalPrice)} MAD
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-6 space-y-2 border-t border-[var(--border)] pt-4">
            <div className="flex justify-between text-sm text-[var(--text-muted)]">
              <span>{t('subtotal')}</span>
              <span className="tabular-nums">{fmt(order.subtotal)} MAD</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--text-muted)]">
              <span>{t('shipping')}</span>
              <span className="tabular-nums">{fmt(order.shippingCost)} MAD</span>
            </div>
            <div className="flex justify-between font-extrabold text-base text-[var(--text-primary)] pt-1">
              <span>{t('total')}</span>
              <span className="tabular-nums text-[var(--accent)]">{fmt(order.total)} MAD</span>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6">
            <h2 className="mb-3 font-bold text-[var(--text-primary)]">{t('address')}</h2>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{order.customerName}</p>
            <p className="tabular-nums mt-0.5 text-sm text-[var(--text-muted)]">
              {order.customerPhone}
              {order.customerPhone2 ? ` · ${order.customerPhone2}` : ''}
            </p>
            <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">{addressParts.join(' — ')}</p>
            {order.notes && (
              <p className="mt-3 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] p-3 text-xs">
                <span className="font-bold text-[var(--text-primary)]">{t('notes')}: </span>
                <span className="text-[var(--text-muted)]">{order.notes}</span>
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6">
            <h2 className="mb-3 font-bold text-[var(--text-primary)]">{t('payment')}</h2>
            <p className="text-sm text-[var(--text-muted)]">{t('cod')}</p>
            <p className="tabular-nums mt-3 text-xs text-[var(--text-muted)]">
              {t('orderDate')}: {new Date(order.createdAt).toLocaleString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

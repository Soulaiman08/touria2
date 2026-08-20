'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2 } from 'lucide-react'
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
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED: '#0ea5e9',
  DELIVERED: '#22c55e',
  CANCELLED: '#ef4444',
  RETURNED: '#ef4444',
}

export default function AccountOrderDetailPage({ params }: AccountOrderDetailPageProps) {
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
      .then((data) => { if (isMounted) setOrder(data.order) })
      .catch((err: Error) => {
        if (!isMounted) return
        if (err.message === 'not-authenticated') {
          router.replace(`/${locale}/login`)
        } else {
          setOrder(null)
        }
      })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
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
        <div className="animate-spin mx-auto h-10 w-10 rounded-full border-b-2 border-[#C4622D]" />
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{t('loading')}</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-brand py-20 text-center space-y-4">
        <div className="text-4xl">❌</div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{t('notFound')}</h2>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{t('notFoundDesc')}</p>
        <Link
          href={`/${locale}/account/orders`}
          className="inline-block rounded-xl px-6 py-2.5 font-medium text-white hover:bg-[#A34E23]"
          style={{ background: '#C4622D' }}
        >
          {t('backOrders')}
        </Link>
      </div>
    )
  }

  const snapshotName = (snap: ProductSnapshot) =>
    snap.nameAr || snap.nameFr || snap.nameEn || ''

  const addressParts = [
    order.address,
    order.district,
    order.city,
    order.region,
    order.postalCode,
  ].filter(Boolean)

  return (
    <div className="container-brand page-shell" dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: 720 }}>
      <Link
        href={`/${locale}/account/orders`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--muted-foreground)',
          textDecoration: 'none',
          marginBottom: 20,
        }}
      >
        <ArrowLeft style={{ width: 14, height: 14, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
        {t('backOrders')}
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          {t('title')} #{order.orderNumber}
        </h1>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ background: STATUS_COLORS[order.status] ?? '#6b7280' }}
        >
          {statusLabel(order.status)}
        </span>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
          <h2 className="mb-4 font-bold" style={{ color: 'var(--foreground)' }}>{t('items')}</h2>
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
                      className="rounded-xl object-cover"
                      style={{ width: 64, height: 64 }}
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl" style={{ background: 'var(--bg-muted)' }} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{snapshotName(snap)}</p>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {snap.selectedSize ? ` ${snap.selectedSize}` : ''}
                      {snap.selectedColor?.nameAr ? ` · ${snap.selectedColor.nameAr}` : ''}
                      {' · '}{t('quantity')}: {item.quantity}
                    </p>
                    {snap.niqabs && snap.niqabs.length > 0 && (
                      <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {snap.niqabs.map((n) => `${n.nameAr || n.nameFr || n.nameEn} ×${n.quantity}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                    {fmt(item.totalPrice)} MAD
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-6 space-y-1.5 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <span>{t('subtotal')}</span>
              <span>{fmt(order.subtotal)} MAD</span>
            </div>
            <div className="flex justify-between text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <span>{t('shipping')}</span>
              <span>{fmt(order.shippingCost)} MAD</span>
            </div>
            <div className="flex justify-between font-bold" style={{ color: 'var(--foreground)' }}>
              <span>{t('total')}</span>
              <span>{fmt(order.total)} MAD</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
            <h2 className="mb-4 font-bold" style={{ color: 'var(--foreground)' }}>{t('address')}</h2>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{order.customerName}</p>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {order.customerPhone}
              {order.customerPhone2 ? ` · ${order.customerPhone2}` : ''}
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>{addressParts.join(' — ')}</p>
            {order.notes && (
              <p className="mt-3 rounded-xl bg-[#C4622D]/10 p-3 text-xs">
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>{t('notes')}: </span>
                <span style={{ color: 'var(--muted-foreground)' }}>{order.notes}</span>
              </p>
            )}
          </div>

          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
            <h2 className="mb-4 font-bold" style={{ color: 'var(--foreground)' }}>{t('payment')}</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{t('cod')}</p>
            <p className="mt-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {t('orderDate')}: {new Date(order.createdAt).toLocaleString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
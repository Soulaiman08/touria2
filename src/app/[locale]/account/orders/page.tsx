'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Package, PackageX } from 'lucide-react'

interface AccountOrdersPageProps {
  params: Promise<{ locale: string }>
}

interface OrderListItem {
  id: string
  orderNumber: string
  status: string
  total: number
  itemsCount: number
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

export default function AccountOrdersPage({ params }: AccountOrdersPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderListItem[] | null>(null)

  const t = (key: string): string => {
    const map: Record<string, [string, string, string]> = {
      title: ['طلباتي', 'Mes commandes', 'My orders'],
      loading: ['جاري التحميل...', 'Chargement...', 'Loading...'],
      empty: ['لا توجد طلبات بعد', 'Aucune commande pour le moment', 'No orders yet'],
      emptyDesc: ['عندما تطلب منتجاً، ستظهر طلباتك هنا', 'Lorsque vous commandez, vos commandes apparaîtront ici', 'When you place an order, it will appear here'],
      shop: ['تسوق الآن', 'Acheter maintenant', 'Shop now'],
      signIn: ['سجّل الدخول لعرض طلباتك', 'Connectez-vous pour voir vos commandes', 'Sign in to view your orders'],
      signInBtn: ['تسجيل الدخول', 'Se connecter', 'Sign in'],
      order: ['طلب', 'Commande', 'Order'],
      items: ['منتج', 'article', 'item'],
      total: ['المجموع', 'Total', 'Total'],
      view: ['التفاصيل', 'Détails', 'Details'],
      back: ['العودة لحسابي', 'Retour à mon compte', 'Back to my account'],
      date: ['التاريخ', 'Date', 'Date'],
    }
    const entry = map[key]
    if (!entry) return key
    return locale === 'ar' ? entry[0] : locale === 'fr' ? entry[1] : entry[2]
  }

  useEffect(() => {
    let isMounted = true
    fetch('/api/customer/orders', { cache: 'no-store' })
      .then((res) => {
        if (res.status === 401) throw new Error('not-authenticated')
        if (!res.ok) throw new Error('failed')
        return res.json()
      })
      .then((data) => { if (isMounted) setOrders(data.orders) })
      .catch((err: Error) => {
        if (isMounted) {
          if (err.message === 'not-authenticated') {
            router.replace(`/${locale}/login`)
          } else {
            setOrders([])
          }
        }
      })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [locale, router])

  const statusLabel = (status: string) => {
    const entry = STATUS_LABELS[status]
    if (!entry) return status
    return locale === 'ar' ? entry[0] : locale === 'fr' ? entry[1] : entry[2]
  }

  const Chevron = isRTL ? ChevronLeft : ChevronRight

  if (loading) {
    return (
      <div className="container-brand py-20 text-center space-y-4">
        <div className="animate-spin mx-auto h-10 w-10 rounded-full border-b-2 border-[#C4622D]" />
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="container-brand page-shell" dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: 720 }}>
      <Link
        href={`/${locale}/account`}
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
        {t('back')}
      </Link>

      <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{t('title')}</h1>

      {orders !== null && orders.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#C4622D', color: '#fff' }}>
            <PackageX style={{ width: 28, height: 28 }} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{t('empty')}</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm" style={{ color: 'var(--muted-foreground)' }}>{t('emptyDesc')}</p>
          <Link
            href={`/${locale}`}
            className="btn btn-primary mt-6 inline-flex h-11 items-center justify-center rounded-xl px-6 font-bold"
          >
            {t('shop')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <Link
              key={order.id}
              href={`/${locale}/account/orders/${order.id}`}
              className="block rounded-2xl border p-5 transition-all hover:shadow-md"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                      {t('order')} #{order.orderNumber}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                      style={{ background: STATUS_COLORS[order.status] ?? '#6b7280' }}
                    >
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')}
                    {' · '}
                    {order.itemsCount} {t('items')}
                    {order.itemsCount > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-end">
                    <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{t('total')}</p>
                    <p className="font-bold" style={{ color: 'var(--foreground)' }}>
                      {order.total.toLocaleString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')} MAD
                    </p>
                  </div>
                  <Chevron style={{ width: 18, height: 18, color: 'var(--muted-foreground)' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
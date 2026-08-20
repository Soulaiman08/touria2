'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
  Search,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface OrdersPageProps {
  params: Promise<{
    locale: string
  }>
}

interface OrderItem {
  id: string
  productId?: string
  productName?: string
  name?: string
  quantity: number
  price: number
  image?: string
}

interface Order {
  id: string
  orderNumber?: string
  status: string
  total: number
  subtotal?: number
  shippingCost?: number
  createdAt: string
  items?: OrderItem[]
}

type StatusConfig = {
  label: string
  icon: typeof Clock
  color: string
  background: string
  border: string
}

function getStatusConfig(status: string, locale: string): StatusConfig {
  const s = (status || '').toLowerCase()

  const labels = {
    ar: {
      pending: 'قيد الانتظار',
      confirmed: 'تم التأكيد',
      processing: 'قيد التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغى',
      returned: 'مُرجَع',
      unknown: 'غير معروف',
    },
    fr: {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      returned: 'Retournée',
      unknown: 'Inconnu',
    },
    en: {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
      unknown: 'Unknown',
    },
  }

  const currentLabels = labels[locale as keyof typeof labels] || labels.en

  if (s === 'delivered' || s === 'completed') {
    return {
      label: currentLabels.delivered,
      icon: CheckCircle2,
      color: '#16a34a',
      background: 'rgba(22, 163, 74, 0.12)',
      border: 'rgba(22, 163, 74, 0.3)',
    }
  }

  if (s === 'shipped' || s === 'shipping') {
    return {
      label: currentLabels.shipped,
      icon: Truck,
      color: '#2563eb',
      background: 'rgba(37, 99, 235, 0.12)',
      border: 'rgba(37, 99, 235, 0.3)',
    }
  }

  if (s === 'processing' || s === 'confirmed') {
    return {
      label: s === 'confirmed' ? currentLabels.confirmed : currentLabels.processing,
      icon: RefreshCw,
      color: '#d97706',
      background: 'rgba(217, 119, 6, 0.12)',
      border: 'rgba(217, 119, 6, 0.3)',
    }
  }

  if (s === 'cancelled' || s === 'canceled') {
    return {
      label: currentLabels.cancelled,
      icon: XCircle,
      color: '#dc2626',
      background: 'rgba(220, 38, 38, 0.12)',
      border: 'rgba(220, 38, 38, 0.3)',
    }
  }

  if (s === 'pending' || s === 'new') {
    return {
      label: currentLabels.pending,
      icon: Clock,
      color: '#9333ea',
      background: 'rgba(147, 51, 234, 0.12)',
      border: 'rgba(147, 51, 234, 0.3)',
    }
  }

  return {
    label: currentLabels.unknown,
    icon: Clock,
    color: '#71717a',
    background: 'rgba(113, 113, 122, 0.12)',
    border: 'rgba(113, 113, 122, 0.3)',
  }
}

function formatDate(dateString: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(
      locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    ).format(new Date(dateString))
  } catch {
    return dateString
  }
}

export default function OrdersPage({ params }: OrdersPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchOrderNumber, setSearchOrderNumber] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders', { method: 'GET', cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (mounted) {
            const list = Array.isArray(data.orders) ? data.orders : Array.isArray(data.items) ? data.items : []
            setOrders(list)
          }
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadOrders()
    return () => {
      mounted = false
    }
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchOrderNumber.trim()
    if (trimmed) {
      router.push(`/${locale}/orders/${encodeURIComponent(trimmed)}`)
    }
  }

  const text = {
    ar: {
      title: 'طلباتي ومتابعة الشحنات',
      subtitle: 'تابعي حالة طلباتكِ ومشترياتكِ السابقة بكل سهولة وشفافية.',
      loading: 'جاري تحميل الطلبات...',
      trackDirect: 'تتبع طلب مباشر',
      trackPlaceholder: 'أدخلي رقم الطلب (مثال: ORD-12345)...',
      trackBtn: 'تتبع الآن',
      emptyTitle: 'لا توجد طلبات مسجلة حالياً',
      emptyDescription: 'عندما تقومين بإتمام طلبكِ الأول، ستظهر تفاصيل الشحن والمتابعة هنا مباشرة.',
      shopNow: 'تصفحي المجموعة وابدأي التسوق',
      orderNum: 'رقم الطلب',
      date: 'تاريخ الطلب',
      total: 'المبلغ الإجمالي',
      details: 'تتبع وتفاصيل الطلب',
      items: 'منتجات',
      back: 'العودة للرئيسية',
    },
    fr: {
      title: 'Mes Commandes',
      subtitle: 'Suivez facilement le statut de vos commandes et vos achats précédents.',
      loading: 'Chargement des commandes...',
      trackDirect: 'Suivi direct d\'une commande',
      trackPlaceholder: 'Entrez le numéro de commande (ex: ORD-12345)...',
      trackBtn: 'Suivre',
      emptyTitle: 'Aucune commande enregistrée pour le moment',
      emptyDescription: 'Lorsque vous passerez votre première commande, ses détails de livraison apparaîtront ici.',
      shopNow: 'Découvrir la collection',
      orderNum: 'N° de commande',
      date: 'Date',
      total: 'Total',
      details: 'Détails & Suivi',
      items: 'articles',
      back: 'Retour à l\'accueil',
    },
    en: {
      title: 'My Orders',
      subtitle: 'Easily track the status of your orders and previous purchases.',
      loading: 'Loading orders...',
      trackDirect: 'Direct Order Tracking',
      trackPlaceholder: 'Enter order number (e.g. ORD-12345)...',
      trackBtn: 'Track Order',
      emptyTitle: 'No orders found yet',
      emptyDescription: 'When you place your first order, its tracking and delivery details will appear right here.',
      shopNow: 'Explore & Start Shopping',
      orderNum: 'Order #',
      date: 'Date',
      total: 'Total',
      details: 'View & Track Order',
      items: 'items',
      back: 'Back to Home',
    },
  }

  const t = text[locale as keyof typeof text] || text.en

  if (loading) {
    return (
      <div className="container-brand page-shell py-24 text-center space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--border)] border-t-[var(--accent)] mx-auto" />
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{t.loading}</p>
      </div>
    )
  }

  return (
    <div
      className="container-brand page-shell"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ maxWidth: 840, paddingLeft: 'max(16px, 4vw)', paddingRight: 'max(16px, 4vw)' }}
    >
      {/* ── Back Navigation ───────────────────────────────────────── */}
      <Link
        href={`/${locale}`}
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
        {t.back}
      </Link>

      {/* ── Page Header Card ──────────────────────────────────────── */}
      <div
        style={{
          borderRadius: 24,
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(196,98,45,0.06) 0%, rgba(184,150,90,0.04) 100%)',
            padding: '32px 24px 28px',
            textAlign: 'center',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              border: '1px solid var(--accent-ring)',
            }}
          >
            <Package style={{ width: 28, height: 28, color: 'var(--accent)' }} />
          </div>

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-ring)',
            }}
          >
            <span>✦</span>
            <span>{isRTL ? 'سجل المشتريات والتتبع' : 'Order History & Tracking'}</span>
            <span>✦</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 1.85rem)',
              fontWeight: 900,
              color: 'var(--foreground)',
              margin: '0 0 6px',
              fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
            }}
          >
            {t.title}
          </h1>

          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0, maxWidth: 480, marginInline: 'auto' }}>
            {t.subtitle}
          </p>
        </div>

        {/* ── Quick Lookup Box ──────────────────────────────────────── */}
        <div style={{ padding: '18px 22px', background: 'var(--bg-subtle)' }}>
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  [isRTL ? 'right' : 'left']: 14,
                  width: 16,
                  height: 16,
                  color: 'var(--muted-foreground)',
                }}
              />
              <input
                type="text"
                value={searchOrderNumber}
                onChange={(e) => setSearchOrderNumber(e.target.value)}
                placeholder={t.trackPlaceholder}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  paddingLeft: isRTL ? 16 : 40,
                  paddingRight: isRTL ? 40 : 16,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '11px 20px',
                borderRadius: 12,
                background: 'linear-gradient(90deg, #C4622D, #d97b4a)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(196,98,45,0.22)',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
              className="sm:w-auto"
            >
              <span>{t.trackBtn}</span>
              <ArrowRight style={{ width: 14, height: 14, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
            </button>
          </form>
        </div>
      </div>

      {/* ── Content: Order List or Empty State ─────────────────────── */}
      {orders.length === 0 ? (
        /* ── Empty State ── */
        <div
          style={{
            borderRadius: 24,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            padding: '48px 24px sm:p-14',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
          }}
          className="p-8 sm:p-14"
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: 'var(--accent-light)',
              border: '1.5px solid var(--accent-ring)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              marginBottom: 20,
            }}
          >
            <Package style={{ width: 34, height: 34 }} />
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--foreground)', margin: '0 0 8px' }}>
            {t.emptyTitle}
          </h2>

          <p style={{ fontSize: 13.5, color: 'var(--muted-foreground)', maxWidth: 400, margin: '0 0 24px', lineHeight: 1.6 }}>
            {t.emptyDescription}
          </p>

          <Link
            href={`/${locale}/products`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 26px',
              borderRadius: 14,
              background: 'linear-gradient(90deg, #C4622D, #d97b4a)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(196,98,45,0.25)',
              transition: 'transform 0.2s',
            }}
          >
            <ShoppingBag style={{ width: 16, height: 16 }} />
            <span>{t.shopNow}</span>
          </Link>
        </div>
      ) : (
        /* ── Orders Cards Grid ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status, locale)
            const StatusIcon = statusConfig.icon
            const orderNum = order.orderNumber || order.id
            const itemsCount = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || order.items?.length || 1

            return (
              <div
                key={order.id}
                style={{
                  borderRadius: 20,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Top Info Bar */}
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-subtle)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                      {t.orderNum}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#C4622D', fontFamily: 'monospace' }}>
                      #{orderNum}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 800,
                      color: statusConfig.color,
                      background: statusConfig.background,
                      border: `1px solid ${statusConfig.border}`,
                    }}
                  >
                    <StatusIcon style={{ width: 12, height: 12 }} />
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                {/* Details Body */}
                <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar style={{ width: 12, height: 12 }} />
                      {t.date}
                    </span>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', margin: '4px 0 0' }}>
                      {formatDate(order.createdAt, locale)}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Layers style={{ width: 12, height: 12 }} />
                      {t.items}
                    </span>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', margin: '4px 0 0' }}>
                      {itemsCount} {t.items}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                      {t.total}
                    </span>
                    <p style={{ fontSize: 16, fontWeight: 900, color: '#C4622D', margin: '2px 0 0' }}>
                      {formatPrice(order.total, locale)}
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div
                  style={{
                    padding: '12px 20px',
                    borderTop: '1px solid var(--border)',
                    background: 'rgba(196,98,45,0.02)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Link
                    href={`/${locale}/orders/${order.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '9px 16px',
                      borderRadius: 10,
                      background: 'var(--accent-light)',
                      border: '1px solid var(--accent-ring)',
                      color: 'var(--accent)',
                      fontSize: 12,
                      fontWeight: 800,
                      textDecoration: 'none',
                    }}
                  >
                    <span>{t.details}</span>
                    <ArrowRight style={{ width: 13, height: 13, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

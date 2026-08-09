'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'

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
}

function getStatusConfig(
  status: string,
  locale: string
): StatusConfig {
  const normalizedStatus = status.toLowerCase()

  const labels = {
    ar: {
      pending: 'قيد الانتظار',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغى',
      unknown: 'غير معروف',
    },
    fr: {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      unknown: 'Inconnu',
    },
    en: {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      unknown: 'Unknown',
    },
  }

  const currentLabels =
    labels[locale as keyof typeof labels] || labels.en

  if (
    normalizedStatus === 'delivered' ||
    normalizedStatus === 'completed'
  ) {
    return {
      label: currentLabels.delivered,
      icon: CheckCircle2,
      color: '#22c55e',
      background: 'rgba(34, 197, 94, 0.12)',
    }
  }

  if (
    normalizedStatus === 'shipped' ||
    normalizedStatus === 'shipping'
  ) {
    return {
      label: currentLabels.shipped,
      icon: Truck,
      color: '#3b82f6',
      background: 'rgba(59, 130, 246, 0.12)',
    }
  }

  if (
    normalizedStatus === 'processing' ||
    normalizedStatus === 'confirmed'
  ) {
    return {
      label: currentLabels.processing,
      icon: RefreshCw,
      color: '#f59e0b',
      background: 'rgba(245, 158, 11, 0.12)',
    }
  }

  if (
    normalizedStatus === 'cancelled' ||
    normalizedStatus === 'canceled'
  ) {
    return {
      label: currentLabels.cancelled,
      icon: XCircle,
      color: '#ef4444',
      background: 'rgba(239, 68, 68, 0.12)',
    }
  }

  if (
    normalizedStatus === 'pending' ||
    normalizedStatus === 'new'
  ) {
    return {
      label: currentLabels.pending,
      icon: Clock,
      color: '#a78bfa',
      background: 'rgba(167, 139, 250, 0.12)',
    }
  }

  return {
    label: currentLabels.unknown,
    icon: Clock,
    color: '#a1a1aa',
    background: 'rgba(161, 161, 170, 0.12)',
  }
}

function formatDate(
  dateString: string,
  locale: string
) {
  try {
    return new Intl.DateTimeFormat(
      locale === 'ar'
        ? 'ar-MA'
        : locale === 'fr'
          ? 'fr-FR'
          : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    ).format(new Date(dateString))
  } catch {
    return dateString
  }
}

function formatPrice(value: number) {
  return `${Number(value || 0).toFixed(2)} د.م.`
}

export default function OrdersPage({
  params,
}: OrdersPageProps) {
  const [locale, setLocale] = useState('ar')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function initialize() {
      try {
        const resolvedParams = await params

        if (!mounted) return

        const currentLocale = resolvedParams.locale || 'ar'

        setLocale(currentLocale)

        try {
          const response = await fetch(
            '/api/orders',
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              cache: 'no-store',
            }
          )

          if (!response.ok) {
            throw new Error(
              `Orders request failed: ${response.status}`
            )
          }

          const data = await response.json()

          if (!mounted) return

          const receivedOrders = Array.isArray(
            data.orders
          )
            ? data.orders
            : Array.isArray(data.items)
              ? data.items
              : []

          setOrders(receivedOrders)
          setError('')
        } catch (requestError) {
          console.error(
            'Error loading orders:',
            requestError
          )

          if (!mounted) return

          /*
           * إذا كانت API الطلبات غير موجودة حالياً،
           * نعرض الصفحة بشكل طبيعي بدون كسر الموقع.
           */
          setOrders([])
          setError('')
        }
      } catch (parameterError) {
        console.error(
          'Error resolving locale:',
          parameterError
        )

        if (mounted) {
          setLocale('ar')
          setOrders([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [params])

  const isRTL = locale === 'ar'

  const text = {
    ar: {
      title: 'طلباتي',
      subtitle:
        'تابعي حالة طلباتك ومشترياتك السابقة بسهولة.',
      loading: 'جاري تحميل الطلبات...',
      emptyTitle: 'لا توجد طلبات حتى الآن',
      emptyDescription:
        'عندما تقومين بإجراء أول طلب، ستظهر تفاصيله هنا.',
      shopNow: 'تسوقي الآن',
      order: 'الطلب',
      date: 'التاريخ',
      total: 'الإجمالي',
      details: 'عرض التفاصيل',
      items: 'منتجات',
      item: 'منتج',
      retry: 'إعادة المحاولة',
      loginTitle: 'سجلي الدخول لمشاهدة طلباتك',
      loginDescription:
        'سجلي الدخول إلى حسابك للوصول إلى جميع طلباتك السابقة ومتابعة حالتها.',
      login: 'تسجيل الدخول',
      back: 'العودة للمتجر',
    },

    fr: {
      title: 'Mes commandes',
      subtitle:
        'Suivez facilement vos commandes et vos achats précédents.',
      loading: 'Chargement des commandes...',
      emptyTitle: 'Aucune commande pour le moment',
      emptyDescription:
        'Lorsque vous passerez votre première commande, elle apparaîtra ici.',
      shopNow: 'Acheter maintenant',
      order: 'Commande',
      date: 'Date',
      total: 'Total',
      details: 'Voir les détails',
      items: 'produits',
      item: 'produit',
      retry: 'Réessayer',
      loginTitle:
        'Connectez-vous pour voir vos commandes',
      loginDescription:
        'Connectez-vous à votre compte pour accéder à vos commandes et suivre leur statut.',
      login: 'Se connecter',
      back: 'Retour à la boutique',
    },

    en: {
      title: 'My Orders',
      subtitle:
        'Easily track your orders and previous purchases.',
      loading: 'Loading orders...',
      emptyTitle: 'No orders yet',
      emptyDescription:
        'When you place your first order, it will appear here.',
      shopNow: 'Shop Now',
      order: 'Order',
      date: 'Date',
      total: 'Total',
      details: 'View Details',
      items: 'products',
      item: 'product',
      retry: 'Try Again',
      loginTitle:
        'Sign in to view your orders',
      loginDescription:
        'Sign in to your account to access your previous orders and track their status.',
      login: 'Sign In',
      back: 'Back to Store',
    },
  }

  const currentText =
    text[locale as keyof typeof text] || text.en

  if (loading) {
    return (
      <main
        className="min-h-[70vh]"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          background: 'var(--bg)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="container-brand page-shell px-4">
          <div className="flex min-h-[400px] flex-col items-center justify-center">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]"
              aria-label={currentText.loading}
            />

            <p
              className="mt-4 text-sm"
              style={{
                color: 'var(--text-muted)',
              }}
            >
              {currentText.loading}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        background: 'var(--bg)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="container-brand page-shell px-4">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div
              className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                background: 'var(--accent-light)',
                color: 'var(--accent)',
              }}
            >
              <Package className="h-5 w-5" />
            </div>

            <h1
              className="text-2xl font-black tracking-tight sm:text-4xl"
              style={{
                color: 'var(--text-primary)',
              }}
            >
              {currentText.title}
            </h1>

            <p
              className="mt-2 max-w-xl text-sm leading-6"
              style={{
                color: 'var(--text-muted)',
              }}
            >
              {currentText.subtitle}
            </p>
          </div>

          {orders.length > 0 && (
            <Link
              href={`/${locale}/products`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                boxShadow:
                  '0 8px 24px rgba(0,0,0,0.12)',
              }}
            >
              <ShoppingBag className="h-4 w-4" />
              {currentText.shopNow}
            </Link>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-6 rounded-2xl border p-4"
            style={{
              borderColor:
                'rgba(239,68,68,0.25)',
              background:
                'rgba(239,68,68,0.06)',
              color: '#ef4444',
            }}
          >
            <p className="text-sm font-semibold">
              {error}
            </p>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 ? (
          <section
            className="relative isolate flex min-h-[300px] items-center justify-center overflow-hidden rounded-3xl border px-5 py-8 text-center sm:min-h-[420px] sm:px-10 sm:py-16"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-40 blur-3xl"
              style={{ background: 'var(--accent-light)' }}
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
              style={{ background: 'var(--accent-light)' }}
            />

            <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] border shadow-sm"
                style={{
                  background: 'var(--accent-light)',
                  borderColor: 'rgba(196, 98, 45, 0.2)',
                  color: 'var(--accent)',
                }}
              >
                <Package className="h-9 w-9" strokeWidth={1.75} />
              </div>

              <h2
                className="mt-7 text-2xl font-black tracking-tight sm:text-[1.7rem]"
                style={{
                  color: 'var(--text-primary)',
                }}
              >
                {currentText.emptyTitle}
              </h2>

              <p
                className="mt-3 max-w-sm text-sm leading-7 sm:text-[0.95rem]"
                style={{
                  color: 'var(--text-muted)',
                }}
              >
                {currentText.emptyDescription}
              </p>

              <Link
                href={`/${locale}/products`}
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  boxShadow: '0 10px 24px rgba(196, 98, 45, 0.22)',
                }}
              >
                <ShoppingBag className="h-4 w-4" />
                {currentText.shopNow}
              </Link>
            </div>
          </section>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map((order) => {
              const status =
                getStatusConfig(
                  order.status,
                  locale
                )

              const StatusIcon = status.icon

              const orderNumber =
                order.orderNumber ||
                order.id

              const itemsCount =
                order.items?.reduce(
                  (sum, item) =>
                    sum +
                    Number(item.quantity || 0),
                  0
                ) || 0

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background:
                      'var(--card-bg)',
                    borderColor:
                      'var(--border)',
                  }}
                >
                  {/* Order Top */}
                  <div
                    className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                    style={{
                      borderColor:
                        'var(--border)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background:
                            'var(--accent-light)',
                          color:
                            'var(--accent)',
                        }}
                      >
                        <Package className="h-5 w-5" />
                      </div>

                      <div>
                        <p
                          className="text-xs font-medium"
                          style={{
                            color:
                              'var(--text-muted)',
                          }}
                        >
                          {currentText.order}
                        </p>

                        <p
                          className="mt-0.5 text-sm font-black"
                          style={{
                            color:
                              'var(--text-primary)',
                          }}
                        >
                          #{orderNumber}
                        </p>
                      </div>
                    </div>

                    <div
                      className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold"
                      style={{
                        background:
                          status.background,
                        color: status.color,
                      }}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />

                      <span>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-5">
                    <div>
                      <p
                        className="text-xs"
                        style={{
                          color:
                            'var(--text-muted)',
                        }}
                      >
                        {currentText.date}
                      </p>

                      <p
                        className="mt-1 text-sm font-semibold"
                        style={{
                          color:
                            'var(--text-primary)',
                        }}
                      >
                        {formatDate(
                          order.createdAt,
                          locale
                        )}
                      </p>
                    </div>

                    <div>
                      <p
                        className="text-xs"
                        style={{
                          color:
                            'var(--text-muted)',
                        }}
                      >
                        {currentText.items}
                      </p>

                      <p
                        className="mt-1 text-sm font-semibold"
                        style={{
                          color:
                            'var(--text-primary)',
                        }}
                      >
                        {itemsCount}{' '}
                        {itemsCount === 1
                          ? currentText.item
                          : currentText.items}
                      </p>
                    </div>

                    <div>
                      <p
                        className="text-xs"
                        style={{
                          color:
                            'var(--text-muted)',
                        }}
                      >
                        {currentText.total}
                      </p>

                      <p
                        className="mt-1 text-sm font-black"
                        style={{
                          color:
                            'var(--accent)',
                        }}
                      >
                        {formatPrice(
                          order.total
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div
                    className="flex justify-end border-t px-4 py-3 sm:px-5 sm:py-4"
                    style={{
                      borderColor:
                        'var(--border)',
                    }}
                  >
                    <Link
                      href={`/${locale}/orders/${order.id}`}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
                      style={{
                        color:
                          'var(--text-secondary)',
                      }}
                    >
                      {currentText.details}

                      {isRTL ? (
                        <ChevronLeft className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Back to Store */}
        <div className="mt-8 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[var(--accent)]"
            style={{
              color: 'var(--text-muted)',
            }}
          >
            {isRTL ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}

            {currentText.back}
          </Link>
        </div>
      </div>
    </main>
  )
}

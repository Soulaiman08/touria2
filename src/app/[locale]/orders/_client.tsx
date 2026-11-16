'use client'

import { use, useEffect, useState, useRef, useCallback } from 'react'
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
  LogIn,
  UserPlus,
  MapPin,
  AlertCircle,
  SearchX,
  Phone,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCustomerAuth } from '@/components/providers/CustomerAuthProvider'

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
      color: 'var(--success)',
      background: 'var(--success-bg)',
      border: 'var(--success-border)',
    }
  }

  if (s === 'shipped' || s === 'shipping') {
    return {
      label: currentLabels.shipped,
      icon: Truck,
      color: '#2563eb',
      background: 'rgba(37, 99, 235, 0.1)',
      border: 'rgba(37, 99, 235, 0.25)',
    }
  }

  if (s === 'processing' || s === 'confirmed') {
    return {
      label: s === 'confirmed' ? currentLabels.confirmed : currentLabels.processing,
      icon: RefreshCw,
      color: 'var(--accent)',
      background: 'var(--accent-light)',
      border: 'var(--accent-ring)',
    }
  }

  if (s === 'cancelled' || s === 'canceled' || s === 'returned') {
    return {
      label: s === 'returned' ? currentLabels.returned : currentLabels.cancelled,
      icon: XCircle,
      color: 'var(--error)',
      background: 'var(--error-bg)',
      border: 'var(--error-border)',
    }
  }

  if (s === 'pending' || s === 'new') {
    return {
      label: currentLabels.pending,
      icon: Clock,
      color: 'var(--gold)',
      background: 'var(--bg-subtle)',
      border: 'var(--border)',
    }
  }

  return {
    label: currentLabels.unknown,
    icon: Clock,
    color: 'var(--text-muted)',
    background: 'var(--bg-subtle)',
    border: 'var(--border)',
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

export function OrdersPageClient({ params }: OrdersPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'
  const { customer, loading: authLoading } = useCustomerAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchOrderNumber, setSearchOrderNumber] = useState('')
  const [searchPhone, setSearchPhone] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchNotFound, setSearchNotFound] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (authLoading) return

    if (!customer) {
      setLoading(false)
      return
    }

    let mounted = true
    async function loadOrders() {
      try {
        const res = await fetch('/api/customer/orders', { method: 'GET', cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (mounted) {
            const list = Array.isArray(data.orders) ? data.orders : Array.isArray(data.items) ? data.items : []
            setOrders(list)
          }
        } else {
          if (mounted) setError(true)
        }
      } catch {
        if (mounted) setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadOrders()
    return () => {
      mounted = false
    }
  }, [customer, authLoading])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setSearchOrderNumber('')
    setSearchPhone('')
    setSearchNotFound(false)
    setSearchError(false)
  }, [])

  useEffect(() => {
    if (!searchOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen, closeSearch])

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [searchOpen])

  const isLoggedIn = !!customer
  const showContent = !authLoading

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchOrderNumber.trim()
    if (!trimmed) return

    setSearching(true)
    setSearchNotFound(false)
    setSearchError(false)

    try {
      if (isLoggedIn) {
        const match = orders.find(
          (o) => o.orderNumber?.toLowerCase() === trimmed.toLowerCase() || o.id.toLowerCase() === trimmed.toLowerCase()
        )
        if (match) {
          router.push(`/${locale}/orders/${match.id}`)
        } else {
          setSearchNotFound(true)
        }
      } else {
        const phoneTrimmed = searchPhone.trim()
        if (!phoneTrimmed) {
          setSearchOpen(true)
          if (phoneInputRef.current) phoneInputRef.current.focus()
          setSearching(false)
          return
        }
        const res = await fetch('/api/orders/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber: trimmed, phone: phoneTrimmed }),
          cache: 'no-store',
        })
        if (res.ok) {
          router.push(`/${locale}/orders/${trimmed}`)
        } else if (res.status === 404 || res.status === 429) {
          setSearchNotFound(true)
        } else {
          setSearchError(true)
        }
      }
    } catch {
      setSearchError(true)
    } finally {
      setSearching(false)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeSearch()
    }
  }

  const text = {
    ar: {
      title: 'طلباتي ومتابعة الشحنات',
      subtitle: 'تابعي حالة طلباتكِ ومشترياتكِ السابقة بكل سهولة وشفافية.',
      badge: 'سجل المشتريات والتتبع',
      loading: 'جاري تحميل الطلبات...',
      trackDirect: 'تتبع طلب مباشر',
      trackPlaceholder: 'أدخلي رقم الطلب (مثال: ORD-12345)...',
      trackBtn: 'تتبع الآن',
      orderNum: 'رقم الطلب',
      date: 'تاريخ الطلب',
      total: 'المبلغ الإجمالي',
      items: 'منتجات',
      details: 'تتبع وتفاصيل الطلب',
      back: 'العودة للرئيسية',
      guestTitle: 'سجّلي دخولكِ لعرض طلباتك',
      guestDesc: 'جميع طلباتك في مكان واحد. سجّلي الدخول لمتابعة طلباتكِ وتفاصيلها.',
      guestLogin: 'تسجيل الدخول',
      guestSignup: 'إنشاء حساب',
      noOrdersTitle: 'لا توجد طلبات بعد',
      noOrdersDesc: 'عندما تقومين بإتمام طلبكِ الأول، ستظهر تفاصيل الشحن والمتابعة هنا مباشرة.',
      browseProducts: 'تصفحي المنتجات',
      errorTitle: 'حدث خطأ أثناء تحميل الطلبات',
      errorDesc: 'يرجى المحاولة مجدداً.',
      retry: 'حاول مجدداً',
      trackSectionTitle: 'كيف يمكنني تتبع حالة طلبي؟',
      trackSectionDesc: 'يمكنكِ تتبع الطلب بكل سهولة من خلال زيارة صفحة تتبع الطلب وإدخال رقم طلبكِ لمعرفة المرحلة الحالية للتجهيز والشحن.',
      trackSectionBtn: 'تتبع طلبك',
      welcome: 'مرحباً،',
      searchNoResults: 'لا توجد نتيجة',
      searchNoResultsDesc: 'لم نتمكن من العثور على طلب يطابق رقم الطلب ورقم الهاتف المُدخلين. تأكد من البيانات وحاول مرة أخرى.',
      searchError: 'حدث خطأ أثناء البحث',
      searchPlaceholder: 'أدخلي رقم الطلب...',
      trackPhonePlaceholder: 'أدخلي رقم الهاتف المستخدم في الطلب...',
    },
    fr: {
      title: 'Mes Commandes',
      subtitle: 'Suivez facilement le statut de vos commandes et vos achats précédents.',
      badge: 'Historique et suivi des commandes',
      loading: 'Chargement des commandes...',
      trackDirect: 'Suivi direct d\'une commande',
      trackPlaceholder: 'Entrez le numéro de commande (ex: ORD-12345)...',
      trackBtn: 'Suivre',
      orderNum: 'N° de commande',
      date: 'Date',
      total: 'Total',
      items: 'articles',
      details: 'Détails et suivi',
      back: 'Retour à l\'accueil',
      guestTitle: 'Connectez-vous pour voir vos commandes',
      guestDesc: 'Retrouvez toutes vos commandes en un seul endroit. Connectez-vous pour suivre vos commandes et leurs détails.',
      guestLogin: 'Se connecter',
      guestSignup: 'Créer un compte',
      noOrdersTitle: 'Aucune commande pour le moment',
      noOrdersDesc: 'Lorsque vous passerez votre première commande, ses détails de livraison apparaîtront ici.',
      browseProducts: 'Découvrir les produits',
      errorTitle: 'Erreur de chargement des commandes',
      errorDesc: 'Veuillez réessayer.',
      retry: 'Réessayer',
      trackSectionTitle: 'Comment suivre ma commande ?',
      trackSectionDesc: 'Vous pouvez suivre votre commande facilement en visitant la page de suivi et en entrant votre numéro de commande pour connaître l\'étape actuelle de préparation et de livraison.',
      trackSectionBtn: 'Suivre votre commande',
      welcome: 'Bonjour,',
      searchNoResults: 'Aucun résultat',
      searchNoResultsDesc: 'Nous n\'avons trouvé aucune commande correspondant au numéro de commande et au numéro de téléphone saisis. Vérifiez vos informations et réessayez.',
      searchError: 'Une erreur s\'est produite lors de la recherche',
      searchPlaceholder: 'Entrez le numéro de commande...',
      trackPhonePlaceholder: 'Entrez le numéro de téléphone utilisé pour la commande...',
    },
    en: {
      title: 'My Orders',
      subtitle: 'Easily track the status of your orders and previous purchases.',
      badge: 'Order History & Tracking',
      loading: 'Loading orders...',
      trackDirect: 'Direct Order Tracking',
      trackPlaceholder: 'Enter order number (e.g. ORD-12345)...',
      trackBtn: 'Track Order',
      orderNum: 'Order #',
      date: 'Date',
      total: 'Total',
      items: 'items',
      details: 'View & Track Order',
      back: 'Back to Home',
      guestTitle: 'Sign in to view your orders',
      guestDesc: 'Find all your orders in one place. Sign in to track your orders and view their details.',
      guestLogin: 'Sign in',
      guestSignup: 'Create account',
      noOrdersTitle: 'No orders yet',
      noOrdersDesc: 'When you place your first order, its tracking and delivery details will appear right here.',
      browseProducts: 'Browse Products',
      errorTitle: 'Error loading orders',
      errorDesc: 'Please try again.',
      retry: 'Try Again',
      trackSectionTitle: 'How can I track my order?',
      trackSectionDesc: 'You can easily track your order by visiting the order tracking page and entering your order number to know the current preparation and shipping stage.',
      trackSectionBtn: 'Track Your Order',
      welcome: 'Hello,',
      searchNoResults: 'No results found',
      searchNoResultsDesc: 'We couldn\'t find an order matching the order number and phone number. Please check your details and try again.',
      searchError: 'An error occurred while searching',
      searchPlaceholder: 'Enter order number...',
      trackPhonePlaceholder: 'Enter the phone number used for the order...',
    },
  }

  const t = text[locale as keyof typeof text] || text.en

  if (loading || authLoading) {
    return (
      <div className="container-brand page-shell py-24 text-center space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--border)] border-t-[var(--accent)] mx-auto" />
        <p className="text-sm text-[var(--text-muted)]">{t.loading}</p>
      </div>
    )
  }

  return (
    <div
      className="container-brand page-shell"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ maxWidth: 840 }}
    >
      {/* ── Back Navigation ───────────────────────────────────────── */}
      <Link href={`/${locale}`} className="btn btn-outline btn-sm btn-round mb-5">
        <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
        <span>{t.back}</span>
      </Link>

      {/* ── Page Header Card ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden mb-6">
        <div className="p-7 text-center border-b border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="w-14 h-14 rounded-full bg-[var(--accent-light)] border border-[var(--accent-ring)] flex items-center justify-center mx-auto mb-3.5">
            <Package className="w-7 h-7 text-[var(--accent)]" />
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1.5">
            {t.badge}
          </p>

          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-1.5"
            style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
          >
            {t.title}
          </h1>

          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto m-0">
            {t.subtitle}
          </p>

          {isLoggedIn && customer?.name && (
            <p className="text-sm text-[var(--accent)] mt-2.5 font-bold">
              {t.welcome} {customer.name}
            </p>
          )}
        </div>

        {/* ── Quick Lookup Box ──────────────────────────────────────── */}
        <div id="order-lookup" className="p-5 bg-[var(--card-bg)]">
          <div ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5">
              <div
                className="flex items-center gap-2 relative"
                style={{ flex: searchOpen ? 1 : 'none' }}
              >
                {searchOpen ? (
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-[var(--text-muted)] absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchOrderNumber}
                      onChange={(e) => {
                        setSearchOrderNumber(e.target.value)
                        setSearchNotFound(false)
                        setSearchError(false)
                      }}
                      onKeyDown={handleSearchKeyDown}
                      placeholder={t.searchPlaceholder}
                      className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] ps-10 pe-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="w-11 h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center justify-center cursor-pointer flex-shrink-0"
                    aria-label={t.trackDirect}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>

              {searchOpen && !isLoggedIn && (
                <div className="relative w-full" style={{ flex: '1 1 100%' }}>
                  <Phone className="w-4 h-4 text-[var(--text-muted)] absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={searchPhone}
                    onChange={(e) => {
                      setSearchPhone(e.target.value)
                      setSearchNotFound(false)
                      setSearchError(false)
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={t.trackPhonePlaceholder}
                    className="tabular-nums w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] ps-10 pe-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={searching || (searchOpen && (!searchOrderNumber.trim() || (!isLoggedIn && !searchPhone.trim())))}
                className="btn btn-primary rounded-xl px-5 py-2.5 text-sm font-bold whitespace-nowrap"
              >
                {searching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{t.trackBtn}</span>
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
            </form>

            {/* ── Search Results ──────────────────────────────────────── */}
            {searchNotFound && (
              <div className="mt-4 p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] flex items-center justify-center text-[var(--accent)] mb-3">
                  <SearchX className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                  {t.searchNoResults}
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm leading-relaxed m-0">
                  {t.searchNoResultsDesc}
                </p>
              </div>
            )}

            {searchError && (
              <div className="mt-4 p-4 rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] flex items-center justify-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-[var(--error)] flex-shrink-0" />
                <span className="text-xs text-[var(--error)] font-semibold">{t.searchError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      {showContent && !isLoggedIn ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-10 text-center flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-ring)] flex items-center justify-center text-[var(--accent)] mb-5">
            <LogIn className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-extrabold text-[var(--text-primary)] mb-2">
            {t.guestTitle}
          </h2>

          <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
            {t.guestDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <Link href={`/${locale}/login`} className="btn btn-primary w-full justify-center py-3 rounded-xl">
              <LogIn className="w-4 h-4" />
              <span>{t.guestLogin}</span>
            </Link>

            <Link href={`/${locale}/signup`} className="btn btn-outline w-full justify-center py-3 rounded-xl">
              <UserPlus className="w-4 h-4" />
              <span>{t.guestSignup}</span>
            </Link>
          </div>
        </div>
      ) : showContent && error ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-10 text-center flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--error-bg)] border border-[var(--error-border)] flex items-center justify-center text-[var(--error)] mb-5">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-extrabold text-[var(--text-primary)] mb-2">
            {t.errorTitle}
          </h2>

          <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
            {t.errorDesc}
          </p>

          <button type="button" onClick={() => window.location.reload()} className="btn btn-primary rounded-xl px-6 py-3">
            <RefreshCw className="w-4 h-4" />
            <span>{t.retry}</span>
          </button>
        </div>
      ) : showContent && orders.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-10 text-center flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-ring)] flex items-center justify-center text-[var(--accent)] mb-5">
            <Package className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-extrabold text-[var(--text-primary)] mb-2">
            {t.noOrdersTitle}
          </h2>

          <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
            {t.noOrdersDesc}
          </p>

          <Link href={`/${locale}/products`} className="btn btn-primary rounded-xl px-6 py-3">
            <ShoppingBag className="w-4 h-4" />
            <span>{t.browseProducts}</span>
          </Link>
        </div>
      ) : showContent && orders.length > 0 ? (
        <div className="flex flex-col gap-4 mb-6">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status, locale)
            const StatusIcon = statusConfig.icon
            const orderNum = order.orderNumber || order.id
            const itemsCount = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || order.items?.length || 1

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden"
              >
                {/* Top Info Bar */}
                <div className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--bg-subtle)] flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {t.orderNum}
                    </span>
                    <span className="tabular-nums font-mono text-sm font-extrabold text-[var(--accent)]">
                      #{orderNum}
                    </span>
                  </div>

                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                    style={{
                      color: statusConfig.color,
                      background: statusConfig.background,
                      borderColor: statusConfig.border,
                    }}
                  >
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <span className="text-[11px] text-[var(--text-muted)] inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t.date}
                    </span>
                    <p className="tabular-nums text-sm font-bold text-[var(--text-primary)] mt-1 mb-0">
                      {formatDate(order.createdAt, locale)}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] text-[var(--text-muted)] inline-flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {t.items}
                    </span>
                    <p className="tabular-nums text-sm font-bold text-[var(--text-primary)] mt-1 mb-0">
                      {itemsCount} {t.items}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      {t.total}
                    </span>
                    <p className="tabular-nums text-base font-extrabold text-[var(--accent)] mt-0.5 mb-0">
                      {formatPrice(order.total, locale)}
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-subtle)] flex justify-end">
                  <Link
                    href={`/${locale}/orders/${order.id}`}
                    className="btn btn-outline btn-sm rounded-xl text-xs font-bold text-[var(--accent)] border-[var(--accent-ring)]"
                  >
                    <span>{t.details}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      {/* ── Tracking Section ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden mb-6">
        <div className="p-7 text-center border-b border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] border border-[var(--accent-ring)] flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6 text-[var(--accent)]" />
          </div>

          <h2
            className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] mb-2"
            style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
          >
            {t.trackSectionTitle}
          </h2>

          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed m-0">
            {t.trackSectionDesc}
          </p>
        </div>

        <div className="p-5 text-center">
          <Link href="#order-lookup" className="btn btn-primary btn-round px-6 py-2.5 text-sm">
            <Truck className="w-4 h-4" />
            <span>{t.trackSectionBtn}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

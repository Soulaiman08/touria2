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
  const { customer, loading: authLoading } = useCustomerAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchOrderNumber, setSearchOrderNumber] = useState('')
  const [searchPhone, setSearchPhone] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResult, setSearchResult] = useState<Order | null>(null)
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
    setSearchResult(null)
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

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchOrderNumber.trim()
    if (!trimmed) return

    setSearching(true)
    setSearchResult(null)
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
        } else if (res.status === 404) {
          setSearchNotFound(true)
        } else if (res.status === 429) {
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
  const isLoggedIn = !!customer
  const showContent = !authLoading

  if (loading || authLoading) {
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
            <span>{t.badge}</span>
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

          {/* Welcome message for logged-in users */}
          {isLoggedIn && customer?.name && (
            <p style={{ fontSize: 13, color: 'var(--accent)', margin: '8px 0 0', fontWeight: 700 }}>
              {t.welcome} {customer.name}
            </p>
          )}
        </div>

        {/* ── Quick Lookup Box ──────────────────────────────────────── */}
        <div id="order-lookup" style={{ padding: '18px 22px', background: 'var(--bg-subtle)' }}>
          <div ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5" style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flex: searchOpen ? 1 : 'none',
                  position: 'relative',
                  transition: 'flex 0.3s ease',
                }}
              >
                {searchOpen && (
                  <div className="relative flex-1 w-full" style={{ flex: 1 }}>
                    <Search
                      style={{
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        [isRTL ? 'right' : 'left']: 14,
                        width: 16,
                        height: 16,
                        color: 'var(--muted-foreground)',
                        zIndex: 1,
                      }}
                    />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchOrderNumber}
                      onChange={(e) => { setSearchOrderNumber(e.target.value); setSearchNotFound(false); setSearchError(false) }}
                      onKeyDown={handleSearchKeyDown}
                      placeholder={t.searchPlaceholder}
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
                        animation: 'searchExpand 0.3s ease forwards',
                      }}
                    />
                  </div>
                )}

                {!searchOpen && (
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      color: 'var(--muted-foreground)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'background 0.2s, color 0.2s',
                    }}
                    aria-label={t.trackDirect}
                  >
                    <Search style={{ width: 18, height: 18 }} />
                  </button>
                )}
              </div>

              {searchOpen && !isLoggedIn && (
                <div className="relative w-full" style={{ flex: '1 1 100%' }}>
                  <Phone
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      [isRTL ? 'right' : 'left']: 14,
                      width: 16,
                      height: 16,
                      color: 'var(--muted-foreground)',
                      zIndex: 1,
                    }}
                  />
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={searchPhone}
                    onChange={(e) => { setSearchPhone(e.target.value); setSearchNotFound(false); setSearchError(false) }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={t.trackPhonePlaceholder}
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
              )}

              <button
                type="submit"
                disabled={searching || (searchOpen && (!searchOrderNumber.trim() || (!isLoggedIn && !searchPhone.trim())))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: searchOpen ? '11px 16px' : '11px 20px',
                  borderRadius: 12,
                  background: 'linear-gradient(90deg, #C4622D, #d97b4a)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                  border: 'none',
                  cursor: searching || (searchOpen && (!searchOrderNumber.trim() || (!isLoggedIn && !searchPhone.trim()))) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(196,98,45,0.22)',
                  whiteSpace: 'nowrap',
                  opacity: searchOpen && (!searchOrderNumber.trim() || (!isLoggedIn && !searchPhone.trim())) ? 0.5 : 1,
                  transition: 'padding 0.3s ease, opacity 0.2s',
                  flexShrink: 0,
                }}
              >
                {searching ? (
                  <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <span>{t.trackBtn}</span>
                    <ArrowRight style={{ width: 14, height: 14, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                  </>
                )}
              </button>
            </form>

            {/* ── Search Results ──────────────────────────────────────── */}
            {searchNotFound && (
              <div
                style={{
                  marginTop: 14,
                  padding: '20px 24px',
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  animation: 'fadeIn 0.25s ease',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'var(--accent-light)',
                    border: '1px solid var(--accent-ring)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    marginBottom: 12,
                  }}
                >
                  <SearchX style={{ width: 24, height: 24 }} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--foreground)', margin: '0 0 6px' }}>
                  {t.searchNoResults}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0, maxWidth: 360, lineHeight: 1.5 }}>
                  {t.searchNoResultsDesc}
                </p>
              </div>
            )}

            {searchError && (
              <div
                style={{
                  marginTop: 14,
                  padding: '16px 20px',
                  borderRadius: 16,
                  border: '1px solid rgba(220,38,38,0.2)',
                  background: 'rgba(220,38,38,0.04)',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  animation: 'fadeIn 0.25s ease',
                }}
              >
                <AlertCircle style={{ width: 18, height: 18, color: '#dc2626', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>{t.searchError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      {showContent && !isLoggedIn ? (
        /* ── Guest Empty State ── */
        <div
          style={{
            borderRadius: 24,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            marginBottom: 24,
          }}
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
            <LogIn style={{ width: 34, height: 34 }} />
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--foreground)', margin: '0 0 8px' }}>
            {t.guestTitle}
          </h2>

          <p style={{ fontSize: 13.5, color: 'var(--muted-foreground)', maxWidth: 400, margin: '0 0 28px', lineHeight: 1.6 }}>
            {t.guestDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3" style={{ width: '100%', maxWidth: 340 }}>
            <Link
              href={`/${locale}/login`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                flex: 1,
                width: '100%',
              }}
            >
              <LogIn style={{ width: 16, height: 16 }} />
              <span>{t.guestLogin}</span>
            </Link>

            <Link
              href={`/${locale}/signup`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 26px',
                borderRadius: 14,
                background: 'transparent',
                color: '#C4622D',
                fontSize: 14,
                fontWeight: 800,
                textDecoration: 'none',
                border: '1.5px solid #C4622D',
                transition: 'background 0.2s',
                flex: 1,
                width: '100%',
              }}
            >
              <UserPlus style={{ width: 16, height: 16 }} />
              <span>{t.guestSignup}</span>
            </Link>
          </div>
        </div>
      ) : showContent && error ? (
        /* ── Error State ── */
        <div
          style={{
            borderRadius: 24,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: 'rgba(220, 38, 38, 0.08)',
              border: '1.5px solid rgba(220, 38, 38, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
              marginBottom: 20,
            }}
          >
            <AlertCircle style={{ width: 34, height: 34 }} />
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--foreground)', margin: '0 0 8px' }}>
            {t.errorTitle}
          </h2>

          <p style={{ fontSize: 13.5, color: 'var(--muted-foreground)', maxWidth: 400, margin: '0 0 24px', lineHeight: 1.6 }}>
            {t.errorDesc}
          </p>

          <button
            onClick={() => window.location.reload()}
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
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(196,98,45,0.25)',
            }}
          >
            <RefreshCw style={{ width: 16, height: 16 }} />
            <span>{t.retry}</span>
          </button>
        </div>
      ) : showContent && orders.length === 0 ? (
        /* ── No Orders Empty State ── */
        <div
          style={{
            borderRadius: 24,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            marginBottom: 24,
          }}
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
            {t.noOrdersTitle}
          </h2>

          <p style={{ fontSize: 13.5, color: 'var(--muted-foreground)', maxWidth: 400, margin: '0 0 24px', lineHeight: 1.6 }}>
            {t.noOrdersDesc}
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
            <span>{t.browseProducts}</span>
          </Link>
        </div>
      ) : showContent && orders.length > 0 ? (
        /* ── Orders Cards Grid ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
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
      ) : null}

      {/* ── Tracking Section ──────────────────────────────────────── */}
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
            background: 'linear-gradient(135deg, rgba(196,98,45,0.04) 0%, rgba(184,150,90,0.02) 100%)',
            padding: '28px 24px',
            textAlign: 'center',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              border: '1px solid var(--accent-ring)',
            }}
          >
            <MapPin style={{ width: 24, height: 24, color: 'var(--accent)' }} />
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              fontWeight: 900,
              color: 'var(--foreground)',
              margin: '0 0 8px',
              fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
            }}
          >
            {t.trackSectionTitle}
          </h2>

          <p style={{ fontSize: 13.5, color: 'var(--muted-foreground)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            {t.trackSectionDesc}
          </p>
        </div>

        <div style={{ padding: '20px 24px', textAlign: 'center' }}>
          <Link
            href="#order-lookup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 14,
              background: 'linear-gradient(90deg, #C4622D, #d97b4a)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(196,98,45,0.22)',
              transition: 'transform 0.2s',
            }}
          >
            <Truck style={{ width: 16, height: 16 }} />
            <span>{t.trackSectionBtn}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, use, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, PackageX, Plus, Minus } from 'lucide-react'

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
  PENDING: '#A68246',
  CONFIRMED: '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED: '#0ea5e9',
  DELIVERED: '#16a34a',
  CANCELLED: '#dc2626',
  RETURNED: '#dc2626',
}

export function AccountOrdersPageClient({ params }: AccountOrdersPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderListItem[] | null>(null)

  const [claimOpen, setClaimOpen] = useState(false)
  const [claimOrderNumber, setClaimOrderNumber] = useState('')
  const [claimPhone, setClaimPhone] = useState('')
  const [claimBusy, setClaimBusy] = useState(false)
  const [claimMsg, setClaimMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const claimT = (key: string): string => {
    const map: Record<string, [string, string, string]> = {
      title: ['ربط طلب زائر', 'Lier une commande invité', 'Claim a guest order'],
      desc: ['هل لديك طلب سابق قمت به كزائر؟ اربطه بحسابك بواسطة رقم الطلب والهاتف.', 'Avez-vous une commande passée en tant qu\'invité ? Liez-la à votre compte avec le numéro de commande et le téléphone.', 'Had a guest order before? Link it to your account with your order number and phone.'],
      orderNum: ['رقم الطلب', 'N° de commande', 'Order number'],
      phone: ['الهاتف المستخدم في الطلب', 'Téléphone utilisé', 'Phone used on the order'],
      submit: ['ربط الطلب', 'Lier la commande', 'Link order'],
      toggle: ['ربط طلب قديم', 'Lier une ancienne commande', 'Link an old order'],
      success: ['تم ربط الطلب بحسابك بنجاح', 'Commande liée à votre compte', 'Order linked to your account'],
      fail: ['تعذّر التحقق. تحقق من رقم الطلب والهاتف.', 'Impossible de vérifier. Vérifiez le numéro et le téléphone.', 'Unable to verify. Check the order number and phone.'],
      busy: ['جاري التحقق...', 'Vérification...', 'Verifying...'],
      err: ['حدث خطأ، حاول مجدداً لاحقاً.', 'Une erreur est survenue.', 'Something went wrong, try later.'],
    }
    const e = map[key]
    if (!e) return key
    return locale === 'ar' ? e[0] : locale === 'fr' ? e[1] : e[2]
  }

  const submitClaim = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!claimOrderNumber.trim() || !claimPhone.trim()) return
    setClaimBusy(true)
    setClaimMsg(null)
    try {
      const res = await fetch('/api/customer/orders/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: claimOrderNumber, phone: claimPhone }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        setClaimMsg({ ok: true, text: claimT('success') })
        setClaimOrderNumber('')
        setClaimPhone('')
        fetch('/api/customer/orders', { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d && Array.isArray(d.orders)) setOrders(d.orders)
          })
          .catch(() => {})
      } else {
        setClaimMsg({ ok: false, text: claimT('fail') })
      }
    } catch {
      setClaimMsg({ ok: false, text: claimT('err') })
    } finally {
      setClaimBusy(false)
    }
  }

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
      .then((data) => {
        if (isMounted) setOrders(data.orders)
      })
      .catch((err: Error) => {
        if (isMounted) {
          if (err.message === 'not-authenticated') {
            router.replace(`/${locale}/login`)
          } else {
            setOrders([])
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
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
        <div className="animate-spin mx-auto h-10 w-10 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
        <p className="text-sm text-[var(--text-muted)]">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="container-brand page-shell" dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: 720 }}>
      <Link href={`/${locale}/account`} className="btn btn-outline btn-sm btn-round mb-5">
        <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
        <span>{t('back')}</span>
      </Link>

      <h1
        className="mb-6 text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]"
        style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
      >
        {t('title')}
      </h1>

      {/* ── Claim a guest order ─────────────────────────────────────── */}
      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
        <button
          type="button"
          onClick={() => {
            setClaimOpen((v) => !v)
            setClaimMsg(null)
          }}
          className="flex w-full items-center justify-between text-sm font-bold text-[var(--text-primary)] bg-transparent border-0 cursor-pointer"
        >
          <span>{claimT('toggle')}</span>
          <span className="text-[var(--accent)]">
            {claimOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </span>
        </button>

        {claimOpen && (
          <form onSubmit={submitClaim} className="mt-4 space-y-3">
            <p className="text-xs text-[var(--text-muted)]">{claimT('desc')}</p>
            <input
              type="text"
              value={claimOrderNumber}
              onChange={(e) => setClaimOrderNumber(e.target.value)}
              placeholder={claimT('orderNum')}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
            <input
              type="tel"
              inputMode="tel"
              value={claimPhone}
              onChange={(e) => setClaimPhone(e.target.value)}
              placeholder={claimT('phone')}
              className="tabular-nums w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
            {claimMsg && (
              <p className="text-xs font-semibold" style={{ color: claimMsg.ok ? 'var(--success)' : 'var(--error)' }}>
                {claimMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={claimBusy}
              className="btn btn-primary btn-sm rounded-xl px-5"
            >
              {claimBusy ? claimT('busy') : claimT('submit')}
            </button>
          </form>
        )}
      </div>

      {orders !== null && orders.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-9 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)]">
            <PackageX className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('empty')}</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-[var(--text-muted)]">{t('emptyDesc')}</p>
          <Link href={`/${locale}/products`} className="btn btn-primary btn-round mt-6 px-6">
            {t('shop')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {orders?.map((order) => (
            <Link
              key={order.id}
              href={`/${locale}/account/orders/${order.id}`}
              className="block rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 transition-all hover:border-[var(--accent-ring)] hover:shadow-sm no-underline"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="tabular-nums font-bold text-[var(--text-primary)]">
                      {t('order')} #{order.orderNumber}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                      style={{ background: STATUS_COLORS[order.status] ?? '#6b7280' }}
                    >
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  <p className="tabular-nums mt-1.5 text-xs text-[var(--text-muted)]">
                    {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')}
                    {' · '}
                    {order.itemsCount} {t('items')}
                    {order.itemsCount > 1 && locale !== 'ar' ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-end">
                    <p className="text-[11px] text-[var(--text-muted)] m-0">{t('total')}</p>
                    <p className="tabular-nums font-extrabold text-[var(--accent)] m-0">
                      {order.total.toLocaleString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')} MAD
                    </p>
                  </div>
                  <Chevron className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

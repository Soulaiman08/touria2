'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Package,
  Save,
  FileText,
  Printer,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { useAdminI18n } from '@/components/admin/providers/AdminI18nContext'
import { formatPrice } from '@/lib/utils'
import { resolveOrderColor } from '@/lib/color-names'
import { CopyWhatsAppButton } from '@/components/admin/orders/CopyWhatsAppButton'

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  paymentMethod: string
  paymentStatus: string
  customerName: string
  customerPhone: string
  customerPhone2?: string
  customerEmail?: string
  region?: string
  city: string
  district?: string
  address: string
  postalCode?: string
  notes?: string
  adminNotes?: string
  subtotal: number
  shippingCost: number
  discountAmount: number
  total: number
  locale?: string
  createdAt: string
  items: {
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    productSnapshot: Record<string, unknown>
    product?: { nameFr?: string; nameAr?: string; mainImage?: string }
  }[]
  statusHistory: {
    id: string
    status: string
    note?: string
    createdAt: string
  }[]
}

interface SnapshotColor {
  code?: string
  nameAr?: string
  nameFr?: string
  nameEn?: string
  name?: string
}

interface SnapshotNiqab {
  id: string
  nameAr?: string
  nameFr?: string
  image?: string
  color?: SnapshotColor | string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
}

interface Snapshot extends Record<string, unknown> {
  nameAr?: string
  nameFr?: string
  nameEn?: string
  mainImage?: string
  sku?: string
  size?: string
  selectedSize?: string
  color?: SnapshotColor | string
  selectedColor?: SnapshotColor | string
  niqabs?: SnapshotNiqab[]
}

const statusOptions = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
]

const text = (value: unknown) => (typeof value === 'string' ? value : '')

function ColorDot({ code }: { code?: string }) {
  if (!code || !/^#?[0-9a-f]{3,8}$/i.test(code)) return null
  const hex = code.startsWith('#') ? code : `#${code}`
  return (
    <span
      title={hex}
      aria-label={`Color ${hex}`}
      className="inline-block w-3.5 h-3.5 rounded-full border border-white/85 ring-1 ring-black/50 align-middle ms-1.5 shrink-0"
      style={{ background: hex }}
    />
  )
}

function OrderDetailContent({ orderId }: { orderId: string }) {
  const { tr, statusLabel, formatDate, isRTL, locale } = useAdminI18n()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const { success, error } = useToast()

  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  useEffect(() => {
    let active = true
    async function loadOrderDetail() {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to load order: ${res.status}`)
        const data = await res.json()
        if (active && data.order) {
          setOrder(data.order)
          setStatus(data.order.status)
          setAdminNotes(data.order.adminNotes || '')
        }
      } catch (err) {
        console.error('Error loading order details:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadOrderDetail()
    return () => {
      active = false
    }
  }, [orderId, refreshTick])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNotes,
          note: statusNote || undefined,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || tr('فشل تحديث الطلب', 'Failed to update order'))
      }

      setRefreshTick((t) => t + 1)
      setStatusNote('')
      success(tr('تم حفظ تحديثات الطلب بنجاح', 'Order updated successfully'))
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : tr('فشل حفظ التعديلات', 'Update failed')
      error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-amber-400" />
        <p className="text-sm font-semibold text-zinc-200">
          {tr('جاري تحميل تفاصيل الطلب...', 'Loading order details...')}
        </p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <p className="text-base font-bold text-zinc-100">
          {tr('تعذر العثور على هذا الطلب.', 'Order not found.')}
        </p>
        <Link
          href="/control-panel-ss7/orders"
          className="text-amber-400 hover:text-amber-300 font-bold text-xs mt-3 inline-block"
        >
          {tr('العودة إلى قائمة الطلبات', 'Return to orders list')}
        </Link>
      </div>
    )
  }

  const isDirty =
    status !== order.status ||
    adminNotes !== (order.adminNotes || '') ||
    Boolean(statusNote.trim())

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Top Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <Link
            href="/control-panel-ss7/orders"
            aria-label={tr('العودة إلى الطلبات', 'Back to orders')}
            className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-zinc-600 text-zinc-300 hover:text-white flex items-center justify-center transition-colors shrink-0 no-print"
          >
            <BackIcon className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {tr('تم الإنشاء في', 'Placed on')} {formatDate(order.createdAt, true)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <CopyWhatsAppButton order={order} variant="primary" />

          <button
            type="button"
            onClick={() => window.print()}
            className="h-10 px-3.5 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-zinc-600 text-zinc-200 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-zinc-400" />
            <span>{tr('طباعة', 'Print')}</span>
          </button>

          <div className="flex items-center gap-2 h-10 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3">
            <span className="text-xs font-bold text-zinc-400">{tr('الحالة:', 'Status:')}</span>
            <div className="relative flex items-center">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                aria-label={tr('حالة الطلب', 'Order status')}
                className="appearance-none min-w-[138px] h-7 bg-[#111115] border border-zinc-700/70 focus:border-amber-500/70 rounded-lg ps-2.5 pe-7 text-xs font-extrabold text-amber-400 outline-none cursor-pointer"
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {statusLabel(st)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400 absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {isDirty && (
            <button
              type="button"
              onClick={handleUpdate}
              disabled={saving}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-black inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? tr('جاري الحفظ...', 'Saving...') : tr('حفظ التغيير', 'Save Change')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Layout Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Start Column (2/3 width): Purchased Items & Admin Notes */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Purchased Items Card */}
          <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 sm:px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/40">
              <Package className="w-[18px] h-[18px] text-amber-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                {tr('منتجات الطلب', 'Order Items')} ({order.items.length})
              </h2>
            </div>

            <div className="px-5 sm:px-6 pb-5 pt-2 flex flex-col divide-y divide-zinc-800/70">
              {order.items.map((item) => {
                const snap = (item.productSnapshot ?? {}) as Snapshot
                const rawSize = text(snap.selectedSize) || text(snap.size)
                const nameArStr = text(snap.nameAr) || item.product?.nameAr || ''
                const nameFrStr = text(snap.nameFr) || item.product?.nameFr || ''
                const nameEnStr = text(snap.nameEn) || ''
                const isNiqabItem = Boolean(
                  snap.isNiqab ||
                    /نقاب/i.test(nameArStr) ||
                    /niqab/i.test(nameFrStr) ||
                    /niqab/i.test(nameEnStr)
                )
                const isFakeSize = [
                  'standard',
                  'one size',
                  'onesize',
                  'n/a',
                  'na',
                  'none',
                  'undefined',
                  'null',
                  '',
                ].includes(rawSize.toLowerCase().trim())
                const hasRealSize = !isNiqabItem && !isFakeSize && Boolean(rawSize.trim())

                const colorInfo = resolveOrderColor(
                  snap.selectedColor || snap.color,
                  locale === 'ar' ? 'ar' : 'en'
                )
                const productName =
                  locale === 'ar'
                    ? nameArStr || nameFrStr || nameEnStr || tr('منتج', 'Product')
                    : nameEnStr || nameFrStr || nameArStr || tr('منتج', 'Product')
                const productImage =
                  snap.mainImage || item.product?.mainImage || '/images/brand/logo-full.png'

                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 py-4"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="relative w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-700/80 overflow-hidden shrink-0">
                        <Image
                          src={productImage}
                          alt={productName}
                          fill
                          sizes="160px"
                          quality={92}
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <h3 className="text-sm sm:text-[15px] font-bold text-white leading-snug">
                          {productName}
                        </h3>

                        {(hasRealSize || colorInfo.name) && (
                          <div className="text-xs sm:text-[13px] text-zinc-300 flex items-center flex-wrap gap-2 font-medium">
                            {hasRealSize && (
                              <span>
                                {tr('المقاس:', 'Size:')}{' '}
                                <strong className="text-white font-semibold">{rawSize}</strong>
                              </span>
                            )}
                            {hasRealSize && colorInfo.name && (
                              <span className="text-zinc-600">·</span>
                            )}
                            {colorInfo.name && (
                              <span className="inline-flex items-center">
                                {tr('اللون:', 'Color:')}{' '}
                                <strong className="text-white font-semibold ms-1">
                                  {colorInfo.name}
                                </strong>
                                <ColorDot code={colorInfo.code} />
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-zinc-400 font-mono tabular-nums">
                          {formatPrice(item.unitPrice, 'fr')} {tr('للقطعة', 'each')}
                        </p>

                        {/* Niqab Add-ons */}
                        {Array.isArray(snap.niqabs) &&
                          snap.niqabs.map((niqab, niqabIndex) => {
                            const niqabColor = resolveOrderColor(
                              niqab.color,
                              locale === 'ar' ? 'ar' : 'en'
                            )
                            const niqabName =
                              locale === 'ar'
                                ? niqab.nameAr || niqab.nameFr || 'نقاب'
                                : niqab.nameFr || niqab.nameAr || 'Niqab'
                            return (
                              <div
                                key={`${niqab.id}-${niqabIndex}`}
                                className="mt-1.5 flex items-center gap-2 flex-wrap text-xs bg-amber-500/8 border border-amber-500/20 rounded-xl px-2.5 py-1.5"
                              >
                                {niqab.image && (
                                  <Image
                                    src={niqab.image}
                                    alt={niqabName}
                                    width={64}
                                    height={64}
                                    quality={92}
                                    referrerPolicy="no-referrer"
                                    className="w-6 h-6 object-cover rounded-md shrink-0"
                                  />
                                )}
                                <span className="font-bold text-amber-400">
                                  {tr('نقاب:', 'Niqab:')} {niqabName}
                                </span>
                                {niqabColor.name && (
                                  <>
                                    <span className="text-zinc-600">—</span>
                                    <span className="text-zinc-100 inline-flex items-center">
                                      {niqabColor.name}
                                      <ColorDot code={niqabColor.code} />
                                    </span>
                                  </>
                                )}
                                <span className="text-zinc-300 font-mono">
                                  × {niqab.quantity ?? 0}
                                </span>
                                <span className="text-amber-400 font-extrabold font-mono tabular-nums ms-auto">
                                  {formatPrice(
                                    niqab.totalPrice ??
                                      (niqab.unitPrice
                                        ? niqab.unitPrice * (niqab.quantity ?? 1)
                                        : 0),
                                    'fr'
                                  )}
                                </span>
                              </div>
                            )
                          })}
                      </div>
                    </div>

                    <div className="text-end flex flex-col gap-1 shrink-0 min-w-[84px]">
                      <span className="text-xs text-zinc-300 font-semibold tabular-nums">
                        {tr('الكمية:', 'Qty:')} {item.quantity}
                      </span>
                      <span className="text-sm sm:text-[15px] font-extrabold text-amber-400 font-mono tabular-nums">
                        {formatPrice(item.totalPrice, 'fr')}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* Price Summary */}
              <div className="pt-4 mt-2 border-t border-zinc-800 flex flex-col gap-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>{tr('المجموع الفرعي', 'Subtotal')}</span>
                  <span className="font-semibold text-white font-mono tabular-nums">
                    {formatPrice(order.subtotal, 'fr')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>{tr('تكلفة التوصيل', 'Shipping Cost')}</span>
                  <span className="font-semibold text-white font-mono tabular-nums">
                    {formatPrice(order.shippingCost, 'fr')}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-rose-400">
                    <span>{tr('الخصم', 'Discount')}</span>
                    <span className="font-bold font-mono tabular-nums">
                      -{formatPrice(order.discountAmount, 'fr')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-zinc-800 text-sm sm:text-base font-black text-white">
                  <span>{tr('المجموع الإجمالي', 'Grand Total')}</span>
                  <span className="text-amber-400 text-lg font-mono tabular-nums">
                    {formatPrice(order.total, 'fr')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Admin Notes Card */}
          <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden no-print">
            <div className="flex items-center gap-2.5 px-5 sm:px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/40">
              <FileText className="w-[18px] h-[18px] text-amber-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                {tr('ملاحظات الإدارة وتحديث الحالة', 'Internal Admin Notes & Status Remark')}
              </h2>
            </div>

            <div className="p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200">
                  {tr('ملاحظة تحديث الحالة (اختياري)', 'Status Update Remark (Optional)')}
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder={tr(
                    'مثال: تم تسليم الطرد لشركة الشحن (رقم التتبع #123456)...',
                    'e.g., Package handed to courier (Tracking #123456)...'
                  )}
                  className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200">
                  {tr('ملاحظات خاصة بفريق العمل', 'Permanent Staff Notes')}
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={tr('أضف ملاحظات داخلية خاصة...', 'Add private staff notes...')}
                  className="w-full bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none resize-none transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>
                  {saving
                    ? tr('جاري حفظ التحديثات...', 'Saving updates...')
                    : tr('حفظ التغييرات والملاحظات', 'Save Status & Notes Changes')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* End Column (1/3 width): Customer Info & Status Timeline */}
        <div className="flex flex-col gap-6">
          {/* Customer Information Card */}
          <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800/80 bg-zinc-950/40">
              <User className="w-[18px] h-[18px] text-amber-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                {tr('بيانات العميل والشحن', 'Customer Information')}
              </h2>
            </div>

            <div className="p-5 flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-400 block">
                    {tr('الاسم', 'Name')}
                  </span>
                  <span className="font-extrabold text-white">{order.customerName}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                    {tr('الهاتف', 'Phone')}
                  </span>
                  <a
                    href={`tel:${order.customerPhone}`}
                    dir="ltr"
                    className="font-mono font-extrabold text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline inline-block w-fit"
                  >
                    {order.customerPhone}
                  </a>
                  {order.customerPhone2 && (
                    <a
                      href={`tel:${order.customerPhone2}`}
                      dir="ltr"
                      className="font-mono text-zinc-300 hover:text-white text-xs inline-block w-fit"
                    >
                      {order.customerPhone2}
                    </a>
                  )}
                </div>
              </div>

              {order.customerEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-400 block">
                      {tr('البريد الإلكتروني', 'Email')}
                    </span>
                    <span className="text-zinc-100 font-semibold break-all text-xs sm:text-sm">
                      {order.customerEmail}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 pt-3.5 border-t border-zinc-800/80">
                <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                    {tr('عنوان التوصيل', 'Shipping Address')}
                  </span>
                  <span className="text-zinc-100 font-medium text-xs sm:text-sm leading-relaxed">
                    {order.address}
                  </span>
                  <span className="text-amber-400 font-extrabold text-xs sm:text-sm">
                    {order.city} {order.district ? `(${order.district})` : ''}
                  </span>
                </div>
              </div>

              {order.notes && (
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[11px] text-amber-400 font-extrabold uppercase tracking-wide block">
                    {tr('ملاحظة العميل:', 'Customer Order Note:')}
                  </span>
                  <p className="text-zinc-200 text-xs sm:text-sm italic mt-1.5 leading-relaxed">
                    &ldquo;{order.notes}&rdquo;
                  </p>
                </div>
              )}

              <div className="pt-3.5 border-t border-zinc-800/80 no-print">
                <CopyWhatsAppButton order={order} variant="card" />
              </div>
            </div>
          </div>

          {/* Status Timeline Log Card */}
          <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800/80 bg-zinc-950/40">
              <Clock className="w-[18px] h-[18px] text-amber-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                {tr('سجل الحالات', 'Status History Log')}
              </h2>
            </div>

            <div className="p-5">
              <div className="border-s-2 border-zinc-700/80 ps-5 ms-1.5 flex flex-col gap-4">
                {order.statusHistory.length === 0 ? (
                  <div className="text-xs text-zinc-400">
                    {tr('تم إنشاء الطلب في', 'Order placed on')} {formatDate(order.createdAt)}
                  </div>
                ) : (
                  order.statusHistory.map((hist) => (
                    <div key={hist.id} className="relative flex flex-col gap-1">
                      <span
                        aria-hidden="true"
                        className="absolute -start-[26px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-zinc-900"
                      />
                      <div className="text-xs font-extrabold text-white uppercase">
                        {statusLabel(hist.status)}
                      </div>
                      {hist.note && (
                        <p className="text-xs text-zinc-300 leading-relaxed">{hist.note}</p>
                      )}
                      <span className="text-[11px] text-zinc-500">
                        {formatDate(hist.createdAt, true)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  return (
    <ToastProvider>
      <AdminLayout>
        <OrderDetailContent orderId={resolvedParams.id} />
      </AdminLayout>
    </ToastProvider>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Search,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  CheckCircle2,
  RotateCcw,
  X,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { useAdminI18n } from '@/components/admin/providers/AdminI18nContext'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  region: string
  city: string
  address: string
  total: number
  shippingCost: number
  status: string
  itemsCount: number
  createdAt: string
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

function OrdersContent() {
  const { tr, statusLabel, isRTL } = useAdminI18n()
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const { success, error } = useToast()

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft
  const NextIcon = isRTL ? ChevronLeft : ChevronRight

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    async function loadOrders() {
      try {
        const params = new URLSearchParams()
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())
        if (statusFilter !== 'all') params.set('status', statusFilter)
        params.set('page', String(page))
        params.set('limit', '10')

        const res = await fetch(`/api/admin/orders?${params.toString()}`, {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`Failed to load orders: ${res.status}`)
        const data = await res.json()

        if (active && Array.isArray(data.items)) {
          setOrders(data.items)
          setTotalPages(data.totalPages || 1)
          setTotalCount(typeof data.total === 'number' ? data.total : data.items.length)
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadOrders()
    return () => {
      active = false
    }
  }, [debouncedSearch, statusFilter, page, refreshTick])

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || tr('فشل تحديث الحالة', 'Failed to update status'))
      }

      success(
        tr(
          `تم تحديث حالة الطلب إلى ${statusLabel(newStatus)}`,
          `Order status updated to ${statusLabel(newStatus)}`
        )
      )
      setRefreshTick((t) => t + 1)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : tr('فشل تحديث الحالة', 'Status update failed')
      error(errorMessage)
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const label = statusLabel(status)
    const base =
      'inline-flex items-center justify-center gap-1.5 min-w-[114px] px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap'
    switch (status) {
      case 'DELIVERED':
        return (
          <span className={`${base} bg-emerald-500/12 text-emerald-400 border-emerald-500/25`}>
            <PackageCheck className="w-3.5 h-3.5 shrink-0" />
            {label}
          </span>
        )
      case 'SHIPPED':
        return (
          <span className={`${base} bg-sky-500/12 text-sky-400 border-sky-500/25`}>
            <Truck className="w-3.5 h-3.5 shrink-0" />
            {label}
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className={`${base} bg-cyan-500/12 text-cyan-400 border-cyan-500/25`}>
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            {label}
          </span>
        )
      case 'PROCESSING':
        return (
          <span className={`${base} bg-amber-500/12 text-amber-400 border-amber-500/25`}>
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {label}
          </span>
        )
      case 'CANCELLED':
        return (
          <span className={`${base} bg-rose-500/12 text-rose-400 border-rose-500/25`}>
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            {label}
          </span>
        )
      case 'RETURNED':
        return (
          <span className={`${base} bg-zinc-800 text-zinc-300 border-zinc-700`}>
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            {label}
          </span>
        )
      default:
        return (
          <span className={`${base} bg-zinc-800/90 text-zinc-200 border-zinc-700`}>
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {label}
          </span>
        )
    }
  }

  const hasFilters = Boolean(search.trim()) || statusFilter !== 'all'

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/12 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {tr('إدارة الطلبات', 'Order Management')}
            </h1>
            <p className="text-xs sm:text-[13px] text-zinc-400 mt-0.5">
              {tr(
                'تتبع طلبات العملاء، تحديث حالة الشحن، ومعاينة تفاصيل كل طلب',
                'Track customer orders, update shipping status, and review order details'
              )}
            </p>
          </div>
        </div>

        {totalCount !== null && (
          <div className="text-xs font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl tabular-nums">
            {tr('الطلبات:', 'Orders:')} <span className="text-amber-400 font-mono">{totalCount}</span>
          </div>
        )}
      </div>

      {/* Search & Status Filter Card */}
      <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-zinc-500 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder={tr('ابحث برقم الطلب، الهاتف، اسم العميل...', 'Search by order #, phone, customer...')}
              className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 rounded-xl ps-10 pe-10 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
                aria-label={tr('مسح البحث', 'Clear search')}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                aria-label={tr('تصفية حسب الحالة', 'Filter by status')}
                className="appearance-none h-11 min-w-[168px] bg-[#111115] border border-zinc-700/80 focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 rounded-xl ps-3.5 pe-9 text-xs font-bold text-zinc-100 outline-none cursor-pointer transition-colors"
              >
                <option value="all">{tr('جميع الحالات', 'All Statuses')}</option>
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {statusLabel(st)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setPage(1)
              }}
              className="h-11 px-3.5 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              {tr('مسح الفلاتر', 'Clear Filters')}
            </button>
          )}
        </div>

        {/* Quick Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 admin-scroll">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all')
              setPage(1)
            }}
            className={`h-8 px-3 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-zinc-950 border-amber-500'
                : 'bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            {tr('الكل', 'All')}
          </button>
          {statusOptions.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st)
                setPage(1)
              }}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                statusFilter === st
                  ? 'bg-amber-500 text-zinc-950 border-amber-500'
                  : 'bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {statusLabel(st)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Table Card */}
      <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden">
        {/* Mobile Cards (< lg) */}
        <div className="lg:hidden divide-y divide-zinc-800/70">
          {loading ? (
            <div className="py-14 text-center text-zinc-400">
              <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-amber-400" />
              <p className="text-xs">{tr('جاري تحميل الطلبات...', 'Fetching orders list...')}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-14 px-4 text-center text-xs text-zinc-500">
              {tr('لا توجد طلبات مطابقة للبحث.', 'No orders found matching filters.')}
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-black text-amber-400">
                        {ord.orderNumber}
                      </span>
                      {getStatusBadge(ord.status)}
                    </div>
                    <p className="text-sm font-bold text-white mt-1.5 truncate">{ord.customerName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      <span dir="ltr" className="font-mono inline-block">{ord.customerPhone}</span> · {ord.city}
                      {ord.region ? ` (${ord.region})` : ''}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="font-mono font-black text-emerald-400 text-sm tabular-nums">
                      {formatPrice(ord.total, 'fr')}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 tabular-nums">
                      {ord.itemsCount} {tr('عنصر', 'item(s)')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/70">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="relative flex-1 max-w-[190px]">
                      <select
                        value={ord.status}
                        disabled={updatingId === ord.id}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                        aria-label={tr('تحديث حالة الطلب', 'Update order status')}
                        className="w-full h-9 appearance-none bg-[#111115] border border-zinc-700/80 focus:border-amber-500/70 rounded-lg ps-3 pe-8 text-xs font-bold text-zinc-100 outline-none cursor-pointer disabled:opacity-50"
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>
                            {statusLabel(st)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {updatingId === ord.id && (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                    )}
                  </div>

                  <Link
                    href={`/control-panel-ss7/orders/${ord.id}`}
                    className="h-9 px-3.5 rounded-lg bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{tr('تفاصيل', 'Details')}</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (>= lg) */}
        <div className="hidden lg:block overflow-x-auto admin-scroll">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-start">{tr('رقم الطلب', 'Order #')}</th>
                <th className="py-3.5 px-4 text-start">{tr('العميل والمدينة', 'Customer & City')}</th>
                <th className="py-3.5 px-4 text-start">{tr('الجهة', 'Region')}</th>
                <th className="py-3.5 px-4 text-start">{tr('القطع', 'Items')}</th>
                <th className="py-3.5 px-4 text-start">{tr('الشحن', 'Shipping')}</th>
                <th className="py-3.5 px-4 text-start">{tr('المجموع', 'Total')}</th>
                <th className="py-3.5 px-4 text-start">{tr('الحالة', 'Status')}</th>
                <th className="py-3.5 px-4 text-start">{tr('تحديث سريع', 'Quick Update')}</th>
                <th className="py-3.5 px-4 text-end">{tr('إجراء', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-14 px-4 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-amber-400" />
                    <p className="text-xs">{tr('جاري تحميل قائمة الطلبات...', 'Fetching orders list...')}</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 px-4 text-center text-xs text-zinc-500">
                    {tr('لا توجد طلبات مطابقة للفلاتر المحددة.', 'No orders found matching filters.')}
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-800/35 transition-colors">
                    <td className="py-4 px-4 font-black text-amber-400 font-mono whitespace-nowrap">
                      {ord.orderNumber}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{ord.customerName}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        <span dir="ltr" className="font-mono inline-block">{ord.customerPhone}</span> · {ord.city}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-300 text-xs">{ord.region || '—'}</td>
                    <td className="py-4 px-4 text-zinc-300 text-xs tabular-nums whitespace-nowrap">
                      {ord.itemsCount} {tr('عنصر', 'item(s)')}
                    </td>
                    <td className="py-4 px-4 text-zinc-400 text-xs font-mono tabular-nums whitespace-nowrap">
                      {formatPrice(ord.shippingCost ?? 0, 'fr')}
                    </td>
                    <td className="py-4 px-4 font-black text-emerald-400 font-mono tabular-nums whitespace-nowrap">
                      {formatPrice(ord.total, 'fr')}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(ord.status)}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <div className="relative">
                          <select
                            value={ord.status}
                            disabled={updatingId === ord.id}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                            aria-label={tr('تغيير حالة الطلب', 'Change order status')}
                            className="w-[152px] h-9 appearance-none bg-[#111115] border border-zinc-700/80 focus:border-amber-500/70 rounded-lg ps-3 pe-8 text-xs font-bold text-zinc-100 outline-none cursor-pointer disabled:opacity-50"
                          >
                            {statusOptions.map((st) => (
                              <option key={st} value={st}>
                                {statusLabel(st)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {updatingId === ord.id && (
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-end whitespace-nowrap">
                      <Link
                        href={`/control-panel-ss7/orders/${ord.id}`}
                        className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{tr('تفاصيل', 'Details')}</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-400 font-medium tabular-nums">
            {tr(`صفحة ${page} من ${totalPages}`, `Page ${page} of ${totalPages}`)}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              aria-label={tr('الصفحة السابقة', 'Previous page')}
              className="h-9 w-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <PrevIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              aria-label={tr('الصفحة التالية', 'Next page')}
              className="h-9 w-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <NextIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  return (
    <ToastProvider>
      <AdminLayout>
        <OrdersContent />
      </AdminLayout>
    </ToastProvider>
  )
}

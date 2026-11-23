'use client'

import React, { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Users,
  Search,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  X,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider } from '@/components/admin/providers/ToastContext'
import { useAdminI18n } from '@/components/admin/providers/AdminI18nContext'
import { formatPrice } from '@/lib/utils'

interface CustomerOrderItem {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
}

interface CustomerItem {
  id: string
  name: string
  phone: string
  email: string
  city: string
  address: string
  avatarUrl?: string | null
  isGuest?: boolean
  totalSpent: number
  ordersCount: number
  lastOrderDate: string
  orders: CustomerOrderItem[]
}

const ORDER_STATUS_BADGES: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  CONFIRMED: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  PROCESSING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  SHIPPED: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
  RETURNED: 'bg-zinc-700/30 text-zinc-300 border-zinc-600/40',
}

function CustomersContent({ initialSearch }: { initialSearch: string }) {
  const { tr, formatDate, statusLabel, isRTL, dir } = useAdminI18n()

  const [customers, setCustomers] = useState<CustomerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    async function loadCustomers() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(debouncedSearch)}`)
        if (!res.ok) {
          if (active) setCustomers([])
          return
        }
        const data = await res.json()
        if (active) {
          setSelectedCustomer(null)
          setCustomers(Array.isArray(data.customers) ? data.customers : [])
        }
      } catch (err) {
        console.error('Error fetching customers:', err)
        if (active) setCustomers([])
      } finally {
        if (active) setLoading(false)
      }
    }
    loadCustomers()
    return () => {
      active = false
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (!selectedCustomer) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCustomer(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedCustomer])

  const DetailChevron = isRTL ? ChevronLeft : ChevronRight

  return (
    <div dir={dir} className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {tr('دليل العملاء', 'Customers Directory')}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {tr(
                'استعراض ملفات العملاء، إجمالي الإنفاق، وسجل الطلبات',
                'View customer profiles, total lifetime spending, and order history'
              )}
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 tabular-nums shrink-0">
          {tr(`${customers.length} عميل`, `${customers.length} customers`)}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr('بحث باسم العميل، رقم الهاتف، المدينة...', 'Search by customer name, phone, city...')}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl ps-10 pe-10 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label={tr('مسح البحث', 'Clear search')}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-3">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="h-16 rounded-xl bg-zinc-950/70 border border-zinc-800/70 animate-pulse"
            />
          ))}
        </div>
      ) : customers.length === 0 ? (
        /* Empty State */
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl px-6 py-16 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-zinc-200">
            {tr('لم يتم العثور على أي عملاء', 'No customers found')}
          </p>
          <p className="text-xs text-zinc-500">
            {search
              ? tr('جرّب تغيير كلمات البحث أو مسح الفلتر.', 'Try adjusting or clearing your search query.')
              : tr('سيظهر العملاء هنا بمجرد إتمام أول طلب.', 'Customers will appear here once orders are placed.')}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{tr('مسح البحث', 'Clear Search')}</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Cards (< md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {customers.map((cust) => (
              <div
                key={cust.id}
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black leading-none flex items-center justify-center text-sm shrink-0 overflow-hidden select-none">
                      {cust.avatarUrl ? (
                        <Image
                          src={cust.avatarUrl}
                          alt={cust.name}
                          fill
                          sizes="128px"
                          quality={92}
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                      ) : (
                        cust.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">{cust.name}</span>
                        {cust.isGuest && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 whitespace-nowrap shrink-0">
                            {tr('زائر', 'Guest')}
                          </span>
                        )}
                      </div>
                      {cust.email && (
                        <p dir="ltr" className="text-[11px] text-zinc-400 truncate text-start mt-0.5">
                          {cust.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">{tr('الهاتف', 'Phone')}</span>
                    <a
                      href={`tel:${cust.phone}`}
                      dir="ltr"
                      className="font-mono font-bold text-amber-400 hover:underline inline-block mt-0.5 truncate max-w-full"
                    >
                      {cust.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">{tr('المدينة', 'City')}</span>
                    <span className="font-semibold text-zinc-200 block mt-0.5 truncate">
                      {cust.city || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">{tr('الطلبات', 'Orders')}</span>
                    <span className="font-bold text-zinc-100 tabular-nums block mt-0.5">
                      {cust.ordersCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">{tr('إجمالي الإنفاق', 'Total Spent')}</span>
                    <span className="font-black text-emerald-400 tabular-nums block mt-0.5">
                      {formatPrice(cust.totalSpent, 'fr')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <span className="text-[11px] text-zinc-500">
                    {tr('آخر طلب:', 'Last order:')}{' '}
                    <span className="text-zinc-300">
                      {cust.lastOrderDate ? formatDate(cust.lastOrderDate) : '—'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(cust)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{tr('سجل الطلبات', 'View History')}</span>
                    <DetailChevron className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto admin-scroll">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-950/70 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-start whitespace-nowrap">{tr('العميل', 'Customer')}</th>
                    <th className="py-3.5 px-4 text-start whitespace-nowrap">{tr('الهاتف', 'Phone')}</th>
                    <th className="py-3.5 px-4 text-start whitespace-nowrap">{tr('المدينة', 'City')}</th>
                    <th className="py-3.5 px-4 text-start whitespace-nowrap">{tr('الطلبات', 'Orders')}</th>
                    <th className="py-3.5 px-4 text-start whitespace-nowrap">{tr('إجمالي الإنفاق', 'Total Spent')}</th>
                    <th className="py-3.5 px-4 text-start whitespace-nowrap">{tr('آخر طلب', 'Last Order')}</th>
                    <th className="py-3.5 px-4 text-end whitespace-nowrap">{tr('التفاصيل', 'Details')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-zinc-800/35 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black leading-none flex items-center justify-center text-sm shrink-0 overflow-hidden select-none">
                            {cust.avatarUrl ? (
                              <Image
                                src={cust.avatarUrl}
                                alt={cust.name}
                                fill
                                sizes="128px"
                                quality={92}
                                referrerPolicy="no-referrer"
                                className="object-cover"
                              />
                            ) : (
                              cust.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white truncate max-w-[200px]">
                                {cust.name}
                              </span>
                              {cust.isGuest && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 whitespace-nowrap shrink-0">
                                  {tr('زائر', 'Guest')}
                                </span>
                              )}
                            </div>
                            {cust.email && (
                              <div dir="ltr" className="text-[11px] text-zinc-400 truncate max-w-[220px] text-start">
                                {cust.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <a
                          href={`tel:${cust.phone}`}
                          dir="ltr"
                          className="font-mono font-bold text-amber-400 hover:underline text-xs"
                        >
                          {cust.phone}
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300 whitespace-nowrap">{cust.city || '—'}</td>
                      <td className="py-3.5 px-4 font-bold text-zinc-100 tabular-nums whitespace-nowrap">
                        {tr(`${cust.ordersCount} طلب`, `${cust.ordersCount} order(s)`)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-400 tabular-nums whitespace-nowrap">
                        {formatPrice(cust.totalSpent, 'fr')}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-400 whitespace-nowrap">
                        {cust.lastOrderDate ? formatDate(cust.lastOrderDate) : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-end whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(cust)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>{tr('عرض السجل', 'View History')}</span>
                          <DetailChevron className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Customer Account Details Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[94dvh] sm:max-h-[88vh] flex flex-col overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl text-zinc-100"
          >
            {/* Sticky Modal Header */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-7 py-4 sm:py-5 border-b border-zinc-800 bg-zinc-900/95 shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20 overflow-hidden shrink-0">
                  {selectedCustomer.avatarUrl ? (
                    <Image
                      src={selectedCustomer.avatarUrl}
                      alt={selectedCustomer.name}
                      fill
                      sizes="160px"
                      quality={92}
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  ) : (
                    selectedCustomer.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-white truncate">
                      {selectedCustomer.name}
                    </h2>
                    {selectedCustomer.isGuest && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 whitespace-nowrap">
                        {tr('حساب زائر', 'Guest')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {tr('ملف العميل وملخص المعاملات', 'Customer Profile & Transaction Summary')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                aria-label={tr('إغلاق', 'Close')}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto admin-scroll p-4 sm:p-7 space-y-5 sm:space-y-6">
              {/* Contact Strip */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                {selectedCustomer.phone && (
                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    dir="ltr"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 font-mono font-bold hover:border-amber-500/40 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedCustomer.phone}</span>
                  </a>
                )}
                {selectedCustomer.email && (
                  <span
                    dir="ltr"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300"
                  >
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{selectedCustomer.email}</span>
                  </span>
                )}
                {(selectedCustomer.address || selectedCustomer.city) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>
                      {[selectedCustomer.city, selectedCustomer.address].filter(Boolean).join(' — ')}
                    </span>
                  </span>
                )}
              </div>

              {/* 3-Stat Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    {tr('إجمالي الطلبات', 'Total Orders')}
                  </span>
                  <span className="text-lg font-black text-white tabular-nums mt-1 block">
                    {selectedCustomer.ordersCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    {tr('إجمالي الإنفاق', 'Total Spent')}
                  </span>
                  <span className="text-lg font-black text-emerald-400 tabular-nums mt-1 block">
                    {formatPrice(selectedCustomer.totalSpent, 'fr')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    {tr('المدينة', 'City')}
                  </span>
                  <span className="text-lg font-black text-amber-400 mt-1 block truncate">
                    {selectedCustomer.city || '—'}
                  </span>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>
                    {tr(
                      `سجل الطلبات (${selectedCustomer.orders.length})`,
                      `Order History (${selectedCustomer.orders.length})`
                    )}
                  </span>
                </h3>

                <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/70 divide-y divide-zinc-800/70">
                  {selectedCustomer.orders.map((ord) => {
                    const badgeClass =
                      ORDER_STATUS_BADGES[ord.status] ||
                      'bg-zinc-800 text-zinc-300 border-zinc-700'
                    return (
                      <Link
                        key={ord.id}
                        href={`/control-panel-ss7/orders/${ord.id}`}
                        className="px-3.5 sm:px-4 py-3.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 hover:bg-zinc-800/40 transition-colors group"
                      >
                        <div className="min-w-0">
                          <span dir="ltr" className="font-mono font-black text-amber-400 text-sm inline-block group-hover:underline">
                            {ord.orderNumber}
                          </span>
                          <span className="text-zinc-500 text-xs block mt-0.5">
                            {formatDate(ord.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-end space-y-1">
                            <span className="font-extrabold text-zinc-100 text-sm tabular-nums block">
                              {formatPrice(ord.total, 'fr')}
                            </span>
                            <span
                              className={`inline-flex items-center justify-center text-[10px] leading-none font-bold px-2 py-1 rounded-md border whitespace-nowrap ${badgeClass}`}
                            >
                              {statusLabel(ord.status)}
                            </span>
                          </div>
                          <DetailChevron className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CustomersWithSearchParams() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  return <CustomersContent key={initialSearch} initialSearch={initialSearch} />
}

export default function AdminCustomersPage() {
  return (
    <ToastProvider>
      <AdminLayout>
        <Suspense fallback={null}>
          <CustomersWithSearchParams />
        </Suspense>
      </AdminLayout>
    </ToastProvider>
  )
}

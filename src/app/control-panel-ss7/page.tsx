'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowUpLeft,
  Eye,
  RefreshCw,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider } from '@/components/admin/providers/ToastContext'
import { useAdminI18n } from '@/components/admin/providers/AdminI18nContext'
import { formatPrice } from '@/lib/utils'

interface MetricData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
}

interface ChartItem {
  date: string
  sales: number
  orders: number
}

interface TopProduct {
  id: string
  name: string
  nameAr?: string
  nameFr?: string
  nameEn?: string
  price: number
  salesCount: number
  totalRevenue: number
  image?: string
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  createdAt: string
  itemsCount: number
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:    'bg-amber-500/10 text-amber-400 border-amber-500/25',
  CONFIRMED:  'bg-blue-500/10 text-blue-400 border-blue-500/25',
  PROCESSING: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
  SHIPPED:    'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  DELIVERED:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  CANCELLED:  'bg-rose-500/10 text-rose-400 border-rose-500/25',
  RETURNED:   'bg-zinc-800 text-zinc-400 border-zinc-700',
}

function StatCard({
  title,
  value,
  sub,
  href,
  accentClass,
  iconBgClass,
  Icon,
  loading,
}: {
  title: string
  value: string | number
  sub: string
  href: string
  accentClass: string
  iconBgClass: string
  Icon: React.ElementType
  loading: boolean
}) {
  return (
    <Link
      href={href}
      className="group bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between gap-5 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`text-xs font-bold uppercase tracking-wide ${accentClass}`}>
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBgClass}`}
        >
          <Icon className="w-[18px] h-[18px]" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {loading ? (
          <div className="h-9 w-28 rounded-lg bg-zinc-800 animate-pulse" />
        ) : (
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono tabular-nums leading-none">
            {value}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
          <TrendingUp className={`w-3.5 h-3.5 shrink-0 ${accentClass}`} />
          <span>{sub}</span>
        </span>
      </div>
    </Link>
  )
}

function DashboardContent() {
  const { tr, statusLabel, formatDate, isRTL, locale } = useAdminI18n()
  const [metrics, setMetrics] = useState<MetricData | null>(null)
  const [salesChart, setSalesChart] = useState<ChartItem[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null)

  const ArrowDiag = isRTL ? ArrowUpLeft : ArrowUpRight

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' })
      if (!res.ok) {
        setMetrics(null)
        setSalesChart([])
        setTopProducts([])
        setRecentOrders([])
        return
      }
      const data = await res.json()
      if (data.metrics) {
        setMetrics(data.metrics)
        setSalesChart(data.charts?.salesChart || [])
        setTopProducts(data.charts?.topProducts || [])
        setRecentOrders(data.recentOrders || [])
      } else {
        setMetrics(null)
        setSalesChart([])
        setTopProducts([])
        setRecentOrders([])
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setMetrics(null)
      setSalesChart([])
      setTopProducts([])
      setRecentOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchStats, 0)
    return () => window.clearTimeout(timeoutId)
  }, [fetchStats])

  const maxSales = Math.max(...salesChart.map((s) => s.sales), 1)
  const hasAnyChartData = salesChart.length > 0
  const hasSales = salesChart.some((item) => item.sales > 0)
  const totalWeekSales = salesChart.reduce((acc, s) => acc + (s.sales || 0), 0)

  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/12 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {tr('لوحة الإحصائيات', 'Analytics Dashboard')}
            </h1>
            <p className="text-xs sm:text-[13px] text-zinc-400 mt-0.5">
              {tr(
                'نظرة شاملة على المبيعات، الطلبات، العملاء والمنتجات',
                'Real-time overview of revenue, orders, customers, and catalog'
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs font-bold text-zinc-200 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/80 transition-colors active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{tr('تحديث البيانات', 'Refresh Data')}</span>
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title={tr('إجمالي الإيرادات', 'Total Revenue')}
          value={formatPrice(metrics?.totalRevenue || 0, locale === 'ar' ? 'ar' : 'fr')}
          sub={tr('الطلبات المسلمة فقط', 'Delivered orders only')}
          href="/control-panel-ss7/orders?status=DELIVERED"
          accentClass="text-emerald-400"
          iconBgClass="bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
          Icon={DollarSign}
          loading={loading}
        />
        <StatCard
          title={tr('إجمالي الطلبات', 'Total Orders')}
          value={metrics?.totalOrders ?? 0}
          sub={tr('جميع حالات الطلبات', 'All order statuses')}
          href="/control-panel-ss7/orders"
          accentClass="text-amber-400"
          iconBgClass="bg-amber-500/10 border-amber-500/25 text-amber-400"
          Icon={ShoppingBag}
          loading={loading}
        />
        <StatCard
          title={tr('العملاء المسجلون', 'Customers')}
          value={metrics?.totalCustomers ?? 0}
          sub={tr('قاعدة بيانات العملاء', 'Customer directory')}
          href="/control-panel-ss7/customers"
          accentClass="text-sky-400"
          iconBgClass="bg-sky-500/10 border-sky-500/25 text-sky-400"
          Icon={Users}
          loading={loading}
        />
        <StatCard
          title={tr('المنتجات المتوفرة', 'Catalog Products')}
          value={metrics?.totalProducts ?? 0}
          sub={tr('في كتالوج المتجر', 'Active & draft items')}
          href="/control-panel-ss7/products"
          accentClass="text-purple-400"
          iconBgClass="bg-purple-500/10 border-purple-500/25 text-purple-400"
          Icon={Package}
          loading={loading}
        />
      </div>

      {/* ── Sales Chart + Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 sm:py-5 border-b border-zinc-800/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
                <BarChart3 className="w-[18px] h-[18px]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                  {tr('مخطط المبيعات اليومي', 'Sales Timeline')}
                </h2>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  {tr('الأداء اليومي خلال آخر 7 أيام', 'Daily performance over recent days')}
                </p>
              </div>
            </div>
            <div className="text-end shrink-0">
              <span className="inline-block text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-lg tabular-nums font-mono">
                {formatPrice(totalWeekSales, 'fr')}
              </span>
            </div>
          </div>

          <div className="px-4 sm:px-6 pt-8 pb-4 flex-1 flex flex-col justify-end min-h-[240px]">
            {loading ? (
              <div className="flex items-end gap-3 h-[170px] px-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className="w-full max-w-[38px] rounded-t-lg bg-zinc-800 animate-pulse"
                      style={{ height: `${30 + ((i * 17) % 55)}%` }}
                    />
                    <div className="w-10 h-3 rounded bg-zinc-800 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : !hasAnyChartData ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                {tr('لا توجد بيانات مبيعات متاحة حالياً.', 'No sales chart data available yet.')}
              </div>
            ) : (
              <div className="flex items-end gap-2 sm:gap-3 h-[180px]">
                {salesChart.map((item, idx) => {
                  const pct =
                    item.sales > 0 ? Math.max(12, Math.round((item.sales / maxSales) * 100)) : 6
                  const isFocused = selectedBarIndex === idx
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedBarIndex(isFocused ? null : idx)}
                      className="group flex-1 h-full flex flex-col items-center justify-end gap-2 focus:outline-none cursor-pointer min-w-0"
                    >
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap font-mono tabular-nums transition-opacity ${
                          isFocused
                            ? 'opacity-100 bg-amber-500 text-zinc-950 border-amber-400'
                            : 'opacity-0 group-hover:opacity-100 bg-zinc-950 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {item.sales} MAD
                      </span>
                      <div className="w-full flex items-end justify-center flex-1 min-h-0">
                        <div
                          style={{ height: `${pct}%` }}
                          className={`w-full max-w-[40px] rounded-t-lg transition-all ${
                            item.sales > 0
                              ? 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300'
                              : 'bg-zinc-800/80 border border-zinc-700/50'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 truncate max-w-full">
                        {item.date}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-t border-zinc-800/80 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>
                {hasSales
                  ? tr('إجمالي المبيعات (MAD) — اضغط على العمود لعرض القيمة', 'Sales (MAD) — tap a bar to inspect')
                  : tr('بانتظار أول طلب مسلّم لبدء الرسم البياني', 'Awaiting delivered orders to populate sales bars')}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              <span>{tr('تحديث فوري', 'Live sync')}</span>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-5 py-4 sm:py-5 border-b border-zinc-800/80">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                {tr('الأكثر مبيعاً', 'Top Products')}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {tr('المنتجات الأعلى طلباً', 'Best-selling catalog items')}
              </p>
            </div>
            <Link
              href="/control-panel-ss7/products"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors shrink-0 whitespace-nowrap"
            >
              <span>{tr('الكل', 'All')}</span>
              <ArrowDiag className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[340px] admin-scroll">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-zinc-800 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-zinc-800 animate-pulse" />
                  </div>
                </div>
              ))
            ) : topProducts.length === 0 ? (
              <div className="py-10 text-center text-xs text-zinc-500">
                {tr('لا توجد مبيعات مسجلة للمنتجات بعد', 'No product sales recorded yet')}
              </div>
            ) : (
              topProducts.map((prod, idx) => {
                const displayName =
                  locale === 'ar'
                    ? prod.nameAr || prod.name
                    : prod.nameEn || prod.nameFr || prod.name
                return (
                  <div
                    key={prod.id || idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/80 shrink-0">
                      <Image
                        src={prod.image || '/images/brand/logo-full.png'}
                        alt={displayName}
                        fill
                        sizes="128px"
                        quality={92}
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-zinc-100 truncate">{displayName}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 tabular-nums">
                        {prod.salesCount} {tr('قطعة مباعة', 'sold')}
                      </p>
                    </div>
                    <span className="text-xs font-black text-amber-400 font-mono tabular-nums shrink-0">
                      {formatPrice(prod.price, 'fr')}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 sm:py-5 border-b border-zinc-800/80">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              {tr('أحدث الطلبات', 'Recent Orders')}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {tr('آخر الطلبات الواردة إلى المتجر', 'Latest incoming customer orders')}
            </p>
          </div>
          <Link
            href="/control-panel-ss7/orders"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 text-xs font-bold transition-colors shrink-0 whitespace-nowrap"
          >
            <span>{tr('إدارة الطلبات', 'Manage Orders')}</span>
            <ArrowDiag className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Cards (< md) */}
        <div className="md:hidden divide-y divide-zinc-800/70">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2.5">
                <div className="h-4 w-32 rounded bg-zinc-800 animate-pulse" />
                <div className="h-3.5 w-48 rounded bg-zinc-800 animate-pulse" />
              </div>
            ))
          ) : recentOrders.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-zinc-500">
              {tr('لا توجد طلبات مسجلة حتى الآن.', 'No orders recorded yet.')}
            </div>
          ) : (
            recentOrders.map((ord) => {
              const cls = STATUS_STYLE[ord.status] || 'bg-zinc-800 text-zinc-300 border-zinc-700'
              return (
                <div key={ord.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold text-amber-400">
                        {ord.orderNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${cls}`}>
                        {statusLabel(ord.status)}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-zinc-100 truncate">{ord.customerName}</p>
                    <p className="text-[11px] text-zinc-400 font-mono tabular-nums">
                      {formatPrice(ord.total, 'fr')} · {formatDate(ord.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`/control-panel-ss7/orders/${ord.id}`}
                    className="h-9 px-3 rounded-xl bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{tr('تفاصيل', 'View')}</span>
                  </Link>
                </div>
              )
            })
          )}
        </div>

        {/* Desktop Table (>= md) */}
        <div className="hidden md:block overflow-x-auto admin-scroll">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-5 text-start">{tr('رقم الطلب', 'Order #')}</th>
                <th className="py-3.5 px-5 text-start">{tr('العميل', 'Customer')}</th>
                <th className="py-3.5 px-5 text-start">{tr('الحالة', 'Status')}</th>
                <th className="py-3.5 px-5 text-start">{tr('المجموع', 'Total')}</th>
                <th className="py-3.5 px-5 text-start">{tr('التاريخ', 'Date')}</th>
                <th className="py-3.5 px-5 text-end">{tr('إجراء', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-5">
                      <div className="h-4 w-full rounded bg-zinc-800/70 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-5 text-center text-xs text-zinc-500">
                    {tr('لا توجد طلبات مسجلة حتى الآن.', 'No orders recorded yet.')}
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => {
                  const cls = STATUS_STYLE[ord.status] || 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  return (
                    <tr key={ord.id} className="hover:bg-zinc-800/35 transition-colors">
                      <td className="py-4 px-5 font-mono font-extrabold text-amber-400 whitespace-nowrap">
                        {ord.orderNumber}
                      </td>
                      <td className="py-4 px-5 font-semibold text-zinc-100">{ord.customerName}</td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${cls}`}>
                          {statusLabel(ord.status)}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold font-mono tabular-nums text-zinc-100 whitespace-nowrap">
                        {formatPrice(ord.total, 'fr')}
                      </td>
                      <td className="py-4 px-5 text-xs text-zinc-400 whitespace-nowrap">
                        {formatDate(ord.createdAt)}
                      </td>
                      <td className="py-4 px-5 text-end whitespace-nowrap">
                        <Link
                          href={`/control-panel-ss7/orders/${ord.id}`}
                          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 text-xs font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{tr('تفاصيل', 'Details')}</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ToastProvider>
      <AdminLayout>
        <DashboardContent />
      </AdminLayout>
    </ToastProvider>
  )
}

'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  Eye,
  RefreshCw,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider } from '@/components/admin/providers/ToastContext'
import { ThemeProvider } from '@/components/admin/providers/ThemeContext'
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

const statusMap: Record<string, { labelAr: string; labelEn: string; cls: string }> = {
  PENDING:    { labelAr: 'قيد الانتظار', labelEn: 'Pending',    cls: 'bg-amber-500/10  text-amber-400  border-amber-500/25' },
  CONFIRMED:  { labelAr: 'مؤكد',          labelEn: 'Confirmed',  cls: 'bg-blue-500/10   text-blue-400   border-blue-500/25'  },
  PROCESSING: { labelAr: 'قيد التجهيز',   labelEn: 'Processing', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/25'},
  SHIPPED:    { labelAr: 'تم الشحن',       labelEn: 'Shipped',    cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'},
  DELIVERED:  { labelAr: 'تم التسليم',     labelEn: 'Delivered',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'},
  CANCELLED:  { labelAr: 'ملغي',           labelEn: 'Cancelled',  cls: 'bg-rose-500/10   text-rose-400   border-rose-500/25'  },
  RETURNED:   { labelAr: 'مرجع',           labelEn: 'Returned',   cls: 'bg-zinc-800      text-zinc-400   border-zinc-700'     },
}

/* ─── single stat card ──────────────────────────────────────────────── */
function StatCard({
  labelAr, labelEn, value, sub, accent, Icon,
}: {
  labelAr: string
  labelEn: string
  value: string | number
  sub: string
  accent: string          // tailwind color key e.g. 'emerald'
  Icon: React.ElementType
}) {
  const colors: Record<string, { ring: string; icon: string; blob: string; text: string }> = {
    emerald: { ring: 'border-emerald-500/25 hover:border-emerald-500/50', icon: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', blob: 'bg-emerald-500/10', text: 'text-emerald-400' },
    amber:   { ring: 'border-amber-500/25  hover:border-amber-500/50',  icon: 'bg-amber-500/15   text-amber-400   border-amber-500/25',  blob: 'bg-amber-500/10',  text: 'text-amber-400'  },
    blue:    { ring: 'border-blue-500/25   hover:border-blue-500/50',   icon: 'bg-blue-500/15    text-blue-400    border-blue-500/25',   blob: 'bg-blue-500/10',   text: 'text-blue-400'   },
    purple:  { ring: 'border-purple-500/25 hover:border-purple-500/50', icon: 'bg-purple-500/15  text-purple-400  border-purple-500/25', blob: 'bg-purple-500/10', text: 'text-purple-400' },
  }
  const c = colors[accent]

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-zinc-900 border ${c.ring} shadow-xl transition-all duration-300 p-6 flex flex-col gap-5`}>
      {/* decorative blob */}
      <div className={`absolute -right-8 -bottom-8 w-36 h-36 ${c.blob} rounded-full blur-3xl pointer-events-none`} />

      {/* row: label + icon */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className={`text-xs font-black uppercase tracking-widest ${c.text}`}>{labelAr}</span>
          <span className="text-[11px] font-medium text-zinc-500 tracking-wide">{labelEn}</span>
        </div>
        <div className={`shrink-0 p-2.5 rounded-xl border ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* big number */}
      <div className="relative z-10 flex flex-col gap-2">
        <span className="text-3xl font-black text-white tracking-tight leading-none">{value}</span>
        <span className={`text-xs font-semibold ${c.text} flex items-center gap-1`}>
          <TrendingUp className="w-3.5 h-3.5" />
          {sub}
        </span>
      </div>
    </div>
  )
}

/* ─── main dashboard content ────────────────────────────────────────── */
function DashboardContent() {
  const [metrics, setMetrics] = useState<MetricData | null>(null)
  const [salesChart, setSalesChart] = useState<ChartItem[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (data.metrics) {
        setMetrics(data.metrics)
        setSalesChart(data.charts?.salesChart || [])
        setTopProducts(data.charts?.topProducts || [])
        setRecentOrders(data.recentOrders || [])
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  const maxSales = Math.max(...salesChart.map((s) => s.sales), 1)

  return (
    <div className="flex flex-col gap-8">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/70 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              لوحة الإحصائيات
              <span className="ml-2 text-base font-semibold text-zinc-500">Analytics Dashboard</span>
            </h1>
            <p className="text-xs text-zinc-500 font-medium">متابعة فورية للمبيعات، الأرباح، الطلبات والمنتجات</p>
          </div>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all active:scale-95 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          تحديث / Refresh
        </button>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          labelAr="إجمالي الإيرادات"
          labelEn="Total Revenue"
          value={loading ? '—' : formatPrice(metrics?.totalRevenue || 0, 'fr')}
          sub="+14.2% عن الشهر الماضي"
          accent="emerald"
          Icon={DollarSign}
        />
        <StatCard
          labelAr="إجمالي الطلبات"
          labelEn="Total Orders"
          value={loading ? '—' : metrics?.totalOrders ?? 0}
          sub="+8.5% عن الأسبوع الماضي"
          accent="amber"
          Icon={ShoppingBag}
        />
        <StatCard
          labelAr="إجمالي العملاء"
          labelEn="Customers"
          value={loading ? '—' : metrics?.totalCustomers ?? 0}
          sub="قاعدة العملاء النشطين"
          accent="blue"
          Icon={Users}
        />
        <StatCard
          labelAr="إجمالي المنتجات"
          labelEn="Products"
          value={loading ? '—' : metrics?.totalProducts ?? 0}
          sub="منتجات متاحة في الكتالوج"
          accent="purple"
          Icon={Package}
        />
      </div>

      {/* ── Chart + Top Products ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Sales chart */}
        <div className="lg:col-span-2 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-xl p-6 flex flex-col gap-6">
          {/* header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-black text-white">
                  مخطط المبيعات
                  <span className="ml-1.5 text-xs font-normal text-zinc-500">Sales Timeline</span>
                </h2>
                <p className="text-xs text-zinc-500 font-medium">أداء الأرباح اليومية على مدى الأيام الأخيرة</p>
              </div>
            </div>
            <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Daily
            </span>
          </div>

          {/* bars */}
          <div className="h-56 flex items-end gap-3 pt-4 pb-2">
            {salesChart.map((item, idx) => {
              const heightPct = Math.max(10, Math.round((item.sales / maxSales) * 100))
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[11px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 px-2 py-0.5 rounded-lg border border-amber-500/30 whitespace-nowrap">
                    {item.sales} DH
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-xl group-hover:brightness-110 transition-all shadow-md shadow-amber-500/10"
                  />
                  <span className="text-[11px] font-semibold text-zinc-500 group-hover:text-amber-400 transition-colors">
                    {item.date}
                  </span>
                </div>
              )
            })}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs text-zinc-500 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>إجمالي المبيعات (MAD)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>تحديث تلقائي</span>
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-xl p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between pb-4 border-b border-zinc-800/60">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-black text-white">
                الأكثر مبيعاً
                <span className="ml-1.5 text-xs font-normal text-zinc-500">Top Products</span>
              </h2>
              <p className="text-xs text-zinc-500 font-medium">المنتجات الأكثر طلباً</p>
            </div>
            <Link href="/admin/products" className="flex items-center gap-1 text-xs text-amber-400 font-bold hover:underline shrink-0">
              الكل <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {topProducts.length === 0 ? (
              <p className="py-10 text-center text-xs text-zinc-600">لا توجد منتجات مباعة بعد</p>
            ) : (
              topProducts.map((prod, idx) => (
                <div key={prod.id || idx} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 hover:border-zinc-700 transition-all">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                    <img src={prod.image || '/images/brand/logo-full.png'} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-zinc-100 truncate">{prod.name}</span>
                    <span className="text-xs text-zinc-500">{prod.salesCount} قطعة مباعة</span>
                  </div>
                  <span className="text-sm font-black text-amber-400 shrink-0">{formatPrice(prod.price, 'fr')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Orders table ───────────────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-xl p-6 flex flex-col gap-6">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-black text-white">
              أحدث الطلبات
              <span className="ml-1.5 text-xs font-normal text-zinc-500">Recent Orders</span>
            </h2>
            <p className="text-xs text-zinc-500 font-medium">آخر الطلبات المسجلة في المتجر</p>
          </div>
          <Link
            href="/admin/orders"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition-all shrink-0"
          >
            إدارة الطلبات <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800/70">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950/60 border-b border-zinc-800">
              <tr className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-left">رقم الطلب</th>
                <th className="py-3.5 px-4 text-left">العميل</th>
                <th className="py-3.5 px-4 text-left">الحالة</th>
                <th className="py-3.5 px-4 text-left">المجموع</th>
                <th className="py-3.5 px-4 text-left">التاريخ</th>
                <th className="py-3.5 px-4 text-right">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-zinc-600">
                    لا توجد طلبات مسجلة حتى الآن.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => {
                  const st = statusMap[ord.status] || { labelAr: ord.status, labelEn: ord.status, cls: 'bg-zinc-800 text-zinc-300 border-zinc-700' }
                  return (
                    <tr key={ord.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-4 px-4 font-black text-amber-400 text-sm">{ord.orderNumber}</td>
                      <td className="py-4 px-4 font-semibold text-zinc-200 text-sm">{ord.customerName}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${st.cls}`}>
                          {st.labelAr}
                          <span className="opacity-60 text-[10px]">({st.labelEn})</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-200 text-sm">{formatPrice(ord.total, 'fr')}</td>
                      <td className="py-4 px-4 text-zinc-500 text-xs">{new Date(ord.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-amber-500 hover:text-zinc-950 text-xs font-bold transition-all active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          تفاصيل
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

/* ─── page export ───────────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminLayout>
          <DashboardContent />
        </AdminLayout>
      </ToastProvider>
    </ThemeProvider>
  )
}

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

const statusMap: Record<string, { labelAr: string; labelEn: string; class: string }> = {
  PENDING: {
    labelAr: 'قيد الانتظار',
    labelEn: 'Pending',
    class: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  CONFIRMED: {
    labelAr: 'مؤكد',
    labelEn: 'Confirmed',
    class: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  PROCESSING: {
    labelAr: 'قيد التجهيز',
    labelEn: 'Processing',
    class: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  SHIPPED: {
    labelAr: 'تم الشحن',
    labelEn: 'Shipped',
    class: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  DELIVERED: {
    labelAr: 'تم التسليم',
    labelEn: 'Delivered',
    class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  CANCELLED: {
    labelAr: 'ملغي',
    labelEn: 'Cancelled',
    class: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  RETURNED: {
    labelAr: 'مرجع',
    labelEn: 'Returned',
    class: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  },
}

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
        setSalesChart(data.charts.salesChart || [])
        setTopProducts(data.charts.topProducts || [])
        setRecentOrders(data.recentOrders || [])
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const maxSales = Math.max(...salesChart.map((s) => s.sales), 1)

  return (
    <div className="w-full flex flex-col gap-10 sm:gap-12 py-2">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 shadow-lg shadow-amber-500/5">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>لوحة الإحصائيات</span>
              <span className="text-zinc-600 font-normal">|</span>
              <span className="text-amber-400 font-bold">Analytics Dashboard</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
              متابعة فورية للمبيعات، الأرباح، الطلبات، والمنتجات الأكثر طلباً في المتجر
            </p>
          </div>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-extrabold text-zinc-200 hover:text-white hover:border-amber-500/50 hover:bg-zinc-850 transition-all shadow-xl active:scale-95 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث البيانات / Refresh</span>
        </button>
      </div>

      {/* Metric Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Card 1: Total Revenue */}
        <div className="p-7 sm:p-8 rounded-3xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl relative overflow-hidden flex flex-col justify-between gap-6 hover:border-emerald-500/40 transition-all duration-300 min-h-[200px]">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400">
                إجمالي الإيرادات
              </span>
              <span className="text-xs font-semibold text-zinc-400">Total Revenue</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 shadow-inner">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="flex flex-col gap-2 relative z-10 pt-2">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {loading ? '...' : formatPrice(metrics?.totalRevenue || 0, 'fr')}
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>+14.2% مقارنة بالشهر الماضي</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="p-7 sm:p-8 rounded-3xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl relative overflow-hidden flex flex-col justify-between gap-6 hover:border-amber-500/40 transition-all duration-300 min-h-[200px]">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400">
                إجمالي الطلبات
              </span>
              <span className="text-xs font-semibold text-zinc-400">Total Orders</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 shadow-inner">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="flex flex-col gap-2 relative z-10 pt-2">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {loading ? '...' : metrics?.totalOrders || 0}
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>+8.5% مقارنة بالأسبوع الماضي</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Customers */}
        <div className="p-7 sm:p-8 rounded-3xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl relative overflow-hidden flex flex-col justify-between gap-6 hover:border-blue-500/40 transition-all duration-300 min-h-[200px]">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-400">
                إجمالي العملاء
              </span>
              <span className="text-xs font-semibold text-zinc-400">Customers</span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="flex flex-col gap-2 relative z-10 pt-2">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {loading ? '...' : metrics?.totalCustomers || 0}
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-bold">
              <Users className="w-4 h-4" />
              <span>قاعدة العملاء المسجلين والنشطين</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Products */}
        <div className="p-7 sm:p-8 rounded-3xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl relative overflow-hidden flex flex-col justify-between gap-6 hover:border-purple-500/40 transition-all duration-300 min-h-[200px]">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-400">
                إجمالي المنتجات
              </span>
              <span className="text-xs font-semibold text-zinc-400">Total Products</span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0 shadow-inner">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="flex flex-col gap-2 relative z-10 pt-2">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {loading ? '...' : metrics?.totalProducts || 0}
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-400 font-bold">
              <Package className="w-4 h-4" />
              <span>في الكتالوج المتاح بالمتجر</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Chart & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Sales Chart Box */}
        <div className="lg:col-span-2 p-7 sm:p-9 md:p-10 rounded-3xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl flex flex-col gap-8">
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 shadow-md shadow-amber-500/5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>مخطط المبيعات والإيرادات</span>
                  <span className="text-xs font-normal text-zinc-500">| Sales Timeline</span>
                </h2>
                <p className="text-xs text-zinc-400 font-medium">أداء الأرباح اليومية على مدى الأيام الأخيرة</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              مبيعات يومية / Daily
            </span>
          </div>

          <div className="h-72 flex items-end justify-between gap-4 pt-8 pb-4 border-b border-zinc-800/80">
            {salesChart.map((item, idx) => {
              const heightPercent = Math.max(15, Math.round((item.sales / maxSales) * 100))
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                  <div className="text-[11px] font-black text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 px-2.5 py-1 rounded-xl border border-amber-500/30 whitespace-nowrap shadow-xl">
                    {item.sales} DH
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[46px] bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-t-2xl group-hover:brightness-125 transition-all relative shadow-lg shadow-amber-500/10"
                  >
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-zinc-950 rounded-full opacity-60" />
                  </div>
                  <span className="text-xs font-bold text-zinc-400 group-hover:text-amber-400 transition-colors">
                    {item.date}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 pt-2">
            <div className="flex items-center gap-2.5 font-bold">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/50" />
              <span>إجمالي المبيعات (درهم مغربي / MAD)</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>تحديث تلقائي مستمر</span>
            </div>
          </div>
        </div>

        {/* Top Products Sidebar Box */}
        <div className="p-7 sm:p-9 md:p-10 rounded-3xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>الأكثر مبيعاً</span>
                <span className="text-xs font-normal text-zinc-500">| Top Products</span>
              </h2>
              <p className="text-xs text-zinc-400 font-medium">المنتجات الأكثر طلباً في المتجر</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs text-amber-400 hover:text-amber-300 font-extrabold flex items-center gap-1 hover:underline shrink-0"
            >
              <span>الكل</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {topProducts.length === 0 ? (
              <p className="py-10 text-center text-xs text-zinc-500 font-medium">لا توجد منتجات مباعة حتى الآن</p>
            ) : (
              topProducts.map((prod, idx) => (
                <div
                  key={prod.id || idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-all hover:bg-zinc-850/60 shadow-md"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700 shadow-sm">
                      <img
                        src={prod.image || '/images/brand/logo-full.png'}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">{prod.name}</h3>
                      <p className="text-xs font-medium text-zinc-400">
                        تم بيع {prod.salesCount} قطعة
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-3">
                    <div className="text-xs sm:text-sm font-black text-amber-400">
                      {formatPrice(prod.price, 'fr')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders Table Box */}
      <div className="p-7 sm:p-9 md:p-10 rounded-3xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>أحدث المعاملات والطلبات</span>
              <span className="text-xs font-normal text-zinc-500">| Recent Orders</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium">آخر الطلبات المسجلة حديثاً في المتجر</p>
          </div>

          <Link
            href="/admin/orders"
            className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-extrabold hover:bg-amber-500/20 transition-all flex items-center gap-2 shadow-md shrink-0"
          >
            <span>إدارة جميع الطلبات | Manage All</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/50 shadow-inner">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/90 text-zinc-400 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-5">رقم الطلب / Order #</th>
                <th className="py-4 px-5">العميل / Customer</th>
                <th className="py-4 px-5">الحالة / Status</th>
                <th className="py-4 px-5">المجموع / Total</th>
                <th className="py-4 px-5">التاريخ / Date</th>
                <th className="py-4 px-5 text-right">الإجراء / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-semibold">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-medium">
                    لا توجد طلبات مسجلة حتى الآن.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => {
                  const statusInfo = statusMap[ord.status] || {
                    labelAr: ord.status,
                    labelEn: ord.status,
                    class: 'bg-zinc-800 text-zinc-300 border-zinc-700',
                  }
                  return (
                    <tr key={ord.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="py-5 px-5 font-black text-amber-400">{ord.orderNumber}</td>
                      <td className="py-5 px-5 font-bold text-zinc-100">{ord.customerName}</td>
                      <td className="py-5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${statusInfo.class}`}
                        >
                          <span>{statusInfo.labelAr}</span>
                          <span className="text-[10px] opacity-70">({statusInfo.labelEn})</span>
                        </span>
                      </td>
                      <td className="py-5 px-5 font-black text-zinc-100">
                        {formatPrice(ord.total, 'fr')}
                      </td>
                      <td className="py-5 px-5 text-zinc-400 font-medium">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-5 px-5 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 text-xs font-black transition-all shadow-md active:scale-95"
                        >
                          <Eye className="w-4 h-4" />
                          <span>التفاصيل</span>
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
    <ThemeProvider>
      <ToastProvider>
        <AdminLayout>
          <DashboardContent />
        </AdminLayout>
      </ToastProvider>
    </ThemeProvider>
  )
}

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
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>لوحة الإحصائيات</span>
                <span className="text-zinc-600 font-normal">|</span>
                <span className="text-amber-400 font-bold">Analytics Dashboard</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                متابعة فورية للمبيعات، الأرباح، الطلبات، والمنتجات الأكثر طلباً
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 hover:text-white hover:border-amber-500/50 hover:bg-zinc-850 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث البيانات / Refresh</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Revenue */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                إجمالي الإيرادات
              </p>
              <p className="text-xs text-zinc-400 font-medium">Total Revenue</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-5">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {loading ? '...' : formatPrice(metrics?.totalRevenue || 0, 'fr')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-2.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.2% مقارنة بالشهر الماضي</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                إجمالي الطلبات
              </p>
              <p className="text-xs text-zinc-400 font-medium">Total Orders</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-5">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {loading ? '...' : metrics?.totalOrders || 0}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mt-2.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+8.5% مقارنة بالأسبوع الماضي</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Customers */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
                إجمالي العملاء
              </p>
              <p className="text-xs text-zinc-400 font-medium">Customers</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-5">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {loading ? '...' : metrics?.totalCustomers || 0}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mt-2.5">
              <Users className="w-3.5 h-3.5" />
              <span>قاعدة العملاء المسجلين والنشطين</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Products */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400">
                إجمالي المنتجات
              </p>
              <p className="text-xs text-zinc-400 font-medium">Total Products</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-5">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {loading ? '...' : metrics?.totalProducts || 0}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold mt-2.5">
              <Package className="w-3.5 h-3.5" />
              <span>في الكتالوج المتاح بالمتجر</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Chart & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Box */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>مخطط المبيعات والإيرادات</span>
                  <span className="text-xs font-normal text-zinc-500">| Sales Timeline</span>
                </h2>
                <p className="text-xs text-zinc-400">أداء الأرباح اليومية على مدى الأيام الأخيرة</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              مبيعات يومية / Daily
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-3 border-b border-zinc-800/80">
            {salesChart.map((item, idx) => {
              const heightPercent = Math.max(15, Math.round((item.sales / maxSales) * 100))
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 px-2 py-0.5 rounded border border-amber-500/30 whitespace-nowrap shadow-lg">
                    {item.sales} DH
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[42px] bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-t-xl group-hover:brightness-125 transition-all relative shadow-md shadow-amber-500/10"
                  >
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 rounded-full opacity-60" />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-amber-400 transition-colors">
                    {item.date}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <div className="flex items-center gap-2 font-semibold">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              <span>إجمالي المبيعات (درهم مغربي / MAD)</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-500">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>تحديث تلقائي مستمر</span>
            </div>
          </div>
        </div>

        {/* Top Products Sidebar Box */}
        <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <span>الأكثر مبيعاً</span>
                  <span className="text-xs font-normal text-zinc-500">| Top Products</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">المنتجات الأكثر طلباً في المتجر</p>
              </div>
              <Link
                href="/admin/products"
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline"
              >
                <span>الكل</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5 mt-4">
              {topProducts.length === 0 ? (
                <p className="py-8 text-center text-xs text-zinc-500">لا توجد منتجات مباعة حتى الآن</p>
              ) : (
                topProducts.map((prod, idx) => (
                  <div
                    key={prod.id || idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 transition-all hover:bg-zinc-850/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700 shadow-sm">
                        <img
                          src={prod.image || '/images/brand/logo-full.png'}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-zinc-100 truncate">{prod.name}</h3>
                        <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                          تم بيع {prod.salesCount} قطعة
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <div className="text-xs font-black text-amber-400">
                        {formatPrice(prod.price, 'fr')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Orders Table Box */}
      <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>أحدث المعاملات والطلبات</span>
              <span className="text-xs font-normal text-zinc-500">| Recent Orders</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">آخر الطلبات المسجلة حديثاً في المتجر</p>
          </div>

          <Link
            href="/admin/orders"
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-extrabold hover:bg-amber-500/20 transition-all flex items-center gap-2 shadow-sm"
          >
            <span>إدارة جميع الطلبات | Manage All</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/40">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">رقم الطلب / Order #</th>
                <th className="py-3.5 px-4">العميل / Customer</th>
                <th className="py-3.5 px-4">الحالة / Status</th>
                <th className="py-3.5 px-4">المجموع / Total</th>
                <th className="py-3.5 px-4">التاريخ / Date</th>
                <th className="py-3.5 px-4 text-right">الإجراء / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-500 font-medium">
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
                      <td className="py-4 px-4 font-black text-amber-400">{ord.orderNumber}</td>
                      <td className="py-4 px-4 font-semibold text-zinc-100">{ord.customerName}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${statusInfo.class}`}
                        >
                          <span>{statusInfo.labelAr}</span>
                          <span className="text-[9px] opacity-70">({statusInfo.labelEn})</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 font-black text-zinc-100">
                        {formatPrice(ord.total, 'fr')}
                      </td>
                      <td className="py-4 px-4 text-zinc-400">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 text-xs font-bold transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
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

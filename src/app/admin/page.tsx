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

export default function AdminDashboardPage() {
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
    <ThemeProvider>
      <ToastProvider>
        <AdminLayout>
          {/* Dashboard Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h1 className="text-2xl font-black tracking-tight text-white">Store Analytics Dashboard</h1>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Real-time overview of revenue, sales trends, orders, and products</p>
            </div>

            <button
              onClick={fetchStats}
              disabled={loading}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Revenue */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800/80 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Revenue</span>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {loading ? '...' : formatPrice(metrics?.totalRevenue || 0, 'fr')}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+14.2% from last month</span>
                </div>
              </div>
            </div>

            {/* Card 2: Orders */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800/80 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Orders</span>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {loading ? '...' : metrics?.totalOrders || 0}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+8.5% from last week</span>
                </div>
              </div>
            </div>

            {/* Card 3: Customers */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800/80 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Customers</span>
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {loading ? '...' : metrics?.totalCustomers || 0}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Active customer base</span>
                </div>
              </div>
            </div>

            {/* Card 4: Products */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800/80 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Products</span>
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {loading ? '...' : metrics?.totalProducts || 0}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>In active catalog</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Visual Chart */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Sales & Revenue Timeline</h2>
                  <p className="text-xs text-zinc-400">Revenue performance over recent days</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Daily Growth
                </span>
              </div>

              <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-zinc-800">
                {salesChart.map((item, idx) => {
                  const heightPercent = Math.max(12, Math.round((item.sales / maxSales) * 100))
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="text-[10px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.sales} DH
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[40px] bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-t-xl group-hover:brightness-125 transition-all relative"
                      >
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-950 rounded-full opacity-60" />
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-400">{item.date}</span>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Gross Sales (MAD)</span>
                </div>
                <span>Total aggregated revenue</span>
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Top Products</h2>
                  <p className="text-xs text-zinc-400">Best performing items</p>
                </div>
                <Link href="/admin/products" className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1">
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3.5">
                {topProducts.map((prod, idx) => (
                  <div key={prod.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/40 hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
                        <img src={prod.image || '/images/brand/logo-full.png'} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-zinc-200 truncate">{prod.name}</h3>
                        <p className="text-[11px] text-zinc-400">{prod.salesCount} sold</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-amber-400">{formatPrice(prod.price, 'fr')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Recent Orders</h2>
                <p className="text-xs text-zinc-400">Latest customer transactions</p>
              </div>
              <Link
                href="/admin/orders"
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Manage All Orders</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-3">Order #</th>
                    <th className="pb-3 px-3">Customer</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3">Total</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-amber-400">{ord.orderNumber}</td>
                        <td className="py-3.5 px-3 text-zinc-200">{ord.customerName}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : ord.status === 'SHIPPED'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : ord.status === 'PROCESSING'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : ord.status === 'CANCELLED'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-zinc-100">{formatPrice(ord.total, 'fr')}</td>
                        <td className="py-3.5 px-3 text-zinc-400">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </AdminLayout>
      </ToastProvider>
    </ThemeProvider>
  )
}

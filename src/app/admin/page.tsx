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
  labelAr, labelEn, value, sub, accentColor, bgColor, Icon,
}: {
  labelAr: string
  labelEn: string
  value: string | number
  sub: string
  accentColor: string
  bgColor: string
  Icon: React.ElementType
}) {
  return (
    <div style={{
      background: 'rgb(24,24,27)',
      border: `1px solid ${accentColor}30`,
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Top section: label + icon */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        padding: '24px 24px 20px',
        borderBottom: '1px solid rgba(63,63,70,0.5)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: accentColor, letterSpacing: '0.02em' }}>
            {labelAr}
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#71717a' }}>
            {labelEn}
          </span>
        </div>
        <div style={{
          flexShrink: 0,
          padding: 12,
          borderRadius: 14,
          background: bgColor,
          border: `1px solid ${accentColor}30`,
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon style={{ width: 20, height: 20 }} />
        </div>
      </div>

      {/* Bottom section: number + trend */}
      <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {value}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: accentColor, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp style={{ width: 13, height: 13, flexShrink: 0 }} />
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
          accentColor="#34d399"
          bgColor="rgba(52,211,153,0.12)"
          Icon={DollarSign}
        />
        <StatCard
          labelAr="إجمالي الطلبات"
          labelEn="Total Orders"
          value={loading ? '—' : metrics?.totalOrders ?? 0}
          sub="+8.5% عن الأسبوع الماضي"
          accentColor="#fbbf24"
          bgColor="rgba(251,191,36,0.12)"
          Icon={ShoppingBag}
        />
        <StatCard
          labelAr="إجمالي العملاء"
          labelEn="Customers"
          value={loading ? '—' : metrics?.totalCustomers ?? 0}
          sub="قاعدة العملاء النشطين"
          accentColor="#60a5fa"
          bgColor="rgba(96,165,250,0.12)"
          Icon={Users}
        />
        <StatCard
          labelAr="إجمالي المنتجات"
          labelEn="Products"
          value={loading ? '—' : metrics?.totalProducts ?? 0}
          sub="منتجات في الكتالوج"
          accentColor="#c084fc"
          bgColor="rgba(192,132,252,0.12)"
          Icon={Package}
        />
      </div>

      {/* ── Chart + Top Products ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>

        {/* Sales chart — 2/3 width */}
        <div style={{ gridColumn: 'span 2', background: 'rgb(24,24,27)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '24px 24px 20px', borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ padding: 10, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BarChart3 style={{ width: 18, height: 18 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
                  مخطط المبيعات <span style={{ fontSize: 12, fontWeight: 400, color: '#52525b' }}>Sales Timeline</span>
                </span>
                <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>أداء الأرباح اليومية على مدى الأيام الأخيرة</span>
              </div>
            </div>
            <span style={{ flexShrink: 0, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}>
              Daily
            </span>
          </div>

          {/* Bars */}
          <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'flex-end', gap: 10, height: 220 }}>
            {salesChart.map((item, idx) => {
              const heightPct = Math.max(10, Math.round((item.sales / maxSales) * 100))
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }} className="group">
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', background: 'rgb(9,9,11)', padding: '2px 8px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)', whiteSpace: 'nowrap', opacity: 0 }} className="group-hover:opacity-100 transition-opacity">
                    {item.sales} DH
                  </span>
                  <div style={{ height: `${heightPct}%`, width: '100%', maxWidth: 40, background: 'linear-gradient(to top, #d97706, #fbbf24)', borderRadius: '8px 8px 0 0', boxShadow: '0 4px 12px rgba(245,158,11,0.15)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#52525b' }}>{item.date}</span>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid rgba(63,63,70,0.5)', fontSize: 12, color: '#71717a', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <span>إجمالي المبيعات (MAD)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar style={{ width: 13, height: 13 }} />
              <span>تحديث تلقائي</span>
            </div>
          </div>
        </div>

        {/* Top products — 1/3 width */}
        <div style={{ background: 'rgb(24,24,27)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, padding: '24px 24px 20px', borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
                الأكثر مبيعاً <span style={{ fontSize: 12, fontWeight: 400, color: '#52525b' }}>Top Products</span>
              </span>
              <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>المنتجات الأكثر طلباً</span>
            </div>
            <Link href="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#fbbf24', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
              الكل <ArrowUpRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {/* Product list */}
          <div style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topProducts.length === 0 ? (
              <p style={{ padding: '32px 0', textAlign: 'center', fontSize: 12, color: '#3f3f46' }}>لا توجد منتجات مباعة بعد</p>
            ) : (
              topProducts.map((prod, idx) => (
                <div key={prod.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: 'rgba(9,9,11,0.6)', border: '1px solid rgba(63,63,70,0.6)' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, overflow: 'hidden', background: '#27272a', border: '1px solid rgba(63,63,70,0.8)', flexShrink: 0 }}>
                    <img src={prod.image || '/images/brand/logo-full.png'} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#f4f4f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</span>
                    <span style={{ fontSize: 11, color: '#71717a', fontWeight: 500 }}>{prod.salesCount} قطعة مباعة</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 900, color: '#fbbf24', flexShrink: 0 }}>{formatPrice(prod.price, 'fr')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Orders table ───────────────────────────────────────── */}
      <div style={{ background: 'rgb(24,24,27)', border: '1px solid rgba(63,63,70,0.6)', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '24px 28px 20px', borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
              أحدث الطلبات <span style={{ fontSize: 12, fontWeight: 400, color: '#52525b' }}>Recent Orders</span>
            </span>
            <span style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>آخر الطلبات المسجلة في المتجر</span>
          </div>
          <Link href="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)', fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
            إدارة الطلبات <ArrowUpRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(9,9,11,0.5)', borderBottom: '1px solid rgba(63,63,70,0.6)' }}>
                {['رقم الطلب', 'العميل', 'الحالة', 'المجموع', 'التاريخ', 'إجراء'].map((h, i) => (
                  <th key={i} style={{ padding: '14px 18px', textAlign: i === 5 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 18px', textAlign: 'center', fontSize: 12, color: '#3f3f46' }}>
                    لا توجد طلبات مسجلة حتى الآن.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => {
                  const st = statusMap[ord.status] || { labelAr: ord.status, labelEn: ord.status, cls: 'bg-zinc-800 text-zinc-300 border-zinc-700' }
                  return (
                    <tr key={ord.id} style={{ borderBottom: '1px solid rgba(63,63,70,0.4)' }} className="hover:bg-zinc-800/30 transition-colors">
                      <td style={{ padding: '16px 18px', fontWeight: 900, color: '#fbbf24' }}>{ord.orderNumber}</td>
                      <td style={{ padding: '16px 18px', fontWeight: 600, color: '#e4e4e7' }}>{ord.customerName}</td>
                      <td style={{ padding: '16px 18px' }}>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${st.cls}`}>
                          {st.labelAr}
                          <span style={{ opacity: 0.6, fontSize: 10 }}>({st.labelEn})</span>
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px', fontWeight: 700, color: '#e4e4e7' }}>{formatPrice(ord.total, 'fr')}</td>
                      <td style={{ padding: '16px 18px', fontSize: 12, color: '#71717a' }}>{new Date(ord.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <Link href={`/admin/orders/${ord.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, background: 'rgba(63,63,70,0.7)', color: '#d4d4d8', fontSize: 12, fontWeight: 700, textDecoration: 'none' }} className="hover:bg-amber-500 hover:text-zinc-950 transition-all">
                          <Eye style={{ width: 13, height: 13 }} />
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

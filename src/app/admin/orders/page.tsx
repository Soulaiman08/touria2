'use client'

import React, { useCallback, useEffect, useState } from 'react'
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
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { ThemeProvider } from '@/components/admin/providers/ThemeContext'
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

const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

function OrdersContent() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { success, error } = useToast()

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', '10')

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      const data = await res.json()

      if (data.items) {
        setOrders(data.items)
        setTotalPages(data.totalPages || 1)
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      success(`Order status updated to ${newStatus}`)
      fetchOrders()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Status update failed'
      error(errorMessage)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
            <PackageCheck style={{ width: 12, height: 12 }} /> Delivered
          </span>
        )
      case 'SHIPPED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
            <Truck style={{ width: 12, height: 12 }} /> Shipped
          </span>
        )
      case 'PROCESSING':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
            <Clock style={{ width: 12, height: 12 }} /> Processing
          </span>
        )
      case 'CANCELLED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
            <XCircle style={{ width: 12, height: 12 }} /> Cancelled
          </span>
        )
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'rgba(63,63,70,0.4)', color: '#d4d4d8', border: '1px solid rgba(63,63,70,0.6)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
            <Clock style={{ width: 12, height: 12 }} /> Pending
          </span>
        )
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid rgba(63,63,70,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag style={{ width: 22, height: 22 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              Order Management
            </h1>
            <p style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>
              Track customer orders, update shipping status, and view customer details
            </p>
          </div>
        </div>
      </div>

      {/* Search & Status Filter Card */}
      <div style={{
        background: 'rgb(24,24,27)',
        border: '1px solid rgba(63,63,70,0.6)',
        borderRadius: 16,
        padding: '16px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ position: 'relative', minWidth: 280, flex: 1 }}>
          <Search style={{ position: 'absolute', left: 14, top: 12, width: 16, height: 16, color: '#71717a' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by order #, phone, customer..."
            style={{
              width: '100%',
              background: 'rgb(9,9,11)',
              border: '1px solid rgba(63,63,70,0.8)',
              borderRadius: 12,
              padding: '10px 14px 10px 40px',
              fontSize: 12,
              color: '#f4f4f5',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#a1a1aa', fontWeight: 600 }}>
            <Filter style={{ width: 14, height: 14, color: '#fbbf24' }} /> Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            style={{
              background: 'rgb(9,9,11)',
              border: '1px solid rgba(63,63,70,0.8)',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 12,
              fontWeight: 700,
              color: '#f4f4f5',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Statuses</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table Card */}
      <div style={{
        background: 'rgb(24,24,27)',
        border: '1px solid rgba(63,63,70,0.6)',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(9,9,11,0.6)', borderBottom: '1px solid rgba(63,63,70,0.6)' }}>
                {['Order #', 'Customer & City', 'Region', 'Items', 'Shipping', 'Total', 'Status', 'Quick Status Update', 'Action'].map((h, i) => (
                  <th key={i} style={{ padding: '14px 18px', textAlign: i === 8 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px 18px', textAlign: 'center', color: '#71717a' }}>
                    <span style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid #fbbf24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 8 }} />
                    <p style={{ fontSize: 12 }}>Fetching orders list...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px 18px', textAlign: 'center', fontSize: 12, color: '#3f3f46' }}>
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid rgba(63,63,70,0.4)' }} className="hover:bg-zinc-800/30 transition-colors">
                    <td style={{ padding: '16px 18px', fontWeight: 900, color: '#fbbf24', fontFamily: 'monospace' }}>{ord.orderNumber}</td>
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{ord.customerName}</div>
                      <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>
                        {ord.customerPhone} • {ord.city}
                      </div>
                    </td>
                    <td style={{ padding: '16px 18px', color: '#d4d4d8', fontSize: 12 }}>{ord.region || '—'}</td>
                    <td style={{ padding: '16px 18px', color: '#d4d4d8' }}>{ord.itemsCount} item(s)</td>
                    <td style={{ padding: '16px 18px', color: '#71717a', fontSize: 12 }}>{formatPrice(ord.shippingCost ?? 0, 'fr')}</td>
                    <td style={{ padding: '16px 18px', fontWeight: 900, color: '#34d399' }}>{formatPrice(ord.total, 'fr')}</td>
                    <td style={{ padding: '16px 18px' }}>{getStatusBadge(ord.status)}</td>
                    <td style={{ padding: '16px 18px' }}>
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                        style={{
                          background: 'rgb(9,9,11)',
                          border: '1px solid rgba(63,63,70,0.8)',
                          borderRadius: 8,
                          padding: '6px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#f4f4f5',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 14px',
                          borderRadius: 10,
                          background: 'rgba(63,63,70,0.7)',
                          color: '#d4d4d8',
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                        className="hover:bg-amber-500 hover:text-zinc-950 transition-all"
                      >
                        <Eye style={{ width: 14, height: 14 }} /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '14px 20px', background: 'rgba(9,9,11,0.6)', borderTop: '1px solid rgba(63,63,70,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>Page {page} of {totalPages}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              style={{ padding: 8, borderRadius: 10, background: 'rgba(63,63,70,0.6)', border: 'none', color: '#d4d4d8', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              style={{ padding: 8, borderRadius: 10, background: 'rgba(63,63,70,0.6)', border: 'none', color: '#d4d4d8', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}
            >
              <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminLayout>
          <OrdersContent />
        </AdminLayout>
      </ToastProvider>
    </ThemeProvider>
  )
}

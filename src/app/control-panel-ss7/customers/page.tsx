'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Users,
  Search,
  ShoppingBag,
  ChevronRight,
  X,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider } from '@/components/admin/providers/ToastContext'
import { ThemeProvider } from '@/components/admin/providers/ThemeContext'
import { formatPrice } from '@/lib/utils'

interface CustomerItem {
  id: string
  name: string
  phone: string
  email: string
  city: string
  address: string
  totalSpent: number
  ordersCount: number
  lastOrderDate: string
  orders: {
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: string
  }[]
}

function CustomersContent() {
  const [customers, setCustomers] = useState<CustomerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setSelectedCustomer(null)
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(search)}`)
      if (!res.ok) {
        setCustomers([])
        return
      }
      const data = await res.json()
      if (Array.isArray(data.customers)) {
        setCustomers(data.customers)
      } else {
        setCustomers([])
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchCustomers, 0)
    return () => window.clearTimeout(timeoutId)
  }, [fetchCustomers])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid rgba(63,63,70,0.6)', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users style={{ width: 22, height: 22 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              Customers Directory
            </h1>
            <p style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>
              View customer profiles, total lifetime spending, and order history
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        background: 'rgb(24,24,27)',
        border: '1px solid rgba(63,63,70,0.6)',
        borderRadius: 16,
        padding: '16px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        maxWidth: 400,
      }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 14, top: 12, width: 16, height: 16, color: '#71717a' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, city..."
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
      </div>

      {/* Customers Table Card */}
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
                {['Customer Name', 'Contact Phone', 'City', 'Orders Placed', 'Total Lifetime Spent', 'Last Order', 'Account Details'].map((h, i) => (
                  <th key={i} style={{ padding: '14px 18px', textAlign: i === 6 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 18px', textAlign: 'center', color: '#71717a' }}>
                    <span style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid #fbbf24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 8 }} />
                    <p style={{ fontSize: 12 }}>Loading customer profiles...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 18px', textAlign: 'center', fontSize: 12, color: '#3f3f46' }}>
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} style={{ borderBottom: '1px solid rgba(63,63,70,0.4)' }} className="hover:bg-zinc-800/30 transition-colors">
                    <td style={{ padding: '16px 18px', fontWeight: 700, color: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div>{cust.name}</div>
                          {cust.email && <div style={{ fontSize: 11, color: '#71717a', fontWeight: 400 }}>{cust.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 18px', fontFamily: 'monospace', color: '#fbbf24', fontWeight: 700 }}>{cust.phone}</td>
                    <td style={{ padding: '16px 18px', color: '#d4d4d8' }}>{cust.city || '—'}</td>
                    <td style={{ padding: '16px 18px', fontWeight: 700, color: '#e4e4e7' }}>{cust.ordersCount} order(s)</td>
                    <td style={{ padding: '16px 18px', fontWeight: 900, color: '#34d399' }}>{formatPrice(cust.totalSpent, 'fr')}</td>
                    <td style={{ padding: '16px 18px', color: '#71717a', fontSize: 12 }}>
                      {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedCustomer(cust)}
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
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        className="hover:bg-amber-500 hover:text-zinc-950 transition-all"
                      >
                        <span>View History</span>
                        <ChevronRight style={{ width: 14, height: 14 }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Account Details Modal */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 640, maxHeight: '85vh', overflowY: 'auto', background: 'rgb(24,24,27)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 24, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.6)', color: '#f4f4f5' }}>
            <button
              onClick={() => setSelectedCustomer(null)}
              style={{ position: 'absolute', top: 24, right: 24, padding: 8, borderRadius: 10, background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}
            >
              <X style={{ width: 20, height: 20 }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#09090b', fontWeight: 900, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(245,158,11,0.25)' }}>
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{selectedCustomer.name}</h2>
                <p style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>Customer Profile & Transaction Summary</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 16, borderRadius: 16, background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', marginBottom: 24 }}>
              <div>
                <span style={{ color: '#71717a', display: 'block', fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>Total Orders</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 2, display: 'block' }}>{selectedCustomer.ordersCount}</span>
              </div>
              <div>
                <span style={{ color: '#71717a', display: 'block', fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>Total Spent</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#34d399', marginTop: 2, display: 'block' }}>
                  {formatPrice(selectedCustomer.totalSpent, 'fr')}
                </span>
              </div>
              <div>
                <span style={{ color: '#71717a', display: 'block', fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>City</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#fbbf24', marginTop: 2, display: 'block' }}>{selectedCustomer.city || '—'}</span>
              </div>
            </div>

            {/* Order History */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag style={{ width: 16, height: 16, color: '#fbbf24' }} /> Order History ({selectedCustomer.orders.length})
              </h3>

              <div style={{ border: '1px solid rgba(63,63,70,0.8)', borderRadius: 16, overflow: 'hidden', background: 'rgba(9,9,11,0.6)' }}>
                {selectedCustomer.orders.map((ord, idx) => (
                  <div
                    key={ord.id}
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      borderBottom: idx < selectedCustomer.orders.length - 1 ? '1px solid rgba(63,63,70,0.5)' : 'none',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 900, color: '#fbbf24', fontFamily: 'monospace', fontSize: 13 }}>{ord.orderNumber}</span>
                      <span style={{ color: '#71717a', fontSize: 11, display: 'block', marginTop: 2 }}>
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontWeight: 800, color: '#f4f4f5', fontSize: 13 }}>{formatPrice(ord.total, 'fr')}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#fbbf24' }}>{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminCustomersPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminLayout>
          <CustomersContent />
        </AdminLayout>
      </ToastProvider>
    </ThemeProvider>
  )
}

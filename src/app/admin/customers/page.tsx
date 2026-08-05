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
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(search)}`)
      const data = await res.json()
      if (data.customers) {
        setCustomers(data.customers)
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" /> Customers Directory
          </h1>
          <p className="text-xs text-zinc-400 mt-1">View customer profiles, total lifetime spending, and order history</p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, city..."
            className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-4">Customer Name</th>
                <th className="py-4 px-4">Contact Phone</th>
                <th className="py-4 px-4">City</th>
                <th className="py-4 px-4">Orders Placed</th>
                <th className="py-4 px-4">Total Lifetime Spent</th>
                <th className="py-4 px-4">Last Order</th>
                <th className="py-4 px-4 text-right">Account Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <span className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading customer profiles...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-extrabold flex items-center justify-center text-xs">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div>{cust.name}</div>
                          {cust.email && <div className="text-[11px] text-zinc-500 font-normal">{cust.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-400">{cust.phone}</td>
                    <td className="py-3.5 px-4 text-zinc-300">{cust.city || '—'}</td>
                    <td className="py-3.5 px-4 font-bold text-zinc-200">{cust.ordersCount} order(s)</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{formatPrice(cust.totalSpent, 'fr')}</td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 text-xs font-semibold transition-colors"
                      >
                        <span>View History</span>
                        <ChevronRight className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedCustomer.name}</h2>
                <p className="text-xs text-zinc-400">Customer Profile & Transaction Summary</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 mb-6 text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Total Orders</span>
                <span className="text-base font-bold text-white mt-0.5 block">{selectedCustomer.ordersCount}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Total Spent</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                  {formatPrice(selectedCustomer.totalSpent, 'fr')}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">City</span>
                <span className="text-base font-bold text-amber-400 mt-0.5 block">{selectedCustomer.city || '—'}</span>
              </div>
            </div>

            {/* Order History */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" /> Order History ({selectedCustomer.orders.length})
              </h3>

              <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/60">
                {selectedCustomer.orders.map((ord) => (
                  <div key={ord.id} className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-800/40">
                    <div>
                      <span className="font-bold text-amber-400 font-mono text-xs">{ord.orderNumber}</span>
                      <span className="text-zinc-500 text-[11px] block mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-zinc-100 text-xs block">{formatPrice(ord.total, 'fr')}</span>
                      <span className="text-[10px] font-extrabold uppercase text-amber-400">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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

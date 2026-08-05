'use client'

import React, { useCallback, useEffect, useState, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Package,
  Save,
  FileText,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { ThemeProvider } from '@/components/admin/providers/ThemeContext'
import { formatPrice } from '@/lib/utils'

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  paymentMethod: string
  paymentStatus: string
  customerName: string
  customerPhone: string
  customerPhone2?: string
  customerEmail?: string
  city: string
  district?: string
  address: string
  postalCode?: string
  notes?: string
  adminNotes?: string
  subtotal: number
  shippingCost: number
  discountAmount: number
  total: number
  createdAt: string
  items: {
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    productSnapshot: Record<string, unknown>
    product?: { nameFr?: string; nameAr?: string; mainImage?: string }
  }[]
  statusHistory: {
    id: string
    status: string
    note?: string
    createdAt: string
  }[]
}

const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

function OrderDetailContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [saving, setSaving] = useState(false)
  const { success, error } = useToast()

  const fetchOrderDetail = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`)
      const data = await res.json()
      if (data.order) {
        setOrder(data.order)
        setStatus(data.order.status)
        setAdminNotes(data.order.adminNotes || '')
      }
    } catch (err) {
      console.error('Error loading order details:', err)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrderDetail()
  }, [fetchOrderDetail])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNotes,
          note: statusNote || undefined,
        }),
      })

      if (!res.ok) throw new Error('Failed to update order')

      success('Order updated successfully')
      setStatusNote('')
      fetchOrderDetail()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed'
      error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-500">
        <span className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p>Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <p>Order not found.</p>
        <Link href="/admin/orders" className="text-amber-400 font-semibold text-xs hover:underline mt-2 inline-block">
          Return to orders list
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">{order.orderNumber}</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-semibold">Order Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold text-amber-400 outline-none focus:border-amber-500 uppercase"
          >
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchased Items Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" /> Order Items ({order.items.length})
            </h2>

            <div className="divide-y divide-zinc-800">
              {order.items.map((item) => {
                const snap = (item.productSnapshot ?? {}) as any
                return (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0">
                        <img
                          src={snap.mainImage || item.product?.mainImage || '/images/brand/logo-full.png'}
                          alt={snap.nameFr || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-100">{snap.nameFr || snap.nameAr || 'Product'}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {snap.selectedSize ? `Size: ${snap.selectedSize}` : ''}{' '}
                          {snap.selectedColor ? `• Color: ${snap.selectedColor}` : ''}
                        </p>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{formatPrice(item.unitPrice, 'fr')} each</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-zinc-400 font-medium">Qty: {item.quantity}</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">{formatPrice(item.totalPrice, 'fr')}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-200">{formatPrice(order.subtotal, 'fr')}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Shipping Cost</span>
                <span className="font-semibold text-zinc-200">{formatPrice(order.shippingCost, 'fr')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex items-center justify-between text-rose-400">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatPrice(order.discountAmount, 'fr')}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-sm font-black text-white">
                <span>Grand Total</span>
                <span className="text-amber-400">{formatPrice(order.total, 'fr')}</span>
              </div>
            </div>
          </div>

          {/* Admin Notes & Update Action */}
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" /> Internal Admin Notes & Status Note
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Status Update Remark (Optional)</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g., Package handed to Amana courier (Tracking #123456)..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Permanent Admin Notes</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add private staff notes..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving updates...' : 'Save Status & Notes Changes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Timeline */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" /> Customer Information
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 text-zinc-300">
                <User className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Name</span>
                  <span className="font-bold text-zinc-100">{order.customerName}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-zinc-300">
                <Phone className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Phone</span>
                  <span className="font-mono text-amber-400">{order.customerPhone}</span>
                  {order.customerPhone2 && <span className="block text-zinc-400 font-mono">{order.customerPhone2}</span>}
                </div>
              </div>

              {order.customerEmail && (
                <div className="flex items-start gap-3 text-zinc-300">
                  <Mail className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Email</span>
                    <span className="text-zinc-200">{order.customerEmail}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 text-zinc-300 pt-2 border-t border-zinc-800">
                <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Shipping Address</span>
                  <span className="text-zinc-200 font-medium block">{order.address}</span>
                  <span className="text-amber-400 font-bold block mt-0.5">
                    {order.city} {order.district ? `(${order.district})` : ''}
                  </span>
                </div>
              </div>

              {order.notes && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 mt-2">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">Customer Order Note:</span>
                  <p className="text-zinc-300 text-xs italic mt-1">&quot;{order.notes}&quot;</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Status History Log
            </h2>

            <div className="space-y-4 border-l-2 border-zinc-800 pl-4 ml-2">
              {order.statusHistory.length === 0 ? (
                <div className="text-xs text-zinc-500">Order placed on {new Date(order.createdAt).toLocaleDateString()}</div>
              ) : (
                order.statusHistory.map((hist) => (
                  <div key={hist.id} className="relative group">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-zinc-900" />
                    <div className="text-xs font-bold text-white uppercase">{hist.status}</div>
                    {hist.note && <p className="text-xs text-zinc-400 mt-0.5">{hist.note}</p>}
                    <span className="text-[10px] text-zinc-500 block mt-1">
                      {new Date(hist.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminLayout>
          <OrderDetailContent orderId={resolvedParams.id} />
        </AdminLayout>
      </ToastProvider>
    </ThemeProvider>
  )
}

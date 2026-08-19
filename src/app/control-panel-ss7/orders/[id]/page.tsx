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
import { resolveOrderColor } from '@/lib/color-names'

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

interface SnapshotColor {
  code?: string
  nameAr?: string
  nameFr?: string
  nameEn?: string
  name?: string
}

interface SnapshotNiqab {
  id: string
  nameAr?: string
  nameFr?: string
  image?: string
  color?: SnapshotColor | string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
}

interface Snapshot extends Record<string, unknown> {
  nameAr?: string
  nameFr?: string
  mainImage?: string
  sku?: string
  size?: string
  selectedSize?: string
  color?: SnapshotColor | string
  selectedColor?: SnapshotColor | string
  niqabs?: SnapshotNiqab[]
}

const statusOptions = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']

const text = (value: unknown) => (typeof value === 'string' ? value : '')

function ColorDot({ code }: { code?: string }) {
  if (!code || !/^#?[0-9a-f]{3,8}$/i.test(code)) return null
  const hex = code.startsWith('#') ? code : `#${code}`
  return (
    <span
      title={hex}
      aria-label={`Color ${hex}`}
      style={{
        display: 'inline-block',
        width: 13,
        height: 13,
        borderRadius: '50%',
        background: hex,
        border: '1.5px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3)',
        verticalAlign: 'middle',
        marginInlineStart: 6,
        flexShrink: 0,
      }}
    />
  )
}

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
      if (!res.ok) throw new Error(`Failed to load order: ${res.status}`)
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
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#a1a1aa' }}>
        <span
          style={{
            display: 'inline-block',
            width: 32,
            height: 32,
            border: '3px solid #fbbf24',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: 12,
          }}
        />
        <p style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7' }}>Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#a1a1aa' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f5' }}>Order not found.</p>
        <Link
          href="/control-panel-ss7/orders"
          style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13, marginTop: 12, display: 'inline-block' }}
        >
          Return to orders list
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          paddingBottom: 20,
          borderBottom: '1px solid rgba(63,63,70,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link
            href="/control-panel-ss7/orders"
            style={{
              padding: 10,
              borderRadius: 12,
              background: 'rgb(24,24,27)',
              border: '1px solid rgba(82,82,91,0.8)',
              color: '#d4d4d8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                fontFamily: 'monospace',
              }}
            >
              {order.orderNumber}
            </h1>
            <p style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 500 }}>
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#d4d4d8' }}>Order Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              background: 'rgb(24,24,27)',
              border: '1px solid rgba(245,158,11,0.5)',
              borderRadius: 12,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 800,
              color: '#fbbf24',
              outline: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {statusOptions.map((st) => (
              <option key={st} value={st} style={{ background: '#18181b', color: '#ffffff' }}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Main Layout Grid ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {/* ── Left Column (2/3 width): Purchased Items & Admin Notes ─────── */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Purchased Items Card */}
          <div
            style={{
              background: 'rgb(24,24,27)',
              border: '1px solid rgba(63,63,70,0.6)',
              borderRadius: 20,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '20px 24px',
                borderBottom: '1px solid rgba(63,63,70,0.5)',
                background: 'rgba(9,9,11,0.4)',
              }}
            >
              <Package style={{ width: 18, height: 18, color: '#fbbf24' }} />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>
                Order Items ({order.items.length})
              </h2>
            </div>

            <div style={{ padding: '8px 24px 20px', display: 'flex', flexDirection: 'column' }}>
              {order.items.map((item, idx) => {
                const snap = (item.productSnapshot ?? {}) as Snapshot
                const rawSize = text(snap.selectedSize) || text(snap.size)
                const nameArStr = text(snap.nameAr) || item.product?.nameAr || ''
                const nameFrStr = text(snap.nameFr) || item.product?.nameFr || ''
                const nameEnStr = text(snap.nameEn) || ''
                const isNiqabItem = Boolean(
                  snap.isNiqab ||
                  /نقاب/i.test(nameArStr) ||
                  /niqab/i.test(nameFrStr) ||
                  /niqab/i.test(nameEnStr)
                )
                const isFakeSize = ['standard', 'one size', 'onesize', 'n/a', 'na', 'none', 'undefined', 'null', ''].includes(
                  rawSize.toLowerCase().trim()
                )
                const hasRealSize = !isNiqabItem && !isFakeSize && Boolean(rawSize.trim())

                const colorInfo = resolveOrderColor(snap.selectedColor || snap.color, 'ar')
                const productName =
                  text(snap.nameFr) ||
                  text(snap.nameAr) ||
                  item.product?.nameFr ||
                  item.product?.nameAr ||
                  'Product'
                const productImage =
                  snap.mainImage || item.product?.mainImage || '/images/brand/logo-full.png'

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 18,
                      padding: '18px 0',
                      borderBottom: idx < order.items.length - 1 ? '1px solid rgba(63,63,70,0.4)' : 'none',
                    }}
                  >
                    {/* Left: Product Image beside Product Details */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: 1, minWidth: 0 }}>
                      {/* Product Image */}
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          minWidth: 64,
                          minHeight: 64,
                          borderRadius: 12,
                          background: '#27272a',
                          border: '1px solid rgba(82,82,91,0.8)',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={productImage}
                          alt={productName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>

                      {/* Product Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#ffffff',
                            margin: 0,
                            lineHeight: 1.3,
                          }}
                        >
                          {productName}
                        </h3>

                        {/* Size & Color row */}
                        {(hasRealSize || colorInfo.name) && (
                          <div
                            style={{
                              fontSize: 13,
                              color: '#d4d4d8',
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 6,
                              fontWeight: 500,
                            }}
                          >
                            {hasRealSize && (
                              <span>
                                Size: <strong style={{ color: '#ffffff', fontWeight: 600 }}>{rawSize}</strong>
                              </span>
                            )}
                            {hasRealSize && colorInfo.name && <span style={{ color: '#71717a' }}>•</span>}
                            {colorInfo.name && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                Color: <strong style={{ color: '#ffffff', fontWeight: 600 }}>{colorInfo.name}</strong>
                                <ColorDot code={colorInfo.code} />
                              </span>
                            )}
                          </div>
                        )}

                        {/* Unit price */}
                        <p style={{ fontSize: 12, color: '#a1a1aa', fontFamily: 'monospace', margin: 0 }}>
                          {formatPrice(item.unitPrice, 'fr')} each
                        </p>

                        {/* Niqab Add-ons */}
                        {Array.isArray(snap.niqabs) &&
                          snap.niqabs.map((niqab, niqabIndex) => {
                            const niqabColor = resolveOrderColor(niqab.color, 'ar')
                            return (
                              <div
                                key={`${niqab.id}-${niqabIndex}`}
                                style={{
                                  fontSize: 12,
                                  color: '#fbbf24',
                                  marginTop: 4,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  flexWrap: 'wrap',
                                  background: 'rgba(245,158,11,0.08)',
                                  padding: '5px 10px',
                                  borderRadius: 8,
                                  border: '1px solid rgba(245,158,11,0.2)',
                                }}
                              >
                                {niqab.image && (
                                  <img
                                    src={niqab.image}
                                    alt="Niqab"
                                    style={{
                                      width: 22,
                                      height: 22,
                                      objectFit: 'cover',
                                      borderRadius: 4,
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                                <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                                  Niqab: {niqab.nameFr || niqab.nameAr || 'Niqab'}
                                </span>
                                {niqabColor.name && (
                                  <>
                                    <span style={{ color: '#71717a' }}>—</span>
                                    <span
                                      style={{
                                        color: '#f4f4f5',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 2,
                                      }}
                                    >
                                      {niqabColor.name}
                                      <ColorDot code={niqabColor.code} />
                                    </span>
                                  </>
                                )}
                                <span style={{ color: '#d4d4d8' }}>× {niqab.quantity ?? 0}</span>
                                <span
                                  style={{
                                    color: '#fbbf24',
                                    fontWeight: 800,
                                    marginInlineStart: 'auto',
                                  }}
                                >
                                  {formatPrice(
                                    niqab.totalPrice ??
                                      (niqab.unitPrice ? niqab.unitPrice * (niqab.quantity ?? 1) : 0),
                                    'fr'
                                  )}
                                </span>
                              </div>
                            )
                          })}
                      </div>
                    </div>

                    {/* Right: Quantity and Line Total */}
                    <div
                      style={{
                        textAlign: 'right',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        flexShrink: 0,
                        minWidth: 80,
                      }}
                    >
                      <div style={{ fontSize: 13, color: '#d4d4d8', fontWeight: 600 }}>
                        Qty: {item.quantity}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#fbbf24' }}>
                        {formatPrice(item.totalPrice, 'fr')}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Price Summary */}
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid rgba(63,63,70,0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#d4d4d8',
                  }}
                >
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#ffffff' }}>{formatPrice(order.subtotal, 'fr')}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#d4d4d8',
                  }}
                >
                  <span>Shipping Cost</span>
                  <span style={{ fontWeight: 600, color: '#ffffff' }}>
                    {formatPrice(order.shippingCost, 'fr')}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#f87171',
                    }}
                  >
                    <span>Discount</span>
                    <span style={{ fontWeight: 700 }}>-{formatPrice(order.discountAmount, 'fr')}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    marginTop: 6,
                    borderTop: '1px solid rgba(63,63,70,0.6)',
                    fontSize: 15,
                    fontWeight: 900,
                    color: '#ffffff',
                  }}
                >
                  <span>Grand Total</span>
                  <span style={{ color: '#fbbf24', fontSize: 18, fontWeight: 900 }}>
                    {formatPrice(order.total, 'fr')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Admin Notes Card */}
          <div
            style={{
              background: 'rgb(24,24,27)',
              border: '1px solid rgba(63,63,70,0.6)',
              borderRadius: 20,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '20px 24px',
                borderBottom: '1px solid rgba(63,63,70,0.5)',
                background: 'rgba(9,9,11,0.4)',
              }}
            >
              <FileText style={{ width: 18, height: 18, color: '#fbbf24' }} />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>
                Internal Admin Notes & Status Remark
              </h2>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#f4f4f5' }}>
                  Status Update Remark (Optional)
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g., Package handed to Amana courier (Tracking #123456)..."
                  style={{
                    width: '100%',
                    background: 'rgb(9,9,11)',
                    border: '1px solid rgba(82,82,91,0.8)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    fontSize: 13,
                    color: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#f4f4f5' }}>Permanent Staff Notes</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add private staff notes..."
                  style={{
                    width: '100%',
                    background: 'rgb(9,9,11)',
                    border: '1px solid rgba(82,82,91,0.8)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    fontSize: 13,
                    color: '#ffffff',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 12,
                  background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                  color: '#09090b',
                  fontWeight: 900,
                  fontSize: 13,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(245,158,11,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Save style={{ width: 16, height: 16 }} />
                <span>{saving ? 'Saving updates...' : 'Save Status & Notes Changes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column (1/3 width): Customer Info & Status Timeline ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Customer Information Card */}
          <div
            style={{
              background: 'rgb(24,24,27)',
              border: '1px solid rgba(63,63,70,0.6)',
              borderRadius: 20,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '20px 24px',
                borderBottom: '1px solid rgba(63,63,70,0.5)',
                background: 'rgba(9,9,11,0.4)',
              }}
            >
              <User style={{ width: 18, height: 18, color: '#fbbf24' }} />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>Customer Information</h2>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <User style={{ width: 16, height: 16, color: '#a1a1aa', marginTop: 2, flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#a1a1aa',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    Name
                  </span>
                  <span style={{ fontWeight: 800, color: '#ffffff', fontSize: 14 }}>
                    {order.customerName}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Phone style={{ width: 16, height: 16, color: '#a1a1aa', marginTop: 2, flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#a1a1aa',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    Phone
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#fbbf24', fontSize: 14 }}>
                    {order.customerPhone}
                  </span>
                  {order.customerPhone2 && (
                    <span style={{ fontFamily: 'monospace', color: '#d4d4d8', fontSize: 13 }}>
                      {order.customerPhone2}
                    </span>
                  )}
                </div>
              </div>

              {order.customerEmail && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Mail style={{ width: 16, height: 16, color: '#a1a1aa', marginTop: 2, flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#a1a1aa',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      Email
                    </span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{order.customerEmail}</span>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  paddingTop: 14,
                  borderTop: '1px solid rgba(63,63,70,0.5)',
                }}
              >
                <MapPin style={{ width: 16, height: 16, color: '#a1a1aa', marginTop: 2, flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#a1a1aa',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    Shipping Address
                  </span>
                  <span style={{ color: '#ffffff', fontWeight: 500, fontSize: 13 }}>{order.address}</span>
                  <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: 13 }}>
                    {order.city} {order.district ? `(${order.district})` : ''}
                  </span>
                </div>
              </div>

              {order.notes && (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: 'rgb(9,9,11)',
                    border: '1px solid rgba(82,82,91,0.6)',
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: '#fbbf24',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      display: 'block',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Customer Order Note:
                  </span>
                  <p
                    style={{
                      color: '#f4f4f5',
                      fontSize: 13,
                      fontStyle: 'italic',
                      marginTop: 6,
                      lineHeight: 1.4,
                    }}
                  >
                    &quot;{order.notes}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Timeline Log Card */}
          <div
            style={{
              background: 'rgb(24,24,27)',
              border: '1px solid rgba(63,63,70,0.6)',
              borderRadius: 20,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '20px 24px',
                borderBottom: '1px solid rgba(63,63,70,0.5)',
                background: 'rgba(9,9,11,0.4)',
              }}
            >
              <Clock style={{ width: 18, height: 18, color: '#fbbf24' }} />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>Status History Log</h2>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  borderLeft: '2px solid rgba(63,63,70,0.8)',
                  paddingLeft: 16,
                  marginLeft: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                }}
              >
                {order.statusHistory.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#a1a1aa' }}>
                    Order placed on {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                ) : (
                  order.statusHistory.map((hist) => (
                    <div
                      key={hist.id}
                      style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 3 }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: -21,
                          top: 4,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#f59e0b',
                          border: '3px solid rgb(24,24,27)',
                        }}
                      />
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: '#ffffff',
                          textTransform: 'uppercase',
                        }}
                      >
                        {hist.status}
                      </div>
                      {hist.note && (
                        <p style={{ fontSize: 12, color: '#e4e4e7', marginTop: 2, lineHeight: 1.4 }}>
                          {hist.note}
                        </p>
                      )}
                      <span style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>
                        {new Date(hist.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

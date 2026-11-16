'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/store/cart.store'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { aggregateNiqabs, computeCartSubtotal } from '@/lib/cart-math'
import { AnimatePresence, motion } from 'framer-motion'

interface CartDrawerProps {
  locale: string
}

export function CartDrawer({ locale }: CartDrawerProps) {
  const t = useTranslations('cart')
  const router = useRouter()
  const cartStore = useCartStore()

  const isRTL = locale === 'ar'
  const drawerRef = useRef<HTMLDivElement>(null)

  const cartSubtotal = computeCartSubtotal(cartStore.items)
  const totalCount = cartStore.items.reduce((sum, item) => sum + item.quantity, 0)

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && cartStore.isOpen) {
        cartStore.closeCart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cartStore])

  const handleCheckout = () => {
    cartStore.closeCart()
    router.push(`/${locale}/checkout`)
  }

  return (
    <AnimatePresence>
      {cartStore.isOpen && (
        <>
          {/* ── Overlay ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.52 }}
            exit={{ opacity: 0 }}
            onClick={cartStore.closeCart}
            className="fixed inset-0 bg-[#140D09] z-50 cursor-pointer"
            aria-hidden="true"
          />

          {/* ── Drawer ──────────────────────────────────────────── */}
          <motion.div
            ref={drawerRef}
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed inset-y-0 z-50 flex flex-col focus:outline-none"
            style={{
              width: 'min(92vw, 410px)',
              left: isRTL ? 0 : 'auto',
              right: isRTL ? 'auto' : 0,
              background: 'var(--card-bg)',
              borderLeft: isRTL ? 'none' : '1px solid var(--border)',
              borderRight: isRTL ? '1px solid var(--border)' : 'none',
              boxShadow: 'var(--shadow-modal)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
          >
            {/* ── Header ────────────────────────────────────────── */}
            <div
              className="flex items-center justify-between flex-shrink-0"
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
              }}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center gap-2.5">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--accent-light)',
                    border: '1px solid var(--accent-ring)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingBag style={{ width: 17, height: 17, color: 'var(--accent)' }} />
                </div>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  {t('title')}
                </h2>
                {totalCount > 0 && (
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: 'var(--accent)',
                      background: 'var(--accent-light)',
                      border: '1px solid var(--accent-ring)',
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {totalCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={cartStore.closeCart}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
                aria-label={t('close')}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* ── Item List ─────────────────────────────────────── */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {cartStore.items.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '48px 24px',
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'var(--accent-light)',
                      border: '1px solid var(--accent-ring)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShoppingBag style={{ width: 26, height: 26, color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {t('empty')}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.6 }}>
                      {t('emptyDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      cartStore.closeCart()
                      router.push(`/${locale}/products`)
                    }}
                    className="btn btn-primary btn-round text-sm"
                  >
                    {t('startShopping')}
                  </button>
                </div>
              ) : (
                cartStore.items.map((item) => {
                  const itemTotal = item.unitPrice * item.quantity
                  const itemName = locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.nameEn
                  const itemColor = locale === 'ar' ? item.colorNameAr : locale === 'fr' ? item.colorNameFr : item.colorNameEn

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: '12px',
                        borderRadius: 14,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-subtle)',
                        position: 'relative',
                      }}
                    >
                      {/* Product image */}
                      <div
                        style={{
                          width: 66,
                          height: 82,
                          borderRadius: 10,
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: 'var(--bg-muted)',
                          border: '1px solid var(--border)',
                          position: 'relative',
                        }}
                      >
                        <Image
                          src={item.mainImage || '/images/brand/logo-icon.png'}
                          alt={itemName}
                          fill
                          sizes="66px"
                          referrerPolicy="no-referrer"
                          className="object-cover"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).src = '/images/brand/logo-icon.png'
                          }}
                        />
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6 }}>
                        <div>
                          <h4
                            style={{
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              lineHeight: 1.35,
                              margin: 0,
                              paddingInlineEnd: 26,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {itemName}
                          </h4>

                          {/* Size + Color */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', alignItems: 'center', marginTop: 5 }}>
                            {!item.isNiqab &&
                              item.size &&
                              !['standard', 'one size', 'n/a', 'undefined', 'null'].includes(
                                item.size.toLowerCase().trim()
                              ) && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: 'var(--text-secondary)',
                                    background: 'var(--card-bg)',
                                    padding: '1px 7px',
                                    borderRadius: 6,
                                    border: '1px solid var(--border)',
                                    fontWeight: 600,
                                  }}
                                >
                                  {item.size}
                                </span>
                              )}
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text-muted)' }}>
                              <span
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  background: item.colorCode || 'transparent',
                                  border: '1px solid var(--border)',
                                  flexShrink: 0,
                                  display: 'inline-block',
                                }}
                              />
                              {itemColor}
                            </span>
                          </div>
                        </div>

                        {/* Bottom row: Qty controls + Price */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              border: '1px solid var(--border)',
                              borderRadius: 8,
                              background: 'var(--card-bg)',
                              overflow: 'hidden',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => cartStore.updateQuantity(item.id, item.quantity - 1)}
                              style={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-muted)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              aria-label="Decrease quantity"
                            >
                              <Minus style={{ width: 12, height: 12 }} />
                            </button>
                            <span
                              className="tabular-nums"
                              style={{
                                minWidth: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                borderInlineStart: '1px solid var(--border)',
                                borderInlineEnd: '1px solid var(--border)',
                              }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => cartStore.updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-muted)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              aria-label="Increase quantity"
                            >
                              <Plus style={{ width: 12, height: 12 }} />
                            </button>
                          </div>

                          <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)' }}>
                            {formatPrice(itemTotal, locale)}
                          </span>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => cartStore.removeItem(item.id)}
                        style={{
                          position: 'absolute',
                          top: 10,
                          [isRTL ? 'left' : 'right']: 10,
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        aria-label="Remove item"
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  )
                })
              )}

              {/* ── Standalone Niqab Add-ons (aggregated, counted once) ── */}
              {aggregateNiqabs(cartStore.items).map((niqab) => {
                const niqabName =
                  locale === 'ar' ? niqab.nameAr : locale === 'fr' ? niqab.nameFr : niqab.nameEn
                const colorLabel =
                  locale === 'ar' ? niqab.colorNameAr : locale === 'fr' ? niqab.colorNameFr : niqab.colorNameEn
                return (
                  <div
                    key={`${niqab.productId}-${niqab.variantId ?? ''}`}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '12px',
                      borderRadius: 14,
                      border: '1px solid var(--accent-ring)',
                      background: 'var(--accent-light)',
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 10,
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--border)',
                        position: 'relative',
                      }}
                    >
                      {niqab.mainImage ? (
                        <Image
                          src={niqab.mainImage}
                          alt={niqabName}
                          fill
                          sizes="60px"
                          referrerPolicy="no-referrer"
                          className="object-cover"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).src = '/images/brand/logo-icon.png'
                          }}
                        />
                      ) : (
                        <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: niqab.colorCode || 'var(--gold)', border: '1px solid var(--border)' }} />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, margin: 0 }}>
                        {niqabName}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: niqab.colorCode || 'transparent',
                              border: '1px solid var(--border)',
                              flexShrink: 0,
                              display: 'inline-block',
                            }}
                          />
                          {colorLabel}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>
                          {locale === 'ar' ? 'نقاب' : locale === 'fr' ? 'Niquab' : 'Niqab'}
                        </span>
                        <span className="tabular-nums">× {niqab.quantity}</span>
                      </div>
                    </div>

                    <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', alignSelf: 'flex-start' }}>
                      {formatPrice(niqab.unitPrice * niqab.quantity, locale)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* ── Footer ────────────────────────────────────────── */}
            {cartStore.items.length > 0 && (
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  flexShrink: 0,
                }}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {/* Subtotal rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>{t('subtotal')}</span>
                    <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatPrice(cartSubtotal, locale)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{t('shipping')}</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: 11.5 }}>
                      {locale === 'ar'
                        ? 'يُحسب عند إتمام الطلب'
                        : locale === 'fr'
                          ? 'Calculé à la caisse'
                          : 'Calculated at checkout'}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {t('total')}
                  </span>
                  <span className="tabular-nums" style={{ fontSize: 19, fontWeight: 800, color: 'var(--accent)' }}>
                    {formatPrice(cartSubtotal, locale)}
                  </span>
                </div>

                {/* Checkout button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="btn btn-primary w-full"
                  style={{
                    borderRadius: 12,
                    padding: '13px 20px',
                    fontSize: 14,
                    fontWeight: 800,
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingBag style={{ width: 16, height: 16 }} />
                  <span>{t('checkout')}</span>
                  <ArrowRight style={{ width: 15, height: 15, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                </button>

                {/* Continue shopping */}
                <button
                  type="button"
                  onClick={cartStore.closeCart}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.04em',
                    padding: '4px 0',
                  }}
                >
                  {t('continueShopping')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

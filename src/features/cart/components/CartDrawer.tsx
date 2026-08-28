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
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={cartStore.closeCart}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
            aria-hidden="true"
          />

          {/* ── Drawer ──────────────────────────────────────────── */}
          <motion.div
            ref={drawerRef}
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 z-50 flex flex-col focus:outline-none"
            style={{
              width: 'min(92vw, 400px)',
              left: isRTL ? 0 : 'auto',
              right: isRTL ? 'auto' : 0,
              background: 'var(--card)',
              borderLeft: isRTL ? 'none' : '1px solid var(--border)',
              borderRight: isRTL ? '1px solid var(--border)' : 'none',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
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
              }}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center gap-2.5">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(196,98,45,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingBag style={{ width: 18, height: 18, color: '#C4622D' }} />
                </div>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--foreground)',
                    lineHeight: 1,
                  }}
                >
                  {t('title')}
                </h2>
                {cartStore.items.length > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#C4622D',
                      background: 'rgba(196,98,45,0.1)',
                      padding: '2px 8px',
                      borderRadius: 100,
                    }}
                  >
                    {cartStore.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={cartStore.closeCart}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--muted-foreground)',
                  background: 'var(--bg-subtle)',
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
              style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}
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
                      background: 'rgba(196,98,45,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShoppingBag style={{ width: 28, height: 28, color: '#C4622D' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                      {t('empty')}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 6 }}>
                      {t('emptyDesc')}
                    </p>
                  </div>
                  <button
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

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: '12px',
                        borderRadius: 14,
                        border: '1px solid var(--border)',
                        background: 'var(--background)',
                        position: 'relative',
                      }}
                    >
                      {/* Product image */}
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 10,
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: 'var(--bg-subtle)',
                          position: 'relative',
                        }}
                      >
                        <Image
                          src={item.mainImage}
                          alt={locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.nameEn}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Name */}
                        <h4
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--foreground)',
                            lineHeight: 1.3,
                            margin: 0,
                            paddingInlineEnd: 24,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.nameEn}
                        </h4>

                        {/* Size + Color */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', alignItems: 'center' }}>
                          {!item.isNiqab &&
                            item.size &&
                            !['standard', 'one size', 'n/a', 'undefined', 'null'].includes(
                              item.size.toLowerCase().trim()
                            ) && (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: 'var(--muted-foreground)',
                                  background: 'var(--bg-subtle)',
                                  padding: '1px 7px',
                                  borderRadius: 6,
                                  border: '1px solid var(--border)',
                                  fontWeight: 600,
                                }}
                              >
                                {item.size}
                              </span>
                            )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted-foreground)' }}>
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: item.colorCode,
                                border: '1px solid rgba(0,0,0,0.12)',
                                flexShrink: 0,
                                display: 'inline-block',
                              }}
                            />
                            {locale === 'ar' ? item.colorNameAr : locale === 'fr' ? item.colorNameFr : item.colorNameEn}
                          </span>
                        </div>

                        {/* Bottom row: Qty controls + Price */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                          {/* Quantity */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              border: '1px solid var(--border)',
                              borderRadius: 8,
                              overflow: 'hidden',
                            }}
                          >
                            <button
                              onClick={() => cartStore.updateQuantity(item.id, item.quantity - 1)}
                              style={{
                                width: 30,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--muted-foreground)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              aria-label="Decrease quantity"
                            >
                              <Minus style={{ width: 12, height: 12 }} />
                            </button>
                            <span
                              style={{
                                minWidth: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                fontWeight: 700,
                                color: 'var(--foreground)',
                                borderLeft: '1px solid var(--border)',
                                borderRight: '1px solid var(--border)',
                              }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => cartStore.updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                width: 30,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--muted-foreground)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              aria-label="Increase quantity"
                            >
                              <Plus style={{ width: 12, height: 12 }} />
                            </button>
                          </div>

                          {/* Price */}
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#C4622D' }}>
                            {formatPrice(itemTotal, locale)}
                          </span>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => cartStore.removeItem(item.id)}
                        style={{
                          position: 'absolute',
                          top: 8,
                          [isRTL ? 'left' : 'right']: 8,
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#f87171',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        aria-label="Remove item"
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
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
                      border: '1px solid rgba(184,150,90,0.3)',
                      background: 'rgba(184,150,90,0.05)',
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 10,
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'var(--bg-subtle)',
                        position: 'relative',
                      }}
                    >
                      {niqab.mainImage ? (
                        <Image
                          src={niqab.mainImage}
                          alt={niqabName}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: niqab.colorCode, border: '1px solid rgba(0,0,0,0.12)' }} />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.3, margin: 0 }}>
                        {niqabName}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted-foreground)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: niqab.colorCode,
                              border: '1px solid rgba(0,0,0,0.12)',
                              flexShrink: 0,
                              display: 'inline-block',
                            }}
                          />
                          {colorLabel}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#b8965a' }}>
                          {locale === 'ar' ? 'نقاب' : locale === 'fr' ? 'Niquab' : 'Niqab'}
                        </span>
                        <span>× {niqab.quantity}</span>
                      </div>
                    </div>

                    <span style={{ fontSize: 14, fontWeight: 800, color: '#C4622D', alignSelf: 'flex-start' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted-foreground)' }}>
                    <span>{t('subtotal')}</span>
                    <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                      {formatPrice(cartSubtotal, locale)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted-foreground)' }}>
                    <span>{t('shipping')}</span>
                    <span style={{ fontWeight: 500, color: '#C4622D', fontSize: 11 }}>
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
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>
                    {t('total')}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#C4622D' }}>
                    {formatPrice(cartSubtotal, locale)}
                  </span>
                </div>

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: 12,
                    background: 'linear-gradient(90deg, #C4622D, #d97b4a)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 16px rgba(196,98,45,0.25)',
                  }}
                >
                  <ShoppingBag style={{ width: 16, height: 16 }} />
                  {t('checkout')}
                  <ArrowRight style={{ width: 14, height: 14, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                </button>

                {/* Continue shopping */}
                <button
                  onClick={cartStore.closeCart}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
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

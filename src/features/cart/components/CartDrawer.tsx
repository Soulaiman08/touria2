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
            animate={{ opacity: 0.55 }}
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
            className={`fixed inset-y-0 z-50 flex flex-col w-[min(92vw,26rem)] bg-[var(--card-bg)] shadow-[var(--shadow-modal)] focus:outline-none ${
              isRTL ? 'left-0 border-r border-[var(--border)]' : 'right-0 border-l border-[var(--border)]'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
          >
            {/* ── Header ────────────────────────────────────────── */}
            <div
              className="flex items-center justify-between flex-shrink-0 px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-subtle)]"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] flex items-center justify-center flex-shrink-0 text-[var(--accent)]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-base font-extrabold text-[var(--text-primary)] leading-none m-0 truncate">
                    {t('title')}
                  </h2>
                  {totalCount > 0 && (
                    <span className="tabular-nums text-xs font-bold text-[var(--accent)]">
                      ({totalCount})
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={cartStore.closeCart}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-muted)] bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--accent-ring)] hover:text-[var(--accent)] cursor-pointer transition-colors flex-shrink-0"
                aria-label={t('close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Item List ─────────────────────────────────────── */}
            <div
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {cartStore.items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 gap-4">
                  <div className="w-16 h-20 rounded-t-[999px] rounded-b-xl bg-[var(--accent-light)] border border-[var(--gold-ring)] flex items-center justify-center text-[var(--accent)]">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] m-0">
                      {t('empty')}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1.5 mb-0 leading-relaxed">
                      {t('emptyDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      cartStore.closeCart()
                      router.push(`/${locale}/products`)
                    }}
                    className="btn btn-primary btn-round px-6 h-11 text-sm font-bold"
                  >
                    {t('startShopping')}
                  </button>
                </div>
              ) : (
                cartStore.items.map((item) => {
                  const itemTotal = item.unitPrice * item.quantity
                  const itemName = locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.nameEn
                  const itemColor = locale === 'ar' ? item.colorNameAr : locale === 'fr' ? item.colorNameFr : item.colorNameEn
                  const hasSize =
                    !item.isNiqab &&
                    item.size &&
                    !['standard', 'one size', 'n/a', 'undefined', 'null'].includes(item.size.toLowerCase().trim())

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]/65 relative"
                    >
                      {/* 3:4 Product thumbnail */}
                      <div className="w-16 h-[5.3125rem] rounded-xl overflow-hidden flex-shrink-0 bg-[var(--bg-muted)] border border-[var(--border)] relative">
                        <Image
                          src={item.mainImage || '/images/brand/logo-icon.png'}
                          alt={itemName}
                          fill
                          sizes="64px"
                          referrerPolicy="no-referrer"
                          className="object-cover"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).src = '/images/brand/logo-icon.png'
                          }}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-[var(--text-primary)] leading-snug m-0 pe-9 line-clamp-2">
                            {itemName}
                          </h4>

                          {/* Clean inline metadata */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-[var(--text-muted)]">
                            {hasSize && (
                              <>
                                <span className="font-semibold text-[var(--text-secondary)]">{item.size}</span>
                                <span aria-hidden="true">·</span>
                              </>
                            )}
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-[var(--border)] flex-shrink-0 inline-block"
                                style={{ background: item.colorCode || 'transparent' }}
                              />
                              <span>{itemColor}</span>
                            </span>
                          </div>
                        </div>

                        {/* Qty Stepper + Price */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="inline-flex items-center border border-[var(--border)] rounded-xl bg-[var(--card-bg)] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => cartStore.updateQuantity(item.id, item.quantity - 1)}
                              className="w-9 h-9 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] bg-transparent border-0 cursor-pointer transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="tabular-nums min-w-[1.75rem] h-9 flex items-center justify-center text-xs font-bold text-[var(--text-primary)] border-x border-[var(--border)]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => cartStore.updateQuantity(item.id, item.quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] bg-transparent border-0 cursor-pointer transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="tabular-nums text-sm font-extrabold text-[var(--accent)]">
                            {formatPrice(itemTotal, locale)}
                          </span>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => cartStore.removeItem(item.id)}
                        className="absolute top-2.5 end-2.5 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] bg-transparent border-0 cursor-pointer transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
                    className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--accent-ring)] bg-[var(--accent-light)]"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--bg-muted)] border border-[var(--border)] relative">
                      {niqab.mainImage ? (
                        <Image
                          src={niqab.mainImage}
                          alt={niqabName}
                          fill
                          sizes="56px"
                          referrerPolicy="no-referrer"
                          className="object-cover"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).src = '/images/brand/logo-icon.png'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span
                            className="w-5 h-5 rounded-full border border-[var(--border)]"
                            style={{ background: niqab.colorCode || 'var(--gold)' }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug m-0 truncate">
                        {niqabName}
                      </h4>
                      <div className="flex items-center flex-wrap gap-1.5 text-xs text-[var(--text-muted)]">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-[var(--border)] flex-shrink-0 inline-block"
                            style={{ background: niqab.colorCode || 'transparent' }}
                          />
                          <span>{colorLabel}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-bold text-[var(--gold)]">
                          {locale === 'ar' ? 'نقاب' : locale === 'fr' ? 'Niqab' : 'Niqab'}
                        </span>
                        <span className="tabular-nums">× {niqab.quantity}</span>
                      </div>
                    </div>

                    <span className="tabular-nums text-sm font-extrabold text-[var(--accent)] flex-shrink-0">
                      {formatPrice(niqab.unitPrice * niqab.quantity, locale)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* ── Footer ────────────────────────────────────────── */}
            {cartStore.items.length > 0 && (
              <div
                className="px-5 py-4 border-t border-[var(--border)] bg-[var(--bg-subtle)] flex flex-col gap-3 flex-shrink-0"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs sm:text-sm text-[var(--text-muted)]">
                    <span>{t('subtotal')}</span>
                    <span className="tabular-nums font-bold text-[var(--text-primary)]">
                      {formatPrice(cartSubtotal, locale)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>{t('shipping')}</span>
                    <span className="font-semibold text-[var(--accent)]">
                      {locale === 'ar'
                        ? 'يُحسب عند إتمام الطلب'
                        : locale === 'fr'
                          ? 'Calculé à la caisse'
                          : 'Calculated at checkout'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-[var(--border)]">
                  <span className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                    {t('total')}
                  </span>
                  <span className="tabular-nums text-lg sm:text-xl font-extrabold text-[var(--accent)]">
                    {formatPrice(cartSubtotal, locale)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="btn btn-primary w-full h-11 rounded-xl justify-center text-sm font-extrabold"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('checkout')}</span>
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={cartStore.closeCart}
                  className="w-full h-9 bg-transparent border-0 cursor-pointer text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
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

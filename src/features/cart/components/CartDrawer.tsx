'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/store/cart.store'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
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

  // Close drawer on pressing Escape key
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
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={cartStore.closeCart}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
            aria-hidden="true"
          />

          {/* Drawer container */}
          <motion.div
            ref={drawerRef}
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 z-50 w-[92vw] max-w-[360px] sm:w-full sm:max-w-md shadow-2xl flex flex-col focus:outline-none"
            style={{
              left: isRTL ? 0 : 'auto',
              right: isRTL ? 'auto' : 0,
              background: 'var(--card)',
              borderLeft: isRTL ? 'none' : '1px solid var(--border)',
              borderRight: isRTL ? '1px solid var(--border)' : 'none',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C4622D]" />
                <h2 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                  {t('title')}
                </h2>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full text-[#C4622D] bg-[rgba(196,98,45,0.08)]">
                  {cartStore.totalItems}
                </span>
              </div>
              <button
                onClick={cartStore.closeCart}
                className="p-2 rounded-xl transition-colors hover:bg-[rgba(196,98,45,0.08)] hover:text-[#C4622D]"
                style={{ color: 'var(--muted-foreground)' }}
                aria-label={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartStore.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[rgba(196,98,45,0.05)] text-[#C4622D]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>
                      {t('empty')}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
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
                  const niqabSubtotal =
                    item.niqabItems?.reduce(
                      (sum, n) =>
                        sum + n.unitPrice * n.quantity,
                      0,
                    ) || 0

                  const itemTotal =
                    item.unitPrice * item.quantity +
                    niqabSubtotal

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-2.5 sm:gap-4 sm:p-3 rounded-xl border relative transition-all duration-200"
                      style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                    >
                      {/* Product image */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.mainImage}
                          alt={locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.nameEn}
                          fill
                          sizes="(max-width: 640px) 64px, 80px"
                          className="object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-medium text-sm leading-snug line-clamp-1" style={{ color: 'var(--foreground)' }}>
                            {locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.nameEn}
                          </h4>
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            <span>{t('size')}: {item.size}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: item.colorCode }} />
                              {locale === 'ar' ? item.colorNameAr : locale === 'fr' ? item.colorNameFr : item.colorNameEn}
                            </span>
                          </div>

                          {/* Multiple Niqabs Subitem Display */}
                          {item.niqabItems && item.niqabItems.length > 0 && (
                            <div className="mt-2 space-y-1 p-2 rounded bg-[rgba(184,150,90,0.08)] border border-[rgba(184,150,90,0.2)] text-xs">
                              <div className="font-semibold text-[#b8965a] text-[11px]">
                                {locale === 'ar' ? 'النقابات الإضافية:' : locale === 'fr' ? 'Niqabs inclus :' : 'Included niqabs:'}
                              </div>
                              {item.niqabItems.map((n, idx) => {
                                const colorLabel = locale === 'ar' ? n.colorNameAr : locale === 'fr' ? n.colorNameFr : n.colorNameEn
                                return (
                                  <div key={idx} className="flex items-center justify-between text-[11px]">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full inline-block border" style={{ background: n.colorCode }} />
                                      {colorLabel} × {n.quantity}
                                    </span>
                                    <span className="font-semibold text-[#C4622D]">
                                      +{formatPrice(n.unitPrice * n.quantity, locale)}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity Selector */}
                          <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                            <button
                              onClick={() => cartStore.updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 transition-colors hover:bg-[rgba(196,98,45,0.08)] hover:text-[#C4622D]"
                              style={{ color: 'var(--muted-foreground)' }}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => cartStore.updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 transition-colors hover:bg-[rgba(196,98,45,0.08)] hover:text-[#C4622D]"
                              style={{ color: 'var(--muted-foreground)' }}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                              {formatPrice(itemTotal, locale)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => cartStore.removeItem(item.id)}
                        className="absolute top-2 inset-inline-end-2 p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:dark:bg-rose-950/30 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer Summary */}
            {cartStore.items.length > 0 && (
              <div className="p-4 border-t space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
                <div className="space-y-1.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  <div className="flex justify-between">
                    <span>{t('subtotal')}</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {formatPrice(cartStore.subtotal, locale)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('shipping')}</span>
                    <span className="font-medium text-[#C4622D]">
                      {locale === 'ar' ? 'يُحسب عند إتمام الطلب' : locale === 'fr' ? 'Calculé à la caisse' : 'Calculated at checkout'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3 flex justify-between font-semibold text-base" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  <span>{t('total')}</span>
                  <span className="text-[#C4622D]">{formatPrice(cartStore.subtotal, locale)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full btn btn-primary btn-round py-2.5 text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t('checkout')}
                </button>

                <button
                  onClick={cartStore.closeCart}
                  className="w-full text-center text-xs font-semibold uppercase tracking-wider transition-colors hover:text-[#C4622D] mt-3"
                  style={{ color: 'var(--text-muted)' }}
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

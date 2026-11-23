'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductCard } from '@/types/product'
import { formatPrice, cn } from '@/lib/utils'

interface HeroShowcaseProps {
  products: ProductCard[]
  locale: string
  featuredPieceLabel: string
  fallbackName: string
}

export function HeroShowcase({
  products,
  locale,
  featuredPieceLabel,
  fallbackName,
}: HeroShowcaseProps) {
  const isRTL = locale === 'ar'
  const count = products.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const safeIndex = count > 0 ? activeIndex % count : 0
  const activeProduct = count > 0 ? products[safeIndex] : null
  const nextIndex = count > 1 ? (safeIndex + 1) % count : 0
  const nextProduct = count > 1 ? products[nextIndex] : null

  useEffect(() => {
    if (count <= 1 || paused) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count)
    }, 4500)
    return () => clearInterval(timer)
  }, [count, paused])

  const getProductName = (item: ProductCard) =>
    locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.nameEn

  const goPrev = () => {
    if (count <= 1) return
    setActiveIndex((prev) => (prev - 1 + count) % count)
  }

  const goNext = () => {
    if (count <= 1) return
    setActiveIndex((prev) => (prev + 1) % count)
  }

  const primaryName = activeProduct ? getProductName(activeProduct) : fallbackName
  const secondaryName = nextProduct ? getProductName(nextProduct) : ''

  return (
    <div
      className="relative w-full max-w-[9.75rem] min-[390px]:max-w-[11rem] sm:max-w-[13.5rem] md:max-w-[15rem] lg:max-w-[16.5rem] xl:max-w-[17.5rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative">
        {activeProduct ? (
          <Link
            href={`/${locale}/products/${activeProduct.slug}`}
            className="block relative aspect-[4/5] w-full rounded-t-[999px] rounded-b-xl sm:rounded-b-2xl overflow-hidden border border-[var(--gold)]/45 bg-[var(--bg-muted)] group no-underline"
            style={{ boxShadow: 'var(--card-shadow-hover)' }}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={activeProduct.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={activeProduct.mainImage || '/images/brand/logo-full.png'}
                  alt={primaryName}
                  fill
                  priority
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 640px) 176px, (max-width: 1024px) 240px, 280px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(20, 13, 9, 0.84) 0%, rgba(20, 13, 9, 0.16) 50%, transparent 100%)',
                  }}
                />

                {/* Subtle Framed Showcase Caption */}
                <div
                  className={cn(
                    'absolute bottom-0 inset-x-0 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-1 lg:gap-2 text-white',
                    nextProduct
                      ? 'ps-10 pe-2 pb-2 min-[390px]:ps-11 min-[390px]:pe-2.5 min-[390px]:pb-2.5 sm:ps-[4rem] sm:pe-3 sm:pb-3 md:ps-[4.5rem] md:pe-3.5 md:pb-3.5 lg:ps-[5rem] lg:pe-4 lg:pb-4'
                      : 'p-2.5 sm:p-3.5 lg:p-4'
                  )}
                >
                  <div className="min-w-0 space-y-0.5">
                    <span className="hidden sm:block text-[0.5625rem] font-semibold uppercase tracking-[0.11em] text-[#E4C48E] whitespace-nowrap">
                      {featuredPieceLabel}
                    </span>
                    <p className="text-[0.6875rem] sm:text-xs lg:text-sm font-bold truncate">
                      {primaryName}
                    </p>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-1.5 flex-shrink-0">
                    <span className="text-[0.6875rem] sm:text-xs font-bold tabular-nums text-[#F6EFE6] whitespace-nowrap">
                      {formatPrice(activeProduct.salePrice ?? activeProduct.basePrice, locale)}
                    </span>
                    <span className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-white/15 backdrop-blur-xs border border-white/25 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                      <ArrowUpRight className={cn('w-3 h-3 sm:w-3.5 sm:h-3.5', isRTL ? '-scale-x-100' : '')} />
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </Link>
        ) : (
          <div
            className="relative aspect-[4/5] w-full rounded-t-[999px] rounded-b-xl sm:rounded-b-2xl overflow-hidden border border-[var(--gold)]/45 bg-[var(--card-bg)]"
            style={{ boxShadow: 'var(--card-shadow-hover)' }}
          >
            <Image
              src="/images/brand/logo-full.png"
              alt={fallbackName}
              fill
              priority
              referrerPolicy="no-referrer"
              sizes="(max-width: 640px) 176px, (max-width: 1024px) 240px, 280px"
              className="object-cover"
            />
          </div>
        )}

        {/* Secondary Next-Piece Preview Tile (click to switch to next featured piece) */}
        {nextProduct && (
          <button
            type="button"
            onClick={goNext}
            aria-label={
              isRTL
                ? `عرض ${secondaryName}`
                : locale === 'fr'
                  ? `Voir ${secondaryName}`
                  : `Preview ${secondaryName}`
            }
            title={secondaryName}
            className="block absolute -bottom-2 -start-2 w-10 min-[390px]:w-11 sm:-bottom-2.5 sm:-start-2.5 sm:w-14 md:w-16 lg:-bottom-3 lg:-start-3 lg:w-[4.5rem] aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden border-2 border-[var(--card-bg)] bg-[var(--card-bg)] shadow-lg group cursor-pointer transition-transform duration-300 hover:-translate-y-1 p-0"
          >
            <Image
              src={nextProduct.mainImage || '/images/brand/logo-icon.png'}
              alt={secondaryName}
              fill
              referrerPolicy="no-referrer"
              sizes="(max-width: 640px) 48px, 80px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        )}
      </div>

      {/* Subtle Pagination Controls for All Featured Pieces */}
      {count > 1 && (
        <div
          className="mt-2 sm:mt-2.5 flex items-center justify-center gap-1.5"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label={isRTL ? 'المنتج السابق' : locale === 'fr' ? 'Produit précédent' : 'Previous product'}
            className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--gold)]"
          >
            {isRTL ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>

          <div className="flex flex-wrap items-center justify-center gap-1 max-w-[9rem]">
            {products.map((item, idx) => {
              const isActive = idx === safeIndex
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={getProductName(item)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    isActive
                      ? 'w-4 bg-[var(--gold)]'
                      : 'w-1.5 bg-[var(--border)] hover:bg-[var(--gold)]/60'
                  )}
                />
              )
            })}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label={isRTL ? 'المنتج التالي' : locale === 'fr' ? 'Produit suivant' : 'Next product'}
            className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--gold)]"
          >
            {isRTL ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'

import { formatPrice, cn } from '@/lib/utils'
import type { ProductCard as ProductCardType } from '@/types/product'

interface ProductCardProps {
  product: ProductCardType
  locale: string
  onAddToCart?: (product: ProductCardType) => void
  className?: string
  isNew?: boolean
}

const FALLBACK_IMAGE = '/images/brand/logo-icon.png'

export function ProductCard({
  product,
  locale,
  className,
  isNew,
}: ProductCardProps) {
  const isRTL = locale === 'ar'

  const allImages = useMemo(() => {
    const list = [product.mainImage, ...(product.images || [])].filter(Boolean)
    return Array.from(new Set(list))
  }, [product.mainImage, product.images])

  const totalImages = allImages.length
  const hasMultipleImages = totalImages > 1

  const [activeIndex, setActiveIndex] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({})

  const cardRef = useRef<HTMLElement | null>(null)
  const touchStartXRef = useRef<number | null>(null)

  // Respect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Pause autoscroll when card is scrolled out of view
  useEffect(() => {
    const el = cardRef.current
    if (!el || !hasMultipleImages) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMultipleImages])

  // Deterministic Autoscroll when multiple images exist (3.5s interval, pauses on hover/focus/reduced-motion)
  useEffect(() => {
    if (
      !hasMultipleImages ||
      !isInView ||
      isHovered ||
      isFocused ||
      prefersReducedMotion
    ) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalImages)
    }, 3500)

    return () => window.clearInterval(timer)
  }, [hasMultipleImages, isInView, isHovered, isFocused, prefersReducedMotion, totalImages])

  const safeIndex = activeIndex < totalImages ? activeIndex : 0

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages)
    },
    [totalImages]
  )

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setActiveIndex((prev) => (prev + 1) % totalImages)
    },
    [totalImages]
  )

  const handleSelectDot = useCallback((e: React.MouseEvent, idx: number) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveIndex(idx)
  }, [])

  const handleImageError = useCallback((src: string) => {
    setFailedSrcs((prev) => (prev[src] ? prev : { ...prev, [src]: true }))
  }, [])

  // Localized labels
  const name =
    locale === 'ar'
      ? product.nameAr
      : locale === 'fr'
        ? product.nameFr
        : product.nameEn

  const categoryName =
    locale === 'ar'
      ? product.category?.nameAr
      : locale === 'fr'
        ? product.category?.nameFr
        : product.category?.nameEn

  const newLabel =
    locale === 'ar' ? 'جديد' : locale === 'fr' ? 'Nouveau' : 'New'

  const soldOutLabel =
    locale === 'ar' ? 'نفذ' : locale === 'fr' ? 'Épuisé' : 'Sold out'

  const discount =
    product.salePrice && product.basePrice > 0
      ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
      : 0

  const saleLabel = locale === 'ar' ? `خصم ${discount}%` : `-${discount}%`
  const hasAnyVariantData =
    (product.availableSizes && product.availableSizes.length > 0) ||
    (product.availableColors && product.availableColors.length > 0)
  const isOutOfStock = !hasAnyVariantData
  const cardAspectRatio = product.category?.config?.cardAspectRatio === '1:1' ? '1 / 1' : '3 / 4'
  const productUrl = `/${locale}/products/${product.slug}`

  // Priority-ordered single top badge so images remain calm & uncluttered
  const singleBadge = isOutOfStock
    ? { label: soldOutLabel, variant: 'soldout' as const }
    : discount > 0
      ? { label: saleLabel, variant: 'accent' as const }
      : isNew
        ? { label: newLabel, variant: 'gold' as const }
        : null

  return (
    <article
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocused(false)
        }
      }}
      className={cn('product-card group', className)}
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-label={name}
    >
      {/* ── Image Canvas (Category-driven 3:4 or 1:1 frame) ───────────────────────── */}
      <div
        className="product-card-img-wrap"
        style={{ aspectRatio: cardAspectRatio }}
        onTouchStart={(e) => {
          if (!hasMultipleImages) return
          touchStartXRef.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (!hasMultipleImages || touchStartXRef.current === null) return
          const dx = e.changedTouches[0].clientX - touchStartXRef.current
          touchStartXRef.current = null
          if (Math.abs(dx) < 28) return
          if (dx < 0) {
            setActiveIndex((prev) => (prev + 1) % totalImages)
          } else {
            setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages)
          }
        }}
      >
        <Link
          href={productUrl}
          aria-label={name}
          className="block w-full h-full relative overflow-hidden"
        >
          {allImages.map((imgSrc, idx) => {
            const isActive = idx === safeIndex
            const resolvedSrc = failedSrcs[imgSrc] ? FALLBACK_IMAGE : imgSrc
            return (
              <div
                key={`${product.id}-img-${idx}`}
                aria-hidden={!isActive}
                className={cn(
                  'absolute inset-0 transition-opacity duration-500 ease-out',
                  isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
                )}
              >
                <Image
                  src={resolvedSrc}
                  alt={idx === 0 ? name : `${name} (${idx + 1})`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={90}
                  className="product-card-img object-cover"
                  onError={() => handleImageError(imgSrc)}
                  loading="lazy"
                  draggable={false}
                />
              </div>
            )
          })}
        </Link>

        {/* Single Restraint Top-Start Badge */}
        {singleBadge && (
          <div className="product-card-badge pointer-events-none z-10">
            <span
              className={cn(
                'badge !rounded-md text-[0.625rem] sm:text-[0.6875rem] font-bold tracking-wide shadow-xs',
                singleBadge.variant === 'accent' && 'badge-accent',
                singleBadge.variant === 'gold' && 'badge-gold'
              )}
              style={
                singleBadge.variant === 'soldout'
                  ? { background: 'rgba(26, 20, 16, 0.82)', color: '#FAF6F0' }
                  : undefined
              }
            >
              {singleBadge.label}
            </span>
          </div>
        )}

        {/* Desktop Subtle Hover Arrows for Multi-Image Cards */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label={locale === 'ar' ? 'الصورة السابقة' : locale === 'fr' ? 'Image précédente' : 'Previous image'}
              className="hidden sm:flex items-center justify-center absolute start-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[var(--card-bg)]/90 text-[var(--text-primary)] border border-[var(--border)] shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
            >
              <ChevronLeft className={cn('w-3.5 h-3.5', isRTL && 'rotate-180')} />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label={locale === 'ar' ? 'الصورة التالية' : locale === 'fr' ? 'Image suivante' : 'Next image'}
              className="hidden sm:flex items-center justify-center absolute end-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[var(--card-bg)]/90 text-[var(--text-primary)] border border-[var(--border)] shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
            >
              <ChevronRight className={cn('w-3.5 h-3.5', isRTL && 'rotate-180')} />
            </button>

            {/* Sleek Bottom Autoscroll Indicator */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-black/35 backdrop-blur-xs">
              {allImages.map((_, idx) => {
                const active = idx === safeIndex
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => handleSelectDot(e, idx)}
                    aria-label={`${idx + 1} / ${totalImages}`}
                    className={cn(
                      'h-1 rounded-full transition-all duration-300 cursor-pointer',
                      active ? 'w-3.5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                    )}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Product Info ──────────────────────────────────────────── */}
      <Link
        href={productUrl}
        className="product-card-info px-3.5 sm:px-4 py-3.5 sm:py-4 flex-1 flex flex-col justify-between gap-2.5 no-underline"
      >
        <div className="space-y-1">
          {categoryName && (
            <p
              className="text-[0.625rem] sm:text-[0.6875rem] font-semibold uppercase tracking-wider truncate"
              style={{ color: 'var(--gold)' }}
            >
              {categoryName}
            </p>
          )}

          <h3
            className="font-semibold text-[0.8125rem] sm:text-sm leading-snug line-clamp-2 min-h-[2.35rem] transition-colors group-hover:text-[var(--accent)]"
            style={{ color: 'var(--text-primary)' }}
          >
            {name}
          </h3>

          {product.availableColors && product.availableColors.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5 pt-1 min-h-[1.125rem]">
              {product.availableColors.slice(0, 4).map((c) => (
                <span
                  key={c.code}
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border flex-shrink-0"
                  style={{
                    background: c.code,
                    borderColor: 'var(--border)',
                  }}
                  title={
                    locale === 'ar'
                      ? c.nameAr
                      : locale === 'fr'
                        ? c.nameFr
                        : c.nameEn
                  }
                />
              ))}

              {product.availableColors.length > 4 && (
                <span
                  className="text-[0.625rem] font-medium tabular-nums"
                  style={{ color: 'var(--text-muted)' }}
                >
                  +{product.availableColors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Clean Price + Subtle View Arrow */}
        <div
          className="flex items-center justify-between gap-2 pt-2.5 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-baseline gap-1.5 min-w-0 tabular-nums">
            {product.salePrice ? (
              <>
                <span
                  className="text-sm sm:text-base font-bold whitespace-nowrap"
                  style={{ color: 'var(--accent)' }}
                >
                  {formatPrice(product.salePrice, locale)}
                </span>
                <span
                  className="text-[0.6875rem] sm:text-xs whitespace-nowrap line-through"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatPrice(product.basePrice, locale)}
                </span>
              </>
            ) : (
              <span
                className="text-sm sm:text-base font-bold whitespace-nowrap"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatPrice(product.basePrice, locale)}
              </span>
            )}
          </div>

          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-200 text-[var(--text-muted)] group-hover:bg-[var(--accent-light)] group-hover:text-[var(--accent)] flex-shrink-0"
            aria-hidden="true"
          >
            <ArrowUpRight className={cn('w-3.5 h-3.5', isRTL && '-scale-x-100')} />
          </span>
        </div>
      </Link>
    </article>
  )
}

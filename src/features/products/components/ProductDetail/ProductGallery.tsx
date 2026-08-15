'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  mainImage: string
  productName: string
  activeImage: string
  onSelectImage: (image: string) => void
  locale: string
}

export function ProductGallery({
  images,
  mainImage,
  productName,
  activeImage,
  onSelectImage,
  locale,
}: ProductGalleryProps) {
  const isRTL = locale === 'ar'

  // ─── Image list ────────────────────────────────────────────────────────
  // Only use real product images. Fallback to mainImage if images array is empty.
  const imageList = React.useMemo(() => {
    if (images && images.length > 0) return images
    if (mainImage) return [mainImage]
    return []
  }, [images, mainImage])

  const hasMultiple = imageList.length > 1

  // ─── Current index derived from activeImage prop ────────────────────────
  const currentIndex = React.useMemo(() => {
    const idx = imageList.indexOf(activeImage)
    return idx >= 0 ? idx : 0
  }, [imageList, activeImage])

  // ─── Transition control ─────────────────────────────────────────────────
  // Only enable CSS transition when user triggers navigation; external changes (color select) snap instantly.
  const [animating, setAnimating] = useState(false)

  // ─── Live drag offset (px) ─────────────────────────────────────────────
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // ─── Refs ───────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const activeThumbRef = useRef<HTMLButtonElement>(null)

  // Touch
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchIsHorizontal = useRef(false)

  // Mouse drag
  const mouseStartX = useRef<number | null>(null)
  const isMouseDown = useRef(false)

  // ─── Scroll active thumbnail into view ─────────────────────────────────
  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [currentIndex])

  // ─── Navigation ────────────────────────────────────────────────────────
  const goToIndex = useCallback(
    (newIndex: number) => {
      if (newIndex === currentIndex || !hasMultiple) return
      setAnimating(true)
      setDragOffset(0)
      onSelectImage(imageList[newIndex])
      // Reset animating flag after transition completes
      setTimeout(() => setAnimating(false), 320)
    },
    [currentIndex, hasMultiple, imageList, onSelectImage]
  )

  const handlePrevious = useCallback(() => {
    if (!hasMultiple) return
    const prev = currentIndex === 0 ? imageList.length - 1 : currentIndex - 1
    goToIndex(prev)
  }, [currentIndex, imageList.length, hasMultiple, goToIndex])

  const handleNext = useCallback(() => {
    if (!hasMultiple) return
    const next = currentIndex === imageList.length - 1 ? 0 : currentIndex + 1
    goToIndex(next)
  }, [currentIndex, imageList.length, hasMultiple, goToIndex])

  // ─── Keyboard ────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasMultiple) return
    if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrevious() }
    else if (e.key === 'ArrowRight') { e.preventDefault(); handleNext() }
  }

  // ─── Touch handlers ─────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultiple) return
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchIsHorizontal.current = false
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!hasMultiple || touchStartX.current === null || touchStartY.current === null) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    if (!touchIsHorizontal.current && Math.abs(dy) > Math.abs(dx)) {
      // Vertical scroll — release control
      setIsDragging(false)
      setDragOffset(0)
      touchStartX.current = null
      return
    }

    touchIsHorizontal.current = true
    e.preventDefault()
    setDragOffset(dx)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultiple || touchStartX.current === null) {
      setIsDragging(false)
      setDragOffset(0)
      return
    }

    const dx = e.changedTouches[0].clientX - touchStartX.current
    const containerWidth = containerRef.current?.offsetWidth ?? 300
    const threshold = containerWidth * 0.18 // 18% of container width

    setIsDragging(false)
    touchStartX.current = null
    touchStartY.current = null

    if (Math.abs(dx) >= threshold) {
      // Physical left swipe → next; physical right swipe → previous (same for RTL/LTR — physically intuitive)
      if (dx < 0) handleNext()
      else handlePrevious()
    } else {
      // Not enough — snap back
      setAnimating(true)
      setDragOffset(0)
      setTimeout(() => setAnimating(false), 200)
    }
  }

  // ─── Mouse drag handlers ─────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!hasMultiple) return
    isMouseDown.current = true
    mouseStartX.current = e.clientX
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hasMultiple || !isMouseDown.current || mouseStartX.current === null) return
    setDragOffset(e.clientX - mouseStartX.current)
  }

  const finishMouseDrag = (clientX: number) => {
    if (!isMouseDown.current || mouseStartX.current === null) {
      isMouseDown.current = false
      setIsDragging(false)
      setDragOffset(0)
      return
    }
    const dx = clientX - mouseStartX.current
    const containerWidth = containerRef.current?.offsetWidth ?? 300
    const threshold = containerWidth * 0.15

    isMouseDown.current = false
    mouseStartX.current = null
    setIsDragging(false)

    if (Math.abs(dx) >= threshold) {
      if (dx < 0) handleNext()
      else handlePrevious()
    } else {
      setAnimating(true)
      setDragOffset(0)
      setTimeout(() => setAnimating(false), 200)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => finishMouseDrag(e.clientX)
  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isMouseDown.current) finishMouseDrag(e.clientX)
  }

  // ─── Slide track transform ───────────────────────────────────────────────
  // Track is n * 100% wide; each slide is (100/n)% of track = 100% of container.
  // To show slide i: translateX(-i * (100/n)%) + dragOffset in px.
  // Drag offset direction: positive = moving right = showing previous.
  const n = imageList.length
  const slideWidthPercent = n > 0 ? 100 / n : 100
  const baseTranslate = -currentIndex * slideWidthPercent
  const trackTransform =
    n > 1
      ? `translateX(calc(${baseTranslate}% + ${dragOffset}px))`
      : 'translateX(0)'

  const trackTransition =
    isDragging
      ? 'none'
      : animating
      ? 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none'

  // ─── Accessibility labels ───────────────────────────────────────────────
  const prevLabel =
    locale === 'ar' ? 'الصورة السابقة' : locale === 'fr' ? 'Image précédente' : 'Previous image'
  const nextLabel =
    locale === 'ar' ? 'الصورة التالية' : locale === 'fr' ? 'Image suivante' : 'Next image'

  if (imageList.length === 0) return null

  return (
    <div
      className="product-gallery-panel space-y-3 sm:space-y-3.5 lg:sticky lg:top-24 lg:self-start select-none"
      tabIndex={hasMultiple ? 0 : -1}
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription={hasMultiple ? 'carousel' : undefined}
      aria-label={productName}
    >
      {/* ── Main viewer ──────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="product-main-image relative aspect-[4/5] w-full overflow-hidden rounded-2xl"
        style={{
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          cursor: hasMultiple ? (isDragging ? 'grabbing' : 'grab') : 'default',
          touchAction: hasMultiple ? 'pan-y' : 'auto',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {hasMultiple ? (
          /* Slide track — all images inline */
          <div
            className="absolute inset-0 flex h-full"
            style={{
              width: `${n * 100}%`,
              transform: trackTransform,
              transition: trackTransition,
              willChange: 'transform',
            }}
          >
            {imageList.map((img, idx) => (
              <div
                key={`slide-${idx}`}
                className="relative h-full flex-shrink-0"
                style={{ width: `${slideWidthPercent}%` }}
              >
                <Image
                  src={img}
                  alt={`${productName} ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority={idx === 0}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Single image — plain, no slider chrome */
          <div className="relative h-full w-full">
            <Image
              src={imageList[0]}
              alt={productName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
              draggable={false}
            />
          </div>
        )}

        {/* Nav arrows + counter — only when multiple images */}
        {hasMultiple && (
          <>
            {/* ← Previous */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handlePrevious() }}
              aria-label={prevLabel}
              className="
                absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 z-10
                flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center
                rounded-full
                border border-white/30 dark:border-white/20
                bg-white/90 dark:bg-black/75
                text-[#3a1a00] dark:text-white
                shadow-[0_2px_8px_rgba(0,0,0,0.35)]
                backdrop-blur-sm
                transition-all duration-200
                hover:bg-white dark:hover:bg-black/90
                hover:border-[#C4622D]/60
                hover:text-[#C4622D] dark:hover:text-[#D4AE78]
                hover:scale-110
                active:scale-90
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4622D]
              "
            >
              <ChevronLeft className="h-4 w-4 sm:h-[17px] sm:w-[17px]" strokeWidth={2.5} />
            </button>

            {/* → Next */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleNext() }}
              aria-label={nextLabel}
              className="
                absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-10
                flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center
                rounded-full
                border border-white/30 dark:border-white/20
                bg-white/90 dark:bg-black/75
                text-[#3a1a00] dark:text-white
                shadow-[0_2px_8px_rgba(0,0,0,0.35)]
                backdrop-blur-sm
                transition-all duration-200
                hover:bg-white dark:hover:bg-black/90
                hover:border-[#C4622D]/60
                hover:text-[#C4622D] dark:hover:text-[#D4AE78]
                hover:scale-110
                active:scale-90
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4622D]
              "
            >
              <ChevronRight className="h-4 w-4 sm:h-[17px] sm:w-[17px]" strokeWidth={2.5} />
            </button>

            {/* Counter badge */}
            <div
              className="
                absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10
                rounded-full px-1.5 py-[3px]
                text-[10px] font-semibold leading-none tabular-nums tracking-wide
                bg-black/65 dark:bg-black/80
                text-white
                border border-white/20
                shadow-[0_1px_6px_rgba(0,0,0,0.4)]
              "
              style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            >
              {currentIndex + 1}&thinsp;/&thinsp;{imageList.length}
            </div>
          </>
        )}
      </div>

      {/* ── Thumbnails — only when multiple images ─────────────────────── */}
      {hasMultiple && (
        <div
          ref={thumbnailsRef}
          className="w-full flex justify-center overflow-x-auto pb-1 pt-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          <div className="inline-flex gap-2 sm:gap-2.5 flex-nowrap">
            {imageList.map((img, idx) => {
              const isSelected = idx === currentIndex
              return (
                <button
                  key={`thumb-${idx}`}
                  ref={isSelected ? activeThumbRef : null}
                  type="button"
                  onClick={() => goToIndex(idx)}
                  aria-label={`${productName} ${idx + 1}`}
                  aria-current={isSelected ? 'true' : undefined}
                  className="relative flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4622D]"
                  style={{
                    width: '52px',
                    height: '52px',
                    border: isSelected ? '2px solid #C4622D' : '1.5px solid var(--border)',
                    opacity: isSelected ? 1 : 0.6,
                    boxShadow: isSelected ? '0 0 0 3px rgba(196,98,45,0.18)' : 'none',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <Image
                    src={img}
                    alt={`${productName} ${idx + 1}`}
                    fill
                    sizes="52px"
                    className="object-cover"
                    draggable={false}
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

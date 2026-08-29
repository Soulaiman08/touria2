'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileFullscreenGalleryProps {
  images: string[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  productName: string
  locale: string
}

export function MobileFullscreenGallery({
  images,
  initialIndex,
  isOpen,
  onClose,
  productName,
  locale,
}: MobileFullscreenGalleryProps) {
  const isRTL = locale === 'ar'
  const n = images.length
  const hasMultiple = n > 1

  // Cloned track for seamless infinite circular loop: [last, ...items, first]
  const trackImages = useMemo(() => {
    if (!hasMultiple) return images
    return [images[n - 1], ...images, images[0]]
  }, [images, hasMultiple, n])

  const totalSlides = trackImages.length

  const [trackIndex, setTrackIndex] = useState(
    initialIndex >= 0 && initialIndex < n ? initialIndex + 1 : 1
  )
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [animating, setAnimating] = useState(false)

  // Touch tracking
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchIsHorizontal = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync initialIndex when gallery opens
  useEffect(() => {
    if (isOpen) {
      const validIndex = initialIndex >= 0 && initialIndex < n ? initialIndex : 0
      setTrackIndex(validIndex + 1)
      setDragOffset(0)
      setAnimating(false)
    }
  }, [isOpen, initialIndex, n])

  // Prevent background body scrolling while gallery is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Display index (0 .. n - 1)
  const displayIndex = useMemo(() => {
    if (!hasMultiple) return 0
    return (trackIndex - 1 + n) % n
  }, [trackIndex, n, hasMultiple])

  // ─── Navigation with Infinite Loop ─────────────────────────────────────
  const handleNext = useCallback(() => {
    if (!hasMultiple || animating) return
    setAnimating(true)
    setDragOffset(0)

    const nextTrackIndex = trackIndex + 1
    setTrackIndex(nextTrackIndex)

    setTimeout(() => {
      if (nextTrackIndex >= n + 1) {
        setAnimating(false)
        setTrackIndex(1)
      } else {
        setAnimating(false)
      }
    }, 280)
  }, [hasMultiple, animating, trackIndex, n])

  const handlePrev = useCallback(() => {
    if (!hasMultiple || animating) return
    setAnimating(true)
    setDragOffset(0)

    const prevTrackIndex = trackIndex - 1
    setTrackIndex(prevTrackIndex)

    setTimeout(() => {
      if (prevTrackIndex <= 0) {
        setAnimating(false)
        setTrackIndex(n)
      } else {
        setAnimating(false)
      }
    }, 280)
  }, [hasMultiple, animating, trackIndex, n])

  const goToThumbnail = useCallback(
    (idx: number) => {
      if (!hasMultiple || idx === displayIndex || animating) return
      setAnimating(true)
      setDragOffset(0)
      setTrackIndex(idx + 1)
      setTimeout(() => setAnimating(false), 280)
    },
    [hasMultiple, displayIndex, animating]
  )

  // Keyboard navigation & escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        if (isRTL) handlePrev()
        else handleNext()
      } else if (e.key === 'ArrowLeft') {
        if (isRTL) handleNext()
        else handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isRTL, handleNext, handlePrev, onClose])

  // ─── Touch handlers for mobile swipe ─────────────────────────────────────
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
    const containerWidth = containerRef.current?.offsetWidth ?? 320
    const threshold = containerWidth * 0.15

    setIsDragging(false)
    touchStartX.current = null
    touchStartY.current = null

    if (Math.abs(dx) >= threshold) {
      if (dx < 0) {
        handleNext()
      } else {
        handlePrev()
      }
    } else {
      setAnimating(true)
      setDragOffset(0)
      setTimeout(() => setAnimating(false), 200)
    }
  }

  if (!isOpen || images.length === 0) return null

  const slideWidthPercent = totalSlides > 0 ? 100 / totalSlides : 100
  const baseTranslate = -trackIndex * slideWidthPercent
  const trackTransform =
    hasMultiple
      ? `translateX(calc(${baseTranslate}% + ${dragOffset}px))`
      : 'translateX(0)'

  const trackTransition =
    isDragging
      ? 'none'
      : animating
      ? 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none'

  const prevAriaLabel =
    locale === 'ar' ? 'الصورة السابقة' : locale === 'fr' ? 'Image précédente' : 'Previous image'
  const nextAriaLabel =
    locale === 'ar' ? 'الصورة التالية' : locale === 'fr' ? 'Image suivante' : 'Next image'
  const closeAriaLabel =
    locale === 'ar' ? 'إغلاق المعرض' : locale === 'fr' ? 'Fermer la galerie' : 'Close gallery'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} - Fullscreen Gallery`}
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md select-none touch-none animate-in fade-in duration-200"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Floating Counter Badge (Clean spacing away from edges) ────── */}
      <div className="absolute top-8 start-6 z-40 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 border border-[#D4AE78]/60 shadow-xl backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AE78]" />
        <span className="text-xs font-bold text-[#D4AE78] tracking-widest font-serif tabular-nums">
          {displayIndex + 1} / {n}
        </span>
      </div>

      {/* ── Floating Close Button (Clean spacing away from edges) ────── */}
      <button
        type="button"
        onClick={onClose}
        aria-label={closeAriaLabel}
        className="absolute top-8 end-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 hover:bg-[#C4622D] text-[#FFFDF9] hover:text-white border border-[#D4AE78]/60 shadow-xl backdrop-blur-md transition-all active:scale-90 cursor-pointer"
      >
        <X className="h-5 w-5" strokeWidth={2.2} />
      </button>

      {/* ── Main Fullscreen Viewer Area ─────────────────────────────── */}
      <div
        ref={containerRef}
        dir="ltr"
        className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {hasMultiple ? (
          <div
            dir="ltr"
            className="absolute inset-0 flex h-full items-center"
            style={{
              width: `${totalSlides * 100}%`,
              transform: trackTransform,
              transition: trackTransition,
              willChange: 'transform',
            }}
          >
            {trackImages.map((src, idx) => (
              <div
                key={`fs-track-${idx}`}
                className="relative h-full flex-shrink-0 flex items-center justify-center p-4 sm:p-6"
                style={{ width: `${slideWidthPercent}%` }}
              >
                <div className="relative w-full h-full max-h-[72vh] flex items-center justify-center">
                  <Image
                    src={src}
                    alt={`${productName} ${idx + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                    priority={idx === 1}
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative w-full h-full max-h-[72vh] p-4 sm:p-6 flex items-center justify-center">
            <Image
              src={images[0]}
              alt={productName}
              fill
              sizes="100vw"
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
              priority
              draggable={false}
            />
          </div>
        )}

        {/* ── Previous Button ────────────────────────────────────────── */}
        {hasMultiple && (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (isRTL) handleNext()
              else handlePrev()
            }}
            aria-label={prevAriaLabel}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 z-30',
              'flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full',
              'bg-[#1A1410]/80 text-[#D4AE78] border border-[#D4AE78]/50 shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-lg',
              'transition-all duration-200 active:scale-90 hover:bg-[#C4622D] hover:text-white hover:border-[#D4AE78]',
              'start-3 sm:start-5'
            )}
          >
            {isRTL ? (
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
            ) : (
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
            )}
          </button>
        )}

        {/* ── Next Button ────────────────────────────────────────────── */}
        {hasMultiple && (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (isRTL) handlePrev()
              else handleNext()
            }}
            aria-label={nextAriaLabel}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 z-30',
              'flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full',
              'bg-[#1A1410]/80 text-[#D4AE78] border border-[#D4AE78]/50 shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-lg',
              'transition-all duration-200 active:scale-90 hover:bg-[#C4622D] hover:text-white hover:border-[#D4AE78]',
              'end-3 sm:end-5'
            )}
          >
            {isRTL ? (
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
            ) : (
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
            )}
          </button>
        )}
      </div>

      {/* ── Floating Miniature Thumbnails (No dark bar, No scrollbars) ─── */}
      {hasMultiple && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-2.5 max-w-[92vw] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-1.5">
          {images.map((img, idx) => {
            const isSelected = idx === displayIndex
            return (
              <button
                key={`fs-thumb-${idx}`}
                type="button"
                onClick={() => goToThumbnail(idx)}
                aria-label={`${productName} ${idx + 1}`}
                className={cn(
                  'relative h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 focus:outline-none shadow-lg',
                  isSelected
                    ? 'border-2 border-[#D4AE78] shadow-[0_0_15px_rgba(212,174,120,0.7)] scale-110 opacity-100 ring-2 ring-[#C4622D]'
                    : 'border border-white/30 bg-black/40 opacity-55 hover:opacity-90'
                )}
              >
                <Image
                  src={img}
                  alt={`${productName} ${idx + 1}`}
                  fill
                  sizes="48px"
                  className="object-cover"
                  draggable={false}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

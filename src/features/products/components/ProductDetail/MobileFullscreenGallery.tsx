'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileFullscreenGalleryProps {
  images: string[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  productName: string
  locale: string
}

// Lightweight fullscreen image viewer.
//
// Performance notes (target: low-end Android):
//  - Only a 3-image window (previous / current / next) is mounted instead of
//    the full image set, so memory stays tiny regardless of how many product
//    photos there are.
//  - No backdrop-filter / drop-shadow heavy filters (they are the main GPU
//    cost on weak devices). A solid background + a short transform transition
//    is used instead.
//  - During a swipe only the track position state changes and only 3 <img>
//    elements are re-painted — no per-frame full-list re-render.
//  - Navigation logic is direction-agnostic: previous always goes back, next
//    always advances. Only the arrow placement/icon is mirrored for RTL.

const SLIDE_MS = 180

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

  // Real 0..n-1 index of the current image.
  const [index, setIndex] = useState(() =>
    initialIndex >= 0 && initialIndex < n ? initialIndex : 0,
  )
  // Track translate in px (-slideW centers the current slide).
  const [pos, setPos] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchIsHorizontal = useRef(false)

  const slideW = () => containerRef.current?.offsetWidth ?? 320

  // Center the current slide whenever the gallery opens.
  useEffect(() => {
    if (isOpen) {
      const valid = initialIndex >= 0 && initialIndex < n ? initialIndex : 0
      setIndex(valid)
      setIsDragging(false)
      setAnimating(false)
      setPos(-slideW())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Keep the track centered if the viewport resizes while open.
  useEffect(() => {
    if (!isOpen) return
    const onResize = () => {
      if (!animating && !isDragging) setPos(-slideW())
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [isOpen, animating, isDragging])

  // Prevent background body scrolling while the gallery is open.
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  const move = useCallback(
    (dir: number) => {
      if (!hasMultiple || animating) return
      const w = slideW()
      setAnimating(true)
      setPos(dir > 0 ? -2 * w : 0)
      window.setTimeout(() => {
        setIndex((i) => (i + dir + n) % n)
        setPos(-slideW())
        setAnimating(false)
      }, SLIDE_MS)
    },
    [hasMultiple, animating, n],
  )

  const next = useCallback(() => move(1), [move])
  const prev = useCallback(() => move(-1), [move])

  const goToThumbnail = useCallback(
    (idx: number) => {
      if (!hasMultiple || idx === index) return
      setAnimating(false)
      setIndex(idx)
      setPos(-slideW())
    },
    [hasMultiple, index],
  )

  // Keyboard navigation & escape. Logical keys are direction-agnostic.
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, prev, next, onClose])

  // ─── Touch swipe (native non-passive listeners) ────────────────────────
  // React's synthetic onTouchMove is attached as a passive listener, so
  // e.preventDefault() would be ignored and the browser could hijack the
  // gesture. Using native listeners with passive:false guarantees the drag
  // follows the finger smoothly and reliably on all devices.
  // Direction-agnostic: swipe right→left = next, left→right = previous,
  // identical in AR/FR/EN. Only the track position (pos) changes during a
  // swipe, so only the 3 mounted slides re-paint — no full-list re-render.
  useEffect(() => {
    const viewer = containerRef.current
    if (!viewer || !isOpen || !hasMultiple) return

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchIsHorizontal.current = false
      setAnimating(false)
      setIsDragging(true)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return
      const dx = e.touches[0].clientX - touchStartX.current
      const dy = e.touches[0].clientY - touchStartY.current

      // Vertical swipe -> not handled (lets it be ignored / close handled elsewhere).
      if (!touchIsHorizontal.current && Math.abs(dy) > Math.abs(dx)) {
        touchStartX.current = null
        touchStartY.current = null
        setIsDragging(false)
        setPos(-slideW())
        return
      }

      touchIsHorizontal.current = true
      e.preventDefault() // requires passive:false to have any effect
      setPos(-slideW() + dx)
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) {
        touchStartX.current = null
        touchStartY.current = null
        setIsDragging(false)
        setPos(-slideW())
        return
      }

      const dx = e.changedTouches[0].clientX - touchStartX.current
      const w = slideW()

      touchStartX.current = null
      touchStartY.current = null
      setIsDragging(false)

      if (Math.abs(dx) >= w * 0.15) {
        // right→left (dx<0) = next, left→right (dx>0) = previous
        move(dx < 0 ? 1 : -1)
      } else {
        // Spring back to the current slide.
        setAnimating(true)
        setPos(-w)
        window.setTimeout(() => setAnimating(false), SLIDE_MS)
      }
    }

    viewer.addEventListener('touchstart', onTouchStart, { passive: true })
    viewer.addEventListener('touchmove', onTouchMove, { passive: false })
    viewer.addEventListener('touchend', onTouchEnd, { passive: true })
    viewer.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      viewer.removeEventListener('touchstart', onTouchStart)
      viewer.removeEventListener('touchmove', onTouchMove)
      viewer.removeEventListener('touchend', onTouchEnd)
      viewer.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [isOpen, hasMultiple, move])

  if (!isOpen || images.length === 0) return null

  const displayIndex = index
  const prevIndex = (index - 1 + n) % n
  const nextIndex = (index + 1) % n
  const windowSlides = [
    { src: images[prevIndex], rel: -1, visible: false },
    { src: images[index], rel: 0, visible: true },
    { src: images[nextIndex], rel: 1, visible: false },
  ]

  const trackTransform = `translateX(${pos}px)`
  const trackTransition =
    animating ? `transform ${SLIDE_MS}ms cubic-bezier(0.33, 1, 0.68, 1)` : 'none'

  const swipeHintText =
    locale === 'ar'
      ? '← اسحب يمينًا أو يسارًا لتصفح الصور →'
      : locale === 'fr'
        ? 'Faites glisser pour parcourir les images'
        : 'Swipe to browse images'
  const closeAriaLabel =
    locale === 'ar' ? 'إغلاق المعرض' : locale === 'fr' ? 'Fermer la galerie' : 'Close gallery'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={productName}
      className="fixed inset-0 z-[9999] bg-black select-none flex flex-col"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ animation: 'fadeIn 0.15s ease-out' }}
    >
      {/* ── Header: Counter + Close ────────────────────────────────── */}
      <div className="relative z-40 flex-shrink-0 h-16">
        <div className="absolute top-8 start-6 inline-flex items-center px-3.5 py-1.5 rounded-full border border-white/40">
          <span className="text-sm text-white/90 tabular-nums">
            {displayIndex + 1} / {n}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeAriaLabel}
          className="absolute top-8 end-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 hover:bg-white/10 text-white/90 transition-all active:scale-90 cursor-pointer"
        >
          <X className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </div>

      {/* ── Main Viewer (3-slide window) ──────────────────────────── */}
      <div
        ref={containerRef}
        dir="ltr"
        className="relative flex-1 min-h-0 overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        <div
          dir="ltr"
          className="absolute inset-0 flex h-full items-center will-change-transform"
          style={{ width: '300%', transform: trackTransform, transition: trackTransition }}
        >
          {windowSlides.map((slide) => (
            <div
              key={`${slide.rel}-${slide.src}`}
              className="relative h-full flex-shrink-0 flex items-center justify-center p-4 sm:p-6"
              style={{ width: `${100 / 3}%` }}
              aria-hidden={slide.visible ? undefined : true}
            >
              <div className="relative w-full h-full max-h-full flex items-center justify-center">
                <Image
                  src={slide.src}
                  alt={productName}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  preload={slide.visible}
                  loading="eager"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Swipe Hint ────────────────────────────────────────────── */}
      {hasMultiple && (
        <div
          dir="auto"
          className="flex-shrink-0 text-center py-2.5 text-[#D4AE78]/80 text-[11px] sm:text-xs pointer-events-none select-none"
        >
          {swipeHintText}
        </div>
      )}

      {/* ── Thumbnails ────────────────────────────────────────────── */}
      {hasMultiple && (
        <div className="flex-shrink-0 flex items-center justify-center gap-2.5 py-3 px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, idx) => {
            const isSelected = idx === displayIndex
            return (
              <button
                key={`fs-thumb-${idx}`}
                type="button"
                onClick={() => goToThumbnail(idx)}
                aria-label={`${productName} ${idx + 1}`}
                aria-current={isSelected ? 'true' : undefined}
                className={cn(
                  'relative overflow-hidden flex-shrink-0 transition-all duration-200 focus:outline-none',
                  isSelected
                    ? 'h-14 w-14 rounded-2xl border-2 border-[#D4AE78] shadow-[0_0_8px_rgba(212,174,120,0.4)] opacity-100'
                    : 'h-11 w-11 rounded-xl border border-white/20 opacity-50 hover:opacity-80',
                )}
              >
                <Image
                  src={img}
                  alt={`${productName} ${idx + 1}`}
                  fill
                  sizes="56px"
                  className="object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </button>
            )
          })}
        </div>
      )}

      {/* ── Bottom Safe Area ──────────────────────────────────────── */}
      <div className="flex-shrink-0" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }} />
    </div>
  )
}

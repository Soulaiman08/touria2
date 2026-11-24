'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileFullscreenGalleryProps {
  images: string[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  productName: string
  locale: string
}

const SLIDE_MS = 200
const ZOOM_SCALE = 2.2

export function MobileFullscreenGallery({
  images,
  initialIndex,
  isOpen,
  onClose,
  productName,
  locale,
}: MobileFullscreenGalleryProps) {
  if (!isOpen || images.length === 0 || typeof document === 'undefined') {
    return null
  }

  return (
    <FullscreenGalleryDialog
      key={`lightbox-${initialIndex}-${images.length}`}
      images={images}
      initialIndex={initialIndex}
      onClose={onClose}
      productName={productName}
      locale={locale}
    />
  )
}

function FullscreenGalleryDialog({
  images,
  initialIndex,
  onClose,
  productName,
  locale,
}: Omit<MobileFullscreenGalleryProps, 'isOpen'>) {
  const isRTL = locale === 'ar'
  const n = images.length
  const hasMultiple = n > 1

  const validInitial = initialIndex >= 0 && initialIndex < n ? initialIndex : 0
  const [index, setIndex] = useState(validInitial)
  const [slideStep, setSlideStep] = useState(0)
  const [dragPx, setDragPx] = useState(0)
  const [animating, setAnimating] = useState(false)

  // Interactive Zoom & Pan state
  const [zoom, setZoom] = useState<1 | 2.2>(1)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)

  // Track loaded natural aspect ratios by src so pan bounds fit exact rendered image geometry
  const aspectRatiosRef = useRef<Record<string, number>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const slideTimerRef = useRef<number | null>(null)

  // Swipe tracking refs (when zoom === 1)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchIsHorizontal = useRef(false)
  const lastTapRef = useRef<number>(0)

  // Pan tracking refs (when zoom > 1)
  const panStartRef = useRef<{ clientX: number; clientY: number; panX: number; panY: number } | null>(null)

  const getViewerRect = () => {
    const rect = containerRef.current?.getBoundingClientRect()
    return { width: rect?.width ?? 360, height: rect?.height ?? 480 }
  }

  // Computes true rendered dimensions of the active `object-contain` image inside the slide box,
  // preventing the zoomed image from panning out into empty horizontal space on wide screens.
  const clampPan = useCallback(
    (x: number, y: number, currentZoom: number, activeSrc: string) => {
      if (currentZoom <= 1) return { x: 0, y: 0 }
      const { width, height } = getViewerRect()
      const pad = width >= 640 ? 64 : 32
      const boxW = Math.max(120, width - pad)
      const boxH = Math.max(160, height - pad)
      const ratio = aspectRatiosRef.current[activeSrc] || 0.8

      let renderedW: number
      let renderedH: number
      if (boxW / boxH > ratio) {
        renderedH = boxH
        renderedW = boxH * ratio
      } else {
        renderedW = boxW
        renderedH = boxW / ratio
      }

      const maxX = Math.max(0, (renderedW * currentZoom - width) / 2)
      const maxY = Math.max(0, (renderedH * currentZoom - height) / 2)

      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      }
    },
    [],
  )

  const resetZoom = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setIsPanning(false)
  }, [])

  const toggleZoom = useCallback(
    (clientX?: number, clientY?: number) => {
      if (zoom > 1) {
        resetZoom()
        return
      }
      const activeSrc = images[index] || ''
      if (clientX !== undefined && clientY !== undefined && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const offsetX = clientX - (rect.left + rect.width / 2)
        const offsetY = clientY - (rect.top + rect.height / 2)
        const targetPan = clampPan(
          -offsetX * (ZOOM_SCALE - 1),
          -offsetY * (ZOOM_SCALE - 1),
          ZOOM_SCALE,
          activeSrc,
        )
        setZoom(ZOOM_SCALE)
        setPan(targetPan)
      } else {
        setZoom(ZOOM_SCALE)
        setPan({ x: 0, y: 0 })
      }
    },
    [zoom, resetZoom, clampPan, images, index],
  )

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
      if (slideTimerRef.current !== null) window.clearTimeout(slideTimerRef.current)
    }
  }, [])

  const move = useCallback(
    (dir: number) => {
      if (!hasMultiple || animating) return
      resetZoom()
      setDragPx(0)
      setAnimating(true)
      setSlideStep(dir)
      if (slideTimerRef.current !== null) window.clearTimeout(slideTimerRef.current)
      slideTimerRef.current = window.setTimeout(() => {
        setAnimating(false)
        setSlideStep(0)
        setIndex((i) => (i + dir + n) % n)
      }, SLIDE_MS)
    },
    [hasMultiple, animating, n, resetZoom],
  )

  const next = useCallback(() => move(1), [move])
  const prev = useCallback(() => move(-1), [move])

  const goToThumbnail = useCallback(
    (idx: number) => {
      if (!hasMultiple || idx === index || animating) return
      resetZoom()
      setDragPx(0)
      setSlideStep(0)
      setIndex(idx)
    },
    [hasMultiple, index, animating, resetZoom],
  )

  // Keyboard navigation & zoom controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        if (zoom === 1) toggleZoom()
      } else if (e.key === '-' || e.key === '0') {
        e.preventDefault()
        if (zoom > 1) resetZoom()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [prev, next, onClose, zoom, toggleZoom, resetZoom])

  // Native non-passive touch handling: supports double-tap zoom, pan when zoomed, or swipe when 1x
  useEffect(() => {
    const viewer = containerRef.current
    if (!viewer) return
    const activeSrc = images[index] || ''

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]

      // Double-tap detection
      const now = Date.now()
      if (now - lastTapRef.current < 280) {
        e.preventDefault()
        lastTapRef.current = 0
        toggleZoom(touch.clientX, touch.clientY)
        return
      }
      lastTapRef.current = now

      if (zoom > 1) {
        setIsPanning(true)
        panStartRef.current = {
          clientX: touch.clientX,
          clientY: touch.clientY,
          panX: pan.x,
          panY: pan.y,
        }
        return
      }

      if (!hasMultiple || animating) return
      touchStartX.current = touch.clientX
      touchStartY.current = touch.clientY
      touchIsHorizontal.current = false
    }

    const onTouchMove = (e: TouchEvent) => {
      if (zoom > 1 && panStartRef.current && e.touches.length === 1) {
        e.preventDefault()
        const touch = e.touches[0]
        const dx = touch.clientX - panStartRef.current.clientX
        const dy = touch.clientY - panStartRef.current.clientY
        setPan(clampPan(panStartRef.current.panX + dx, panStartRef.current.panY + dy, zoom, activeSrc))
        return
      }

      if (!hasMultiple || zoom > 1 || touchStartX.current === null || touchStartY.current === null) return
      const dx = e.touches[0].clientX - touchStartX.current
      const dy = e.touches[0].clientY - touchStartY.current

      if (!touchIsHorizontal.current && Math.abs(dy) > Math.abs(dx)) {
        touchStartX.current = null
        touchStartY.current = null
        setDragPx(0)
        return
      }

      touchIsHorizontal.current = true
      e.preventDefault()
      setDragPx(dx)
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (zoom > 1) {
        setIsPanning(false)
        panStartRef.current = null
        return
      }

      if (!hasMultiple || touchStartX.current === null) {
        setDragPx(0)
        return
      }

      const dx = e.changedTouches[0].clientX - touchStartX.current
      const { width } = getViewerRect()

      touchStartX.current = null
      touchStartY.current = null

      if (Math.abs(dx) >= width * 0.15) {
        move(dx < 0 ? 1 : -1)
      } else {
        setAnimating(true)
        setDragPx(0)
        if (slideTimerRef.current !== null) window.clearTimeout(slideTimerRef.current)
        slideTimerRef.current = window.setTimeout(() => setAnimating(false), SLIDE_MS)
      }
    }

    viewer.addEventListener('touchstart', onTouchStart, { passive: false })
    viewer.addEventListener('touchmove', onTouchMove, { passive: false })
    viewer.addEventListener('touchend', onTouchEnd, { passive: true })
    viewer.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      viewer.removeEventListener('touchstart', onTouchStart)
      viewer.removeEventListener('touchmove', onTouchMove)
      viewer.removeEventListener('touchend', onTouchEnd)
      viewer.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [hasMultiple, animating, move, zoom, pan.x, pan.y, clampPan, toggleZoom, images, index])

  // Mouse pan & double-click handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    e.preventDefault()
    setIsPanning(true)
    panStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (zoom <= 1 || !isPanning || !panStartRef.current) return
    const dx = e.clientX - panStartRef.current.clientX
    const dy = e.clientY - panStartRef.current.clientY
    setPan(
      clampPan(
        panStartRef.current.panX + dx,
        panStartRef.current.panY + dy,
        zoom,
        images[index] || '',
      ),
    )
  }

  const endMousePan = () => {
    if (!isPanning) return
    setIsPanning(false)
    panStartRef.current = null
  }

  const prevIndex = (index - 1 + n) % n
  const nextIndex = (index + 1) % n
  const windowSlides = [
    { src: images[prevIndex], rel: -1, visible: false },
    { src: images[index], rel: 0, visible: true },
    { src: images[nextIndex], rel: 1, visible: false },
  ]

  const baseTranslatePct = (-1 - slideStep) * (100 / 3)
  const trackTransform = `translateX(calc(${baseTranslatePct}% + ${dragPx}px))`
  const trackTransition = animating
    ? `transform ${SLIDE_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`
    : 'none'

  const hintText =
    zoom > 1
      ? locale === 'ar'
        ? 'اسحب لتحريك الصورة · انقر مرتين لإعادة الحجم'
        : locale === 'fr'
          ? 'Glissez pour déplacer · Double-cliquez pour réinitialiser'
          : 'Drag to pan · Double-click or tap twice to reset'
      : hasMultiple
        ? locale === 'ar'
          ? 'اضغط مرتين للتكبير · اسحب أو استخدم الأسهم للتنقل'
          : locale === 'fr'
            ? 'Double-cliquez pour zoomer · Glissez pour naviguer'
            : 'Double-click or tap to zoom · Swipe or use arrows to browse'
        : locale === 'ar'
          ? 'اضغط مرتين لتكبير الصورة'
          : locale === 'fr'
            ? 'Double-cliquez pour zoomer'
            : 'Double-click or tap twice to zoom'

  const zoomAriaLabel =
    zoom > 1
      ? locale === 'ar'
        ? 'تصغير الصورة'
        : locale === 'fr'
          ? 'Réinitialiser le zoom'
          : 'Zoom out'
      : locale === 'ar'
        ? 'تكبير الصورة'
        : locale === 'fr'
          ? 'Zoomer sur l’image'
          : 'Zoom in'

  const closeAriaLabel =
    locale === 'ar' ? 'إغلاق المعرض' : locale === 'fr' ? 'Fermer la galerie' : 'Close gallery'

  const prevLabel =
    locale === 'ar' ? 'الصورة السابقة' : locale === 'fr' ? 'Image précédente' : 'Previous image'
  const nextLabel =
    locale === 'ar' ? 'الصورة التالية' : locale === 'fr' ? 'Image suivante' : 'Next image'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={productName}
      className="fixed inset-0 z-[9999] bg-black/88 backdrop-blur-md select-none flex flex-col animate-in fade-in duration-200"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Top Utility Header: Counter + Zoom Toggle + Close ────────── */}
      <div className="relative z-40 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 pt-3 sm:pt-5 pb-1">
        <div className="flex items-center gap-2">
          <div
            dir="ltr"
            className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/25 bg-black/45"
          >
            <span className="text-xs sm:text-sm text-white/95 tabular-nums">
              {index + 1} / {n}
            </span>
          </div>

          <button
            type="button"
            onClick={() => toggleZoom()}
            aria-label={zoomAriaLabel}
            dir="ltr"
            className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-3 rounded-full border border-white/25 bg-black/45 hover:bg-white/15 text-xs font-semibold text-white/95 transition-colors cursor-pointer tabular-nums"
          >
            {zoom > 1 ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            <span>{zoom > 1 ? '1×' : `${ZOOM_SCALE}×`}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={closeAriaLabel}
          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/25 bg-black/45 hover:bg-white/15 text-white/95 transition-all active:scale-90 cursor-pointer"
        >
          <X className="h-5 w-5" strokeWidth={1.9} />
        </button>
      </div>

      {/* ── Main Viewer Wrapper (arrows separated from double-click/pan surface) ── */}
      <div className="relative flex-1 min-h-0 overflow-hidden" dir="ltr">
        <div
          ref={containerRef}
          dir="ltr"
          className="relative h-full w-full overflow-hidden"
          style={{
            touchAction: 'none',
            cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'zoom-in',
          }}
          onDoubleClick={(e) => toggleZoom(e.clientX, e.clientY)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={endMousePan}
          onMouseLeave={endMousePan}
        >
          <div
            dir="ltr"
            className="absolute inset-0 flex h-full items-center will-change-transform"
            style={{ width: '300%', transform: trackTransform, transition: trackTransition }}
          >
            {windowSlides.map((slide) => {
              const isCenter = slide.rel === 0
              return (
                <div
                  key={`${slide.rel}-${slide.src}`}
                  className="relative h-full flex-shrink-0 flex items-center justify-center p-4 sm:p-8"
                  style={{ width: `${100 / 3}%` }}
                  aria-hidden={slide.visible ? undefined : true}
                >
                  <div
                    className="relative w-full h-full max-h-full flex items-center justify-center"
                    style={
                      isCenter
                        ? {
                            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                            transition: isPanning ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                          }
                        : undefined
                    }
                  >
                    <Image
                      src={slide.src}
                      alt={productName}
                      fill
                      sizes="100vw"
                      referrerPolicy="no-referrer"
                      className="object-contain"
                      onLoad={(e) => {
                        const imgEl = e.currentTarget
                        if (imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0) {
                          aspectRatiosRef.current[slide.src] =
                            imgEl.naturalWidth / imgEl.naturalHeight
                        }
                      }}
                      loading={slide.visible ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Desktop Side Arrows (strictly outside zoom/pan surface so holding/double-clicking never zooms or pans) */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              aria-label={prevLabel}
              className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/55 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              aria-label={nextLabel}
              className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/55 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* ── Hint Line ─────────────────────────────────────────────────── */}
      <div
        dir="auto"
        className="flex-shrink-0 text-center py-2 text-[#D4AE78]/85 text-[11px] sm:text-xs pointer-events-none select-none"
      >
        {hintText}
      </div>

      {/* ── Thumbnails ────────────────────────────────────────────────── */}
      {hasMultiple && (
        <div
          dir="ltr"
          className="flex-shrink-0 flex items-center justify-center gap-2.5 pb-3 pt-1 px-4 overflow-x-auto no-scrollbar"
        >
          {images.map((img, idx) => {
            const isSelected = idx === index
            return (
              <button
                key={`fs-thumb-${idx}`}
                type="button"
                onClick={() => goToThumbnail(idx)}
                aria-label={`${productName} ${idx + 1}`}
                aria-current={isSelected ? 'true' : undefined}
                className={cn(
                  'relative overflow-hidden flex-shrink-0 transition-all duration-200 focus:outline-none cursor-pointer',
                  isSelected
                    ? 'h-14 w-12 sm:h-16 sm:w-13 rounded-xl border-2 border-[#D4AE78] shadow-[0_0_8px_rgba(212,174,120,0.4)] opacity-100'
                    : 'h-11 w-9 sm:h-12 sm:w-10 rounded-lg border border-white/20 opacity-55 hover:opacity-85',
                )}
              >
                <Image
                  src={img}
                  alt={`${productName} ${idx + 1}`}
                  fill
                  sizes="(max-width: 639px) 48px, 52px"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </button>
            )
          })}
        </div>
      )}

      {/* ── Bottom Safe Area ──────────────────────────────────────────── */}
      <div className="flex-shrink-0" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }} />
    </div>,
    document.body,
  )
}

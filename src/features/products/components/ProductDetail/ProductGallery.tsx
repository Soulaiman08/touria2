'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MobileFullscreenGallery } from './MobileFullscreenGallery'

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
  const [isMobile, setIsMobile] = useState(false)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ─── Image list ────────────────────────────────────────────────────────
  const imageList = useMemo(() => {
    if (images && images.length > 0) return images
    if (mainImage) return [mainImage]
    return []
  }, [images, mainImage])

  const n = imageList.length
  const hasMultiple = n > 1

  // Cloned track for seamless infinite circular loop: [last, ...items, first]
  const trackImages = useMemo(() => {
    if (!hasMultiple) return imageList
    return [imageList[n - 1], ...imageList, imageList[0]]
  }, [imageList, hasMultiple, n])

  const totalSlides = trackImages.length

  // Current active index in real imageList (0 .. n - 1)
  const realIndex = useMemo(() => {
    const idx = imageList.indexOf(activeImage)
    return idx >= 0 ? idx : 0
  }, [imageList, activeImage])

  // Track index inside trackImages (1 .. n for real slides, 0 and n+1 for clones)
  const [trackIndex, setTrackIndex] = useState(realIndex + 1)
  const [animating, setAnimating] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Track last image notified to parent to prevent state synchronization collision
  const lastNotifiedImageRef = useRef(activeImage)

  // Synchronize track index only when activeImage changes externally (e.g. color selection in parent)
  useEffect(() => {
    if (activeImage !== lastNotifiedImageRef.current) {
      lastNotifiedImageRef.current = activeImage
      setTrackIndex(realIndex + 1)
    }
  }, [activeImage, realIndex])

  // Display index for badges & thumbnails (0 .. n - 1)
  const displayIndex = useMemo(() => {
    if (!hasMultiple) return 0
    return (trackIndex - 1 + n) % n
  }, [trackIndex, n, hasMultiple])

  // ─── Refs ───────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const activeThumbRef = useRef<HTMLButtonElement>(null)

  // Touch & mouse tracking
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchIsHorizontal = useRef(false)
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
  }, [displayIndex])

  // ─── Navigation with Infinite Loop ─────────────────────────────────────
  const handleNext = useCallback(() => {
    if (!hasMultiple || animating) return
    setAnimating(true)
    setDragOffset(0)

    const nextTrackIndex = trackIndex + 1
    setTrackIndex(nextTrackIndex)

    setTimeout(() => {
      if (nextTrackIndex >= n + 1) {
        // Reached cloned first slide (at end) -> snap instantly without transition to real first slide (index 1)
        setAnimating(false)
        setTrackIndex(1)
        lastNotifiedImageRef.current = imageList[0]
        onSelectImage(imageList[0])
      } else {
        setAnimating(false)
        const targetIdx = (nextTrackIndex - 1 + n) % n
        lastNotifiedImageRef.current = imageList[targetIdx]
        onSelectImage(imageList[targetIdx])
      }
    }, 280)
  }, [hasMultiple, animating, trackIndex, n, onSelectImage, imageList])

  const handlePrevious = useCallback(() => {
    if (!hasMultiple || animating) return
    setAnimating(true)
    setDragOffset(0)

    const prevTrackIndex = trackIndex - 1
    setTrackIndex(prevTrackIndex)

    setTimeout(() => {
      if (prevTrackIndex <= 0) {
        // Reached cloned last slide (at start) -> snap instantly without transition to real last slide (index n)
        setAnimating(false)
        setTrackIndex(n)
        lastNotifiedImageRef.current = imageList[n - 1]
        onSelectImage(imageList[n - 1])
      } else {
        setAnimating(false)
        const targetIdx = (prevTrackIndex - 1 + n) % n
        lastNotifiedImageRef.current = imageList[targetIdx]
        onSelectImage(imageList[targetIdx])
      }
    }, 280)
  }, [hasMultiple, animating, trackIndex, n, onSelectImage, imageList])

  const goToThumbnail = useCallback(
    (idx: number) => {
      if (!hasMultiple || idx === displayIndex || animating) return
      setAnimating(true)
      setDragOffset(0)
      setTrackIndex(idx + 1)
      lastNotifiedImageRef.current = imageList[idx]
      onSelectImage(imageList[idx])
      setTimeout(() => setAnimating(false), 280)
    },
    [hasMultiple, displayIndex, animating, onSelectImage, imageList]
  )

  // ─── Keyboard ────────────────────────────────────────────────────────
  // Logical navigation is direction-agnostic: ArrowLeft always goes to the
  // previous image, ArrowRight always to the next. Only the visual arrow
  // placement/rotation is mirrored for RTL, never the order logic.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasMultiple) return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrevious()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNext()
    }
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
    const threshold = containerWidth * 0.15

    setIsDragging(false)
    touchStartX.current = null
    touchStartY.current = null

    if (Math.abs(dx) >= threshold) {
      if (dx < 0) handleNext()
      else handlePrevious()
    } else {
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
        dir={isRTL ? 'rtl' : 'ltr'}
        className="product-main-image relative aspect-[4/5] w-full overflow-hidden rounded-2xl cursor-pointer"
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
        onClick={() => {
          if (isMobile) {
            setIsFullscreenOpen(true)
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {hasMultiple ? (
          /* Cloned Slide Track for Seamless Infinite Loop */
          <div
            dir="ltr"
            className="absolute inset-y-0 left-0 flex h-full"
            style={{
              width: `${totalSlides * 100}%`,
              transform: trackTransform,
              transition: trackTransition,
              willChange: 'transform',
            }}
          >
            {trackImages.map((img, idx) => (
              <div
                key={`track-img-${idx}`}
                className="relative h-full flex-shrink-0"
                style={{ width: `${slideWidthPercent}%` }}
              >
                <Image
                  src={img}
                  alt={`${productName} ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  {...(idx === displayIndex + 1
                    ? { preload: true }
                    : { loading: 'lazy' as const })}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Single image */
          <div className="relative h-full w-full">
            <Image
              src={imageList[0]}
              alt={productName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              preload
              draggable={false}
            />
          </div>
        )}

        {/* Nav arrows + counter — only when multiple images */}
        {hasMultiple && (
          <>
            {/* Left/Previous Button — always goes to the previous image;
                only its position and icon are mirrored for RTL */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                handlePrevious()
              }}
              aria-label={prevLabel}
              className={`
                absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 z-30
                flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center
                rounded-full
                border border-white/40 dark:border-white/20
                bg-white/95 dark:bg-black/80
                text-[#1A1410] dark:text-white
                shadow-[0_4px_14px_rgba(0,0,0,0.3)]
                backdrop-blur-md
                transition-all duration-200
                hover:bg-white dark:hover:bg-black
                hover:border-[#C4622D]
                hover:text-[#C4622D] dark:hover:text-[#D4AE78]
                hover:scale-110
                active:scale-90
                cursor-pointer
              `}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>

            {/* Right/Next Button — always goes to the next image;
                only its position and icon are mirrored for RTL */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                handleNext()
              }}
              aria-label={nextLabel}
              className={`
                absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-30
                flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center
                rounded-full
                border border-white/40 dark:border-white/20
                bg-white/95 dark:bg-black/80
                text-[#1A1410] dark:text-white
                shadow-[0_4px_14px_rgba(0,0,0,0.3)]
                backdrop-blur-md
                transition-all duration-200
                hover:bg-white dark:hover:bg-black
                hover:border-[#C4622D]
                hover:text-[#C4622D] dark:hover:text-[#D4AE78]
                hover:scale-110
                active:scale-90
                cursor-pointer
              `}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </button>

            {/* Counter badge */}
            <div
              dir="ltr"
              className="
                absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-20
                rounded-full px-2.5 py-1
                text-[11px] font-semibold leading-none tabular-nums tracking-wide
                bg-black/75 dark:bg-black/85
                text-white
                border border-white/20
                shadow-[0_2px_8px_rgba(0,0,0,0.4)]
              "
              style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            >
              {displayIndex + 1}&thinsp;/&thinsp;{n}
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
              const isSelected = idx === displayIndex
              return (
                <button
                  key={`thumb-${idx}`}
                  ref={isSelected ? activeThumbRef : null}
                  type="button"
                  onClick={() => goToThumbnail(idx)}
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

      {/* ── Mobile Fullscreen Gallery (Mobile Only + Product Detail Page Only) ── */}
      {isMobile && (
        <MobileFullscreenGallery
          images={imageList}
          initialIndex={displayIndex}
          isOpen={isFullscreenOpen}
          onClose={() => setIsFullscreenOpen(false)}
          productName={productName}
          locale={locale}
        />
      )}
    </div>
  )
}

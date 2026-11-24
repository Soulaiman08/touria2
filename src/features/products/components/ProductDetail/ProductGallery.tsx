'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from 'lucide-react'
import { MobileFullscreenGallery } from './MobileFullscreenGallery'

interface ProductGalleryProps {
  images: string[]
  mainImage: string
  productName: string
  activeImage: string
  onSelectImage: (image: string) => void
  locale: string
}

const FALLBACK_IMAGE = '/images/brand/logo-icon.png'
const INLINE_LOUPE_SCALE = 2.05

export function ProductGallery({
  images,
  mainImage,
  productName,
  activeImage,
  onSelectImage,
  locale,
}: ProductGalleryProps) {
  const isRTL = locale === 'ar'
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({})

  // Desktop inline cursor loupe state
  const [loupeActive, setLoupeActive] = useState(false)
  const [loupeOrigin, setLoupeOrigin] = useState({ x: 50, y: 50 })

  const imageList = useMemo(() => {
    const combined = [mainImage, ...(images || [])].filter(Boolean)
    return Array.from(new Set(combined))
  }, [images, mainImage])

  const n = imageList.length
  const hasMultiple = n > 1

  const trackImages = useMemo(() => {
    if (!hasMultiple) return imageList
    return [imageList[n - 1], ...imageList, imageList[0]]
  }, [imageList, hasMultiple, n])

  const totalSlides = trackImages.length

  const realIndex = useMemo(() => {
    const idx = imageList.indexOf(activeImage)
    return idx >= 0 ? idx : 0
  }, [imageList, activeImage])

  const [syncedActiveImage, setSyncedActiveImage] = useState(activeImage)
  const [trackIndex, setTrackIndex] = useState(realIndex + 1)
  const [animating, setAnimating] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Keep trackIndex synced when activeImage changes externally without effect setState
  if (activeImage !== syncedActiveImage) {
    setSyncedActiveImage(activeImage)
    setTrackIndex(realIndex + 1)
  }

  const displayIndex = useMemo(() => {
    if (!hasMultiple) return 0
    return (trackIndex - 1 + n) % n
  }, [trackIndex, n, hasMultiple])

  const containerRef = useRef<HTMLDivElement>(null)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const activeThumbRef = useRef<HTMLButtonElement>(null)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchIsHorizontal = useRef(false)
  const mouseStartX = useRef<number | null>(null)
  const isMouseDown = useRef(false)
  const didDragRef = useRef(false)

  const isFirstThumbRender = useRef(true)

  useEffect(() => {
    if (isFirstThumbRender.current) {
      isFirstThumbRender.current = false
      return
    }

    const container = thumbnailsRef.current
    const thumb = activeThumbRef.current
    if (!container || !thumb) return

    const containerRect = container.getBoundingClientRect()
    const thumbRect = thumb.getBoundingClientRect()

    if (container.scrollHeight > container.clientHeight) {
      const deltaY =
        thumbRect.top + thumbRect.height / 2 - (containerRect.top + containerRect.height / 2)
      if (Math.abs(deltaY) > 1) {
        container.scrollBy({ top: deltaY, behavior: 'smooth' })
      }
    }
  }, [displayIndex])

  const handleNext = useCallback(() => {
    if (!hasMultiple || animating) return
    setLoupeActive(false)
    setAnimating(true)
    setDragOffset(0)

    const nextTrackIndex = trackIndex + 1
    setTrackIndex(nextTrackIndex)

    window.setTimeout(() => {
      if (nextTrackIndex >= n + 1) {
        setAnimating(false)
        setTrackIndex(1)
        setSyncedActiveImage(imageList[0])
        onSelectImage(imageList[0])
      } else {
        setAnimating(false)
        const targetIdx = (nextTrackIndex - 1 + n) % n
        setSyncedActiveImage(imageList[targetIdx])
        onSelectImage(imageList[targetIdx])
      }
    }, 280)
  }, [hasMultiple, animating, trackIndex, n, onSelectImage, imageList])

  const handlePrevious = useCallback(() => {
    if (!hasMultiple || animating) return
    setLoupeActive(false)
    setAnimating(true)
    setDragOffset(0)

    const prevTrackIndex = trackIndex - 1
    setTrackIndex(prevTrackIndex)

    window.setTimeout(() => {
      if (prevTrackIndex <= 0) {
        setAnimating(false)
        setTrackIndex(n)
        setSyncedActiveImage(imageList[n - 1])
        onSelectImage(imageList[n - 1])
      } else {
        setAnimating(false)
        const targetIdx = (prevTrackIndex - 1 + n) % n
        setSyncedActiveImage(imageList[targetIdx])
        onSelectImage(imageList[targetIdx])
      }
    }, 280)
  }, [hasMultiple, animating, trackIndex, n, onSelectImage, imageList])

  const goToThumbnail = useCallback(
    (idx: number) => {
      if (!hasMultiple || idx === displayIndex || animating) return
      setLoupeActive(false)
      setAnimating(true)
      setDragOffset(0)
      setTrackIndex(idx + 1)
      setSyncedActiveImage(imageList[idx])
      onSelectImage(imageList[idx])
      window.setTimeout(() => setAnimating(false), 280)
    },
    [hasMultiple, displayIndex, animating, onSelectImage, imageList],
  )

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

  const updateLoupeCoords = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100))
    setLoupeOrigin({ x, y })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultiple) return
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchIsHorizontal.current = false
    didDragRef.current = false
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

    if (Math.abs(dx) > 6) {
      didDragRef.current = true
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
      window.setTimeout(() => setAnimating(false), 200)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!hasMultiple || loupeActive) return
    isMouseDown.current = true
    mouseStartX.current = e.clientX
    didDragRef.current = false
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (loupeActive) {
      updateLoupeCoords(e.clientX, e.clientY)
      return
    }
    if (!hasMultiple || !isMouseDown.current || mouseStartX.current === null) return
    const dx = e.clientX - mouseStartX.current
    if (Math.abs(dx) > 6) {
      didDragRef.current = true
    }
    setDragOffset(dx)
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
      window.setTimeout(() => setAnimating(false), 200)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (loupeActive) return
    finishMouseDrag(e.clientX)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (loupeActive) {
      setLoupeOrigin({ x: 50, y: 50 })
    }
    if (isMouseDown.current) finishMouseDrag(e.clientX)
  }

  const slideWidthPercent = totalSlides > 0 ? 100 / totalSlides : 100
  const baseTranslate = -trackIndex * slideWidthPercent
  const trackTransform = hasMultiple
    ? `translateX(calc(${baseTranslate}% + ${dragOffset}px))`
    : 'translateX(0)'

  const trackTransition = isDragging
    ? 'none'
    : animating
      ? 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none'

  const prevLabel =
    locale === 'ar' ? 'الصورة السابقة' : locale === 'fr' ? 'Image précédente' : 'Previous image'
  const nextLabel =
    locale === 'ar' ? 'الصورة التالية' : locale === 'fr' ? 'Image suivante' : 'Next image'
  const zoomLightboxLabel =
    locale === 'ar' ? 'تكبير الصورة بملء الشاشة' : locale === 'fr' ? 'Plein écran et zoom' : 'Fullscreen zoom'
  const loupeLabel = loupeActive
    ? locale === 'ar'
      ? 'إلغاء عدسة التكبير'
      : locale === 'fr'
        ? 'Quitter la loupe'
        : 'Exit magnifier'
    : locale === 'ar'
      ? 'تكبير التفاصيل بالمؤشر'
      : locale === 'fr'
        ? 'Loupe de détail'
        : 'Inspect detail'

  const handleImgError = (src: string) => {
    setFailedSrcs((prev) => (prev[src] ? prev : { ...prev, [src]: true }))
  }

  if (imageList.length === 0) return null

  return (
    <div
      className="product-gallery-panel w-full min-w-0 md:w-fit md:sticky md:top-[4.5rem] lg:top-24 md:self-start select-none"
      tabIndex={hasMultiple ? 0 : -1}
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription={hasMultiple ? 'carousel' : undefined}
      aria-label={productName}
    >
      <div className="flex items-start justify-center gap-2 sm:gap-2.5 lg:gap-3 min-w-0 w-full">
        {/* ── Vertical Thumbnails Rail (all viewports, zero bottom height theft) ── */}
        {hasMultiple && (
          <div
            ref={thumbnailsRef}
            className="product-thumbnails w-11 sm:w-14 lg:w-15 overflow-y-auto no-scrollbar flex-shrink-0 py-0.5"
          >
            <div className="flex flex-col gap-1.5 sm:gap-2 flex-nowrap">
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
                    className="relative flex-shrink-0 w-11 h-[54px] sm:w-13 sm:h-[64px] lg:w-14 lg:h-[70px] overflow-hidden rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer"
                    style={{
                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                      opacity: isSelected ? 1 : 0.65,
                      boxShadow: isSelected ? '0 0 0 2px var(--accent-ring)' : 'none',
                    }}
                  >
                    <Image
                      src={failedSrcs[img] ? FALLBACK_IMAGE : img}
                      alt={`${productName} ${idx + 1}`}
                      fill
                      sizes="(max-width: 639px) 44px, 56px"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                      onError={() => handleImgError(img)}
                      draggable={false}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Main Viewer (4:5 dynamically viewport-adaptive) ──────────────── */}
        <div
          ref={containerRef}
          dir={isRTL ? 'rtl' : 'ltr'}
          className={`product-main-image group relative aspect-[4/5] overflow-hidden rounded-2xl border ${
            hasMultiple ? 'flex-1 min-w-0 max-w-[360px] md:max-w-none md:flex-initial' : 'w-full max-w-[360px] mx-auto md:mx-0 md:max-w-none'
          }`}
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-muted)',
            cursor: loupeActive ? 'zoom-out' : isDragging ? 'grabbing' : 'zoom-in',
            touchAction: hasMultiple ? 'pan-y' : 'auto',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (didDragRef.current) {
              didDragRef.current = false
              return
            }
            if (loupeActive) {
              setLoupeActive(false)
              return
            }
            setIsFullscreenOpen(true)
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Active Slide Track (scaled when desktop loupe is active) */}
          <div
            className="w-full h-full transition-transform duration-200 ease-out will-change-transform"
            style={
              loupeActive
                ? {
                    transform: `scale(${INLINE_LOUPE_SCALE})`,
                    transformOrigin: `${loupeOrigin.x}% ${loupeOrigin.y}%`,
                  }
                : undefined
            }
          >
            {hasMultiple ? (
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
                      src={failedSrcs[img] ? FALLBACK_IMAGE : img}
                      alt={`${productName} ${idx + 1}`}
                      fill
                      sizes="(max-width: 440px) 82vw, (max-width: 767px) 360px, (max-width: 1023px) 40vw, 540px"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                      onError={() => handleImgError(img)}
                      {...(idx === 1
                        ? { priority: true }
                        : idx === displayIndex + 1
                          ? { loading: 'eager' as const }
                          : { loading: 'lazy' as const })}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative h-full w-full">
                <Image
                  src={failedSrcs[imageList[0]] ? FALLBACK_IMAGE : imageList[0]}
                  alt={productName}
                  fill
                  sizes="(max-width: 440px) 85vw, (max-width: 767px) 360px, (max-width: 1023px) 40vw, 540px"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                  onError={() => handleImgError(imageList[0])}
                  priority
                  draggable={false}
                />
              </div>
            )}
          </div>

          {/* ── Top-End Zoom & Fullscreen Action Controls ───────────────── */}
          <div className="absolute top-2.5 end-2.5 z-30 flex items-center gap-1.5">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                const rect = containerRef.current?.getBoundingClientRect()
                if (rect) {
                  setLoupeOrigin({ x: 50, y: 50 })
                }
                setLoupeActive((prev) => !prev)
              }}
              aria-label={loupeLabel}
              aria-pressed={loupeActive}
              title={loupeLabel}
              className={`hidden md:inline-flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-full border backdrop-blur-sm transition-all cursor-pointer ${
                loupeActive
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-md'
                  : 'border-[var(--border)] bg-[var(--card-bg)]/85 text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] opacity-85 group-hover:opacity-100'
              }`}
            >
              {loupeActive ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                setLoupeActive(false)
                setIsFullscreenOpen(true)
              }}
              aria-label={zoomLightboxLabel}
              title={zoomLightboxLabel}
              className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)]/85 text-[var(--text-primary)] shadow-sm backdrop-blur-sm transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95 cursor-pointer"
            >
              <Maximize2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            </button>
          </div>

          {hasMultiple && !loupeActive && (
            <>
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  handlePrevious()
                }}
                aria-label={prevLabel}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)]/90 text-[var(--text-primary)] shadow-md backdrop-blur-sm transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  handleNext()
                }}
                aria-label={nextLabel}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)]/90 text-[var(--text-primary)] shadow-md backdrop-blur-sm transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
              </button>

              <div
                dir="ltr"
                className="absolute bottom-2.5 end-2.5 z-20 rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold leading-none tabular-nums bg-black/70 text-white border border-white/15 backdrop-blur-sm"
              >
                {displayIndex + 1}&thinsp;/&thinsp;{n}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Fullscreen Lightbox + Zoom (enabled on all screen sizes) ── */}
      <MobileFullscreenGallery
        images={imageList}
        initialIndex={displayIndex}
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        productName={productName}
        locale={locale}
      />
    </div>
  )
}

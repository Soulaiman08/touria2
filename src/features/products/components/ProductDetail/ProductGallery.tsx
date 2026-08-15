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

  // Consolidate images array (ensuring mainImage is included if images list is empty)
  const imageList = React.useMemo(() => {
    if (images && images.length > 0) {
      return images
    }
    return [mainImage || '/images/brand/logo-full.png']
  }, [images, mainImage])

  // Current active index
  const currentIndex = React.useMemo(() => {
    const idx = imageList.indexOf(activeImage)
    return idx >= 0 ? idx : 0
  }, [imageList, activeImage])

  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const [animating, setAnimating] = useState(false)

  // Touch & Drag Gesture state
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const isDragging = useRef(false)
  const dragStartX = useRef<number | null>(null)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const activeThumbRef = useRef<HTMLButtonElement>(null)

  // Scroll active thumbnail into view
  useEffect(() => {
    if (activeThumbRef.current && thumbnailsRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [currentIndex])

  const goToIndex = useCallback(
    (newIndex: number, direction: 'left' | 'right') => {
      if (animating || imageList.length <= 1) return
      setSlideDirection(direction)
      setAnimating(true)

      const targetImg = imageList[newIndex]
      onSelectImage(targetImg)

      setTimeout(() => {
        setAnimating(false)
        setSlideDirection(null)
      }, 300)
    },
    [animating, imageList, onSelectImage]
  )

  const handlePrevious = useCallback(() => {
    if (imageList.length <= 1) return
    const prevIndex = currentIndex === 0 ? imageList.length - 1 : currentIndex - 1
    goToIndex(prevIndex, isRTL ? 'right' : 'left')
  }, [currentIndex, imageList.length, isRTL, goToIndex])

  const handleNext = useCallback(() => {
    if (imageList.length <= 1) return
    const nextIndex = currentIndex === imageList.length - 1 ? 0 : currentIndex + 1
    goToIndex(nextIndex, isRTL ? 'left' : 'right')
  }, [currentIndex, imageList.length, isRTL, goToIndex])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (isRTL) {
        handleNext()
      } else {
        handlePrevious()
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      if (isRTL) {
        handlePrevious()
      } else {
        handleNext()
      }
    }
  }

  // Touch Swipe Handlers (Mobile / Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY

    const deltaX = touchEndX - touchStartX.current
    const deltaY = touchEndY - touchStartY.current

    // Only trigger horizontal swipe if horizontal movement is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        // Swiped left
        if (isRTL) {
          handlePrevious()
        } else {
          handleNext()
        }
      } else {
        // Swiped right
        if (isRTL) {
          handleNext()
        } else {
          handlePrevious()
        }
      }
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  // Mouse Drag Handlers (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    dragStartX.current = e.clientX
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || dragStartX.current === null) return
    const dragEndX = e.clientX
    const deltaX = dragEndX - dragStartX.current

    if (Math.abs(deltaX) > 45) {
      if (deltaX < 0) {
        // Dragged left
        if (isRTL) {
          handlePrevious()
        } else {
          handleNext()
        }
      } else {
        // Dragged right
        if (isRTL) {
          handleNext()
        } else {
          handlePrevious()
        }
      }
    }

    isDragging.current = false
    dragStartX.current = null
  }

  const handleMouseLeave = () => {
    isDragging.current = false
    dragStartX.current = null
  }

  // Labels for accessibility
  const prevLabel = locale === 'ar' ? 'الصورة السابقة' : locale === 'fr' ? 'Image précédente' : 'Previous image'
  const nextLabel = locale === 'ar' ? 'الصورة التالية' : locale === 'fr' ? 'Image suivante' : 'Next image'

  const hasMultiple = imageList.length > 1

  return (
    <div
      className="product-gallery-panel space-y-3 sm:space-y-3.5 lg:sticky lg:top-24 lg:self-start select-none"
      dir={isRTL ? 'rtl' : 'ltr'}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription="carousel"
      aria-label={productName}
    >
      {/* ── Main Image Viewer ────────────────────────────────────────── */}
      <div
        className="product-main-image group relative aspect-[4/5] w-full overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing"
        style={{
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`relative h-full w-full transition-all duration-300 ease-out ${
            animating
              ? slideDirection === 'left'
                ? 'opacity-75 translate-x-1'
                : slideDirection === 'right'
                ? 'opacity-75 -translate-x-1'
                : 'opacity-80'
              : 'opacity-100 translate-x-0'
          }`}
        >
          <Image
            src={activeImage || imageList[0]}
            alt={`${productName} - ${currentIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
            draggable={false}
          />
        </div>

        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            {/* ← Previous */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
              aria-label={prevLabel}
              className="
                absolute start-2.5 sm:start-3 top-1/2 -translate-y-1/2 z-10
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
                hover:scale-110 hover:shadow-[0_3px_12px_rgba(0,0,0,0.5)]
                active:scale-90
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4622D]
              "
            >
              {isRTL
                ? <ChevronRight className="h-4 w-4 sm:h-[17px] sm:w-[17px]" strokeWidth={2.5} />
                : <ChevronLeft className="h-4 w-4 sm:h-[17px] sm:w-[17px]" strokeWidth={2.5} />
              }
            </button>

            {/* → Next */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              aria-label={nextLabel}
              className="
                absolute end-2.5 sm:end-3 top-1/2 -translate-y-1/2 z-10
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
                hover:scale-110 hover:shadow-[0_3px_12px_rgba(0,0,0,0.5)]
                active:scale-90
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4622D]
              "
            >
              {isRTL
                ? <ChevronLeft className="h-4 w-4 sm:h-[17px] sm:w-[17px]" strokeWidth={2.5} />
                : <ChevronRight className="h-4 w-4 sm:h-[17px] sm:w-[17px]" strokeWidth={2.5} />
              }
            </button>

            {/* Compact image counter badge */}
            <div
              className="
                absolute bottom-2.5 end-2.5 sm:bottom-3 sm:end-3 z-10
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

      {/* ── Thumbnails Row — always centered ─────────────────────────── */}
      <div
        ref={thumbnailsRef}
        className="w-full flex justify-center overflow-x-auto pb-1 pt-0.5"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {/* inline-flex: group hugs content so justify-center works correctly */}
        <div className="inline-flex gap-2 sm:gap-2.5 flex-nowrap">
          {imageList.map((img, idx) => {
            const isSelected = img === activeImage || idx === currentIndex
            return (
              <button
                key={`${img}-${idx}`}
                ref={isSelected ? activeThumbRef : null}
                type="button"
                onClick={() => {
                  if (idx !== currentIndex) {
                    goToIndex(
                      idx,
                      idx > currentIndex
                        ? isRTL ? 'left' : 'right'
                        : isRTL ? 'right' : 'left'
                    )
                  }
                }}
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
    </div>
  )
}

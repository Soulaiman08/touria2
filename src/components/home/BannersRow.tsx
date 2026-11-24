'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { StoreBanner } from '@/services/banner.service'

interface BannersRowProps {
  banners: StoreBanner[]
  locale: string
}

function resolveBannerUrl(rawUrl: string | null | undefined, locale: string) {
  const trimmed = rawUrl?.trim() || ''
  if (!trimmed) {
    return { href: '', isExternal: false }
  }
  const isExternal = trimmed.startsWith('http://') || trimmed.startsWith('https://')
  if (isExternal) {
    return { href: trimmed, isExternal: true }
  }
  const hasLocalePrefix = /^\/(ar|fr|en)(\/|\?|$)/.test(trimmed)
  if (trimmed.startsWith('/')) {
    return {
      href: hasLocalePrefix ? trimmed : `/${locale}${trimmed === '/' ? '' : trimmed}`,
      isExternal: false,
    }
  }
  return {
    href: `/${locale}/${trimmed}`,
    isExternal: false,
  }
}

function BannerActionButton({
  buttonText,
  href,
  isExternal,
  bannerRTL,
}: {
  buttonText?: string | null
  href: string
  isExternal: boolean
  bannerRTL: boolean
}) {
  if (!buttonText || !href) return null

  const arrowClass = `w-3.5 h-3.5 flex-shrink-0 ${bannerRTL ? 'rotate-180' : ''}`
  const btnClass =
    'btn btn-primary rounded-xl inline-flex items-center gap-2 !min-h-[2.375rem] sm:!min-h-[2.625rem] !py-2 !px-4 sm:!px-5 text-xs sm:text-sm whitespace-nowrap shrink-0 mt-1'

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
      >
        <span>{buttonText}</span>
        <ArrowRight className={arrowClass} />
      </a>
    )
  }

  return (
    <Link href={href} className={btnClass}>
      <span>{buttonText}</span>
      <ArrowRight className={arrowClass} />
    </Link>
  )
}

export function BannersRow({ banners, locale }: BannersRowProps) {
  const isRTL = locale === 'ar'
  const trackRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])

  const [activeIndex, setActiveIndex] = useState(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(banners.length > 1)
  const [isTwoUpDesktop, setIsTwoUpDesktop] = useState(false)

  const syncMetrics = useCallback(() => {
    const track = trackRef.current
    if (!track || banners.length < 2) return

    const twoUp = typeof window !== 'undefined' && window.innerWidth >= 768
    setIsTwoUpDesktop(twoUp)

    const trackRect = track.getBoundingClientRect()
    const maxReachableIndex = twoUp ? Math.max(0, banners.length - 2) : banners.length - 1

    let closestIdx = 0
    let closestDist = Number.POSITIVE_INFINITY

    for (let i = 0; i <= maxReachableIndex; i++) {
      const card = cardRefs.current[i]
      if (!card) continue
      const cardRect = card.getBoundingClientRect()
      const dist = Math.abs(isRTL ? cardRect.right - trackRect.right : cardRect.left - trackRect.left)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = i
      }
    }

    const firstCard = cardRefs.current[0]
    const lastCard = cardRefs.current[banners.length - 1]

    if (firstCard && lastCard) {
      const firstRect = firstCard.getBoundingClientRect()
      const lastRect = lastCard.getBoundingClientRect()
      const prevAvailable = isRTL
        ? firstRect.right > trackRect.right + 6
        : firstRect.left < trackRect.left - 6
      const nextAvailable = isRTL
        ? lastRect.left < trackRect.left - 6
        : lastRect.right > trackRect.right + 6

      setCanPrev(prevAvailable)
      setCanNext(nextAvailable)
    }

    setActiveIndex(closestIdx)
  }, [banners.length, isRTL])

  useEffect(() => {
    if (banners.length < 2) return

    syncMetrics()
    const track = trackRef.current
    if (!track) return

    const handleResize = () => syncMetrics()
    window.addEventListener('resize', handleResize, { passive: true })

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => syncMetrics())
      observer.observe(track)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      observer?.disconnect()
    }
  }, [banners.length, syncMetrics])

  const scrollToIndex = useCallback(
    (targetIdx: number) => {
      const track = trackRef.current
      if (!track || banners.length < 2) return

      const maxReachableIndex = isTwoUpDesktop ? Math.max(0, banners.length - 2) : banners.length - 1
      const clampedIdx = Math.max(0, Math.min(targetIdx, maxReachableIndex))
      const targetCard = cardRefs.current[clampedIdx]
      if (!targetCard) return

      const trackRect = track.getBoundingClientRect()
      const cardRect = targetCard.getBoundingClientRect()
      const delta = isRTL ? cardRect.right - trackRect.right : cardRect.left - trackRect.left

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      track.scrollBy({
        left: delta,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      })
      setActiveIndex(clampedIdx)
    },
    [banners.length, isRTL, isTwoUpDesktop]
  )

  const handleTrackKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (banners.length < 2) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollToIndex(isRTL ? activeIndex - 1 : activeIndex + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollToIndex(isRTL ? activeIndex + 1 : activeIndex - 1)
    }
  }

  if (banners.length === 0) return null

  /* ---------------------------------------------------
     CASE 1: SINGLE FEATURED BANNER
  --------------------------------------------------- */
  if (banners.length === 1) {
    const banner = banners[0]
    const { href, isExternal } = resolveBannerUrl(banner.buttonUrl, locale)
    const bannerRTL = banner.isTextRTL

    return (
      <section
        className="home-section home-section-banners"
        aria-label={isRTL ? 'العروض الرئيسية' : 'Featured Banners'}
      >
        <div className="container-brand">
          <div
            className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] group"
            style={{ boxShadow: 'var(--card-shadow)' }}
          >
            {/* Mobile (< md): Compact 16:9 card with strong dark espresso scrim */}
            <div className="relative md:hidden aspect-[16/9] min-h-[11.5rem] w-full overflow-hidden bg-[var(--bg-muted)]">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                quality={90}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="object-cover object-[50%_32%] transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 639px) 92vw, 90vw"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(16, 10, 6, 0.94) 0%, rgba(16, 10, 6, 0.78) 54%, rgba(16, 10, 6, 0.22) 100%)',
                }}
              />
              <div
                className="absolute inset-0 flex flex-col justify-end items-start text-start p-4 gap-1.5"
                dir={bannerRTL ? 'rtl' : 'ltr'}
              >
                <h3
                  className="text-base min-[390px]:text-lg font-bold text-white leading-snug text-balance line-clamp-2"
                  style={{
                    fontFamily: bannerRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-xs text-white/90 max-w-md line-clamp-1 leading-relaxed">
                    {banner.subtitle}
                  </p>
                )}
                <BannerActionButton
                  buttonText={banner.buttonText}
                  href={href}
                  isExternal={isExternal}
                  bannerRTL={bannerRTL}
                />
              </div>
            </div>

            {/* Tablet & Desktop (md+): Asymmetric Full-Width Editorial Split */}
            <div
              className="hidden md:grid md:grid-cols-12 items-stretch min-h-[15.5rem] lg:min-h-[18.5rem]"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div
                className="md:col-span-6 lg:col-span-5 flex flex-col justify-center items-start text-start p-7 lg:p-10 gap-3 bg-[var(--card-bg)]"
                dir={bannerRTL ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
                  <span className="w-5 h-px bg-[var(--gold)]/70" aria-hidden="true" />
                  <span>
                    {locale === 'ar'
                      ? 'مختارات الموسم'
                      : locale === 'fr'
                        ? 'Édition spéciale'
                        : 'Seasonal Feature'}
                  </span>
                </div>

                <h3
                  className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] leading-tight text-balance"
                  style={{
                    fontFamily: bannerRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                  }}
                >
                  {banner.title}
                </h3>

                {banner.subtitle && (
                  <p className="text-sm lg:text-base text-[var(--text-muted)] max-w-md leading-relaxed line-clamp-2">
                    {banner.subtitle}
                  </p>
                )}

                <div className="pt-1">
                  <BannerActionButton
                    buttonText={banner.buttonText}
                    href={href}
                    isExternal={isExternal}
                    bannerRTL={bannerRTL}
                  />
                </div>
              </div>

              <div className="md:col-span-6 lg:col-span-7 relative min-h-[15.5rem] lg:min-h-[18.5rem] overflow-hidden bg-[var(--bg-muted)]">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  quality={90}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="object-cover object-[50%_30%] transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 1023px) 48vw, (max-width: 1440px) 55vw, 760px"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: isRTL
                      ? 'linear-gradient(to left, var(--card-bg) 0%, transparent 18%)'
                      : 'linear-gradient(to right, var(--card-bg) 0%, transparent 18%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  /* ---------------------------------------------------
     CASE 2: MULTIPLE BANNERS (2+) IN ONE SINGLE HORIZONTAL ROW
     - Mobile/Small Tablet: 1 focal card (~86%) + peek of next card
     - Desktop/Medium+ (md+): 2 side-by-side cards in view + smooth manual scroll for 3+
  --------------------------------------------------- */
  const stepCount = isTwoUpDesktop ? Math.max(1, banners.length - 1) : banners.length
  const showControlsOnDesktop = banners.length > 2
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft
  const NextIcon = isRTL ? ChevronLeft : ChevronRight

  return (
    <section
      className="home-section home-section-banners"
      aria-label={isRTL ? 'العروض الرئيسية' : 'Featured Banners'}
      aria-roledescription="carousel"
      onKeyDown={handleTrackKeyDown}
    >
      <div className="container-brand">
        {/* Single Non-Wrapping Horizontal Scroll-Snap Track */}
        <div
          ref={trackRef}
          dir={isRTL ? 'rtl' : 'ltr'}
          onScroll={syncMetrics}
          tabIndex={0}
          aria-label={isRTL ? 'شريط العروض الترويجية' : 'Promotional banners row'}
          className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 md:gap-6 pb-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-2xl"
        >
          {banners.map((banner, index) => {
            const { href, isExternal } = resolveBannerUrl(banner.buttonUrl, locale)
            const bannerRTL = banner.isTextRTL

            return (
              <div
                key={banner.id}
                ref={(el) => {
                  cardRefs.current[index] = el
                }}
                className="w-[86%] sm:w-[76%] md:w-[calc((100%-1.5rem)/2)] shrink-0 snap-start relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-muted)] group aspect-[16/9] min-h-[11.5rem] sm:min-h-[13.5rem]"
                style={{ boxShadow: 'var(--card-shadow)' }}
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  quality={90}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="object-cover object-[50%_32%] transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 639px) 82vw, (max-width: 767px) 70vw, (max-width: 1440px) 46vw, 640px"
                />

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(16, 10, 6, 0.94) 0%, rgba(16, 10, 6, 0.74) 54%, rgba(16, 10, 6, 0.18) 100%)',
                  }}
                />

                <div
                  className="absolute inset-0 flex flex-col justify-end items-start text-start p-4 sm:p-6 gap-1.5 sm:gap-2"
                  dir={bannerRTL ? 'rtl' : 'ltr'}
                >
                  <h3
                    className="text-base sm:text-xl font-bold text-white leading-snug text-balance line-clamp-2"
                    style={{
                      fontFamily: bannerRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
                    }}
                  >
                    {banner.title}
                  </h3>

                  {banner.subtitle && (
                    <p className="text-xs sm:text-sm text-white/90 max-w-md line-clamp-1 sm:line-clamp-2 leading-relaxed">
                      {banner.subtitle}
                    </p>
                  )}

                  <BannerActionButton
                    buttonText={banner.buttonText}
                    href={href}
                    isExternal={isExternal}
                    bannerRTL={bannerRTL}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Manual Navigation Controls (Dots + Previous/Next Arrows) */}
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className={`mt-3.5 sm:mt-4 items-center justify-between gap-4 ${
            showControlsOnDesktop ? 'flex' : 'flex md:hidden'
          }`}
        >
          {/* Progress Indicator Dots */}
          <div
            className="flex items-center gap-1"
            role="tablist"
            aria-label={isRTL ? 'مؤشر شرائح البانرات' : 'Banner slide indicators'}
          >
            {Array.from({ length: stepCount }).map((_, idx) => {
              const isActive = idx === Math.min(activeIndex, stepCount - 1)
              return (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={
                    isRTL ? `الانتقال للعرض ${idx + 1}` : `Go to banner ${idx + 1}`
                  }
                  onClick={() => scrollToIndex(idx)}
                  className="min-w-[24px] min-h-[32px] flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-md"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'w-6 bg-[var(--accent)]'
                        : 'w-2 bg-[var(--border)] hover:bg-[var(--gold)]/70'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Manual Previous / Next Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={!canPrev}
              aria-label={isRTL ? 'البانر السابق' : 'Previous banner'}
              className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <PrevIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={!canNext}
              aria-label={isRTL ? 'البانر التالي' : 'Next banner'}
              className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <NextIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

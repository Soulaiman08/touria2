'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  Check,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CatalogCategoryOption {
  id: string
  slug: string
  label: string
  count: number
  showSizeFilter?: boolean
  sizes?: string[]
}

export interface CatalogColorOption {
  code: string
  label: string
}

export interface CatalogSortOption {
  key: string
  label: string
}

interface CatalogMobileControlsProps {
  locale: string
  categories: CatalogCategoryOption[]
  sizes: readonly string[]
  colors: CatalogColorOption[]
  sortOptions: CatalogSortOption[]
  activeCategory?: string
  activeSize?: string
  activeColor?: string
  activeSort?: string
  activeSearch?: string
  allCount: number
  showSizeFilter?: boolean
  labels: {
    allCategories: string
    filter: string
    sort: string
    category: string
    size: string
    color: string
    clear: string
    apply: string
    reset: string
    allSizes: string
    allColors: string
  }
}

export function CatalogMobileControls({
  locale,
  categories,
  sizes,
  colors,
  sortOptions,
  activeCategory,
  activeSize,
  activeColor,
  activeSort,
  activeSearch,
  allCount,
  showSizeFilter = true,
  labels,
}: CatalogMobileControlsProps) {
  const router = useRouter()
  const isRTL = locale === 'ar'

  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  // Staged drawer state initialized from active URL params when opened
  const [draftCategory, setDraftCategory] = useState<string | undefined>(activeCategory)
  const [draftSize, setDraftSize] = useState<string | undefined>(activeSize)
  const [draftColor, setDraftColor] = useState<string | undefined>(activeColor)

  const sortContainerRef = useRef<HTMLDivElement | null>(null)

  const openFilterSheet = () => {
    setDraftCategory(activeCategory)
    setDraftSize(activeSize)
    setDraftColor(activeColor)
    setSortOpen(false)
    setFilterOpen(true)
  }

  // Close sort dropdown on outside click / Escape
  useEffect(() => {
    if (!sortOpen) return
    const handlePointerDown = (e: MouseEvent) => {
      if (sortContainerRef.current && !sortContainerRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSortOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [sortOpen])

  // Lock body scroll & handle Escape when filter drawer is open
  useEffect(() => {
    if (!filterOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFilterOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [filterOpen])

  const buildUrl = (overrides: {
    category?: string | null
    size?: string | null
    color?: string | null
    sort?: string | null
    q?: string | null
  }) => {
    const query = new URLSearchParams()
    const nextCategory = overrides.category === undefined ? activeCategory : overrides.category
    const nextSize = overrides.size === undefined ? activeSize : overrides.size
    const nextColor = overrides.color === undefined ? activeColor : overrides.color
    const nextSort = overrides.sort === undefined ? activeSort : overrides.sort
    const nextSearch = overrides.q === undefined ? activeSearch : overrides.q

    if (nextCategory) query.set('category', nextCategory)
    if (nextSize) query.set('size', nextSize)
    if (nextColor) query.set('color', nextColor)
    if (nextSort) query.set('sort', nextSort)
    if (nextSearch) query.set('q', nextSearch)

    const qs = query.toString()
    return qs ? `/${locale}/products?${qs}` : `/${locale}/products`
  }

  const handleApplyFilters = () => {
    setFilterOpen(false)
    router.push(
      buildUrl({
        category: draftCategory ?? null,
        size: draftSize ?? null,
        color: draftColor ?? null,
      })
    )
  }

  const handleResetDraft = () => {
    setDraftCategory(undefined)
    setDraftSize(undefined)
    setDraftColor(undefined)
    setFilterOpen(false)
    router.push(
      buildUrl({
        category: null,
        size: null,
        color: null,
        q: null,
      })
    )
  }

  const activeFilterCount =
    (activeCategory ? 1 : 0) +
    (activeSize ? 1 : 0) +
    (activeColor ? 1 : 0) +
    (activeSearch ? 1 : 0)

  const currentSortLabel =
    sortOptions.find((o) => o.key === activeSort)?.label ?? sortOptions[0]?.label ?? labels.sort

  const activeColorObj = activeColor
    ? colors.find((c) => c.code.replace('#', '').toLowerCase() === activeColor.toLowerCase())
    : undefined

  const draftColorObj = draftColor
    ? colors.find((c) => c.code.replace('#', '').toLowerCase() === draftColor.toLowerCase())
    : undefined

  const draftCategoryObj = draftCategory
    ? categories.find((c) => c.slug === draftCategory || `${c.slug}s` === draftCategory)
    : undefined

  const effectiveShowSizeFilter = draftCategoryObj
    ? draftCategoryObj.showSizeFilter !== false
    : showSizeFilter

  const effectiveSizes =
    draftCategoryObj?.sizes && draftCategoryObj.sizes.length > 0
      ? draftCategoryObj.sizes
      : sizes

  return (
    <div className="lg:hidden space-y-3">
      {/* 1. Sleek Underline Category Tabs (No Pill Clutter) */}
      <div
        className="flex items-center gap-5 border-b border-[var(--border)] overflow-x-auto scrollbar-hidden"
        role="tablist"
        aria-label={labels.category}
      >
        <Link
          href={buildUrl({ category: null })}
          className={cn(
            'relative inline-flex items-center gap-1.5 py-2.5 text-xs sm:text-[13px] whitespace-nowrap flex-shrink-0 border-b-2 -mb-px transition-colors no-underline',
            !activeCategory
              ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
          )}
        >
          <span>{labels.allCategories}</span>
          <span className="tabular-nums text-[11px] opacity-75">({allCount})</span>
        </Link>

        {categories.map((cat) => {
          const isActive =
            activeCategory === cat.slug || activeCategory === `${cat.slug}s`
          return (
            <Link
              key={cat.id}
              href={buildUrl({ category: isActive ? null : cat.slug })}
              className={cn(
                'relative inline-flex items-center gap-1.5 py-2.5 text-xs sm:text-[13px] whitespace-nowrap flex-shrink-0 border-b-2 -mb-px transition-colors no-underline',
                isActive
                  ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
              )}
            >
              <span>{cat.label}</span>
              <span className="tabular-nums text-[11px] opacity-75">({cat.count})</span>
            </Link>
          )
        })}
      </div>

      {/* 2. Unified 2-Button Filter & Sort Action Bar */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={openFilterSheet}
          aria-expanded={filterOpen}
          className={cn(
            'h-11 px-2.5 sm:px-3 rounded-xl border flex items-center justify-between gap-1.5 sm:gap-2 text-xs font-semibold transition-colors cursor-pointer min-w-0',
            activeFilterCount > 0
              ? 'border-[var(--accent-ring)] bg-[var(--accent-light)]/50 text-[var(--text-primary)]'
              : 'border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:border-[var(--accent)]'
          )}
        >
          <span className="inline-flex items-center gap-2 min-w-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
            <span className="truncate">{labels.filter}</span>
          </span>
          {activeFilterCount > 0 ? (
            <span className="tabular-nums inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-md bg-[var(--accent)] text-white text-[11px] font-bold flex-shrink-0">
              {activeFilterCount}
            </span>
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
          )}
        </button>

        {/* Sort Popover Trigger */}
        <div className="relative" ref={sortContainerRef}>
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
            className="h-11 w-full px-2.5 sm:px-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--accent)] flex items-center justify-between gap-1.5 sm:gap-2 text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer min-w-0"
          >
            <span className="inline-flex items-center gap-2 min-w-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--gold)] flex-shrink-0" />
              <span className="truncate">{currentSortLabel}</span>
            </span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 flex-shrink-0',
                sortOpen && 'rotate-180'
              )}
            />
          </button>

          {sortOpen && (
            <div
              role="listbox"
              aria-label={labels.sort}
              className="absolute top-full inset-x-0 mt-1.5 z-40 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] shadow-[var(--shadow-lg)] p-1.5 space-y-0.5"
            >
              {sortOptions.map((opt) => {
                const isActive = activeSort === opt.key || (!activeSort && opt.key === 'featured')
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      setSortOpen(false)
                      router.push(buildUrl({ sort: opt.key === 'featured' ? null : opt.key }))
                    }}
                    className={cn(
                      'w-full px-3 py-2.5 rounded-lg text-start text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer',
                      isActive
                        ? 'bg-[var(--accent-light)] text-[var(--accent)] font-bold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] font-medium'
                    )}
                  >
                    <span>{opt.label}</span>
                    {isActive && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Compact Dismissible Active Filters Strip */}
      {(activeSize || activeColor || activeSearch) && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {activeSize && (
            <Link
              href={buildUrl({ size: null })}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold no-underline hover:border-[var(--accent)]"
            >
              <span>
                {labels.size}: {activeSize}
              </span>
              <X className="w-3 h-3 text-[var(--text-muted)]" />
            </Link>
          )}

          {activeColor && (
            <Link
              href={buildUrl({ color: null })}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold no-underline hover:border-[var(--accent)]"
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-[var(--border)] flex-shrink-0"
                style={{ backgroundColor: `#${activeColor}` }}
              />
              <span>{activeColorObj?.label ?? `#${activeColor}`}</span>
              <X className="w-3 h-3 text-[var(--text-muted)]" />
            </Link>
          )}

          {activeSearch && (
            <Link
              href={buildUrl({ q: null })}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold no-underline hover:border-[var(--accent)]"
            >
              <span>“{activeSearch}”</span>
              <X className="w-3 h-3 text-[var(--text-muted)]" />
            </Link>
          )}

          <Link
            href={`/${locale}/products`}
            className="px-2 py-1 font-semibold text-[var(--accent)] no-underline hover:underline ms-auto"
          >
            {labels.clear}
          </Link>
        </div>
      )}

      {/* 4. Responsive Filter Drawer / Bottom Sheet */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4"
          dir={isRTL ? 'rtl' : 'ltr'}
          onClick={(e) => {
            if (e.target === e.currentTarget) setFilterOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={labels.filter}
            className="w-full sm:max-w-md max-h-[86dvh] rounded-t-2xl sm:rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] shadow-[var(--shadow-modal)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[var(--border)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="text-base font-bold text-[var(--text-primary)] m-0">
                  {labels.filter}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                aria-label={labels.clear}
                className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 space-y-5 sm:space-y-6 overflow-y-auto">
              {/* Categories */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] m-0">
                  {labels.category}
                </h3>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setDraftCategory(undefined)}
                    className={cn(
                      'w-full h-11 px-3.5 rounded-xl border text-xs flex items-center justify-between transition-colors cursor-pointer',
                      !draftCategory
                        ? 'border-[var(--accent-ring)] bg-[var(--accent-light)] text-[var(--accent)] font-bold'
                        : 'border-[var(--border)] bg-[var(--bg-subtle)]/60 text-[var(--text-secondary)] font-medium'
                    )}
                  >
                    <span>{labels.allCategories}</span>
                    <span className="tabular-nums text-[11px] opacity-80">{allCount}</span>
                  </button>

                  {categories.map((cat) => {
                    const isSelected =
                      draftCategory === cat.slug || draftCategory === `${cat.slug}s`
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const nextSlug = isSelected ? undefined : cat.slug
                          setDraftCategory(nextSlug)
                          if (nextSlug && cat.showSizeFilter === false) {
                            setDraftSize(undefined)
                          }
                        }}
                        className={cn(
                          'w-full h-11 px-3.5 rounded-xl border text-xs flex items-center justify-between transition-colors cursor-pointer',
                          isSelected
                            ? 'border-[var(--accent-ring)] bg-[var(--accent-light)] text-[var(--accent)] font-bold'
                            : 'border-[var(--border)] bg-[var(--bg-subtle)]/60 text-[var(--text-secondary)] font-medium'
                        )}
                      >
                        <span>{cat.label}</span>
                        <span className="tabular-nums text-[11px] opacity-80">{cat.count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Colors */}
              {colors.length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] m-0">
                      {labels.color}
                    </h3>
                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                      {draftColorObj ? draftColorObj.label : labels.allColors}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((col) => {
                      const hexParam = col.code.replace('#', '')
                      const isSelected = draftColor?.toLowerCase() === hexParam.toLowerCase()
                      return (
                        <button
                          key={col.code}
                          type="button"
                          onClick={() => setDraftColor(isSelected ? undefined : hexParam)}
                          aria-label={col.label}
                          title={col.label}
                          className={cn(
                            'w-9 h-9 rounded-full border flex items-center justify-center transition-transform cursor-pointer',
                            isSelected
                              ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--card-bg)] scale-105'
                              : 'border-[var(--border)] hover:scale-105'
                          )}
                          style={{ backgroundColor: col.code }}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Size (Symmetrical 4x2 Grid) */}
              {effectiveShowSizeFilter && effectiveSizes.length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-[var(--border)]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] m-0">
                    {labels.size}
                  </h3>

                  <div className="grid grid-cols-3 min-[380px]:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setDraftSize(undefined)}
                      className={cn(
                        'h-11 rounded-xl border text-xs font-semibold transition-colors cursor-pointer',
                        !draftSize
                          ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] font-bold'
                          : 'border-[var(--border)] bg-[var(--bg-subtle)]/60 text-[var(--text-muted)]'
                      )}
                    >
                      {labels.allSizes}
                    </button>

                    {effectiveSizes.map((s) => {
                      const isSelected = draftSize === s
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDraftSize(isSelected ? undefined : s)}
                          className={cn(
                            'h-11 rounded-xl border text-xs font-semibold tabular-nums transition-colors cursor-pointer',
                            isSelected
                              ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] font-bold'
                              : 'border-[var(--border)] bg-[var(--bg-subtle)]/60 text-[var(--text-muted)]'
                          )}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-5 py-3.5 border-t border-[var(--border)] bg-[var(--bg-subtle)] flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetDraft}
                className="btn btn-outline rounded-xl h-11 px-4 text-xs font-semibold cursor-pointer"
              >
                {labels.reset}
              </button>

              <button
                type="button"
                onClick={handleApplyFilters}
                className="btn btn-primary rounded-xl flex-1 h-11 text-xs font-bold cursor-pointer justify-center"
              >
                {labels.apply}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

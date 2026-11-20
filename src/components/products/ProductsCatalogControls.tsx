'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Check,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { CustomSelect, type CustomSelectOption } from '@/components/shared/CustomSelect'
import { cn } from '@/lib/utils'
import type { ProductFilters } from '@/types/product'

export interface CatalogCategoryOption {
  id: string
  slug: string
  label: string
}

export interface CatalogSortOption {
  key: NonNullable<ProductFilters['sort']>
  label: string
}

export interface CatalogCurrentFilters {
  category?: string
  size?: string
  rawColor?: string
  search?: string
  sort?: ProductFilters['sort']
}

export function buildProductsUrl(
  locale: string,
  current: CatalogCurrentFilters,
  overrides: {
    category?: string | null
    size?: string | null
    sort?: string | null
    q?: string | null
    color?: string | null
  }
): string {
  const query = new URLSearchParams()
  const nextCategory =
    overrides.category === undefined ? current.category : overrides.category
  const nextSize = overrides.size === undefined ? current.size : overrides.size
  const nextSort = overrides.sort === undefined ? current.sort : overrides.sort
  const nextSearch = overrides.q === undefined ? current.search : overrides.q
  const nextColor =
    overrides.color === undefined ? current.rawColor : overrides.color

  if (nextCategory) query.set('category', nextCategory)
  if (nextSize) query.set('size', nextSize)
  if (nextSort) query.set('sort', nextSort)
  if (nextSearch && nextSearch.trim()) query.set('q', nextSearch.trim())
  if (nextColor) query.set('color', nextColor)

  const qs = query.toString()
  return qs ? `/${locale}/products?${qs}` : `/${locale}/products`
}

interface MobileCatalogControlsProps {
  locale: string
  categories: CatalogCategoryOption[]
  sizes: readonly string[]
  sortOptions: CatalogSortOption[]
  current: CatalogCurrentFilters
  labels: {
    filter: string
    sort: string
    category: string
    size: string
    color: string
    all: string
    clear: string
    apply: string
    close: string
    searchLabel: string
    searchPlaceholder: string
    sortByLabel: string
  }
}

export function MobileCatalogControls({
  locale,
  categories,
  sizes,
  sortOptions,
  current,
  labels,
}: MobileCatalogControlsProps) {
  const router = useRouter()
  const isRTL = locale === 'ar'

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [draftCategory, setDraftCategory] = useState<string | undefined>(current.category)
  const [draftSize, setDraftSize] = useState<string | undefined>(current.size)
  const [draftColor, setDraftColor] = useState<string | undefined>(current.rawColor)
  const [draftSearch, setDraftSearch] = useState<string>(current.search ?? '')
  const [draftSort, setDraftSort] = useState<NonNullable<ProductFilters['sort']>>(
    current.sort ?? 'featured'
  )

  const activeFilterCount = [
    current.category,
    current.size,
    current.rawColor,
    current.search,
  ].filter(Boolean).length

  const draftFilterCount = [
    draftCategory,
    draftSize,
    draftColor,
    draftSearch.trim() || undefined,
  ].filter(Boolean).length

  const sortSelectOptions: CustomSelectOption[] = useMemo(
    () =>
      sortOptions.map((opt) => ({
        value: opt.key,
        label: `${labels.sort}: ${opt.label}`,
      })),
    [sortOptions, labels.sort]
  )

  const openDrawer = () => {
    setDraftCategory(current.category)
    setDraftSize(current.size)
    setDraftColor(current.rawColor)
    setDraftSearch(current.search ?? '')
    setDraftSort(current.sort ?? 'featured')
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
  }

  useEffect(() => {
    if (!isDrawerOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsDrawerOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDrawerOpen])

  const handleQuickSort = (nextSortValue: string) => {
    const resolvedSort =
      nextSortValue === 'featured' && !current.sort
        ? null
        : nextSortValue === current.sort
          ? current.sort
          : nextSortValue === 'featured'
            ? null
            : nextSortValue
    router.push(buildProductsUrl(locale, current, { sort: resolvedSort }))
  }

  const handleApplyDrawer = () => {
    const url = buildProductsUrl(locale, current, {
      category: draftCategory ?? null,
      size: draftSize ?? null,
      color: draftColor ?? null,
      q: draftSearch.trim() ? draftSearch.trim() : null,
      sort: draftSort === 'featured' ? null : draftSort,
    })
    setIsDrawerOpen(false)
    router.push(url)
  }

  const handleResetDraft = () => {
    setDraftCategory(undefined)
    setDraftSize(undefined)
    setDraftColor(undefined)
    setDraftSearch('')
    setDraftSort('featured')
  }

  return (
    <div className="lg:hidden space-y-2.5 pt-1">
      {/* Row 1: Filter Drawer Trigger + Sort Dropdown (Zero overflow on 320px+) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openDrawer}
          aria-expanded={isDrawerOpen}
          className={cn(
            'h-10 px-3.5 rounded-xl border inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer active:scale-[0.98]',
            activeFilterCount > 0
              ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-ring)] shadow-2xs'
              : 'bg-[var(--card-bg)] text-[var(--text-primary)] border-[var(--border)] shadow-[var(--shadow-sm)] hover:border-[var(--accent)]'
          )}
        >
          <SlidersHorizontal className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{labels.filter}</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-md bg-[var(--accent)] text-white text-[11px] font-bold tabular-nums leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <CustomSelect
            variant="card"
            size="sm"
            value={current.sort ?? 'featured'}
            onChange={handleQuickSort}
            options={sortSelectOptions}
            ariaLabel={labels.sort}
          />
        </div>
      </div>

      {/* Row 2: Clean Single Horizontal Category Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden pb-0.5">
        <Link
          href={buildProductsUrl(locale, current, { category: null })}
          className={cn(
            'h-9 px-3.5 rounded-xl border inline-flex items-center justify-center text-xs whitespace-nowrap shrink-0 transition-colors no-underline',
            !current.category
              ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-ring)] font-bold'
              : 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border)] font-medium hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
          )}
        >
          {labels.all}
        </Link>

        {categories.map((cat) => {
          const isActive =
            current.category === cat.slug || current.category === `${cat.slug}s`
          return (
            <Link
              key={cat.id}
              href={buildProductsUrl(locale, current, {
                category: isActive ? null : cat.slug,
              })}
              className={cn(
                'h-9 px-3.5 rounded-xl border inline-flex items-center justify-center text-xs whitespace-nowrap shrink-0 transition-colors no-underline',
                isActive
                  ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-ring)] font-bold'
                  : 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border)] font-medium hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
              )}
            >
              {cat.label}
            </Link>
          )
        })}
      </div>

      {/* Mobile Filter Drawer / Bottom-Sheet Portal */}
      {isDrawerOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end"
            dir={isRTL ? 'rtl' : 'ltr'}
            role="dialog"
            aria-modal="true"
            aria-label={labels.filter}
          >
            {/* Backdrop */}
            <div
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/55 backdrop-blur-xs animate-fade-in"
              aria-hidden="true"
            />

            {/* Panel */}
            <div className="relative z-10 w-full sm:max-w-sm bg-[var(--card-bg)] border-t sm:border-t-0 sm:border-s border-[var(--border)] rounded-t-2xl sm:rounded-t-none sm:rounded-s-2xl shadow-[var(--shadow-modal)] flex flex-col max-h-[88dvh] sm:max-h-none sm:h-full overflow-hidden animate-fade-in-up">
              {/* Mobile Drag Handle */}
              <div className="flex justify-center pt-2.5 sm:hidden">
                <span className="w-10 h-1 rounded-full bg-[var(--border)]" aria-hidden="true" />
              </div>

              {/* Drawer Header */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent-ring)] flex items-center justify-center flex-shrink-0">
                    <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-bold text-[var(--text-primary)] truncate">
                    {labels.filter}
                  </h2>
                  {draftFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-md bg-[var(--accent)] text-white text-[11px] font-bold tabular-nums">
                      {draftFilterCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {(draftFilterCount > 0 || draftSort !== 'featured') && (
                    <button
                      type="button"
                      onClick={handleResetDraft}
                      className="text-xs font-semibold text-[var(--accent)] hover:underline px-2 py-1.5 rounded-lg cursor-pointer"
                    >
                      {labels.clear}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeDrawer}
                    aria-label={labels.close}
                    className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center hover:border-[var(--accent)] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Scrollable Filter Sections */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-6">
                {/* 1. Search */}
                <div className="space-y-2.5">
                  <label
                    htmlFor="mobile-catalog-search"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]"
                  >
                    {labels.searchLabel}
                  </label>
                  <div className="relative flex items-center">
                    <Search
                      aria-hidden="true"
                      className="w-4 h-4 absolute start-3.5 text-[var(--text-muted)] pointer-events-none"
                    />
                    <input
                      id="mobile-catalog-search"
                      type="search"
                      value={draftSearch}
                      onChange={(e) => setDraftSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleApplyDrawer()
                        }
                      }}
                      placeholder={labels.searchPlaceholder}
                      className="w-full h-11 ps-10 pe-9 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] transition-colors"
                    />
                    {draftSearch && (
                      <button
                        type="button"
                        onClick={() => setDraftSearch('')}
                        aria-label={labels.clear}
                        className="absolute end-2 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Category */}
                <div className="space-y-2.5 pt-5 border-t border-[var(--border)]">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                    {labels.category}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setDraftCategory(undefined)}
                      className={cn(
                        'w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm transition-colors cursor-pointer text-start',
                        !draftCategory
                          ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-ring)] font-bold'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border)] font-medium hover:border-[var(--accent)]'
                      )}
                    >
                      <span>{labels.all}</span>
                      {!draftCategory && (
                        <Check className="w-4 h-4 text-[var(--accent)] flex-shrink-0" aria-hidden="true" />
                      )}
                    </button>

                    {categories.map((cat) => {
                      const isSelected =
                        draftCategory === cat.slug || draftCategory === `${cat.slug}s`
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            setDraftCategory(isSelected ? undefined : cat.slug)
                          }
                          className={cn(
                            'w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm transition-colors cursor-pointer text-start',
                            isSelected
                              ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-ring)] font-bold'
                              : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border)] font-medium hover:border-[var(--accent)]'
                          )}
                        >
                          <span>{cat.label}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[var(--accent)] flex-shrink-0" aria-hidden="true" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Size (Uniform 4-Column Grid) */}
                <div className="space-y-2.5 pt-5 border-t border-[var(--border)]">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                    {labels.size}
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((s) => {
                      const isSelected = draftSize === s
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDraftSize(isSelected ? undefined : s)}
                          className={cn(
                            'h-10 rounded-xl border flex items-center justify-center text-xs font-semibold tabular-nums transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)] font-bold'
                              : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
                          )}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 4. Color indicator if active */}
                {draftColor && (
                  <div className="space-y-2.5 pt-5 border-t border-[var(--border)]">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                      {labels.color}
                    </h3>
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[var(--accent-ring)] bg-[var(--accent-light)]">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                        <span
                          aria-hidden="true"
                          className="w-4 h-4 rounded-full border border-[var(--border)]"
                          style={{ background: `#${draftColor}` }}
                        />
                        <span dir="ltr" className="uppercase tabular-nums">
                          #{draftColor}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setDraftColor(undefined)}
                        className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                      >
                        {labels.clear}
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Sort Order */}
                <div className="space-y-2.5 pt-5 border-t border-[var(--border)]">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                    {labels.sortByLabel}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {sortOptions.map((opt) => {
                      const isSelected = draftSort === opt.key
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setDraftSort(opt.key)}
                          className={cn(
                            'min-h-[42px] px-3 py-2 rounded-xl border text-xs font-medium text-start transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-ring)] font-bold'
                              : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
                          )}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Sticky Apply Footer */}
              <div className="px-5 py-3.5 border-t border-[var(--border)] bg-[var(--card-bg)] flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleApplyDrawer}
                  className="btn btn-primary rounded-xl h-11 flex-1 text-sm font-semibold cursor-pointer"
                >
                  {labels.apply}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

interface SidebarSearchFormProps {
  locale: string
  current: CatalogCurrentFilters
  placeholder: string
  clearLabel: string
  submitLabel: string
}

export function SidebarSearchForm({
  locale,
  current,
  placeholder,
  clearLabel,
  submitLabel,
}: SidebarSearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(current.search ?? '')

  // Keep synced on browser back/forward navigation without effect loops
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    router.push(buildProductsUrl(locale, current, { q: trimmed || null }))
  }

  const handleClear = () => {
    setQuery('')
    if (current.search) {
      router.push(buildProductsUrl(locale, current, { q: null }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <button
        type="submit"
        aria-label={submitLabel}
        className="w-8 h-8 rounded-lg absolute start-1 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
      >
        <Search className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-10 ps-9 pe-8 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none focus:border-[var(--accent)] focus:bg-[var(--card-bg)] transition-colors"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={clearLabel}
          className="w-6 h-6 rounded-md absolute end-1.5 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] cursor-pointer"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </form>
  )
}

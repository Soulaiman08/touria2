'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CustomSelectOption {
  value: string
  label: string
  swatch?: string
  keywords?: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: CustomSelectOption[]
  placeholder?: string
  disabled?: boolean
  hasError?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  noResultsText?: string
  ariaLabel?: string
  size?: 'sm' | 'md'
  variant?: 'card' | 'input'
  className?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '',
  disabled = false,
  hasError = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  noResultsText = 'No results',
  ariaLabel,
  size = 'md',
  variant = 'input',
  className,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const [menuMaxHeight, setMenuMaxHeight] = useState(224)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  )

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => {
      if (opt.label.toLowerCase().includes(q)) return true
      if (opt.keywords && opt.keywords.toLowerCase().includes(q)) return true
      return false
    })
  }, [options, searchQuery])

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false)
    setSearchQuery('')
    setActiveIndex(-1)
    if (restoreFocus) {
      triggerRef.current?.focus()
    }
  }

  const openMenu = () => {
    if (disabled) return

    if (containerRef.current && typeof window !== 'undefined') {
      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight
      const spaceBelow = Math.max(0, viewportHeight - rect.bottom - 12)
      const spaceAbove = Math.max(0, rect.top - 12)
      const searchChrome = searchable ? 54 : 8
      const desiredTotal = Math.min(options.length * 44 + searchChrome + 8, 340)
      const upward = spaceBelow < desiredTotal && spaceAbove > spaceBelow
      const available = upward ? spaceAbove : spaceBelow

      setOpenUpward(upward)
      setMenuMaxHeight(Math.max(132, Math.min(304, available - searchChrome)))
    }

    const currentIdx = options.findIndex((opt) => opt.value === value)
    setSearchQuery('')
    setActiveIndex(currentIdx >= 0 ? currentIdx : 0)
    setIsOpen(true)
  }

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu()
    } else {
      openMenu()
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeMenu()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu(true)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside, { passive: true })
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (searchable) {
      const isTouchDevice =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(pointer: coarse)').matches
      if (!isTouchDevice) {
        const timer = window.setTimeout(() => {
          searchInputRef.current?.focus()
        }, 20)
        return () => window.clearTimeout(timer)
      }
      return
    }
    const targetIdx = activeIndex >= 0 ? activeIndex : 0
    optionRefs.current[targetIdx]?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, searchable, activeIndex])

  const handleSelect = (nextValue: string) => {
    onChange(nextValue)
    closeMenu(true)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return

    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openMenu()
      }
      return
    }

    if (filteredOptions.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => {
        const next = prev < filteredOptions.length - 1 ? prev + 1 : 0
        optionRefs.current[next]?.scrollIntoView({ block: 'nearest' })
        return next
      })
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredOptions.length - 1
        optionRefs.current[next]?.scrollIntoView({ block: 'nearest' })
        return next
      })
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
      optionRefs.current[0]?.scrollIntoView({ block: 'nearest' })
    } else if (event.key === 'End') {
      event.preventDefault()
      const last = filteredOptions.length - 1
      setActiveIndex(last)
      optionRefs.current[last]?.scrollIntoView({ block: 'nearest' })
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0 && filteredOptions[activeIndex]) {
        event.preventDefault()
        handleSelect(filteredOptions[activeIndex].value)
      }
    }
  }

  const isCompact = size === 'sm'
  const triggerBg = variant === 'card' ? 'var(--card-bg)' : 'var(--input-bg)'
  const activeOptionId =
    isOpen && activeIndex >= 0 && filteredOptions[activeIndex]
      ? `${listboxId}-opt-${activeIndex}`
      : undefined

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={ariaLabel}
        className={cn(
          'w-full flex items-center justify-between gap-2 rounded-xl border transition-all duration-150 outline-none select-none text-start',
          isCompact ? 'h-10 px-3 text-xs sm:text-sm font-semibold' : 'h-11 px-3.5 sm:px-4 text-sm font-medium',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--border-strong)]',
          isOpen && !hasError ? 'ring-2 ring-[var(--accent-ring)]' : ''
        )}
        style={{
          background: triggerBg,
          borderColor: hasError
            ? 'var(--error)'
            : isOpen
              ? 'var(--accent)'
              : 'var(--border)',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
        }}
      >
        <span className="min-w-0 flex-1 flex items-center gap-2">
          {selectedOption?.swatch && (
            <span
              aria-hidden="true"
              className="w-4 h-4 rounded-full border flex-shrink-0 shadow-2xs"
              style={{
                background: selectedOption.swatch,
                borderColor: 'var(--border-strong)',
              }}
            />
          )}
          <span className="min-w-0 flex-1 truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'h-4 w-4 flex-shrink-0 transition-transform duration-200',
            isOpen ? 'rotate-180 text-[var(--accent)]' : 'text-[var(--text-muted)] opacity-80'
          )}
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-activedescendant={activeOptionId}
          aria-label={ariaLabel}
          className={cn(
            'absolute z-50 start-0 w-full min-w-[8.5rem] rounded-xl border overflow-hidden animate-fade-in',
            openUpward ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'
          )}
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--border-strong)',
            boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.35)',
          }}
        >
          {searchable && (
            <div
              className="p-2 border-b"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-subtle)',
              }}
            >
              <div className="relative flex items-center">
                <Search
                  aria-hidden="true"
                  className="w-3.5 h-3.5 absolute start-2.5 text-[var(--text-muted)] pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setActiveIndex(0)
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full h-9 ps-8 pe-8 rounded-lg border text-base sm:text-xs font-medium outline-none transition-colors focus:border-[var(--accent)]"
                  style={{
                    background: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setActiveIndex(0)
                      searchInputRef.current?.focus()
                    }}
                    aria-label="Clear search"
                    className="absolute end-1.5 w-6 h-6 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            className="overflow-y-auto overscroll-contain no-scrollbar py-1"
            style={{ maxHeight: `${menuMaxHeight}px` }}
          >
            {filteredOptions.length === 0 ? (
              <div
                className="px-3.5 py-3 text-center text-xs font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {noResultsText}
              </div>
            ) : (
              filteredOptions.map((option, idx) => {
                const isSelected = option.value === value
                const isActive = idx === activeIndex
                return (
                  <button
                    key={option.value}
                    id={`${listboxId}-opt-${idx}`}
                    ref={(el) => {
                      optionRefs.current[idx] = el
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'w-full min-h-[44px] sm:min-h-[40px] flex items-center justify-between gap-2.5 text-start transition-colors cursor-pointer',
                      isCompact
                        ? 'px-3 py-2 text-sm font-semibold'
                        : 'px-3.5 py-2.5 text-sm font-medium',
                      isSelected
                        ? 'bg-[var(--accent-light)] text-[var(--accent)] font-bold'
                        : isActive
                          ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                    )}
                  >
                    <span className="min-w-0 flex-1 flex items-center gap-2">
                      {option.swatch && (
                        <span
                          aria-hidden="true"
                          className="w-4 h-4 rounded-full border flex-shrink-0"
                          style={{
                            background: option.swatch,
                            borderColor: 'var(--border-strong)',
                          }}
                        />
                      )}
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-[var(--accent)] flex-shrink-0" aria-hidden="true" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

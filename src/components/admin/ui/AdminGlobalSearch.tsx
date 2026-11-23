'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Search,
  X,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { useAdminI18n } from '../providers/AdminI18nContext'

interface SearchProduct {
  id: string
  name: string
  nameAr?: string
  nameFr?: string
  nameEn?: string
  sku: string
  price: number
  stock: number
  image?: string
  href: string
}

interface SearchOrder {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  total: number
  status: string
  createdAt: string
  href: string
}

interface SearchCustomer {
  id: string
  name: string
  phone: string
  email?: string
  city?: string
  href: string
}

interface SearchCategory {
  id: string
  slug: string
  name: string
  href: string
}

interface SearchResults {
  products: SearchProduct[]
  orders: SearchOrder[]
  customers: SearchCustomer[]
  categories: SearchCategory[]
}

export function AdminGlobalSearch() {
  const { tr, statusLabel, isRTL, locale, dir } = useAdminI18n()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [, startTransition] = useTransition()

  const inputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = document.activeElement?.tagName
      const isInputFocused = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      if (
        (e.key === '/' && !isInputFocused) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault()
        if (window.innerWidth < 640) {
          setMobileModalOpen(true)
          setTimeout(() => mobileInputRef.current?.focus(), 60)
        } else {
          inputRef.current?.focus()
          setOpen(true)
        }
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setMobileModalOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) return

    let active = true
    const timeout = setTimeout(async () => {
      if (active) setLoading(true)
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`)
        if (res.ok && active) {
          const data = (await res.json()) as SearchResults
          startTransition(() => {
            setResults(data)
          })
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        if (active) setLoading(false)
      }
    }, 200)

    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [query])

  const updateQuery = (nextVal: string) => {
    setQuery(nextVal)
    if (!nextVal.trim()) {
      setResults(null)
      setLoading(false)
    }
  }

  const handleSelect = (href: string) => {
    setOpen(false)
    setMobileModalOpen(false)
    setQuery('')
    setResults(null)
    router.push(href)
  }

  const hasResults =
    results &&
    (results.products.length > 0 ||
      results.orders.length > 0 ||
      results.customers.length > 0 ||
      results.categories.length > 0)

  const isSearching = query.trim().length > 0
  const placeholderText = tr(
    'ابحث عن منتج، طلب، عميل...',
    'Search products, orders, customers...'
  )

  const renderResultsList = () => {
    if (loading && !results) {
      return (
        <div className="py-9 px-5 text-center text-zinc-400">
          <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin text-amber-400" />
          <p className="text-xs font-medium">{tr('جاري البحث في المتجر...', 'Searching store database...')}</p>
        </div>
      )
    }

    if (isSearching && !loading && !hasResults) {
      return (
        <div className="py-9 px-5 text-center text-zinc-400">
          <Search className="w-6 h-6 mx-auto mb-2 opacity-35" />
          <p className="text-sm font-bold text-zinc-200 mb-1">
            {tr(`لا توجد نتائج لـ "${query}"`, `No results found for "${query}"`)}
          </p>
          <p className="text-xs text-zinc-500">
            {tr(
              'جرّب البحث باسم المنتج، الرمز SKU، رقم الطلب أو هاتف العميل',
              'Try searching by product name, SKU, order number, customer name or phone'
            )}
          </p>
        </div>
      )
    }

    if (!hasResults) return null

    return (
      <div className="flex flex-col gap-4 p-3">
        {/* Products */}
        {results!.products.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-amber-400 tracking-wide uppercase">
              <Package className="w-3.5 h-3.5 shrink-0" />
              <span>
                {tr('المنتجات', 'Products')} ({results!.products.length})
              </span>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {results!.products.map((p) => {
                const displayName =
                  locale === 'ar'
                    ? p.nameAr || p.name
                    : p.nameEn || p.nameFr || p.name
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p.href)}
                    className="w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl bg-zinc-800/35 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/25 transition-colors text-start cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={displayName}
                          width={96}
                          height={96}
                          quality={92}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-zinc-700/80 bg-zinc-900"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-zinc-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-zinc-100 truncate">{displayName}</p>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          <span className="font-mono">SKU: {p.sku}</span>
                          <span className="mx-1.5 text-zinc-600">·</span>
                          <span className={p.stock <= 3 ? 'text-amber-400 font-semibold' : 'text-zinc-400'}>
                            {tr('المخزون:', 'Stock:')} {p.stock}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-amber-400 font-mono tabular-nums shrink-0">
                      {p.price} MAD
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Orders */}
        {results!.orders.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-sky-400 tracking-wide uppercase">
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>
                {tr('الطلبات', 'Orders')} ({results!.orders.length})
              </span>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {results!.orders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => handleSelect(o.href)}
                  className="w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl bg-zinc-800/35 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/25 transition-colors text-start cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-zinc-100 truncate">
                      <span className="text-sky-400 font-mono">#{o.orderNumber}</span>
                      <span className="mx-1.5 text-zinc-600">—</span>
                      <span>{o.customerName}</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      <span className="font-mono">{o.customerPhone}</span>
                      <span className="mx-1.5 text-zinc-600">·</span>
                      <span>{statusLabel(o.status)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-extrabold text-zinc-100 font-mono tabular-nums">
                      {o.total} MAD
                    </span>
                    <ArrowIcon className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Customers */}
        {results!.customers.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-emerald-400 tracking-wide uppercase">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>
                {tr('العملاء', 'Customers')} ({results!.customers.length})
              </span>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {results!.customers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c.href)}
                  className="w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl bg-zinc-800/35 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/25 transition-colors text-start cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-zinc-100 truncate">{c.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                      {c.phone}
                      {c.city ? ` · ${c.city}` : ''}
                    </p>
                  </div>
                  <ArrowIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {results!.categories.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-purple-400 tracking-wide uppercase">
              <FolderTree className="w-3.5 h-3.5 shrink-0" />
              <span>
                {tr('التصنيفات', 'Categories')} ({results!.categories.length})
              </span>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {results!.categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelect(cat.href)}
                  className="w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl bg-zinc-800/35 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/25 transition-colors text-start cursor-pointer"
                >
                  <p className="text-[13px] font-bold text-zinc-100 truncate">{cat.name}</p>
                  <ArrowIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div ref={containerRef} className="relative flex items-center sm:w-[clamp(210px,26vw,340px)]">
        {/* Mobile Trigger (< 640px) */}
        <button
          type="button"
          onClick={() => {
            setMobileModalOpen(true)
            setTimeout(() => mobileInputRef.current?.focus(), 60)
          }}
          aria-label={tr('بحث سريع', 'Quick search')}
          className="sm:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-900 text-zinc-300 hover:text-amber-400 hover:border-zinc-600 transition-colors cursor-pointer shrink-0"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Desktop Input (>= 640px) */}
        <div
          className={`hidden sm:flex items-center gap-2 w-full h-10 rounded-xl border px-3 transition-colors ${
            open
              ? 'bg-zinc-950 border-amber-500/70 ring-2 ring-amber-500/20'
              : 'bg-zinc-900/90 border-zinc-700/80 hover:border-zinc-600 focus-within:bg-zinc-950 focus-within:border-amber-500/70 focus-within:ring-2 focus-within:ring-amber-500/20'
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
          ) : (
            <Search
              className={`w-4 h-4 shrink-0 transition-colors ${
                open ? 'text-amber-400' : 'text-zinc-500'
              }`}
            />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              updateQuery(e.target.value)
              if (!open) setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholderText}
            aria-label={placeholderText}
            className="w-full h-full bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 text-xs font-medium text-zinc-100 placeholder:text-zinc-500 min-w-0"
          />

          {query ? (
            <button
              type="button"
              onClick={() => {
                updateQuery('')
                inputRef.current?.focus()
              }}
              aria-label={tr('مسح البحث', 'Clear search')}
              className="w-6 h-6 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="inline-flex items-center justify-center w-5 h-5 text-[11px] leading-none font-bold text-zinc-400 bg-zinc-800/90 border border-zinc-700 rounded-md font-mono shrink-0">
              /
            </kbd>
          )}
        </div>

        {/* Desktop Dropdown Results */}
        {open && isSearching && (
          <div className="hidden sm:block absolute top-[calc(100%+8px)] start-0 w-[min(440px,85vw)] max-h-[460px] bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl z-50 overflow-y-auto admin-scroll animate-in fade-in duration-200">
            {renderResultsList()}
          </div>
        )}
      </div>

      {/* Mobile Search Modal */}
      {mobileModalOpen && (
        <div
          dir={dir}
          role="dialog"
          aria-modal="true"
          aria-label={tr('البحث في لوحة التحكم', 'Search Admin Panel')}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-700/80 focus-within:border-amber-500/70 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-2xl px-3.5 h-12 mb-3 shrink-0 transition-colors">
            {loading ? (
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <input
              ref={mobileInputRef}
              type="text"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder={placeholderText}
              aria-label={placeholderText}
              className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 text-sm text-zinc-100 placeholder:text-zinc-500 min-w-0"
            />
            <button
              type="button"
              onClick={() => {
                setMobileModalOpen(false)
                updateQuery('')
              }}
              aria-label={tr('إغلاق البحث', 'Close search')}
              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-y-auto admin-scroll">
            {renderResultsList() || (
              <div className="py-12 px-6 text-center text-zinc-500 text-xs">
                {tr(
                  'ابدأ بالكتابة للبحث في المنتجات، الطلبات، العملاء أو التصنيفات.',
                  'Start typing to search products, orders, customers, or categories.'
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

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
  Sparkles,
} from 'lucide-react'

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

  // Global shortcut `/` or `Ctrl+K` / `Cmd+K`
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault()
        if (window.innerWidth < 768) {
          setMobileModalOpen(true)
          setTimeout(() => mobileInputRef.current?.focus(), 50)
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

  // Close desktop dropdown on outside click
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

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`)
        if (res.ok) {
          const data = (await res.json()) as SearchResults
          startTransition(() => {
            setResults(data)
          })
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timeout)
  }, [query])

  const handleSelect = (href: string) => {
    setOpen(false)
    setMobileModalOpen(false)
    setQuery('')
    router.push(href)
  }

  const hasResults =
    results &&
    (results.products.length > 0 ||
      results.orders.length > 0 ||
      results.customers.length > 0 ||
      results.categories.length > 0)

  const isSearching = query.trim().length > 0

  const renderResultsList = () => {
    if (loading && !results) {
      return (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#71717a' }}>
          <Loader2 style={{ width: 22, height: 22, margin: '0 auto 8px', animation: 'spin 1s linear infinite', color: '#fbbf24' }} />
          <p style={{ fontSize: 12, margin: 0 }}>Searching store database...</p>
        </div>
      )
    }

    if (isSearching && !loading && !hasResults) {
      return (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#71717a' }}>
          <Search style={{ width: 24, height: 24, margin: '0 auto 8px', opacity: 0.3 }} />
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px', color: '#a1a1aa' }}>No results found for &ldquo;{query}&rdquo;</p>
          <p style={{ fontSize: 11, margin: 0 }}>Try searching by product name, SKU, order number, customer name or phone</p>
        </div>
      )
    }

    if (!hasResults) return null

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '12px' }}>
        {/* Products */}
        {results!.products.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 11, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Package style={{ width: 13, height: 13 }} />
              <span>Products ({results!.products.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {results!.products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: 'rgba(63,63,70,0.2)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(63,63,70,0.2)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    {p.image ? (
                      <Image src={p.image} alt={p.name} width={34} height={34} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-zinc-800" />
                    ) : (
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(63,63,70,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package style={{ width: 16, height: 16, color: '#71717a' }} />
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: '#f4f4f5', margin: 0 }} className="truncate">
                        {p.name}
                      </p>
                      <p style={{ fontSize: 11, color: '#71717a', margin: 0 }}>
                        SKU: <span style={{ fontFamily: 'monospace' }}>{p.sku}</span> • Stock: <span style={{ color: p.stock <= 3 ? '#fbbf24' : '#a1a1aa' }}>{p.stock}</span>
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 900, color: '#fbbf24', fontFamily: 'monospace', flexShrink: 0, marginLeft: 8 }}>
                    {p.price} MAD
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {results!.orders.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 11, fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <ShoppingBag style={{ width: 13, height: 13 }} />
              <span>Orders ({results!.orders.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {results!.orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => handleSelect(o.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: 'rgba(63,63,70,0.2)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(96,165,250,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(63,63,70,0.2)' }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 800, color: '#f4f4f5', margin: 0 }}>
                      <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>#{o.orderNumber}</span> — {o.customerName}
                    </p>
                    <p style={{ fontSize: 11, color: '#71717a', margin: 0 }}>
                      {o.customerPhone} • <span style={{ textTransform: 'capitalize' }}>{o.status.toLowerCase()}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 900, color: '#f4f4f5', fontFamily: 'monospace' }}>
                      {o.total} MAD
                    </span>
                    <ArrowRight style={{ width: 12, height: 12, color: '#71717a' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customers */}
        {results!.customers.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 11, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Users style={{ width: 13, height: 13 }} />
              <span>Customers ({results!.customers.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {results!.customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: 'rgba(63,63,70,0.2)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(52,211,153,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(63,63,70,0.2)' }}
                >
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: '#f4f4f5', margin: 0 }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: '#71717a', margin: 0 }}>{c.phone} {c.city ? `• ${c.city}` : ''}</p>
                  </div>
                  <ArrowRight style={{ width: 12, height: 12, color: '#71717a' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {results!.categories.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 11, fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <FolderTree style={{ width: 13, height: 13 }} />
              <span>Categories ({results!.categories.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {results!.categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleSelect(cat.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: 'rgba(63,63,70,0.2)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(192,132,252,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(63,63,70,0.2)' }}
                >
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: '#f4f4f5', margin: 0 }}>{cat.name}</p>
                  <ArrowRight style={{ width: 12, height: 12, color: '#71717a' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* ── Search Bar (Desktop + triggers modal on mobile) ── */}
      <div ref={containerRef} style={{ position: 'relative', width: 'clamp(150px, 28vw, 360px)' }}>
        <div
          onClick={() => {
            // On mobile viewports the input is hidden — open the full modal instead
            if (typeof window !== 'undefined' && window.innerWidth < 640) {
              setMobileModalOpen(true)
              setTimeout(() => mobileInputRef.current?.focus(), 80)
              return
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: open ? 'rgb(9,9,11)' : 'rgba(63,63,70,0.4)',
            border: open ? '1px solid #fbbf24' : '1px solid rgba(63,63,70,0.6)',
            borderRadius: 12,
            padding: '7px 12px',
            transition: 'all 0.15s',
            cursor: 'text',
          }}
        >
          {loading ? (
            <Loader2 style={{ width: 14, height: 14, color: '#fbbf24', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          ) : (
            <Search style={{ width: 14, height: 14, color: open ? '#fbbf24' : '#71717a', flexShrink: 0 }} />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!open) setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search products, orders, customers..."
            className="hidden sm:block"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 12,
              color: '#f4f4f5',
            }}
          />

          {query ? (
            <button
              onClick={() => {
                setQuery('')
                setResults(null)
                inputRef.current?.focus()
              }}
              style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 2, display: 'flex' }}
            >
              <X style={{ width: 13, height: 13 }} />
            </button>
          ) : (
            <kbd
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#71717a',
                background: 'rgba(63,63,70,0.5)',
                border: '1px solid rgba(63,63,70,0.8)',
                borderRadius: 6,
                padding: '2px 5px',
                fontFamily: 'monospace',
                flexShrink: 0,
              }}
            >
              /
            </kbd>
          )}
        </div>

        {/* Dropdown Results */}
        {open && isSearching && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              maxHeight: 460,
              background: 'rgb(24,24,27)',
              border: '1px solid rgba(63,63,70,0.8)',
              borderRadius: 16,
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              zIndex: 50,
              overflowY: 'auto',
              animation: 'fadeIn 0.15s ease',
            }}
          >
            {renderResultsList()}
          </div>
        )}
      </div>

      {/* ── Mobile Modal Overlay ── */}
      {mobileModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {/* Top Search Input Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgb(24,24,27)',
              border: '1px solid rgba(245,158,11,0.5)',
              borderRadius: 14,
              padding: '10px 14px',
              marginBottom: 12,
            }}
          >
            {loading ? (
              <Loader2 style={{ width: 18, height: 18, color: '#fbbf24', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Search style={{ width: 18, height: 18, color: '#fbbf24' }} />
            )}
            <input
              ref={mobileInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, orders, customers..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 14,
                color: '#fff',
              }}
            />
            <button
              onClick={() => {
                setMobileModalOpen(false)
                setQuery('')
                setResults(null)
              }}
              style={{
                background: 'rgba(63,63,70,0.5)',
                border: 'none',
                color: '#fff',
                borderRadius: 8,
                padding: 6,
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Results Area */}
          <div
            style={{
              flex: 1,
              background: 'rgb(24,24,27)',
              border: '1px solid rgba(63,63,70,0.8)',
              borderRadius: 16,
              overflowY: 'auto',
            }}
          >
            {renderResultsList()}
          </div>
        </div>
      )}
    </>
  )
}

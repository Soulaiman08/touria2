'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ShoppingBag, Menu, X, Search } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import type { ProductCard } from '@/types/product'

interface HeaderProps { locale: string }

const NAV_LINKS = (locale: string, t: (k: string) => string) => [
  { href: `/${locale}`,                          label: t('home') },
  { href: `/${locale}/products`,                 label: t('djellabas') },
  { href: `/${locale}/products?category=niqabs`, label: t('niqabs') },
  { href: `/${locale}/about`,                    label: t('about') },
]

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav')
  const cartStore = useCartStore()
  const totalItems = cartStore.items.reduce((s, i) => s + i.quantity, 0)
  const isRTL = locale === 'ar'

  const [scrolled,   setScrolled]   = useState(false)
  const [mounted,    setMounted]    = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ,    setSearchQ]    = useState('')
  const [searchRes,  setSearchRes]  = useState<ProductCard[]>([])
  const [searching,  setSearching]  = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  /* Set mounted state — deferred to avoid synchronous setState-in-effect */
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(t)
  }, [])

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Keyboard shortcut Ctrl/⌘+K */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); setSearchOpen(true)
      }
      if (e.key === 'Escape') { setSearchOpen(false); setSearchQ('') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* Auto-focus search input */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 60)
  }, [searchOpen])

  /* Debounced search */
  useEffect(() => {
    // Clear results immediately when query is empty (no state set synchronously inside effect)
    const timer = setTimeout(async () => {
      if (!searchQ.trim()) {
        setSearchRes([])
        return
      }
      setSearching(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQ)}&limit=5`)
        const data = await res.json()
        setSearchRes((data.items as ProductCard[]) ?? [])
      } catch {
        setSearchRes([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQ])

  const links = NAV_LINKS(locale, t)

  return (
    <>
      {/* ── Top Info Bar ─────────────────────────────────── */}
      <div
        className="w-full text-center py-2 px-4 text-xs font-medium hidden sm:block"
        style={{ background: 'var(--accent)', color: '#fff' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <span className="opacity-90">✦</span>
        {' '}
        نوفر لكم نقاب مغربي وجلابة مخزنية بقب كبير للمنقبات وبقب صغير لغير المنقبات
        {' '}
        <span className="opacity-90">✦</span>
      </div>

      {/* ── Main Header ──────────────────────────────────── */}
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          scrolled ? 'header-scrolled' : '',
        )}
        style={{
          background: 'var(--header-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${scrolled ? 'var(--header-border)' : 'transparent'}`,
        }}
        role="banner"
      >
        <div className="container-brand">
          <div
            className={cn(
              'flex items-center gap-4 sm:gap-6 transition-all duration-300',
              scrolled ? 'h-14' : 'h-16 md:h-[68px]',
            )}
            dir="ltr"
          >
            {/* Logo */}
            <Link href={`/${locale}`} aria-label={siteConfig.name} className="flex-shrink-0">
              <Image
                src="/images/brand/logo-full.png"
                alt={siteConfig.name}
                width={120} height={48} priority
                className={cn(
                  'w-auto object-contain transition-all duration-300 hidden sm:block',
                  scrolled ? 'h-9' : 'h-11',
                )}
              />
              <Image
                src="/images/brand/logo-icon.png"
                alt={siteConfig.name}
                width={36} height={36} priority
                className="sm:hidden h-9 w-9 object-contain"
              />
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden md:flex items-center gap-1.5 ms-2"
              aria-label={isRTL ? 'التنقل الرئيسي' : 'Main navigation'}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {links.map(l => (
                <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
              ))}
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Inline Search Bar (desktop) */}
            <div className="hidden lg:flex items-center relative">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 h-9 px-3.5 rounded-lg border text-sm transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)', color: 'var(--text-muted)', minWidth: 200 }}
              >
                <Search className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="flex-1 text-start">{isRTL ? 'بحث...' : locale === 'fr' ? 'Rechercher...' : 'Search...'}</span>
                <kbd className="text-[10px] border rounded px-1 opacity-50" style={{ borderColor: 'var(--border)' }}>⌘K</kbd>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3" dir="ltr">
              {/* Mobile Search */}
              <button
                className="icon-btn lg:hidden touch-target"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              <ThemeSwitcher />
              <LanguageSwitcher locale={locale} />

              {/* Cart */}
              <button
                id="cart-toggle-btn"
                onClick={cartStore.toggleCart}
                className="icon-btn touch-target relative"
                aria-label={t('cart')}
              >
                <ShoppingBag className="w-[18px] h-[18px]" />
                {mounted && totalItems > 0 && (
                  <span
                    className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] text-[10px] font-bold text-white rounded-full flex items-center justify-center px-0.5 animate-bounce-in"
                    style={{ background: 'var(--accent)' }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="icon-btn md:hidden touch-target"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Nav Drawer ── */}
        {mobileOpen && (
          <div
            className="md:hidden border-t animate-fade-in-down"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <nav className="container-brand py-3 flex flex-col gap-0.5">
              {links.map(l => (
                <Link
                  key={l.href} href={l.href}
                  className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ── Search Overlay ─────────────────────────────────── */}
      {searchOpen && (
        <div
          className="search-overlay animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) { setSearchOpen(false); setSearchQ('') } }}
        >
          <div className="search-panel animate-fade-in-down w-full">
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                ref={searchRef}
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder={isRTL ? 'ابحثي عن منتج...' : locale === 'fr' ? 'Rechercher un produit...' : 'Search for a product...'}
                className="flex-1 bg-transparent text-base outline-none"
                style={{ color: 'var(--text-primary)' }}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {searchQ && (
                <button onClick={() => setSearchQ('')} className="icon-btn btn-sm" aria-label="Clear search">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => { setSearchOpen(false); setSearchQ('') }}
                className="p-2 rounded-lg border text-xs font-semibold sm:hidden hover:bg-[var(--accent-light)] transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
              <kbd
                onClick={() => { setSearchOpen(false); setSearchQ('') }}
                className="text-xs border rounded px-1.5 py-0.5 cursor-pointer hover:bg-[var(--accent-light)] hidden sm:block"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                Esc
              </kbd>
            </div>

            {/* Search Results */}
            <div className="max-h-[60vh] sm:max-h-[420px] overflow-y-auto">
              {searching ? (
                <div className="p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  <div className="inline-block w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : searchRes.length > 0 ? (
                searchRes.map((p) => (
                  <Link
                    key={p.id}
                    href={`/${locale}/products/${p.slug}`}
                    onClick={() => { setSearchOpen(false); setSearchQ('') }}
                    className="flex items-center gap-3 px-4 py-3 border-b transition-colors hover:bg-[var(--accent-light)]"
                    style={{ borderColor: 'var(--border-subtle)' }}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--bg-muted)] relative">
                      <Image src={p.mainImage || '/images/brand/logo-icon.png'} alt={p.nameFr} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {locale === 'ar' ? p.nameAr : locale === 'fr' ? p.nameFr : p.nameEn}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>
                        {p.salePrice
                          ? `${p.salePrice} د.م.`
                          : `${p.basePrice} د.م.`}
                      </p>
                    </div>
                  </Link>
                ))
              ) : searchQ.trim() ? (
                <div className="p-8 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {isRTL ? 'لا توجد نتائج' : 'No results found'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {isRTL ? `لا يوجد منتج يطابق "${searchQ}"` : `No product matched "${searchQ}"`}
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center text-xs" style={{ color: 'var(--text-muted)' }} dir={isRTL ? 'rtl' : 'ltr'}>
                  {isRTL ? 'اكتبي اسم المنتج للبحث...' : 'Type to search products...'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  Home,
  Package,
  Tag,
  Info,
  Phone,
  Globe,
  MessageCircle,
  ArrowRight,
  User,
  Camera,
  Share2,
  Music2,
} from 'lucide-react'

import { useCartStore } from '@/store/cart.store'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useCustomerAuth } from '@/components/providers/CustomerAuthProvider'
import { siteConfig } from '@/config/site'
import { cn, formatPrice } from '@/lib/utils'
import type { ProductCard } from '@/types/product'

interface HeaderProps {
  locale: string
}

interface MenuItem {
  href: string
  label: string
  icon: React.ElementType
}

interface StoreSettings {
  storeName?: string
  logo?: string
  currency?: string
  shippingCost?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  whatsapp?: string
}

const emptySubscribe = () => () => {}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const cartItems = useCartStore((state) => state.items)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const { customer } = useCustomerAuth()
  const pathname = usePathname()

  const isRTL = locale === 'ar'
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchRes, setSearchRes] = useState<ProductCard[]>([])
  const [searching, setSearching] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const searchRef = useRef<HTMLInputElement | null>(null)
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null)

  useEffect(() => {
    let isMounted = true
    async function loadStoreSettings() {
      try {
        const response = await fetch('/api/settings', {
          method: 'GET',
          cache: 'no-store',
        })
        if (!response.ok) return
        const data = await response.json()
        if (isMounted && data?.settings) {
          setStoreSettings(data.settings)
        }
      } catch {
        // Fallback cleanly to siteConfig
      }
    }
    loadStoreSettings()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setSearchQ('')
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!searchOpen) return
    const timer = setTimeout(() => {
      searchRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [searchOpen])

  useEffect(() => {
    const timer = setTimeout(async () => {
      const query = searchQ.trim()
      if (!query) {
        setSearchRes([])
        setSearching(false)
        return
      }
      setSearching(true)
      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(query)}&limit=5`
        )
        if (!response.ok) throw new Error('Search failed')
        const data = await response.json()
        setSearchRes(Array.isArray(data.items) ? (data.items as ProductCard[]) : [])
      } catch {
        setSearchRes([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQ])

  const links = [
    {
      href: `/${locale}`,
      label: locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home',
    },
    {
      href: `/${locale}/products`,
      label: locale === 'ar' ? 'المنتجات' : locale === 'fr' ? 'Produits' : 'Products',
    },
    {
      href: `/${locale}/orders`,
      label: locale === 'ar' ? 'طلباتي' : locale === 'fr' ? 'Mes commandes' : 'My Orders',
    },
    {
      href: `/${locale}/about`,
      label: locale === 'ar' ? 'من نحن' : locale === 'fr' ? 'À propos' : 'About Us',
    },
    {
      href: `/${locale}#contact`,
      label: locale === 'ar' ? 'اتصل بنا' : locale === 'fr' ? 'Contact' : 'Contact',
    },
  ]

  const menuItems: MenuItem[] = [
    {
      href: `/${locale}`,
      label: locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home',
      icon: Home,
    },
    {
      href: `/${locale}/products`,
      label: locale === 'ar' ? 'المنتجات' : locale === 'fr' ? 'Produits' : 'Products',
      icon: Package,
    },
    {
      href: `/${locale}/products?sort=sale`,
      label: locale === 'ar' ? 'العروض' : locale === 'fr' ? 'Offres' : 'Offers',
      icon: Tag,
    },
    {
      href: `/${locale}/orders`,
      label: locale === 'ar' ? 'طلباتي' : locale === 'fr' ? 'Mes commandes' : 'My Orders',
      icon: ShoppingBag,
    },
    {
      href: `/${locale}/about`,
      label: locale === 'ar' ? 'من نحن' : locale === 'fr' ? 'À propos' : 'About Us',
      icon: Info,
    },
    {
      href: `/${locale}#contact`,
      label: locale === 'ar' ? 'اتصل بنا' : locale === 'fr' ? 'Contact' : 'Contact',
      icon: Phone,
    },
  ]

  const closeMenu = () => setMenuOpen(false)
  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQ('')
  }

  const instagramUrl = storeSettings?.instagram?.trim() || ''
  const facebookUrl = storeSettings?.facebook?.trim() || ''
  const tiktokUrl = storeSettings?.tiktok?.trim() || ''
  const whatsappValue = storeSettings?.whatsapp?.trim() || ''

  const whatsappUrl = whatsappValue
    ? whatsappValue.startsWith('http')
      ? whatsappValue
      : `https://wa.me/${whatsappValue.replace(/[^0-9]/g, '')}`
    : ''

  const brandName =
    storeSettings?.storeName?.trim() ||
    (locale === 'ar' ? siteConfig.name : siteConfig.nameEn)

  const resolvedLogo = !logoError && storeSettings?.logo?.trim()
    ? storeSettings.logo.trim()
    : '/images/brand/logo-icon.png'

  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/signup')
  if (isAuthPage) return null

  return (
    <>
      <header
        className={cn(
          'storefront-header sticky top-0 z-50 w-full transition-all duration-300',
          scrolled ? 'header-scrolled' : ''
        )}
        style={{
          background: 'var(--header-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--header-border)',
        }}
        role="banner"
      >
        <div className="container-brand">
          <div
            className={cn(
              'flex items-center justify-between gap-3 sm:gap-5 transition-all duration-300',
              scrolled ? 'h-14' : 'h-16 md:h-[68px]'
            )}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Left / Start Zone: Menu Toggle + Brand Lockup */}
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
              <button
                type="button"
                className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 hover:border-[var(--accent)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)] active:scale-95"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label={
                  menuOpen
                    ? isRTL ? 'إغلاق القائمة' : 'Close menu'
                    : isRTL ? 'فتح القائمة' : 'Open menu'
                }
                aria-expanded={menuOpen}
                aria-controls="main-side-menu"
                style={{
                  color: 'var(--text-primary)',
                  background: 'var(--bg-subtle)',
                  borderColor: 'var(--border)',
                }}
              >
                {menuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
              </button>

              <Link
                href={`/${locale}`}
                aria-label={brandName}
                onClick={closeMenu}
                className="flex items-center gap-2 sm:gap-2.5 min-w-0 group focus:outline-none"
              >
                <div
                  className="relative h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 overflow-hidden rounded-xl border transition-transform duration-200 group-hover:scale-[1.03]"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--bg-subtle)',
                  }}
                >
                  <Image
                    src={resolvedLogo}
                    alt={brandName}
                    fill
                    sizes="40px"
                    priority
                    className="object-cover"
                    onError={() => setLogoError(true)}
                  />
                </div>
                <span
                  className="inline-block truncate max-w-[88px] sm:max-w-none text-[13px] sm:text-base md:text-lg font-bold tracking-tight whitespace-nowrap"
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                  }}
                >
                  {brandName}
                </span>
              </Link>
            </div>

            {/* Center Zone: Clean Single-Line Navigation */}
            <nav
              className="hidden lg:flex items-center gap-6"
              aria-label={isRTL ? 'التنقل الرئيسي' : 'Main navigation'}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== `/${locale}` && !link.href.includes('#') && pathname?.startsWith(link.href))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn('nav-link whitespace-nowrap shrink-0', isActive && 'active')}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* End Zone: Action Controls */}
            <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0" dir="ltr">
              <button
                type="button"
                className="icon-btn touch-target"
                onClick={() => setSearchOpen(true)}
                aria-label={t('search')}
              >
                <Search className="h-[18px] w-[18px]" />
              </button>

              <ThemeSwitcher />

              <LanguageSwitcher locale={locale} />

              <button
                id="cart-toggle-btn"
                type="button"
                onClick={toggleCart}
                className="icon-btn touch-target relative"
                aria-label={t('cart')}
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {mounted && totalItems > 0 && (
                  <span
                    className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white tabular-nums"
                    style={{ background: 'var(--accent)' }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          SIDE MENU OVERLAY
      ===================================================== */}
      <div
        className={cn(
          'fixed inset-0 z-[60] transition-[visibility] duration-300',
          menuOpen ? 'visible' : 'invisible pointer-events-none'
        )}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          aria-label={isRTL ? 'إغلاق القائمة' : 'Close menu'}
          onClick={closeMenu}
          className={cn(
            'absolute inset-0 h-full w-full border-0 p-0 cursor-default bg-black/45 backdrop-blur-[2px] transition-opacity duration-300',
            menuOpen ? 'opacity-100' : 'opacity-0'
          )}
        />

        <aside
          id="main-side-menu"
          className={cn(
            'scrollbar-hidden absolute top-0 h-full w-[280px] overflow-y-auto shadow-2xl transition-transform duration-300 ease-out flex flex-col',
            isRTL ? 'right-0' : 'left-0',
            isRTL
              ? menuOpen ? 'translate-x-0' : 'translate-x-full'
              : menuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            borderLeft: isRTL ? '1px solid var(--border)' : undefined,
            borderRight: !isRTL ? '1px solid var(--border)' : undefined,
          }}
          dir={isRTL ? 'rtl' : 'ltr'}
          onClick={(event) => event.stopPropagation()}
        >
          {/* Drawer Header */}
          <div
            className="flex items-center justify-between px-4 py-4 mx-3 mt-2 mb-3 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <Link
              href={`/${locale}`}
              onClick={closeMenu}
              className="flex items-center gap-2.5 min-w-0 no-underline"
            >
              <div
                className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border"
                style={{
                  background: 'var(--bg-subtle)',
                  borderColor: 'var(--border)',
                }}
              >
                <Image
                  src={resolvedLogo}
                  alt={brandName}
                  fill
                  sizes="40px"
                  className="object-cover"
                  onError={() => setLogoError(true)}
                />
              </div>

              <div className="min-w-0">
                <div
                  className="truncate text-sm font-bold leading-tight"
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                  }}
                >
                  {brandName}
                </div>
                <div
                  className="mt-0.5 text-[11px] font-medium"
                  style={{ color: 'var(--gold)' }}
                >
                  {locale === 'ar' ? 'القائمة الرئيسية' : locale === 'fr' ? 'Menu principal' : 'Main Menu'}
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={closeMenu}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
              aria-label={isRTL ? 'إغلاق القائمة' : 'Close menu'}
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Navigation */}
          <nav className="flex flex-col gap-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== `/${locale}` && !item.href.includes('?') && !item.href.includes('#') && pathname?.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 min-h-[42px] text-[13px] font-semibold no-underline transition-colors"
                  style={{
                    background: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  }}
                >
                  <Icon
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: isActive ? '#FFFFFF' : 'var(--text-muted)' }}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Customer Account / Sign In */}
          <div className="mx-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {customer ? (
              <Link
                href={`/${locale}/account`}
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 min-h-[46px] text-[13px] font-semibold no-underline border transition-colors hover:border-[var(--accent)]"
                style={{
                  background: 'var(--accent-light)',
                  borderColor: 'var(--accent-ring)',
                  color: 'var(--text-primary)',
                }}
              >
                {customer.avatarUrl ? (
                  <Image
                    src={customer.avatarUrl}
                    alt={customer.name || 'Avatar'}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover border flex-shrink-0"
                    style={{ borderColor: 'var(--gold)' }}
                  />
                ) : (
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: 'var(--accent)' }}
                  >
                    {customer.name ? customer.name.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-bold" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'ar' ? 'حسابي' : locale === 'fr' ? 'Mon compte' : 'My account'}
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                href={`/${locale}/login`}
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 min-h-[46px] text-[13px] font-semibold no-underline border transition-colors hover:border-[var(--accent)]"
                style={{
                  background: 'var(--bg-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="font-bold">
                  {locale === 'ar' ? 'تسجيل الدخول' : locale === 'fr' ? 'Se connecter' : 'Sign in'}
                </span>
              </Link>
            )}
          </div>

          {/* Inline Language Selector */}
          <div className="mx-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <Globe className="h-3.5 w-3.5" />
              <span>{locale === 'ar' ? 'اللغة' : locale === 'fr' ? 'Langue' : 'Language'}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { code: 'ar', label: 'العربية' },
                { code: 'fr', label: 'Français' },
                { code: 'en', label: 'English' },
              ].map((lang) => {
                const isActive = locale === lang.code
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      const segments = window.location.pathname.split('/')
                      segments[1] = lang.code
                      window.location.href = segments.join('/')
                    }}
                    className="flex items-center justify-center rounded-lg px-2 py-2 min-h-[38px] text-xs transition-colors whitespace-nowrap"
                    style={{
                      border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      background: isActive ? 'var(--accent-light)' : 'var(--bg-subtle)',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {lang.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Social Links */}
          {(whatsappUrl || instagramUrl || facebookUrl || tiktokUrl) && (
            <div className="mx-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex flex-col gap-1">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium no-underline transition-colors hover:bg-[var(--bg-subtle)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <MessageCircle className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span>{locale === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium no-underline transition-colors hover:bg-[var(--bg-subtle)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Camera className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span>{locale === 'ar' ? 'إنستغرام' : 'Instagram'}</span>
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium no-underline transition-colors hover:bg-[var(--bg-subtle)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Share2 className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span>{locale === 'ar' ? 'فيسبوك' : 'Facebook'}</span>
                  </a>
                )}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium no-underline transition-colors hover:bg-[var(--bg-subtle)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Music2 className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span>TikTok</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Drawer Footer */}
          <div
            className="mt-auto mx-3 py-4 border-t text-center text-[11px]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            © {new Date().getFullYear()} {brandName}
          </div>
        </aside>
      </div>

      {/* =====================================================
          SEARCH OVERLAY
      ===================================================== */}
      <div
        className={cn(
          'fixed inset-0 z-[70] flex items-start justify-center px-3 transition-all duration-300',
          searchOpen ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
        )}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeSearch()
        }}
        style={{
          background: 'rgba(20, 13, 9, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div
          className={cn(
            'w-full overflow-hidden transition-all duration-300',
            searchOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-3 scale-[0.98] opacity-0'
          )}
          style={{
            background: 'var(--card-bg)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-xl), 0 0 0 1px var(--border)',
            marginTop: 'clamp(68px, 12vh, 92px)',
            width: 'min(660px, calc(100vw - 24px))',
            marginInline: 'auto',
          }}
          dir={isRTL ? 'rtl' : 'ltr'}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Header */}
          <div
            className="flex items-center gap-3 border-b px-4 py-3"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-subtle)',
            }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              <Search className="h-4 w-4" />
            </div>

            <input
              ref={searchRef}
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder={
                locale === 'ar'
                  ? 'ابحث عن جلابة أو نقاب...'
                  : locale === 'fr'
                    ? 'Rechercher une djellaba ou un niqab...'
                    : 'Search for djellabas or niqabs...'
              }
              className="flex-1 bg-transparent text-sm sm:text-base outline-none min-w-0 font-medium"
              style={{ color: 'var(--text-primary)', textAlign: 'start' }}
              dir={isRTL ? 'rtl' : 'ltr'}
              autoComplete="off"
              spellCheck="false"
            />

            {searchQ && (
              <button
                type="button"
                onClick={() => {
                  setSearchQ('')
                  searchRef.current?.focus()
                }}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--border)]"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-muted)' }}
                aria-label="Clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={closeSearch}
              className="flex h-8 flex-shrink-0 items-center justify-center gap-1 rounded-lg border px-2.5 text-[11px] font-semibold transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{
                color: 'var(--text-muted)',
                background: 'var(--card-bg)',
                borderColor: 'var(--border)',
              }}
              aria-label={tCommon('close')}
            >
              <span className="hidden sm:inline">ESC</span>
              <X className="h-4 w-4 sm:hidden" />
            </button>
          </div>

          {/* Search Body */}
          <div className="max-h-[60vh] sm:max-h-[440px] overflow-y-auto">
            {searching ? (
              <div className="flex flex-col items-center justify-center p-10 text-center" style={{ color: 'var(--text-muted)' }}>
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent mb-3" />
                <p className="text-xs font-medium">{tCommon('loading')}</p>
              </div>
            ) : searchRes.length > 0 ? (
              <div>
                <div
                  className="flex items-center justify-between border-b px-4 py-2 text-xs font-semibold"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>
                    {locale === 'ar'
                      ? `نتائج البحث (${searchRes.length})`
                      : locale === 'fr'
                        ? `Résultats (${searchRes.length})`
                        : `Search Results (${searchRes.length})`}
                  </span>
                </div>

                <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {searchRes.map((product) => {
                    const productName =
                      locale === 'ar'
                        ? product.nameAr
                        : locale === 'fr'
                          ? product.nameFr
                          : product.nameEn

                    const categoryName = product.category
                      ? locale === 'ar'
                        ? product.category.nameAr
                        : locale === 'fr'
                          ? product.category.nameFr
                          : product.category.nameEn
                      : null

                    const displayPrice = product.salePrice ?? product.basePrice
                    const hasDiscount = Boolean(product.salePrice && product.salePrice < product.basePrice)

                    return (
                      <Link
                        key={product.id}
                        href={`/${locale}/products/${product.slug}`}
                        onClick={closeSearch}
                        className="group flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[var(--accent-light)] no-underline"
                      >
                        <div
                          className="relative h-14 w-12 flex-shrink-0 overflow-hidden rounded-lg border"
                          style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}
                        >
                          <Image
                            src={product.mainImage || '/images/brand/logo-icon.png'}
                            alt={productName}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="48px"
                          />
                        </div>

                        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                          {categoryName && (
                            <span className="text-[11px] font-medium" style={{ color: 'var(--gold)' }}>
                              {categoryName}
                            </span>
                          )}
                          <p
                            className="truncate text-sm font-semibold transition-colors group-hover:text-[var(--accent)]"
                            style={{ color: 'var(--text-primary)', textAlign: 'start' }}
                          >
                            {productName}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
                              {formatPrice(displayPrice, locale)}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs line-through tabular-nums" style={{ color: 'var(--text-muted)' }}>
                                {formatPrice(product.basePrice, locale)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <ArrowRight className={cn('h-4 w-4', isRTL ? 'rotate-180' : '')} />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : searchQ.trim() ? (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl mb-2.5"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                >
                  <Search className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {tCommon('noResults')}
                </p>
                <p className="mt-1 text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
                  {locale === 'ar'
                    ? `لم نتمكن من العثور على أي منتج يطابق "${searchQ}".`
                    : locale === 'fr'
                      ? `Aucun produit ne correspond à "${searchQ}".`
                      : `No products matched "${searchQ}".`}
                </p>
              </div>
            ) : (
              <div className="px-4 py-4">
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
                  {locale === 'ar'
                    ? 'اقتراحات البحث'
                    : locale === 'fr'
                      ? 'Recherches populaires'
                      : 'Popular Searches'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(locale === 'ar'
                    ? ['جلابة', 'نقاب', 'مخزنية', 'حرير', 'عروض']
                    : locale === 'fr'
                      ? ['Djellaba', 'Niqab', 'Soie', 'Offres', 'Makhzania']
                      : ['Djellaba', 'Niqab', 'Silk', 'Offers', 'Makhzania']
                  ).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQ(tag)
                        searchRef.current?.focus()
                      }}
                      className="text-xs font-medium rounded-lg border px-3 py-1.5 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      style={{
                        background: 'var(--bg-subtle)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

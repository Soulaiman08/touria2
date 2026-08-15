'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  Home,
  Package,
  Flame,
  Info,
  Phone,
  Globe,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

import { useCartStore } from '@/store/cart.store'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
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
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const cartItems = useCartStore((state) => state.items)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const pathname = usePathname()

  const isRTL = locale === 'ar'

  // Direct calculation from the single source of truth (Zustand items)
  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // =========================================================
  // SIDE MENU
  // =========================================================

  const [menuOpen, setMenuOpen] = useState(false)

  // =========================================================
  // SEARCH
  // =========================================================

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchRes, setSearchRes] = useState<ProductCard[]>([])
  const [searching, setSearching] = useState(false)

  const searchRef = useRef<HTMLInputElement | null>(null)

  // =========================================================
  // STORE SETTINGS
  // =========================================================

  const [storeSettings, setStoreSettings] =
    useState<StoreSettings | null>(null)

  // =========================================================
  // LOAD STORE SETTINGS
  // =========================================================

  useEffect(() => {
    let isMounted = true

    async function loadStoreSettings() {
      try {
        const response = await fetch('/api/settings', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to load public store settings')
        }

        const data = await response.json()

        if (isMounted && data?.settings) {
          setStoreSettings(data.settings)
        }
      } catch (error) {
        console.error('Failed to load store settings:', error)
      }
    }

    loadStoreSettings()

    return () => {
      isMounted = false
    }
  }, [])

  // =========================================================
  // MOUNT (Hydration-safe)
  // =========================================================

  useEffect(() => {
    setMounted(true)
  }, [])

  // =========================================================
  // SCROLL
  // =========================================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16)
    }

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // =========================================================
  // KEYBOARD
  // =========================================================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'k'
      ) {
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

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // =========================================================
  // SEARCH FOCUS
  // =========================================================

  useEffect(() => {
    if (!searchOpen) return

    const timer = setTimeout(() => {
      searchRef.current?.focus()
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [searchOpen])

  // =========================================================
  // SEARCH PRODUCTS
  // =========================================================

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

        if (!response.ok) {
          throw new Error('Search failed')
        }

        const data = await response.json()

        setSearchRes(
          Array.isArray(data.items)
            ? (data.items as ProductCard[])
            : []
        )
      } catch {
        setSearchRes([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [searchQ])

  // =========================================================
  // NAVIGATION LINKS
  // =========================================================

  const links = [
    {
      href: `/${locale}`,
      label:
        locale === 'ar'
          ? 'الرئيسية'
          : locale === 'fr'
            ? 'Accueil'
            : 'Home',
    },
    {
      href: `/${locale}/products`,
      label:
        locale === 'ar'
          ? 'المنتجات'
          : locale === 'fr'
            ? 'Produits'
            : 'Products',
    },
    {
      href: `/${locale}/products?sort=sale`,
      label:
        locale === 'ar'
          ? 'العروض'
          : locale === 'fr'
            ? 'Offres'
            : 'Offers',
    },
    {
      href: `/${locale}/orders`,
      label:
        locale === 'ar'
          ? 'طلباتي'
          : locale === 'fr'
            ? 'Mes commandes'
            : 'My Orders',
    },
    {
      href: `/${locale}/about`,
      label:
        locale === 'ar'
          ? 'من نحن'
          : locale === 'fr'
            ? 'À propos'
            : 'About Us',
    },
    {
      href: `/${locale}#contact`,
      label:
        locale === 'ar'
          ? 'اتصل بنا'
          : locale === 'fr'
            ? 'Contact'
            : 'Contact',
    },
  ]

  // =========================================================
  // SIDE MENU ITEMS
  // =========================================================

  const menuItems: MenuItem[] = [
    {
      href: `/${locale}`,
      label:
        locale === 'ar'
          ? 'الرئيسية'
          : locale === 'fr'
            ? 'Accueil'
            : 'Home',
      icon: Home,
    },
    {
      href: `/${locale}/products`,
      label:
        locale === 'ar'
          ? 'المنتجات'
          : locale === 'fr'
            ? 'Produits'
            : 'Products',
      icon: Package,
    },
    {
      href: `/${locale}/products?sort=sale`,
      label:
        locale === 'ar'
          ? 'العروض'
          : locale === 'fr'
            ? 'Offres'
            : 'Offers',
      icon: Flame,
    },
    {
      href: `/${locale}/orders`,
      label:
        locale === 'ar'
          ? 'طلباتي'
          : locale === 'fr'
            ? 'Mes commandes'
            : 'My Orders',
      icon: Package,
    },
    {
      href: `/${locale}/about`,
      label:
        locale === 'ar'
          ? 'من نحن'
          : locale === 'fr'
            ? 'À propos'
            : 'About Us',
      icon: Info,
    },
    {
      href: `/${locale}#contact`,
      label:
        locale === 'ar'
          ? 'اتصل بنا'
          : locale === 'fr'
            ? 'Contact'
            : 'Contact',
      icon: Phone,
    },
  ]

  // =========================================================
  // CLOSE MENU
  // =========================================================

  const closeMenu = () => {
    setMenuOpen(false)
  }

  // =========================================================
  // CLOSE SEARCH
  // =========================================================

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQ('')
  }

  // =========================================================
  // SOCIAL LINKS
  // =========================================================

  const instagramUrl =
    storeSettings?.instagram?.trim() || ''

  const facebookUrl =
    storeSettings?.facebook?.trim() || ''

  const tiktokUrl =
    storeSettings?.tiktok?.trim() || ''

  const whatsappValue =
    storeSettings?.whatsapp?.trim() || ''

  const whatsappUrl = whatsappValue
    ? whatsappValue.startsWith('http')
      ? whatsappValue
      : `https://wa.me/${whatsappValue.replace(/[^0-9]/g, '')}`
    : ''

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <>
      {/* =====================================================
          TOP INFO BAR
      ===================================================== */}

      <div
        className="hidden w-full px-4 py-2 text-center text-xs font-medium sm:block"
        style={{
          background: 'var(--accent)',
          color: '#fff',
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <span className="opacity-90">✦</span>{' '}
        نوفر لكم نقاب مغربي وجلابة مخزنية بقب كبير
        للمنقبات وبقب صغير لغير المنقبات{' '}
        <span className="opacity-90">✦</span>
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled ? 'header-scrolled' : ''
        )}
        style={{
          background: 'var(--header-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${scrolled
            ? 'var(--header-border)'
            : 'transparent'
            }`,
        }}
        role="banner"
      >
        <div className="container-brand">
          <div
            className={cn(
              'flex items-center gap-3 sm:gap-5',
              'transition-all duration-300',
              scrolled
                ? 'h-12 sm:h-14'
                : 'h-14 sm:h-16 md:h-[68px]'
            )}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* =================================================
                LOGO
            ================================================= */}

            <Link
              href={`/${locale}`}
              aria-label={siteConfig.name}
              className="flex-shrink-0"
              onClick={closeMenu}
            >
              <Image
                src={
                  storeSettings?.logo ||
                  '/images/brand/logo-full.png'
                }
                alt={
                  storeSettings?.storeName ||
                  siteConfig.name
                }
                width={120}
                height={48}
                priority
                className={cn(
                  'hidden w-auto object-contain transition-all duration-300 sm:block',
                  scrolled ? 'h-9' : 'h-11'
                )}
              />

              <Image
                src={
                  storeSettings?.logo ||
                  '/images/brand/logo-icon.png'
                }
                alt={
                  storeSettings?.storeName ||
                  siteConfig.name
                }
                width={36}
                height={36}
                priority
                className="h-8 w-8 object-contain sm:hidden"
              />
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================= */}

            <nav
              className="ms-2 hidden items-center gap-1.5 md:flex"
              aria-label={
                isRTL
                  ? 'التنقل الرئيسي'
                  : 'Main navigation'
              }
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex-1" />

            {/* =================================================
                DESKTOP SEARCH TRIGGER
            ================================================= */}

            <div className="relative hidden lg:flex">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="group flex h-10 w-[220px] xl:w-[260px] items-center gap-2.5 rounded-xl border transition-all duration-200 hover:border-[var(--accent)] hover:shadow-sm"
                style={{
                  background: 'var(--bg-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                  paddingInline: '12px',
                }}
                dir={isRTL ? 'rtl' : 'ltr'}
                aria-label={t('search')}
              >
                <div
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-colors group-hover:text-[var(--accent)]"
                  style={{
                    color: 'var(--text-muted)',
                  }}
                >
                  <Search className="h-4 w-4" />
                </div>

                <span
                  className="flex-1 truncate text-start text-xs font-medium"
                  style={{
                    color: 'var(--text-muted)',
                  }}
                >
                  {tCommon('search')}
                </span>

                <kbd
                  className="rounded-md border px-1.5 py-0.5 text-[10px] font-semibold opacity-60 transition-opacity group-hover:opacity-100"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div
              className="flex items-center gap-1.5 sm:gap-2"
              dir="ltr"
            >
              <button
                type="button"
                className="icon-btn touch-target lg:hidden"
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
                    className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-0.5 text-[10px] font-bold text-white"
                    style={{
                      background: 'var(--accent)',
                    }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* =================================================
                HAMBURGER
            ================================================= */}

            <button
              type="button"
              className={cn(
                'order-first flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-200',
                'hover:bg-[var(--accent-light)] hover:text-[var(--accent)]',
                'active:scale-95'
              )}
              onClick={() => {
                setMenuOpen((previous) => !previous)
              }}
              aria-label={
                menuOpen
                  ? isRTL
                    ? 'إغلاق القائمة'
                    : 'Close menu'
                  : isRTL
                    ? 'فتح القائمة'
                    : 'Open menu'
              }
              aria-expanded={menuOpen}
              aria-controls="main-side-menu"
              style={{
                color: 'var(--text-primary)',
                background: 'var(--bg-subtle)',
                borderColor: 'var(--border)',
              }}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
    SIDE MENU OVERLAY
===================================================== */}

      <div
        className={cn(
          'fixed inset-0 z-[60]',
          'transition-[visibility] duration-300',
          menuOpen
            ? 'visible'
            : 'invisible pointer-events-none'
        )}
        aria-hidden={!menuOpen}
      >
        {/* Mobile overlay — نفس فكرة Admin */}
        <button
          type="button"
          aria-label={isRTL ? 'إغلاق القائمة' : 'Close menu'}
          onClick={closeMenu}
          className={cn(
            'absolute inset-0 h-full w-full border-0 p-0 cursor-default',
            'bg-black/40 backdrop-blur-[2px]',
            'transition-opacity duration-300',
            menuOpen ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* =================================================
      SIDEBAR
  ================================================= */}

        <aside
          id="main-side-menu"
          className={cn(
            'scrollbar-hidden',
            'absolute top-0 h-full',
            'w-[260px] min-w-[260px] max-w-[260px]',
            'overflow-y-auto',
            'shadow-2xl',
            'transition-transform duration-300 ease-out',
            isRTL ? 'right-0' : 'left-0',

            isRTL
              ? menuOpen
                ? 'translate-x-0'
                : 'translate-x-full'
              : menuOpen
                ? 'translate-x-0'
                : '-translate-x-full'
          )}
          style={{
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',

            borderLeft: isRTL
              ? '1px solid var(--border)'
              : undefined,

            borderRight: !isRTL
              ? '1px solid var(--border)'
              : undefined,
          }}
          dir={isRTL ? 'rtl' : 'ltr'}
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          {/* =================================================
        BRAND
        مطابق لفكرة Admin Sidebar
    ================================================= */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 0 16px 0',
              margin: '16px 12px 16px 12px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <Link
              href={`/${locale}`}
              onClick={closeMenu}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid var(--border)',
                }}
              >
                <Image
                  src={
                    storeSettings?.logo ||
                    '/images/brand/logo-icon.png'
                  }
                  alt={
                    storeSettings?.storeName ||
                    siteConfig.name
                  }
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-[10px] object-contain"
                />
              </div>

              <div className="min-w-0">
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {storeSettings?.storeName ||
                    (locale === 'ar'
                      ? 'ثريا المغربية'
                      : locale === 'fr'
                        ? 'Thuraya Marocaine'
                        : 'Thuraya Moroccan')}
                </div>

                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 10,
                    color: 'var(--accent)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginTop: 4,
                  }}
                >
                  {locale === 'ar'
                    ? 'القائمة الرئيسية'
                    : locale === 'fr'
                      ? 'Menu principal'
                      : 'Main Menu'}
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={closeMenu}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--accent-light)]"
              aria-label={
                isRTL
                  ? 'إغلاق القائمة'
                  : 'Close menu'
              }
              style={{
                color: 'var(--text-muted)',
                border: 'none',
                background: 'transparent',
              }}
            >
              <X className="h-[16px] w-[16px]" />
            </button>
          </div>

          {/* =================================================
        NAV LINKS
        نفس Admin:
        gap 4
        padding 10px 12px
        radius 12
    ================================================= */}

          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: '0 12px',
            }}
          >
            {menuItems.map((item) => {
              const Icon = item.icon

              const isActive =
                pathname === item.href ||
                (
                  item.href !== `/${locale}` &&
                  pathname.startsWith(item.href)
                )

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  style={{
                    display: 'flex',
                    alignItems: 'center',

                    gap: 10,

                    padding: '10px 12px',

                    minHeight: 40,

                    borderRadius: 12,

                    textDecoration: 'none',

                    fontWeight: 600,
                    fontSize: 13,

                    transition: 'all 0.15s',

                    background: isActive
                      ? 'var(--accent)'
                      : 'transparent',

                    color: isActive
                      ? '#fff'
                      : 'var(--text-secondary)',
                  }}
                >
                  <Icon
                    style={{
                      width: 15,
                      height: 15,
                      flexShrink: 0,

                      color: isActive
                        ? '#fff'
                        : 'var(--text-muted)',
                    }}
                  />

                  <span>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* =================================================
        LANGUAGE
    ================================================= */}

          <div
            style={{
              paddingTop: 16,
              marginTop: 16,
              borderTop: '1px solid var(--border)',
              paddingLeft: 12,
              paddingRight: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 12,

                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',

                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Globe
                style={{
                  width: 15,
                  height: 15,
                  flexShrink: 0,
                  color: 'var(--text-muted)',
                }}
              />

              <span style={{ flex: 1 }}>
                {locale === 'ar'
                  ? 'اللغة'
                  : locale === 'fr'
                    ? 'Langue'
                    : 'Language'}
              </span>

              <LanguageSwitcher locale={locale} />
            </div>
          </div>

          {/* =================================================
        SOCIAL
    ================================================= */}

          {(whatsappUrl ||
            instagramUrl ||
            facebookUrl ||
            tiktokUrl) && (
              <div
                style={{
                  paddingTop: 16,
                  marginTop: 16,
                  borderTop: '1px solid var(--border)',
                  paddingLeft: 12,
                  paddingRight: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  {/* WhatsApp */}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 12,
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <MessageCircle
                        style={{
                          width: 15,
                          height: 15,
                          color: 'var(--text-muted)',
                          flexShrink: 0,
                        }}
                      />

                      <span>
                        {locale === 'ar'
                          ? 'واتساب'
                          : 'WhatsApp'}
                      </span>
                    </a>
                  )}

                  {/* Instagram */}
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 12,
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span
                        style={{
                          width: 15,
                          height: 15,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                        }}
                      >
                        📷
                      </span>

                      <span>
                        {locale === 'ar'
                          ? 'إنستغرام'
                          : 'Instagram'}
                      </span>
                    </a>
                  )}

                  {/* Facebook */}
                  {facebookUrl && (
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 12,
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span
                        style={{
                          width: 15,
                          height: 15,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                        }}
                      >
                        📘
                      </span>

                      <span>
                        {locale === 'ar'
                          ? 'فيسبوك'
                          : 'Facebook'}
                      </span>
                    </a>
                  )}

                  {/* TikTok */}
                  {tiktokUrl && (
                    <a
                      href={tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 12,
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span
                        style={{
                          width: 15,
                          height: 15,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        ♪
                      </span>

                      <span>TikTok</span>
                    </a>
                  )}
                </div>
              </div>
            )}

          {/* =================================================
        COPYRIGHT
    ================================================= */}

          <div
            style={{
              paddingTop: 16,
              marginTop: 16,
              borderTop: '1px solid var(--border)',
              paddingLeft: 12,
              paddingRight: 12,
              paddingBottom: 16,
              textAlign: 'center',
              fontSize: 10,
              color: 'var(--text-muted)',
            }}
          >
            © {new Date().getFullYear()}{' '}
            {storeSettings?.storeName ||
              siteConfig.name}
          </div>
        </aside>
      </div>

      {/* =====================================================
          SEARCH OVERLAY (Responsive & Multi-Language)
      ===================================================== */}

      <div
        className={cn(
          'fixed inset-0 z-[70] flex items-start justify-center transition-all duration-300',
          searchOpen
            ? 'visible opacity-100'
            : 'invisible pointer-events-none opacity-0'
        )}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeSearch()
          }
        }}
        style={{
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          paddingInline: '12px',
        }}
      >
        <div
          className={cn(
            'w-full overflow-hidden transition-all duration-300',
            searchOpen
              ? 'translate-y-0 scale-100 opacity-100'
              : '-translate-y-3 scale-[0.98] opacity-0'
          )}
          style={{
            background: 'var(--card-bg)',
            borderRadius: '22px',
            boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--border)',
            marginTop: 'clamp(68px, 12vh, 92px)',
            width: 'min(680px, calc(100vw - 24px))',
            marginInline: 'auto',
          }}
          dir={isRTL ? 'rtl' : 'ltr'}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Search Input Header ────────────────────────── */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 border-b"
            style={{
              borderColor: 'var(--border)',
              paddingInline: '14px',
              paddingBlock: '12px',
              background: 'var(--bg-subtle)',
            }}
          >
            {/* Search Icon Badge */}
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--accent-light)',
                color: 'var(--accent)',
              }}
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            {/* Input Field */}
            <input
              ref={searchRef}
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder={tCommon('search')}
              className="flex-1 bg-transparent text-sm sm:text-base outline-none min-w-0 font-medium"
              style={{
                color: 'var(--text-primary)',
                textAlign: 'start',
                paddingInline: '4px',
              }}
              dir={isRTL ? 'rtl' : 'ltr'}
              autoComplete="off"
              spellCheck="false"
            />

            {/* Clear Button */}
            {searchQ && (
              <button
                type="button"
                onClick={() => {
                  setSearchQ('')
                  searchRef.current?.focus()
                }}
                className="flex items-center justify-center flex-shrink-0 transition-colors hover:bg-[var(--border)]"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-muted)',
                }}
                aria-label="Clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={closeSearch}
              className="flex items-center justify-center gap-1.5 flex-shrink-0 transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{
                height: 34,
                paddingInline: '10px',
                borderRadius: 8,
                color: 'var(--text-muted)',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                fontSize: 11,
                fontWeight: 700,
              }}
              aria-label={tCommon('close')}
            >
              <span className="hidden sm:inline">ESC</span>
              <X className="h-4 w-4 sm:hidden" />
            </button>
          </div>

          {/* ── Search Body & Results ────────────────────────── */}
          <div className="max-h-[60vh] sm:max-h-[440px] overflow-y-auto">
            {searching ? (
              <div
                className="flex flex-col items-center justify-center p-10 text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent mb-3" />
                <p className="text-xs font-medium">{tCommon('loading')}</p>
              </div>
            ) : searchRes.length > 0 ? (
              <div>
                {/* Result header count */}
                <div
                  className="flex items-center justify-between border-b text-[11px] font-bold uppercase tracking-wider"
                  style={{
                    paddingInline: '16px',
                    paddingBlock: '8px',
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

                {/* Items list */}
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
                    const hasDiscount = Boolean(
                      product.salePrice && product.salePrice < product.basePrice
                    )

                    return (
                      <Link
                        key={product.id}
                        href={`/${locale}/products/${product.slug}`}
                        onClick={closeSearch}
                        className="group flex items-center gap-3.5 transition-colors hover:bg-[var(--accent-light)]"
                        style={{
                          paddingInline: '16px',
                          paddingBlock: '12px',
                        }}
                      >
                        {/* Thumbnail */}
                        <div
                          className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border"
                          style={{
                            borderColor: 'var(--border)',
                            background: 'var(--bg-muted)',
                          }}
                        >
                          <Image
                            src={product.mainImage || '/images/brand/logo-icon.png'}
                            alt={productName}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="56px"
                          />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1 flex flex-col gap-1">
                          <p
                            className="truncate text-sm font-bold transition-colors group-hover:text-[var(--accent)]"
                            style={{
                              color: 'var(--text-primary)',
                              textAlign: 'start',
                            }}
                          >
                            {productName}
                          </p>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Price */}
                            <span
                              className="text-sm font-extrabold"
                              style={{ color: 'var(--accent)' }}
                            >
                              {formatPrice(displayPrice, locale)}
                            </span>

                            {/* Original Price if discounted */}
                            {hasDiscount && (
                              <span
                                className="text-xs line-through"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {formatPrice(product.basePrice, locale)}
                              </span>
                            )}

                            {/* Category Tag */}
                            {categoryName && (
                              <span
                                className="text-[10px] font-semibold rounded-md border"
                                style={{
                                  paddingInline: '6px',
                                  paddingBlock: '1px',
                                  background: 'var(--bg-subtle)',
                                  borderColor: 'var(--border)',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                {categoryName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                          style={{
                            color: 'var(--text-muted)',
                          }}
                        >
                          <ArrowRight
                            className={cn('h-4 w-4', isRTL ? 'rotate-180' : '')}
                          />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : searchQ.trim() ? (
              /* No Results State */
              <div
                className="flex flex-col items-center justify-center p-10 text-center"
                style={{ paddingInline: '20px' }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl mb-2.5"
                  style={{
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Search className="h-5 w-5" />
                </div>

                <p
                  className="text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {tCommon('noResults')}
                </p>

                <p
                  className="mt-1 text-xs max-w-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {locale === 'ar'
                    ? `لم نتمكن من العثور على أي منتج يطابق "${searchQ}". يرجى التحقق من صحة الكلمات.`
                    : locale === 'fr'
                      ? `Aucun produit ne correspond à "${searchQ}". Veuillez vérifier l'orthographe.`
                      : `No products matched "${searchQ}". Please check your spelling and try again.`}
                </p>
              </div>
            ) : (
              /* Empty Initial State: Popular Searches */
              <div
                style={{
                  paddingInline: '16px',
                  paddingBlock: '18px',
                }}
              >
                <div className="flex items-center gap-1.5 mb-3" style={{ paddingInline: '2px' }}>
                  <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {locale === 'ar'
                      ? 'عمليات البحث الشائعة'
                      : locale === 'fr'
                        ? 'RECHERCHES POPULAIRES'
                        : 'POPULAR SEARCHES'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(locale === 'ar'
                    ? ['جلابة', 'نقاب', 'مخزنية', 'حرير', 'عروض']
                    : locale === 'fr'
                      ? ['Jellaba', 'Niqab', 'Soie', 'Offres', 'Makhzania']
                      : ['Djellaba', 'Niqab', 'Silk', 'Offers', 'Makhzania']
                  ).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQ(tag)
                        searchRef.current?.focus()
                      }}
                      className="text-xs font-semibold rounded-xl border transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:scale-105 active:scale-95"
                      style={{
                        paddingInline: '12px',
                        paddingBlock: '7px',
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
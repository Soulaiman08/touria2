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
} from 'lucide-react'

import { useCartStore } from '@/store/cart.store'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
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
  const cartStore = useCartStore()
  const pathname = usePathname()

  const isRTL = locale === 'ar'

  const totalItems = cartStore.items.reduce(
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
        console.error(
          'Failed to load store settings:',
          error
        )
      }
    }

    loadStoreSettings()

    return () => {
      isMounted = false
    }
  }, [])

  // =========================================================
  // MOUNT
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)

    return () => {
      clearTimeout(timer)
    }
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
      // Ctrl + K / Cmd + K
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault()
        setSearchOpen(true)
      }

      // Escape
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
          `/api/products?search=${encodeURIComponent(
            query
          )}&limit=5`
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
  // تأتي من لوحة التحكم
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
      : `https://wa.me/${whatsappValue.replace(
        /[^0-9]/g,
        ''
      )}`
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
            dir="ltr"
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
                  scrolled
                    ? 'h-9'
                    : 'h-11'
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

            {/* Spacer */}

            <div className="flex-1" />

            {/* =================================================
                DESKTOP SEARCH
            ================================================= */}

            <div className="relative hidden lg:flex">
              <button
                type="button"
                onClick={() =>
                  setSearchOpen(true)
                }
                className="flex h-9 min-w-[200px] items-center gap-2 rounded-lg border px-3.5 text-sm transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{
                  background:
                    'var(--bg-subtle)',
                  borderColor:
                    'var(--border)',
                  color:
                    'var(--text-muted)',
                }}
              >
                <Search className="h-3.5 w-3.5 flex-shrink-0" />

                <span className="flex-1 text-start">
                  {isRTL
                    ? 'بحث...'
                    : locale === 'fr'
                      ? 'Rechercher...'
                      : 'Search...'}
                </span>

                <kbd
                  className="rounded border px-1 text-[10px] opacity-50"
                  style={{
                    borderColor:
                      'var(--border)',
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
              {/* Mobile Search */}

              <button
                type="button"
                className="icon-btn touch-target lg:hidden"
                onClick={() =>
                  setSearchOpen(true)
                }
                aria-label={
                  locale === 'ar'
                    ? 'بحث'
                    : 'Search'
                }
              >
                <Search className="h-[18px] w-[18px]" />
              </button>

              {/* Theme */}

              <ThemeSwitcher />

              {/* Language */}

              <LanguageSwitcher
                locale={locale}
              />

              {/* Cart */}

              <button
                id="cart-toggle-btn"
                type="button"
                onClick={
                  cartStore.toggleCart
                }
                className="icon-btn touch-target relative"
                aria-label={t('cart')}
              >
                <ShoppingBag className="h-[18px] w-[18px]" />

                {mounted &&
                  totalItems > 0 && (
                    <span
                      className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-0.5 text-[10px] font-bold text-white"
                      style={{
                        background:
                          'var(--accent)',
                      }}
                    >
                      {totalItems > 9
                        ? '9+'
                        : totalItems}
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
                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-200',
                'hover:bg-[var(--accent-light)] hover:text-[var(--accent)]',
                isRTL
                  ? 'order-last'
                  : 'order-first'
              )}
              onClick={() => {
                setMenuOpen(
                  (previous) =>
                    !previous
                )
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
                color:
                  'var(--text-primary)',
                background:
                  'var(--bg-subtle)',
                borderColor:
                  'var(--border)',
              }}
            >
              <span
                className={cn(
                  'transition-transform duration-300',
                  menuOpen
                    ? 'rotate-90'
                    : 'rotate-0'
                )}
              >
                {menuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </span>
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
        {/* =================================================
            OVERLAY
        ================================================= */}

        <button
          type="button"
          aria-label={
            isRTL
              ? 'إغلاق القائمة'
              : 'Close menu'
          }
          onClick={closeMenu}
          className={cn(
            'absolute inset-0 h-full w-full cursor-default border-0 p-0',
            'bg-black/40',
            'transition-opacity duration-300',
            menuOpen
              ? 'opacity-100'
              : 'opacity-0'
          )}
        />

        {/* =================================================
            SIDE MENU
        ================================================= */}

        <aside
          id="main-side-menu"
          className={cn(
            'absolute top-0 h-full w-[280px] max-w-[85vw] sm:w-[340px] sm:max-w-[88vw]',
            'overflow-y-auto border shadow-2xl',
            'transition-transform duration-300 ease-out',
            isRTL
              ? 'right-0'
              : 'left-0',
            isRTL
              ? menuOpen
                ? 'translate-x-0'
                : 'translate-x-full'
              : menuOpen
                ? 'translate-x-0'
                : '-translate-x-full'
          )}
          style={{
            background:
              'var(--card-bg)',
            color:
              'var(--text-primary)',
            borderColor:
              'var(--border)',
          }}
          dir={isRTL ? 'rtl' : 'ltr'}
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          {/* =================================================
              MENU HEADER
          ================================================= */}

          <div
            className="relative flex h-16 sm:h-20 items-center justify-between overflow-hidden border-b px-4 sm:px-5"
            style={{
              borderColor:
                'var(--border)',
              background:
                'linear-gradient(135deg, var(--accent-light), transparent 70%)',
            }}
          >
            <div className="flex items-center gap-3">
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
                className="h-9 w-9 object-contain"
              />

              <div>
                <p
                  className="text-sm font-bold"
                  style={{
                    color:
                      'var(--text-primary)',
                  }}
                >
                  {storeSettings?.storeName ||
                    (locale === 'ar'
                      ? 'ثريا المغربية'
                      : locale === 'fr'
                        ? 'Thuraya Marocaine'
                        : 'Thuraya Moroccan')}
                </p>

                <p
                  className="text-[10px]"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  {locale === 'ar'
                    ? 'القائمة الرئيسية'
                    : locale === 'fr'
                      ? 'Menu principal'
                      : 'Main Menu'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeMenu}
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-[var(--accent-light)]"
              aria-label={
                isRTL
                  ? 'إغلاق القائمة'
                  : 'Close menu'
              }
              style={{
                color:
                  'var(--text-primary)',
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* =================================================
              MENU CONTENT
          ================================================= */}

          <div className="px-3 py-4 sm:px-4 sm:py-5">
            {/* Main Links */}

            <nav className="flex flex-col gap-1">
              {menuItems.map(
                (item) => {
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={cn(
                        'flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 sm:px-4 sm:py-3.5',
                        pathname === item.href
                          ? 'border-[var(--accent-ring)] bg-[var(--accent-light)] text-[var(--accent)] shadow-sm'
                          : 'border-transparent hover:border-[var(--accent-ring)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]'
                      )}
                      style={{
                        color:
                          pathname === item.href
                            ? 'var(--accent)'
                            : 'var(--text-secondary)',
                      }}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />

                      <span>
                        {item.label}
                      </span>
                    </Link>
                  )
                }
              )}
            </nav>

            {/* Separator */}

            <div
              className="my-4 h-px w-full"
              style={{
                background:
                  'var(--border)',
              }}
            />

            {/* =================================================
                LANGUAGE
            ================================================= */}

            <div
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3.5"
              style={{
                color:
                  'var(--text-secondary)',
              }}
            >
              <Globe className="h-5 w-5 flex-shrink-0" />

              <span className="text-sm font-semibold">
                {locale === 'ar'
                  ? 'اللغة'
                  : locale === 'fr'
                    ? 'Langue'
                    : 'Language'}
              </span>

              <div className="ms-auto">
                <LanguageSwitcher
                  locale={locale}
                />
              </div>
            </div>

            {/* Separator */}

            <div
              className="my-4 h-px w-full"
              style={{
                background:
                  'var(--border)',
              }}
            />

            {/* =================================================
                SOCIAL LINKS
                كلها من لوحة التحكم
            ================================================= */}

            <div className="flex flex-col gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-1.5">
              {/* WhatsApp */}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
                  style={{
                    color:
                      'var(--text-secondary)',
                  }}
                >
                  <MessageCircle className="h-5 w-5 flex-shrink-0" />

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
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
                  style={{
                    color:
                      'var(--text-secondary)',
                  }}
                >
                  <span className="flex h-5 w-5 items-center justify-center text-base">
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
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
                  style={{
                    color:
                      'var(--text-secondary)',
                  }}
                >
                  <span className="flex h-5 w-5 items-center justify-center text-base">
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
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
                  style={{
                    color:
                      'var(--text-secondary)',
                  }}
                >
                  <span className="flex h-5 w-5 items-center justify-center text-base font-bold">
                    ♪
                  </span>

                  <span>
                    TikTok
                  </span>
                </a>
              )}
            </div>

            {/* Separator */}

            {(whatsappUrl ||
              instagramUrl ||
              facebookUrl ||
              tiktokUrl) && (
                <div
                  className="my-4 h-px w-full"
                  style={{
                    background:
                      'var(--border)',
                  }}
                />
              )}

            {/* =================================================
                COPYRIGHT
            ================================================= */}

            <div
              className="pb-4 text-center text-xs"
              style={{
                color:
                  'var(--text-muted)',
              }}
            >
              © {new Date().getFullYear()}{' '}
              {storeSettings?.storeName ||
                siteConfig.name}
            </div>
          </div>
        </aside>
      </div>

      {/* =====================================================
          SEARCH OVERLAY
      ===================================================== */}

      <div
        className={cn(
          'fixed inset-0 z-[70] transition-all duration-300',
          searchOpen
            ? 'visible opacity-100'
            : 'invisible pointer-events-none opacity-0'
        )}
        onClick={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            closeSearch()
          }
        }}
        style={{
          background:
            'rgba(0, 0, 0, 0.45)',
        }}
      >
        <div
          className={cn(
            'mx-3 w-auto max-w-2xl sm:mx-auto sm:w-full',
            'transition-all duration-300',
            searchOpen
              ? 'translate-y-0 opacity-100'
              : '-translate-y-4 opacity-0'
          )}
          style={{
            background:
              'var(--card-bg)',
            marginTop: '8vh',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow:
              '0 25px 60px rgba(0,0,0,0.25)',
          }}
        >
          {/* Search Input */}

          <div
            className="flex items-center gap-2 border-b p-3 sm:gap-3 sm:p-4"
            style={{
              borderColor:
                'var(--border)',
            }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <Search
              className="h-5 w-5 flex-shrink-0"
              style={{
                color:
                  'var(--text-muted)',
              }}
            />

            <input
              ref={searchRef}
              type="text"
              value={searchQ}
              onChange={(event) =>
                setSearchQ(
                  event.target.value
                )
              }
              placeholder={
                isRTL
                  ? 'ابحثي عن منتج...'
                  : locale === 'fr'
                    ? 'Rechercher un produit...'
                    : 'Search for a product...'
              }
              className="flex-1 bg-transparent text-sm sm:text-base outline-none"
              style={{
                color:
                  'var(--text-primary)',
              }}
              dir={isRTL ? 'rtl' : 'ltr'}
            />

            {/* Clear */}

            {searchQ && (
              <button
                type="button"
                onClick={() =>
                  setSearchQ('')
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--accent-light)]"
                aria-label="Clear search"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Close */}

            <button
              type="button"
              onClick={closeSearch}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--accent-light)]"
              aria-label={
                isRTL
                  ? 'إغلاق البحث'
                  : 'Close search'
              }
              style={{
                color:
                  'var(--text-muted)',
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Results */}

          <div className="max-h-[60vh] overflow-y-auto sm:max-h-[420px]">
            {searching ? (
              <div
                className="p-8 text-center"
                style={{
                  color:
                    'var(--text-muted)',
                }}
              >
                <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              </div>
            ) : searchRes.length > 0 ? (
              searchRes.map(
                (product) => (
                  <Link
                    key={product.id}
                    href={`/${locale}/products/${product.slug}`}
                    onClick={closeSearch}
                    className="flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-[var(--accent-light)]"
                    style={{
                      borderColor:
                        'var(--border-subtle)',
                    }}
                    dir={
                      isRTL
                        ? 'rtl'
                        : 'ltr'
                    }
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--bg-muted)]">
                      <Image
                        src={
                          product.mainImage ||
                          '/images/brand/logo-icon.png'
                        }
                        alt={
                          product.nameAr ||
                          product.nameFr ||
                          product.nameEn
                        }
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-semibold"
                        style={{
                          color:
                            'var(--text-primary)',
                        }}
                      >
                        {locale === 'ar'
                          ? product.nameAr
                          : locale === 'fr'
                            ? product.nameFr
                            : product.nameEn}
                      </p>

                      <p
                        className="mt-0.5 text-xs"
                        style={{
                          color:
                            'var(--accent)',
                        }}
                      >
                        {product.salePrice
                          ? `${product.salePrice} د.م.`
                          : `${product.basePrice} د.م.`}
                      </p>
                    </div>
                  </Link>
                )
              )
            ) : searchQ.trim() ? (
              <div
                className="p-8 text-center"
                dir={
                  isRTL
                    ? 'rtl'
                    : 'ltr'
                }
              >
                <p
                  className="text-sm font-medium"
                  style={{
                    color:
                      'var(--text-primary)',
                  }}
                >
                  {isRTL
                    ? 'لا توجد نتائج'
                    : locale === 'fr'
                      ? 'Aucun résultat'
                      : 'No results found'}
                </p>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  {isRTL
                    ? `لا يوجد منتج يطابق "${searchQ}"`
                    : locale === 'fr'
                      ? `Aucun produit ne correspond à "${searchQ}"`
                      : `No product matched "${searchQ}"`}
                </p>
              </div>
            ) : (
              <div
                className="p-8 text-center text-xs"
                style={{
                  color:
                    'var(--text-muted)',
                }}
                dir={
                  isRTL
                    ? 'rtl'
                    : 'ltr'
                }
              >
                {isRTL
                  ? 'اكتبي اسم المنتج للبحث...'
                  : locale === 'fr'
                    ? 'Recherchez un produit...'
                    : 'Type to search products...'}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

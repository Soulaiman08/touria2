'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { useToast } from '../providers/ToastContext'
import { useAdminI18n } from '../providers/AdminI18nContext'
import { AdminNotifications } from '../ui/AdminNotifications'
import { AdminGlobalSearch } from '../ui/AdminGlobalSearch'
import { VisitorCounter } from '../ui/VisitorCounter'
import { AdminLanguageSwitcher } from '../ui/AdminLanguageSwitcher'

interface NavItem {
  labelAr: string
  labelEn: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { labelAr: 'لوحة التحكم',  labelEn: 'Dashboard',      href: '/control-panel-ss7',            icon: LayoutDashboard },
  { labelAr: 'المنتجات',     labelEn: 'Products',       href: '/control-panel-ss7/products',   icon: Package         },
  { labelAr: 'التصنيفات',    labelEn: 'Categories',     href: '/control-panel-ss7/categories', icon: FolderTree      },
  { labelAr: 'الطلبات',      labelEn: 'Orders',         href: '/control-panel-ss7/orders',     icon: ShoppingBag     },
  { labelAr: 'العملاء',      labelEn: 'Customers',      href: '/control-panel-ss7/customers',  icon: Users           },
  { labelAr: 'البانرات',     labelEn: 'Banners',        href: '/control-panel-ss7/banners',    icon: ImageIcon       },
  { labelAr: 'إعدادات المتجر', labelEn: 'Store Settings', href: '/control-panel-ss7/settings',   icon: Settings        },
  { labelAr: 'حسابي',        labelEn: 'Profile',        href: '/control-panel-ss7/profile',    icon: User            },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<{ name: string; role?: string } | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { success, error } = useToast()
  const { tr, dir, isRTL, locale } = useAdminI18n()

  useEffect(() => {
    let active = true
    async function loadAdminUser() {
      try {
        const res = await fetch('/api/admin/auth/me', { cache: 'no-store' })
        if (res.ok) {
          const data = (await res.json()) as { user?: { name?: string; role?: string } }
          if (active && data.user?.name) {
            setAdminUser({ name: data.user.name, role: data.user.role })
          }
        }
      } catch {
        // Non-fatal fallback
      }
    }
    loadAdminUser()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  const adminName = adminUser?.name?.trim() || tr('المدير', 'Admin')
  const adminInitials =
    adminName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || 'TH'

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/auth/logout', { method: 'POST' })
      if (res.ok) {
        success(tr('تم تسجيل الخروج بنجاح', 'Logged out successfully'))
      }
    } catch {
      error(tr('تعذر الاتصال، جاري التوجيه لتسجيل الدخول', 'Failed to reach logout endpoint; redirecting to login'))
    } finally {
      router.push('/control-panel-ss7/login')
    }
  }

  return (
    <div
      dir={dir}
      className="admin-shell dark h-dvh bg-[#09090b] text-zinc-100 flex overflow-hidden"
      style={{
        fontFamily: isRTL
          ? 'var(--font-arabic), system-ui, sans-serif'
          : 'var(--font-sans), system-ui, sans-serif',
      }}
    >
      {/* Mobile / Tablet Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ── Sidebar Navigation ── */}
      <aside
        aria-label={tr('قائمة لوحة التحكم', 'Admin navigation')}
        className={`admin-sidebar ${mobileOpen ? 'admin-sidebar-open' : ''} w-[232px] shrink-0 h-dvh bg-zinc-900/98 border-e border-zinc-800/90 flex flex-col z-20 no-print`}
      >
        {/* Brand Header (exact h-16 matching topbar divider line) */}
        <div className="h-16 shrink-0 px-4 border-b border-zinc-800/90 flex items-center justify-between gap-2">
          <Link
            href="/control-panel-ss7"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 text-zinc-950" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="font-extrabold text-sm text-white leading-tight tracking-tight truncate">
                {tr('ثريا', 'THURAYA')}
              </div>
              <div className="font-bold text-[10px] text-amber-400 tracking-wider uppercase leading-tight mt-0.5 truncate">
                {tr('لوحة الإدارة', 'Admin Panel')}
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label={tr('إغلاق القائمة', 'Close navigation')}
            className="lg:hidden w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav + Footer */}
        <div className="flex-1 flex flex-col px-3.5 py-4 overflow-y-auto admin-scroll">
          {/* Nav Links */}
          <nav className="flex-1 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== '/control-panel-ss7' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 h-10 px-3 rounded-xl text-[13px] font-semibold leading-none transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold shadow-md shadow-amber-500/15'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-zinc-950' : 'text-zinc-500'
                    }`}
                  />
                  <span className="truncate">{isRTL ? item.labelAr : item.labelEn}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer Actions */}
          <div className="pt-4 mt-4 border-t border-zinc-800 flex flex-col gap-2">
            <Link
              href={`/${locale}`}
              target="_blank"
              className="flex items-center gap-2.5 h-10 px-3 rounded-xl text-xs font-semibold leading-none text-zinc-300 bg-zinc-800/55 hover:bg-zinc-800 hover:text-white border border-zinc-700/40 transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{tr('زيارة المتجر', 'View Storefront')}</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 h-10 px-3 rounded-xl text-[13px] font-semibold leading-none text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors w-full cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>{tr('تسجيل الخروج', 'Logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Shell ── */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-hidden">
        {/* Top Bar */}
        <header className="admin-topbar sticky top-0 z-30 h-16 shrink-0 bg-zinc-900/90 border-b border-zinc-800/90 backdrop-blur-md no-print">
          <div className="max-w-[1440px] mx-auto w-full h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-3">
            {/* Start Group: Drawer Toggle + Search */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label={tr('فتح القائمة', 'Open navigation')}
                className="lg:hidden h-10 w-10 rounded-xl border border-zinc-700/80 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-600 inline-flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <AdminGlobalSearch />
            </div>

            {/* End Group: Language Switcher, Visitors, Notifications, Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <AdminLanguageSwitcher />
              <VisitorCounter />
              <AdminNotifications />
              <Link
                href="/control-panel-ss7/profile"
                title={adminName}
                className="inline-flex items-center justify-center w-10 md:w-auto md:justify-start gap-2.5 h-10 md:ps-1.5 md:pe-3.5 rounded-xl border border-zinc-700/80 bg-zinc-900/90 hover:border-zinc-600 hover:bg-zinc-800/80 transition-colors shrink-0"
              >
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold inline-flex items-center justify-center border border-amber-500/30 text-[11px] leading-none shrink-0 select-none">
                  {adminInitials}
                </span>
                <span className="hidden md:inline-flex items-center text-xs font-semibold text-zinc-200 leading-none max-w-[120px] truncate">
                  {adminName}
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="admin-main flex-1 overflow-y-auto overflow-x-hidden admin-scroll">
          <div className="max-w-[1440px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}

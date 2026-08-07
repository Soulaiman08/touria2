'use client'

import React, { useState } from 'react'
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
  Sun,
  Moon,
  ExternalLink,
  Bell,
  Search,
  Sparkles,
} from 'lucide-react'
import { useAdminTheme } from '../providers/ThemeContext'
import { useToast } from '../providers/ToastContext'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { name: 'Dashboard',      href: '/admin',            icon: LayoutDashboard },
  { name: 'Products',       href: '/admin/products',   icon: Package         },
  { name: 'Categories',     href: '/admin/categories', icon: FolderTree      },
  { name: 'Orders',         href: '/admin/orders',     icon: ShoppingBag     },
  { name: 'Customers',      href: '/admin/customers',  icon: Users           },
  { name: 'Banners',        href: '/admin/banners',    icon: ImageIcon       },
  { name: 'Store Settings', href: '/admin/settings',   icon: Settings        },
  { name: 'Profile',        href: '/admin/profile',    icon: User            },
]

/* ─── Sidebar inner content (shared between desktop + mobile drawer) ─── */
function SidebarContent({
  onClose,
  pathname,
  handleLogout,
}: {
  onClose: () => void
  pathname: string
  handleLogout: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
        <Link href="/admin" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white tracking-wide leading-none">THURAYA</h2>
            <p className="text-[10px] font-semibold text-amber-400/90 tracking-widest uppercase mt-0.5">Admin Panel</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="pt-4 mt-4 border-t border-zinc-800/80 space-y-2">
        <Link
          href="/ar"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 bg-zinc-800/40 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
          <span>View Storefront</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors border border-rose-500/10"
        >
          <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

/* ─── Main AdminLayout ─────────────────────────────────────────────── */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useAdminTheme()
  const { success, error } = useToast()

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/auth/logout', { method: 'POST' })
      if (res.ok) {
        success('Logged out successfully')
        router.push('/admin/login')
      }
    } catch {
      error('Failed to log out')
    }
  }

  return (
    /*
     * Outer shell: flex row, full height.
     * On desktop the sidebar is a normal flex child (w-56, shrink-0, sticky).
     * The main content div (flex-1) fills the remaining space naturally.
     */
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950 flex flex-row">

      {/* ── Mobile overlay ───────────────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        />
      )}

      {/* ── Desktop sidebar (in document flow, not fixed) ─────── */}
      <aside className="hidden md:flex md:flex-col md:shrink-0 md:w-52 md:min-h-screen md:sticky md:top-0 md:h-screen bg-zinc-900 border-r border-zinc-800/80 p-4 overflow-y-auto admin-scroll">
        <SidebarContent
          onClose={() => {}}
          pathname={pathname}
          handleLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile drawer (fixed overlay, slides in) ─────────── */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-56 bg-zinc-900 border-r border-zinc-800/80 p-4 overflow-y-auto admin-scroll flex flex-col md:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          onClose={() => setMobileOpen(false)}
          pathname={pathname}
          handleLogout={handleLogout}
        />
      </aside>

      {/* ── Main content area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-zinc-900/90 border-b border-zinc-800/80 px-6 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-4">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3.5 py-1.5 text-xs text-zinc-400">
              <Search className="w-4 h-4 text-zinc-500" />
              <span>Press / to search dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-amber-400 hover:border-zinc-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button
              title="Notifications"
              className="relative p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />
            </button>

            {/* Profile */}
            <Link
              href="/admin/profile"
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30 text-xs">
                AD
              </div>
              <span className="hidden lg:block text-xs font-semibold text-zinc-200">Admin</span>
            </Link>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

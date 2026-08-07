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

  const sidebarNav = (
    <>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(63,63,70,0.8)' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#fbbf24,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles style={{ width: 16, height: 16, color: '#09090b' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#fff', lineHeight: 1 }}>THURAYA</div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#fbbf24', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>Admin Panel</div>
          </div>
        </Link>
        <button onClick={() => setMobileOpen(false)} style={{ display: 'none', padding: 6, borderRadius: 8, background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }} className="md-hide-close">
          <X style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 13,
                transition: 'all 0.15s',
                background: isActive ? 'linear-gradient(90deg,#f59e0b,#d97706)' : 'transparent',
                color: isActive ? '#09090b' : '#a1a1aa',
              }}
            >
              <Icon style={{ width: 15, height: 15, flexShrink: 0, color: isActive ? '#09090b' : '#71717a' }} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ paddingTop: 16, marginTop: 16, borderTop: '1px solid rgba(63,63,70,0.8)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link href="/ar" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 12, textDecoration: 'none', fontSize: 12, color: '#a1a1aa', background: 'rgba(63,63,70,0.4)' }}>
          <ExternalLink style={{ width: 14, height: 14, color: '#fbbf24', flexShrink: 0 }} />
          <span>View Storefront</span>
        </Link>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'none', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#f87171', width: '100%' }}
        >
          <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span>Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <div style={{ height: '100vh', background: '#09090b', color: '#f4f4f5', display: 'flex', flexDirection: 'row', fontFamily: 'sans-serif', overflow: 'hidden' }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 210,
          minWidth: 210,
          maxWidth: 210,
          minHeight: '100vh',
          background: 'rgba(24,24,27,0.98)',
          borderRight: '1px solid rgba(63,63,70,0.8)',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {sidebarNav}
      </aside>

      {/* ── Main content area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>

        {/* Top header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          height: 64,
          background: 'rgba(24,24,27,0.9)',
          borderBottom: '1px solid rgba(63,63,70,0.8)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{ padding: 8, borderRadius: 12, background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'none' }}
              className="mobile-menu-btn"
            >
              <Menu style={{ width: 24, height: 24 }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(63,63,70,0.5)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: 12, padding: '6px 14px', fontSize: 12, color: '#71717a' }}>
              <Search style={{ width: 14, height: 14, color: '#52525b' }} />
              <span>Press / to search dashboard</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={toggleTheme} style={{ padding: 10, borderRadius: 12, border: '1px solid rgba(63,63,70,0.8)', background: 'rgb(24,24,27)', color: '#a1a1aa', cursor: 'pointer' }}>
              {theme === 'dark' ? <Sun style={{ width: 18, height: 18 }} /> : <Moon style={{ width: 18, height: 18 }} />}
            </button>
            <button style={{ position: 'relative', padding: 10, borderRadius: 12, border: '1px solid rgba(63,63,70,0.8)', background: 'rgb(24,24,27)', color: '#a1a1aa', cursor: 'pointer' }}>
              <Bell style={{ width: 18, height: 18 }} />
              <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: '#f59e0b', borderRadius: '50%' }} />
            </button>
            <Link href="/admin/profile" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 12px 6px 8px', borderRadius: 12, border: '1px solid rgba(63,63,70,0.8)', background: 'rgba(24,24,27,0.6)', textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,158,11,0.3)', fontSize: 12 }}>AD</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#e4e4e7' }}>Admin</span>
            </Link>
          </div>
        </header>

        {/* Page body — generous padding away from sidebar */}
        <main style={{ flex: 1, padding: '40px 48px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

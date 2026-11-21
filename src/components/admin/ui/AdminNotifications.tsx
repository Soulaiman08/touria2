'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  ShoppingBag,
  User,
  AlertTriangle,
  XCircle,
  CheckCheck,
  ExternalLink,
} from 'lucide-react'
import { useAdminI18n } from '../providers/AdminI18nContext'

export interface NotificationItem {
  id: string
  type: string
  title: string
  description?: string | null
  targetUrl: string
  isRead: boolean
  createdAt: string
}

export function AdminNotifications() {
  const { tr, locale } = useAdminI18n()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const formatTimeAgo = useCallback(
    (dateString: string): string => {
      try {
        const date = new Date(dateString)
        const now = new Date()
        const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffSeconds < 60) return tr('الآن', 'Just now')
        const diffMinutes = Math.floor(diffSeconds / 60)
        if (diffMinutes < 60) {
          return locale === 'ar' ? `منذ ${diffMinutes} د` : `${diffMinutes}m ago`
        }
        const diffHours = Math.floor(diffMinutes / 60)
        if (diffHours < 24) {
          return locale === 'ar' ? `منذ ${diffHours} س` : `${diffHours}h ago`
        }
        const diffDays = Math.floor(diffHours / 24)
        if (diffDays < 7) {
          return locale === 'ar' ? `منذ ${diffDays} ي` : `${diffDays}d ago`
        }
        return date.toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'en-US', {
          month: 'short',
          day: 'numeric',
        })
      } catch {
        return ''
      }
    },
    [locale, tr]
  )

  useEffect(() => {
    let active = true
    async function loadNotifications() {
      try {
        const res = await fetch('/api/admin/notifications', { cache: 'no-store' })
        if (res.ok && active) {
          const data = (await res.json()) as {
            notifications: NotificationItem[]
            unreadCount: number
          }
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
      }
    }
    loadNotifications()
    const interval = setInterval(loadNotifications, 30_000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all' }),
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_one', id: item.id }),
      }).catch(() => {})

      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    setOpen(false)
    if (item.targetUrl) {
      router.push(item.targetUrl)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingBag className="w-4 h-4 text-amber-400" />
      case 'CUSTOMER':
        return <User className="w-4 h-4 text-sky-400" />
      case 'LOW_STOCK':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case 'OUT_OF_STOCK':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Bell className="w-4 h-4 text-amber-400" />
    }
  }

  return (
    <div ref={popoverRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title={tr('إشعارات المتجر', 'Store Notifications')}
        aria-label={tr('إشعارات المتجر', 'Store Notifications')}
        aria-expanded={open}
        className={`relative h-10 w-10 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
          open
            ? 'border-amber-500/60 bg-zinc-800 text-amber-400'
            : unreadCount > 0
              ? 'border-zinc-700/80 bg-zinc-900 text-amber-400 hover:border-zinc-600'
              : 'border-zinc-700/80 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
        }`}
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 text-[10px] font-black flex items-center justify-center border-2 border-zinc-900 tabular-nums shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] end-0 w-[min(360px,calc(100vw-2rem))] max-h-[460px] bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-bold text-white">{tr('الإشعارات', 'Notifications')}</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-extrabold tabular-nums">
                  {unreadCount} {tr('جديد', 'new')}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-[11px] font-bold px-2 py-1 rounded-lg hover:bg-amber-500/10 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{tr('تحديد الكل كمقروء', 'Mark all as read')}</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto max-h-[380px] admin-scroll divide-y divide-zinc-800/60">
            {notifications.length === 0 ? (
              <div className="py-10 px-5 text-center text-zinc-500">
                <Bell className="w-7 h-7 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold text-zinc-300">
                  {tr('لا توجد إشعارات بعد', 'No notifications yet')}
                </p>
                <p className="text-[11px] mt-1">
                  {tr(
                    'ستظهر هنا الطلبات الجديدة، العملاء وتنبيهات المخزون',
                    'New orders, customers and stock alerts will appear here'
                  )}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full px-4 py-3 text-start flex items-start gap-3 transition-colors hover:bg-zinc-800/60 cursor-pointer ${
                    item.isRead ? 'bg-transparent' : 'bg-amber-500/[0.04]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p
                        className={`text-xs truncate ${
                          item.isRead ? 'font-semibold text-zinc-200' : 'font-extrabold text-white'
                        }`}
                      >
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </div>

                    {item.description && (
                      <p className="text-[11.5px] text-zinc-400 leading-relaxed break-words mb-1">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold">
                      <span>{formatTimeAgo(item.createdAt)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

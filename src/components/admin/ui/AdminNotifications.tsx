'use client'

import { useEffect, useRef, useState } from 'react'
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

export interface NotificationItem {
  id: string
  type: string
  title: string
  description?: string | null
  targetUrl: string
  isRead: boolean
  createdAt: string
}

function timeAgo(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSeconds < 60) return 'Just now'
    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function AdminNotifications() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json() as { notifications: NotificationItem[]; unreadCount: number }
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  useEffect(() => {
    loadNotifications()
    // Poll every 30 seconds for new store events
    const interval = setInterval(loadNotifications, 30_000)
    return () => clearInterval(interval)
  }, [])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
    // If unread, mark as read on server
    if (!item.isRead) {
      try {
        fetch('/api/admin/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark_one', id: item.id }),
        }).catch(() => {})
      } catch {}

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
        return <ShoppingBag style={{ width: 15, height: 15, color: '#fbbf24' }} />
      case 'CUSTOMER':
        return <User style={{ width: 15, height: 15, color: '#60a5fa' }} />
      case 'LOW_STOCK':
        return <AlertTriangle style={{ width: 15, height: 15, color: '#f59e0b' }} />
      case 'OUT_OF_STOCK':
        return <XCircle style={{ width: 15, height: 15, color: '#ef4444' }} />
      default:
        return <Bell style={{ width: 15, height: 15, color: '#fbbf24' }} />
    }
  }

  return (
    <div ref={popoverRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        title="Store Notifications"
        style={{
          position: 'relative',
          padding: 10,
          borderRadius: 12,
          border: '1px solid rgba(63,63,70,0.8)',
          background: open ? 'rgba(63,63,70,0.6)' : 'rgb(24,24,27)',
          color: unreadCount > 0 ? '#fbbf24' : '#a1a1aa',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        <Bell style={{ width: 18, height: 18 }} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              padding: '0 4px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#09090b',
              fontSize: 10,
              fontWeight: 900,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgb(24,24,27)',
              boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 'clamp(290px, 90vw, 360px)',
            maxHeight: 460,
            background: 'rgb(24,24,27)',
            border: '1px solid rgba(63,63,70,0.8)',
            borderRadius: 16,
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(63,63,70,0.8)',
              background: 'rgba(9,9,11,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: 'rgba(245,158,11,0.15)',
                    color: '#fbbf24',
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  color: '#fbbf24',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: 6,
                }}
              >
                <CheckCheck style={{ width: 13, height: 13 }} />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 380 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#71717a' }}>
                <Bell style={{ width: 28, height: 28, margin: '0 auto 8px', opacity: 0.3 }} />
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>No notifications yet</p>
                <p style={{ fontSize: 11, margin: '4px 0 0', opacity: 0.8 }}>New orders, customers and stock alerts will appear here</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(63,63,70,0.3)',
                    background: item.isRead ? 'transparent' : 'rgba(245,158,11,0.04)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(63,63,70,0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = item.isRead ? 'transparent' : 'rgba(245,158,11,0.04)'
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: 'rgba(63,63,70,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {getIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                      <p style={{ fontSize: 12.5, fontWeight: item.isRead ? 700 : 900, color: item.isRead ? '#e4e4e7' : '#fff', margin: 0 }}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', flexShrink: 0 }} />
                      )}
                    </div>

                    {item.description && (
                      <p style={{ fontSize: 11.5, color: '#a1a1aa', margin: '0 0 4px', lineHeight: 1.4, wordBreak: 'break-word' }}>
                        {item.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, color: '#71717a', fontWeight: 600 }}>
                        {timeAgo(item.createdAt)}
                      </span>
                      <ExternalLink style={{ width: 11, height: 11, color: '#71717a' }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

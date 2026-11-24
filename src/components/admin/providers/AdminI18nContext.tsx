'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type AdminLocale = 'ar' | 'en'

export const ADMIN_LOCALE_COOKIE = 'thuraya_admin_locale'
const STORAGE_KEY = 'thuraya_admin_locale'

function persistAdminLocaleCookie(next: AdminLocale) {
  try {
    document.cookie = `${ADMIN_LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`
  } catch {
    // Ignore cookie write errors
  }
}

interface AdminI18nContextValue {
  locale: AdminLocale
  isRTL: boolean
  dir: 'rtl' | 'ltr'
  setLocale: (loc: AdminLocale) => void
  toggleLocale: () => void
  tr: (ar: string, en: string) => string
  statusLabel: (status: string) => string
  formatDate: (date: string | Date, withTime?: boolean) => string
}

const STATUS_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
  PENDING:    { ar: 'قيد الانتظار', en: 'Pending' },
  CONFIRMED:  { ar: 'مؤكد',         en: 'Confirmed' },
  PROCESSING: { ar: 'قيد التجهيز',  en: 'Processing' },
  SHIPPED:    { ar: 'تم الشحن',     en: 'Shipped' },
  DELIVERED:  { ar: 'تم التسليم',   en: 'Delivered' },
  CANCELLED:  { ar: 'ملغي',         en: 'Cancelled' },
  RETURNED:   { ar: 'مرجع',         en: 'Returned' },
}

const AdminI18nContext = createContext<AdminI18nContextValue>({
  locale: 'ar',
  isRTL: true,
  dir: 'rtl',
  setLocale: () => {},
  toggleLocale: () => {},
  tr: (ar) => ar,
  statusLabel: (status) => STATUS_TRANSLATIONS[status]?.ar ?? status,
  formatDate: (date) => {
    try {
      return new Date(date).toLocaleDateString('ar-MA')
    } catch {
      return ''
    }
  },
})

export function AdminI18nProvider({
  children,
  initialLocale = 'ar',
}: {
  children: React.ReactNode
  initialLocale?: AdminLocale
}) {
  const [locale, setLocaleState] = useState<AdminLocale>(initialLocale)

  useEffect(() => {
    let cancelled = false
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved === 'en' || saved === 'ar') {
        persistAdminLocaleCookie(saved)
        if (saved !== initialLocale) {
          queueMicrotask(() => {
            if (!cancelled) setLocaleState(saved)
          })
        }
      }
    } catch {
      // Ignore storage access errors
    }
    return () => {
      cancelled = true
    }
  }, [initialLocale])

  const setLocale = useCallback((next: AdminLocale) => {
    setLocaleState(next)
    persistAdminLocaleCookie(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore storage write errors
    }
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'ar' ? 'en' : 'ar')
  }, [locale, setLocale])

  const isRTL = locale === 'ar'
  const dir = isRTL ? 'rtl' : 'ltr'

  const tr = useCallback(
    (ar: string, en: string) => (locale === 'ar' ? ar : en),
    [locale]
  )

  const statusLabel = useCallback(
    (status: string) => {
      const entry = STATUS_TRANSLATIONS[status]
      if (!entry) return status
      return locale === 'ar' ? entry.ar : entry.en
    },
    [locale]
  )

  const formatDate = useCallback(
    (date: string | Date, withTime = false) => {
      try {
        const d = typeof date === 'string' ? new Date(date) : date
        if (Number.isNaN(d.getTime())) return '—'
        const intlLocale = locale === 'ar' ? 'ar-MA' : 'en-US'
        return withTime
          ? d.toLocaleString(intlLocale, { dateStyle: 'medium', timeStyle: 'short' })
          : d.toLocaleDateString(intlLocale, { year: 'numeric', month: 'short', day: 'numeric' })
      } catch {
        return '—'
      }
    },
    [locale]
  )

  return (
    <AdminI18nContext.Provider
      value={{ locale, isRTL, dir, setLocale, toggleLocale, tr, statusLabel, formatDate }}
    >
      {children}
    </AdminI18nContext.Provider>
  )
}

export function useAdminI18n() {
  return useContext(AdminI18nContext)
}

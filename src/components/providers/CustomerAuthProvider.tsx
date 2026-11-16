'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export interface CustomerUser {
  id: string
  name: string
  email: string | null
  phone: string | null
  avatarUrl: string | null
  createdAt?: string
}

interface CustomerAuthContextType {
  customer: CustomerUser | null
  loading: boolean
  isGuest: boolean
  isLoginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
  continueAsGuest: () => void
  refreshCustomer: () => Promise<CustomerUser | null>
  logout: () => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined)

const GUEST_STORAGE_KEY = 'thuraya_guest_dismissed'
const SUPPORTED_LOCALES = new Set(['ar', 'fr', 'en'])

export function CustomerAuthProvider({
  children,
  locale,
}: {
  children: React.ReactNode
  locale?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const checkedFirstVisitRef = useRef(false)

  const resolvedLocale = (() => {
    if (locale && SUPPORTED_LOCALES.has(locale)) return locale
    const seg = pathname?.split('/')[1]
    return seg && SUPPORTED_LOCALES.has(seg) ? seg : 'ar'
  })()

  const fetchCustomer = useCallback(async (): Promise<CustomerUser | null> => {
    try {
      const res = await fetch('/api/customer/me', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data?.user) {
          setCustomer(data.user)
          return data.user
        }
      }
      setCustomer(null)
      return null
    } catch {
      setCustomer(null)
      return null
    }
  }, [])

  useEffect(() => {
    if (checkedFirstVisitRef.current) return

    let isMounted = true

    async function initAuth() {
      try {
        const user = await fetchCustomer()
        if (!isMounted) return

        checkedFirstVisitRef.current = true

        // Check if visitor previously dismissed login as guest
        const dismissed =
          typeof window !== 'undefined' &&
          localStorage.getItem(GUEST_STORAGE_KEY) === 'true'
        const hasOnboardedCookie =
          typeof document !== 'undefined' &&
          document.cookie.split('; ').some((c) => c.startsWith('thuraya_onboarded='))

        if (dismissed || hasOnboardedCookie) {
          setIsGuest(true)
        }

        const currentPath =
          typeof window !== 'undefined' ? window.location.pathname : ''
        const isAuthOrAdminRoute =
          currentPath.includes('/login') ||
          currentPath.includes('/signup') ||
          currentPath.includes('/control-panel-ss7')

        // First-time visitor (not logged in and not yet onboarded/guest):
        // redirect to the dedicated /[locale]/login page instead of overlaying the homepage.
        if (!user && !dismissed && !hasOnboardedCookie && !isAuthOrAdminRoute) {
          const seg = currentPath.split('/')[1]
          const targetLocale = seg && SUPPORTED_LOCALES.has(seg) ? seg : 'ar'
          router.replace(`/${targetLocale}/login`)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [fetchCustomer, router])

  const openLoginModal = useCallback(() => {
    router.push(`/${resolvedLocale}/login`)
  }, [resolvedLocale, router])

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false)
  }, [])

  const continueAsGuest = useCallback(() => {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, 'true')
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
      const inIframe = typeof window !== 'undefined' && window.self !== window.top
      const sameSite = isSecure && inIframe ? 'None' : 'Lax'
      document.cookie = `thuraya_onboarded=1; path=/; SameSite=${sameSite}; max-age=31536000${isSecure ? '; Secure' : ''}`
    } catch {
      // ignore localstorage errors in restricted mode
    }
    setIsGuest(true)
    setIsLoginModalOpen(false)
  }, [])

  const refreshCustomer = useCallback(async () => {
    setLoading(true)
    try {
      const user = await fetchCustomer()
      if (user) {
        setIsLoginModalOpen(false)
      }
      return user
    } finally {
      setLoading(false)
    }
  }, [fetchCustomer])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/customer/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    setCustomer(null)
  }, [])

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        isGuest,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        continueAsGuest,
        refreshCustomer,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  }
  return context
}

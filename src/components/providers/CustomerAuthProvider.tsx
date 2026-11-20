'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

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
  continueAsGuest: () => void
  refreshCustomer: () => Promise<CustomerUser | null>
  logout: () => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined)

const GUEST_STORAGE_KEY = 'thuraya_guest_dismissed'

export function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode
  locale?: string
}) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const checkedFirstVisitRef = useRef(false)

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
        await fetchCustomer()
        if (!isMounted) return

        checkedFirstVisitRef.current = true

        let dismissed = false
        let hasOnboardedCookie = false
        try {
          dismissed =
            typeof window !== 'undefined' &&
            window.localStorage.getItem(GUEST_STORAGE_KEY) === 'true'
        } catch {
          dismissed = false
        }
        try {
          hasOnboardedCookie =
            typeof document !== 'undefined' &&
            document.cookie.split('; ').some((c) => c.startsWith('thuraya_onboarded='))
        } catch {
          hasOnboardedCookie = false
        }

        if (dismissed || hasOnboardedCookie) {
          setIsGuest(true)
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
  }, [fetchCustomer])

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
  }, [])

  const refreshCustomer = useCallback(async () => {
    setLoading(true)
    try {
      return await fetchCustomer()
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

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

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

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

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
    let isMounted = true

    async function initAuth() {
      try {
        const user = await fetchCustomer()
        if (!isMounted) return

        // Check if visitor previously dismissed login as guest
        const dismissed = typeof window !== 'undefined' ? localStorage.getItem(GUEST_STORAGE_KEY) : null
        if (dismissed === 'true') {
          setIsGuest(true)
        }

        // If not logged in and never dismissed, trigger first-visit overlay
        if (!user && dismissed !== 'true') {
          setIsLoginModalOpen(true)
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

  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true)
  }, [])

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false)
  }, [])

  const continueAsGuest = useCallback(() => {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, 'true')
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

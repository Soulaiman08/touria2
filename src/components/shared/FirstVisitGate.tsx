'use client'

/**
 * FirstVisitGate
 *
 * Rendered by the server-side homepage (page.tsx) when cookies indicate this
 * is a first-time visitor (no thuraya_onboarded, no customer_token).
 *
 * Because the server passes `defaultOpen={true}` as a prop, the overlay HTML
 * is included in the initial SSR output — there is NO flash of unstyled content.
 *
 * After hydration, control is handed off to CustomerAuthProvider's
 * isLoginModalOpen state (which CustomerLoginModal in the layout already
 * reacts to). This component only provides the SSR shell and the initial
 * openLoginModal() trigger.
 *
 * Google (and all other crawlers) receive the full homepage HTML beneath the
 * overlay and can index it normally. The overlay is not cloaking — everyone
 * gets the same HTML.
 */

import React, { useEffect, useRef, useState } from 'react'
import { useCustomerAuth } from '@/components/providers/CustomerAuthProvider'
import { CustomerLoginCard } from '@/components/auth/CustomerLoginCard'

interface FirstVisitGateProps {
  locale: string
  /**
   * Computed server-side: true when thuraya_onboarded and customer_token are
   * both absent from the incoming request cookies.
   */
  defaultOpen: boolean
}

export function FirstVisitGate({ locale, defaultOpen }: FirstVisitGateProps) {
  const { isLoginModalOpen, openLoginModal, closeLoginModal, customer, loading } =
    useCustomerAuth()

  // Track whether hydration is complete
  const [hydrated, setHydrated] = useState(false)
  const triggered = useRef(false)

  // After hydration, trigger the modal open if this is a first visit
  // and the auth provider hasn't already done so.
  useEffect(() => {
    setHydrated(true)
    if (triggered.current) return
    triggered.current = true

    if (defaultOpen && !loading && !customer) {
      openLoginModal()
    }
  }, [defaultOpen, loading, customer, openLoginModal])

  // Also trigger if auth finishes loading and still no user (handles race)
  useEffect(() => {
    if (!hydrated) return
    if (!defaultOpen) return
    if (loading) return
    if (customer) return
    if (!isLoginModalOpen) {
      openLoginModal()
    }
  }, [hydrated, defaultOpen, loading, customer, isLoginModalOpen, openLoginModal])

  // Pre-hydration: render the overlay directly from SSR HTML so there is zero
  // flash. Once hydrated, CustomerLoginModal in layout.tsx takes over via
  // isLoginModalOpen state, so we hide this SSR shell to avoid duplication.
  if (hydrated) return null

  // Server-render only: show overlay when defaultOpen is true
  if (!defaultOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        locale === 'ar' ? 'تسجيل الدخول' : locale === 'fr' ? 'Connexion' : 'Sign in'
      }
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      suppressHydrationWarning
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#060709]/85 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Login Card — same component used by CustomerLoginModal */}
      <div className="relative z-10 w-full max-w-[480px] my-auto">
        <CustomerLoginCard
          locale={locale}
          isModal={true}
          onClose={closeLoginModal}
          onSuccess={closeLoginModal}
        />
      </div>
    </div>
  )
}

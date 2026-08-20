'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCustomerAuth } from '@/components/providers/CustomerAuthProvider'
import { CustomerLoginCard } from './CustomerLoginCard'

interface CustomerLoginModalProps {
  locale: string
}

export function CustomerLoginModal({ locale }: CustomerLoginModalProps) {
  const pathname = usePathname()
  const { isLoginModalOpen, closeLoginModal } = useCustomerAuth()

  // Prevent overlay on dedicated login/signup/admin pages to avoid redundant UI
  const isDedicatedAuthPage =
    pathname?.includes('/login') ||
    pathname?.includes('/signup') ||
    pathname?.includes('/control-panel-ss7')

  // Close on ESC key
  useEffect(() => {
    if (!isLoginModalOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLoginModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLoginModalOpen, closeLoginModal])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isLoginModalOpen && !isDedicatedAuthPage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isLoginModalOpen, isDedicatedAuthPage])

  if (!isLoginModalOpen || isDedicatedAuthPage) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={closeLoginModal}
        className="fixed inset-0 bg-[#060709]/85 backdrop-blur-md transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Login Card Modal Container */}
      <div className="relative z-10 w-full max-w-[480px] my-auto animate-in fade-in duration-200">
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

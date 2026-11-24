'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function LocaleDocumentSync({ locale }: { locale: string }) {
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const pathname = usePathname()
  const prevPathnameRef = useRef<string | null>(null)
  const isPopStateRef = useRef(false)

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [locale, dir])

  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const isInitialMount = prevPathnameRef.current === null
    const pathnameChanged = prevPathnameRef.current !== pathname
    prevPathnameRef.current = pathname

    if (!pathnameChanged) return

    const wasPopState = isPopStateRef.current
    isPopStateRef.current = false

    if (window.location.hash) return
    if (isInitialMount || wasPopState) return

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    resetScroll()
    const rafId = window.requestAnimationFrame(() => {
      resetScroll()
    })
    const timerId = window.setTimeout(() => {
      if (window.scrollY > 0 && window.scrollY < 96) {
        resetScroll()
      }
    }, 60)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(timerId)
    }
  }, [pathname])

  return null
}

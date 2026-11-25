'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delayMs?: number
}

export function ScrollReveal({
  children,
  className,
  delayMs = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      const raf = window.requestAnimationFrame(() => setVisible(true))
      return () => window.cancelAnimationFrame(raf)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      {
        threshold: 0.02,
        rootMargin: '0px 0px -24px 0px',
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const clampedDelay = Math.max(0, Math.min(delayMs, 120))

  return (
    <div
      ref={ref}
      data-visible={visible ? 'true' : 'false'}
      className={cn('reveal-section', className)}
      style={
        clampedDelay > 0 && !visible
          ? { transitionDelay: `${clampedDelay}ms` }
          : clampedDelay > 0
            ? { transitionDelay: `${clampedDelay}ms` }
            : undefined
      }
    >
      {children}
    </div>
  )
}

'use client'

import { useEffect } from 'react'

export function VisitorTracker() {
  useEffect(() => {
    // Only track in browser and avoid re-triggering
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/visitors/track', { method: 'POST' }).catch(() => {})
      } catch {}
    }
  }, [])

  return null
}

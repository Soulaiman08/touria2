'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { formatVisitorCount } from '@/lib/visitor'

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadVisitors() {
      try {
        const res = await fetch('/api/admin/visitors', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json() as { count: number }
          if (mounted) setCount(data.count)
        }
      } catch (err) {
        console.error('Failed to load visitor count:', err)
      }
    }
    loadVisitors()
    // Poll every 60 seconds
    const interval = setInterval(loadVisitors, 60_000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const displayCount = count !== null ? formatVisitorCount(count) : '...'

  return (
    <div
      title={`Total Storefront Visitors: ${count !== null ? count.toLocaleString() : 'Loading...'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        borderRadius: 12,
        border: '1px solid rgba(63,63,70,0.8)',
        background: 'rgb(24,24,27)',
        color: '#a1a1aa',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.02em',
        userSelect: 'none',
      }}
    >
      <Eye style={{ width: 15, height: 15, color: '#fbbf24', flexShrink: 0 }} />
      <span style={{ color: '#f4f4f5', fontFamily: 'monospace', fontWeight: 800 }}>
        {displayCount}
      </span>
    </div>
  )
}

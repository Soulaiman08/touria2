'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { formatVisitorCount } from '@/lib/visitor'
import { useAdminI18n } from '../providers/AdminI18nContext'

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null)
  const { tr } = useAdminI18n()

  useEffect(() => {
    let mounted = true
    async function loadVisitors() {
      try {
        const res = await fetch('/api/admin/visitors', { cache: 'no-store' })
        if (res.ok) {
          const data = (await res.json()) as { count: number }
          if (mounted) setCount(data.count)
        }
      } catch (err) {
        console.error('Failed to load visitor count:', err)
      }
    }
    loadVisitors()
    const interval = setInterval(loadVisitors, 60_000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const displayCount = count !== null ? formatVisitorCount(count) : '...'

  return (
    <div
      title={tr(
        `إجمالي زوار المتجر: ${count !== null ? count.toLocaleString() : '...'}`,
        `Total Storefront Visitors: ${count !== null ? count.toLocaleString() : 'Loading...'}`
      )}
      className="hidden sm:inline-flex h-10 items-center gap-2 px-3 rounded-xl border border-zinc-700/80 bg-zinc-900 text-zinc-300 text-xs font-bold select-none shrink-0 whitespace-nowrap"
    >
      <Eye className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
      <span className="text-zinc-100 font-mono tabular-nums font-extrabold">{displayCount}</span>
    </div>
  )
}

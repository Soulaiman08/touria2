'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { AdminLocale, useAdminI18n } from '../providers/AdminI18nContext'

const OPTIONS: Array<{ code: AdminLocale; label: string; shortLabel: string; dir: 'rtl' | 'ltr' }> = [
  { code: 'ar', label: 'العربية', shortLabel: 'AR', dir: 'rtl' },
  { code: 'en', label: 'English', shortLabel: 'EN', dir: 'ltr' },
]

function AdminFlag({ code }: { code: AdminLocale }) {
  if (code === 'ar') {
    return (
      <svg viewBox="0 0 28 20" aria-hidden="true" className="h-3.5 w-5 shrink-0 rounded-[3px] shadow-xs">
        <rect width="28" height="20" fill="#c1272d" />
        <path
          d="m14 4.3 1.5 4.5 4.7-.05-3.8 2.8 1.4 4.45-3.8-2.72-3.8 2.72 1.4-4.45-3.8-2.8 4.7.05z"
          fill="none"
          stroke="#006233"
          strokeWidth="1.2"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 28 20" aria-hidden="true" className="h-3.5 w-5 shrink-0 rounded-[3px] shadow-xs">
      <rect width="28" height="20" fill="#244c8e" />
      <path d="M0 0 28 20M28 0 0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 28 20M28 0 0 20" stroke="#cf2b3a" strokeWidth="1.8" />
      <path d="M14 0v20M0 10h28" stroke="#fff" strokeWidth="6" />
      <path d="M14 0v20M0 10h28" stroke="#cf2b3a" strokeWidth="3.2" />
    </svg>
  )
}

export function AdminLanguageSwitcher() {
  const { locale, setLocale, tr } = useAdminI18n()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const current = OPTIONS.find((o) => o.code === locale) ?? OPTIONS[0]

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleOutside)
      window.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={tr('تبديل لغة لوحة التحكم', 'Switch admin language')}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex h-10 items-center justify-center gap-2 rounded-xl border px-2.5 sm:px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 whitespace-nowrap shrink-0 cursor-pointer ${
          open
            ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
            : 'border-zinc-700/80 bg-zinc-900 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800/80'
        }`}
      >
        <Globe className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
        <span className="hidden md:inline">{current.label}</span>
        <span className="md:hidden font-mono text-[11px]">{current.shortLabel}</span>
        <ChevronDown
          className={`hidden sm:block h-3.5 w-3.5 text-zinc-400 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={tr('اختر اللغة', 'Select language')}
          className="absolute top-full end-0 mt-2 w-40 rounded-xl border border-zinc-700/80 bg-zinc-900 p-1.5 shadow-2xl z-50 animate-in fade-in duration-200"
        >
          {OPTIONS.map((opt) => {
            const active = opt.code === locale
            return (
              <button
                key={opt.code}
                type="button"
                role="option"
                aria-selected={active}
                dir={opt.dir}
                onClick={() => {
                  setLocale(opt.code)
                  setOpen(false)
                }}
                className={`flex h-9 w-full items-center justify-between gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <AdminFlag code={opt.code} />
                  <span>{opt.label}</span>
                </span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

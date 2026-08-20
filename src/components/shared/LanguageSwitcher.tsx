'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  locale: string
  align?: 'start' | 'end'
}

const LOCALES = [
  { code: 'ar', label: 'العربية', flag: 'ma', dir: 'rtl' },
  { code: 'fr', label: 'Français', flag: 'fr', dir: 'ltr' },
  { code: 'en', label: 'English', flag: 'gb', dir: 'ltr' },
] as const

function LanguageFlag({ flag }: { flag: (typeof LOCALES)[number]['flag'] }) {
  if (flag === 'ma') {
    return (
      <svg viewBox="0 0 28 20" aria-hidden="true" className="h-4 w-6 rounded-[3px] shadow-sm">
        <rect width="28" height="20" fill="#c1272d" />
        <path d="m14 4.3 1.5 4.5 4.7-.05-3.8 2.8 1.4 4.45-3.8-2.72-3.8 2.72 1.4-4.45-3.8-2.8 4.7.05z" fill="none" stroke="#006233" strokeWidth="1.1" />
      </svg>
    )
  }

  if (flag === 'fr') {
    return (
      <svg viewBox="0 0 28 20" aria-hidden="true" className="h-4 w-6 rounded-[3px] shadow-sm">
        <path d="M0 0h9.35v20H0z" fill="#1d4f91" />
        <path d="M9.35 0H18.7v20H9.35z" fill="#fff" />
        <path d="M18.7 0H28v20h-9.3z" fill="#d6313d" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 28 20" aria-hidden="true" className="h-4 w-6 rounded-[3px] shadow-sm">
      <rect width="28" height="20" fill="#244c8e" />
      <path d="M0 0 28 20M28 0 0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 28 20M28 0 0 20" stroke="#cf2b3a" strokeWidth="1.8" />
      <path d="M14 0v20M0 10h28" stroke="#fff" strokeWidth="6" />
      <path d="M14 0v20M0 10h28" stroke="#cf2b3a" strokeWidth="3.2" />
    </svg>
  )
}

export function LanguageSwitcher({ locale, align = 'end' }: LanguageSwitcherProps) {
  const t = useTranslations('language')
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const switchLocale = (newLocale: string) => {
    setIsOpen(false)
    // Replace current locale prefix in path
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <div ref={containerRef} className="relative" dir="ltr">
      <button
        id="language-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'group flex h-10 w-10 items-center justify-center rounded-xl border p-0 text-sm font-semibold transition-all duration-200 sm:w-auto sm:justify-start sm:gap-2 sm:px-2.5',
          'hover:border-[#C4622D] hover:bg-[rgba(196,98,45,0.12)] hover:text-[#C4622D] hover:shadow-sm',
          isOpen && 'border-[#C4622D] bg-[rgba(196,98,45,0.12)] text-[#C4622D] shadow-sm',
        )}
        style={{
          borderColor: isOpen ? '#C4622D' : 'var(--border)',
          color: isOpen ? '#C4622D' : 'var(--text-secondary)',
          background: isOpen
            ? 'rgba(196, 98, 45, 0.12)'
            : 'var(--bg-subtle)',
        }}
        aria-label={t('switch')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex h-5 w-5 items-center justify-center">
          <Globe className="h-3 w-3" aria-hidden="true" />
        </span>
        <span className="hidden sm:inline whitespace-nowrap">{currentLocale.label}</span>
        <ChevronDown
          className={cn('ms-0.5 hidden h-3.5 w-3.5 transition-transform duration-200 sm:block', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full z-50 mt-1.5 w-36 rounded-2xl border p-1 shadow-lg animate-fade-in sm:w-40',
            align === 'end' ? 'end-0' : 'start-0',
          )}
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-elevated)',
            padding: '5px',
          }}
          role="listbox"
          aria-label={t('switch')}
        >
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              role="option"
              aria-selected={loc.code === locale}
              onClick={() => switchLocale(loc.code)}
              className={cn(
                'flex h-8 w-full items-center rounded-xl px-2 text-xs font-medium transition-all duration-150',
                'hover:bg-[rgba(196,98,45,0.10)] hover:text-[#C4622D]',
                loc.code === locale && 'bg-[rgba(196,98,45,0.10)] text-[#C4622D] font-semibold',
              )}
              style={{
                color: loc.code === locale ? '#C4622D' : 'var(--foreground)',
                paddingInline: '7px',
              }}
              dir="ltr"
            >
              {loc.dir === 'rtl' ? (
                <span className="flex flex-1 items-center justify-end gap-1" dir="rtl">
                  <span>{loc.label}</span>
                  <LanguageFlag flag={loc.flag} />
                </span>
              ) : (
                <span className="flex flex-1 items-center gap-1">
                  <LanguageFlag flag={loc.flag} />
                  <span>{loc.label}</span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

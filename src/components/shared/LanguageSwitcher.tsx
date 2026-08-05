'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  locale: string
}

const LOCALES = [
  { code: 'ar', label: 'العربية', flag: '🇲🇦', dir: 'rtl' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
] as const

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
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
          'flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-sm font-medium transition-all duration-200',
          'hover:border-[#C4622D] hover:text-[#C4622D] hover:bg-[rgba(196,98,45,0.08)]',
          isOpen && 'border-[#C4622D] text-[#C4622D] bg-[rgba(196,98,45,0.08)]',
        )}
        style={{
          borderColor: isOpen ? '#C4622D' : 'var(--border)',
          color: isOpen ? '#C4622D' : 'var(--muted-foreground)',
        }}
        aria-label={t('switch')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">{currentLocale.label}</span>
        <ChevronDown
          className={cn('w-3.5 h-3.5 transition-transform duration-200', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full mt-2 rounded-xl border shadow-lg overflow-hidden min-w-[140px] z-50 animate-fade-in"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-elevated)',
            right: 0,
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
                'flex items-center gap-3 w-full px-3.5 py-2.5 text-sm text-left transition-all duration-150',
                'hover:bg-[rgba(196,98,45,0.08)] hover:text-[#C4622D]',
                loc.code === locale && 'text-[#C4622D] bg-[rgba(196,98,45,0.06)] font-medium',
              )}
              style={{ color: loc.code === locale ? '#C4622D' : 'var(--foreground)' }}
              dir={loc.dir}
            >
              <span role="img" aria-label={loc.code} className="text-base">{loc.flag}</span>
              <span>{loc.label}</span>
              {loc.code === locale && (
                <span className="ms-auto text-[#C4622D]" aria-hidden="true">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

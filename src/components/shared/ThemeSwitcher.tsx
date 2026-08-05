'use client'

import { Sun, Moon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from '@/components/providers/ThemeProvider'
import { cn } from '@/lib/utils'

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme, mounted } = useTheme()
  const t = useTranslations('theme')

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      id="theme-switcher-btn"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'icon-btn touch-target',
      )}
      aria-label={isDark ? t('light') : t('dark')}
      title={isDark ? t('light') : t('dark')}
      suppressHydrationWarning
    >
      {/* Render placeholder during SSR to avoid hydration mismatch */}
      {!mounted ? (
        <span className="w-[18px] h-[18px] block" aria-hidden="true" />
      ) : isDark ? (
        <Sun className="w-[18px] h-[18px] transition-transform duration-300" aria-hidden="true" />
      ) : (
        <Moon className="w-[18px] h-[18px] transition-transform duration-300" aria-hidden="true" />
      )}
    </button>
  )
}

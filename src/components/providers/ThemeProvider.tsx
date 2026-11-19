'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = window.localStorage.getItem('thuraya-theme')
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // ignore storage access errors in restricted mobile browsers
  }
  return 'system'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Run once on mount: read stored preference and mark as mounted
  useEffect(() => {
    const stored = getStoredTheme()
    // Schedule both state updates outside the synchronous effect body
    // using a single microtask tick to satisfy react-hooks/set-state-in-effect
    const id = requestAnimationFrame(() => {
      setThemeState(stored)
      setMounted(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateResolved = () => {
      const resolved =
        theme === 'system'
          ? mediaQuery.matches
            ? 'dark'
            : 'light'
          : theme
      setResolvedTheme(resolved)
      document.documentElement.classList.toggle('dark', resolved === 'dark')
    }

    updateResolved()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateResolved)
      return () => mediaQuery.removeEventListener('change', updateResolved)
    }
    mediaQuery.addListener(updateResolved)
    return () => mediaQuery.removeListener(updateResolved)
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      window.localStorage.setItem('thuraya-theme', newTheme)
    } catch {
      // ignore storage write errors in restricted mobile browsers
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    let saved: Theme | null = null
    try {
      saved = window.localStorage.getItem('admin_theme') as Theme | null
    } catch {
      saved = null
    }
    const id = requestAnimationFrame(() => {
      if (saved) {
        setTheme(saved)
        if (saved === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      } else {
        document.documentElement.classList.add('dark')
      }
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      window.localStorage.setItem('admin_theme', next)
    } catch {
      // ignore storage write errors
    }
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useAdminTheme must be used within ThemeProvider')
  }
  return context
}

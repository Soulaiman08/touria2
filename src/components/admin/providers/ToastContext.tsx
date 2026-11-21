'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useAdminI18n } from './AdminI18nContext'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const { dir, tr } = useAdminI18n()

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev.slice(-3), { id, message, type }])

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = {
    toast: addToast,
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        dir={dir}
        aria-live="polite"
        className="fixed bottom-4 end-4 z-[90] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-2xl border text-xs sm:text-sm font-semibold transition-all duration-200 backdrop-blur-md ${
              t.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-100 border-emerald-700/60'
                : t.type === 'error'
                ? 'bg-rose-950/95 text-rose-100 border-rose-700/60'
                : 'bg-zinc-900/95 text-zinc-100 border-zinc-700/70'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
              <span className="break-words">{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              aria-label={tr('إغلاق الإشعار', 'Dismiss notification')}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

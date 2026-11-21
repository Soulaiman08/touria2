'use client'

import React, { useEffect } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { useAdminI18n } from '../providers/AdminI18nContext'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { dir, tr } = useAdminI18n()

  useEffect(() => {
    if (!isOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isLoading) {
        onCancel()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, isLoading, onCancel])

  if (!isOpen) return null

  const resolvedConfirm = confirmText ?? tr('تأكيد', 'Confirm')
  const resolvedCancel = cancelText ?? tr('إلغاء', 'Cancel')

  return (
    <div
      dir={dir}
      onClick={() => !isLoading && onCancel()}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl p-6 shadow-2xl text-zinc-100"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label={tr('إغلاق النافذة', 'Close dialog')}
          className="absolute top-4 end-4 flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 pe-8">
          <div
            className={`p-3 rounded-xl shrink-0 border ${
              variant === 'danger'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                : variant === 'warning'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 id="confirm-modal-title" className="text-base sm:text-lg font-bold text-white">
              {title}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="h-10 px-4 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {resolvedCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-10 px-5 text-xs sm:text-sm font-bold rounded-xl text-white shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50 text-zinc-950'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{tr('جارٍ التنفيذ...', 'Processing...')}</span>
              </>
            ) : (
              resolvedConfirm
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

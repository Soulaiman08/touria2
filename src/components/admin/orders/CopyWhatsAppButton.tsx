'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Check } from 'lucide-react'
import { generateWhatsAppOrderMessage, WhatsAppOrderData } from '@/lib/whatsapp/orderMessage'
import { useToast } from '@/components/admin/providers/ToastContext'
import { useAdminI18n } from '@/components/admin/providers/AdminI18nContext'

interface CopyWhatsAppButtonProps {
  order: WhatsAppOrderData
  variant?: 'primary' | 'card' | 'compact'
  className?: string
  style?: React.CSSProperties
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.71 1.457h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function CopyWhatsAppButton({
  order,
  variant = 'primary',
  className = '',
  style = {},
}: CopyWhatsAppButtonProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastContext = useToast()
  const { tr } = useAdminI18n()

  const handleCopy = useCallback(async () => {
    try {
      const message = generateWhatsAppOrderMessage(order)

      if (!message || message.trim().length === 0) {
        throw new Error(tr('تعذر إنشاء نص الرسالة من بيانات الطلب', 'Unable to generate message from order data'))
      }

      let copiedSuccess = false

      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(message)
          copiedSuccess = true
        } catch {
          // Fall through to fallback
        }
      }

      if (!copiedSuccess && typeof document !== 'undefined') {
        const textarea = document.createElement('textarea')
        textarea.value = message
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        textarea.style.top = '0'
        textarea.setAttribute('readonly', '')
        document.body.appendChild(textarea)
        textarea.select()
        textarea.setSelectionRange(0, 99999)

        try {
          copiedSuccess = document.execCommand('copy')
        } catch (e) {
          console.error('Fallback copy failed:', e)
        } finally {
          document.body.removeChild(textarea)
        }
      }

      if (!copiedSuccess) {
        throw new Error(tr('فشل النسخ إلى الحافظة. يرجى مراجعة إذن الوصول.', 'Failed to copy to clipboard. Check browser permissions.'))
      }

      setCopied(true)
      toastContext?.success?.(tr('تم نسخ رسالة واتساب بنجاح', 'WhatsApp message copied'))

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setCopied(false)
      }, 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : tr('تعذر نسخ الرسالة', 'Failed to copy message')
      toastContext?.error?.(errorMessage)
    }
  }, [order, toastContext, tr])

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        style={style}
        className={`w-full h-11 flex items-center justify-center gap-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
          copied
            ? 'border-emerald-500/60 bg-emerald-900/70 text-emerald-200 shadow-lg shadow-emerald-950/30'
            : 'border-emerald-600/40 bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-100'
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{tr('تم نسخ الرسالة بنجاح', 'Message Copied')}</span>
          </>
        ) : (
          <>
            <WhatsAppIcon size={16} />
            <span>{tr('نسخ رسالة واتساب', 'Copy WhatsApp Message')}</span>
          </>
        )}
      </button>
    )
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        style={style}
        title={tr('نسخ رسالة واتساب', 'Copy WhatsApp message')}
        className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          copied
            ? 'border-emerald-500/60 bg-emerald-900/70 text-emerald-200'
            : 'border-emerald-600/35 bg-emerald-950/60 hover:bg-emerald-900/70 text-zinc-100'
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{tr('تم النسخ', 'Copied')}</span>
          </>
        ) : (
          <>
            <WhatsAppIcon size={14} />
            <span>{tr('واتساب', 'WhatsApp')}</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={style}
      className={`h-10 inline-flex items-center justify-center gap-2 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
        copied
          ? 'border-emerald-500/70 bg-emerald-800/80 text-emerald-100'
          : 'border-emerald-600/45 bg-emerald-900/65 hover:bg-emerald-800/80 text-white'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{tr('تم نسخ الرسالة', 'Copied')}</span>
        </>
      ) : (
        <>
          <WhatsAppIcon size={16} />
          <span>{tr('نسخ رسالة واتساب', 'Copy WhatsApp')}</span>
        </>
      )}
    </button>
  )
}

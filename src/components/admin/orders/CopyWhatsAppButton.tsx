'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Check, Copy } from 'lucide-react'
import { generateWhatsAppOrderMessage, WhatsAppOrderData } from '@/lib/whatsapp/orderMessage'
import { useToast } from '@/components/admin/providers/ToastContext'

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
      style={{ flexShrink: 0 }}
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
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const toastContext = useToast()

  const handleCopy = useCallback(async () => {
    try {
      const message = generateWhatsAppOrderMessage(order)

      if (!message || message.trim().length === 0) {
        throw new Error('تعذر إنشاء نص الرسالة من بيانات الطلب')
      }

      let copiedSuccess = false

      // 1. Try modern clipboard API
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(message)
          copiedSuccess = true
        } catch {
          // Fall through to fallback
        }
      }

      // 2. Fallback to textarea execCommand if needed
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
        throw new Error('فشل النسخ إلى الحافظة. يرجى مراجعة إذن الوصول.')
      }

      // Success feedback
      setCopied(true)
      if (toastContext?.success) {
        toastContext.success('تم نسخ رسالة واتساب بنجاح ✓')
      }

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setCopied(false)
      }, 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'تعذر نسخ الرسالة'
      if (toastContext?.error) {
        toastContext.error(errorMessage)
      } else {
        alert(errorMessage)
      }
    }
  }, [order, toastContext])

  // Style variations
  const isCopied = copied

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`group transition-all duration-200 ${className}`}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '12px 18px',
          borderRadius: 12,
          border: isCopied ? '1px solid rgba(16,185,129,0.6)' : '1px solid rgba(37,211,102,0.4)',
          background: isCopied
            ? 'linear-gradient(135deg, rgba(6,78,59,0.9), rgba(4,120,87,0.9))'
            : 'linear-gradient(135deg, rgba(20,83,45,0.7), rgba(22,101,52,0.6))',
          color: isCopied ? '#a7f3d0' : '#ffffff',
          fontSize: 13,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: isCopied
            ? '0 4px 20px rgba(16,185,129,0.3)'
            : '0 4px 16px rgba(34,197,94,0.18)',
          outline: 'none',
          ...style,
        }}
      >
        {isCopied ? (
          <>
            <Check style={{ width: 17, height: 17, color: '#34d399' }} />
            <span>✓ تم نسخ الرسالة بنجاح</span>
          </>
        ) : (
          <>
            <WhatsAppIcon size={17} />
            <span>📋 نسخ رسالة واتساب</span>
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
        title="نسخ رسالة واتساب"
        className={`transition-all duration-200 ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 10,
          border: isCopied ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(37,211,102,0.35)',
          background: isCopied
            ? 'rgba(6,78,59,0.85)'
            : 'rgba(20,83,45,0.6)',
          color: isCopied ? '#6ee7b7' : '#e2e8f0',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          outline: 'none',
          ...style,
        }}
      >
        {isCopied ? (
          <>
            <Check style={{ width: 14, height: 14, color: '#34d399' }} />
            <span>✓ تم النسخ</span>
          </>
        ) : (
          <>
            <WhatsAppIcon size={14} />
            <span>نسخ واتساب</span>
          </>
        )}
      </button>
    )
  }

  // Default 'primary' Header Button
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`group transition-all duration-200 ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '9px 16px',
        borderRadius: 12,
        border: isCopied ? '1px solid rgba(16,185,129,0.7)' : '1px solid rgba(37,211,102,0.45)',
        background: isCopied
          ? 'linear-gradient(135deg, #065f46, #047857)'
          : 'linear-gradient(135deg, rgba(21,128,61,0.85), rgba(22,101,52,0.95))',
        color: isCopied ? '#d1fae5' : '#ffffff',
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: isCopied
          ? '0 4px 18px rgba(16,185,129,0.35)'
          : '0 4px 14px rgba(34,197,94,0.22)',
        outline: 'none',
        ...style,
      }}
    >
      {isCopied ? (
        <>
          <Check style={{ width: 16, height: 16, color: '#6ee7b7' }} />
          <span>✓ تم نسخ الرسالة</span>
        </>
      ) : (
        <>
          <WhatsAppIcon size={16} />
          <span>📋 نسخ رسالة واتساب</span>
        </>
      )}
    </button>
  )
}

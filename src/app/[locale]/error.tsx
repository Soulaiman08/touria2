'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale === 'fr' || params?.locale === 'en' ? params.locale : 'ar'
  const isRTL = locale === 'ar'

  useEffect(() => {
    console.error('[LocaleError]', error)
  }, [error])

  const copy = {
    ar: {
      title: 'حدث خلل مؤقت أثناء تحميل الصفحة',
      desc: 'يرجى تحديث الصفحة أو العودة إلى المتجر للمتابعة.',
      retry: 'إعادة المحاولة',
      home: 'العودة للمتجر',
    },
    fr: {
      title: 'Une erreur temporaire est survenue',
      desc: 'Veuillez actualiser la page ou retourner à la boutique.',
      retry: 'Réessayer',
      home: 'Retour à la boutique',
    },
    en: {
      title: 'Something went wrong loading this page',
      desc: 'Please try refreshing or return to the store.',
      retry: 'Try again',
      home: 'Back to store',
    },
  }[locale]

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-[60dvh] flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center shadow-[var(--shadow-md)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--accent-ring)] bg-[var(--bg-subtle)] text-[var(--accent)]">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
          {copy.title}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
          {copy.desc}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-primary h-10 px-4 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>{copy.retry}</span>
          </button>
          <Link
            href={`/${locale}`}
            className="h-10 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent-ring)] inline-flex items-center gap-2 transition-colors"
          >
            <Home className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
            <span>{copy.home}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

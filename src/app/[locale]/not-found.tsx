'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ShoppingBag, Compass } from 'lucide-react'

export default function NotFoundPage() {
  const locale = useLocale()
  const t = useTranslations('errors.404')
  const isRTL = locale === 'ar'

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="container-brand page-shell py-16 sm:py-24 flex justify-center"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-7 sm:p-9 text-center flex flex-col items-center">
        {/* Moroccan Arch Icon Ornament */}
        <div className="w-16 h-20 rounded-t-[999px] rounded-b-xl bg-[var(--accent-light)] border border-[var(--gold-ring)] text-[var(--accent)] flex items-center justify-center mb-5">
          <Compass className="w-7 h-7" />
        </div>

        <p className="tabular-nums text-xs font-bold tracking-widest text-[var(--gold)] mb-1.5">
          404
        </p>

        <h1
          className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-2 text-balance"
          style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
        >
          {t('title')}
        </h1>

        <div className="flex items-center justify-center gap-2 my-3" aria-hidden="true">
          <span className="h-[1px] w-8 bg-[var(--gold)] opacity-60" />
          <span className="w-1.5 h-1.5 rotate-45 bg-[var(--gold)]" />
          <span className="h-[1px] w-8 bg-[var(--gold)] opacity-60" />
        </div>

        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 m-0">
          {t('subtitle')}
        </p>

        <Link
          href={`/${locale}`}
          className="btn btn-primary rounded-xl px-7 h-11 inline-flex items-center justify-center gap-2 text-sm font-bold"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t('back')}</span>
        </Link>
      </div>
    </div>
  )
}

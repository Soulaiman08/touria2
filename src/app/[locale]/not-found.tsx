'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShoppingBag, HelpCircle } from 'lucide-react'

export default function NotFoundPage() {
  const t = useTranslations('errors.404')

  return (
    <div className="container-brand py-24 text-center space-y-6 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)]">
        <HelpCircle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          {t('title')}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {t('subtitle')}
        </p>
      </div>
      <Link
        href="/ar"
        className="btn btn-primary btn-round px-8 py-3 inline-flex items-center gap-2"
      >
        <ShoppingBag className="w-5 h-5" />
        <span>{t('back')}</span>
      </Link>
    </div>
  )
}

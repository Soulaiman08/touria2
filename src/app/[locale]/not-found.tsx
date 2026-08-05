'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShoppingBag, HelpCircle } from 'lucide-react'

export default function NotFoundPage() {
  const t = useTranslations('errors.404')

  return (
    <div className="container-brand py-24 text-center space-y-6 max-w-md">
      <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-[rgba(196,98,45,0.05)] text-[#C4622D]">
        <HelpCircle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--foreground)' }}>
          {t('title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {t('subtitle')}
        </p>
      </div>
      <Link
        href="/ar"
        className="inline-flex py-3 px-8 rounded-xl font-semibold text-white transition-all duration-200 hover:bg-[#A34E23] items-center gap-2"
        style={{ background: '#C4622D' }}
      >
        <ShoppingBag className="w-5 h-5" />
        {t('back')}
      </Link>
    </div>
  )
}

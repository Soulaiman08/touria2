'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { CustomerLoginCard } from '@/components/auth/CustomerLoginCard'
import { SilkBackground } from '@/components/shared/SilkBackground'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export function CustomerLoginPageClient({ params }: LoginPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'
  const t = useTranslations('auth')

  const homeLabel =
    locale === 'ar' ? 'المتجر' : locale === 'fr' ? 'Boutique' : 'Store'

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative min-h-dvh w-full flex flex-col justify-between px-4 py-4 sm:px-6 sm:py-6 overflow-x-hidden"
    >
      <SilkBackground />

      {/* Top Auth Toolbar */}
      <header className="relative z-20 flex items-center justify-between gap-2.5 max-w-[1160px] w-full mx-auto">
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 h-10 px-3 sm:px-3.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]/85 backdrop-blur-md text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent-ring)] hover:text-[var(--accent)] transition-colors whitespace-nowrap"
          >
            <ArrowLeft className={`w-4 h-4 text-[var(--accent)] ${isRTL ? 'rotate-180' : ''}`} />
            <span>{homeLabel}</span>
          </Link>

          <Link
            href={`/${locale}/signup`}
            className="inline-flex items-center gap-1.5 h-10 px-3 sm:px-3.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]/85 backdrop-blur-md text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent-ring)] hover:text-[var(--accent)] transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 text-[var(--gold)]" aria-hidden="true" />
            <span>{t('createAccountAction')}</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher locale={locale} align={isRTL ? 'start' : 'end'} />
        </div>
      </header>

      {/* Main Centered Auth Card */}
      <main className="relative z-10 w-full my-auto py-6 sm:py-8">
        <CustomerLoginCard
          locale={locale}
          isModal={false}
          onSuccess={() => {
            router.push(`/${locale}/account`)
            router.refresh()
          }}
        />
      </main>

      <div className="h-2 shrink-0" aria-hidden="true" />
    </div>
  )
}

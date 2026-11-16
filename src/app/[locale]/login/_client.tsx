'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { UserPlus } from 'lucide-react'
import { CustomerLoginCard } from '@/components/auth/CustomerLoginCard'
import { SilkBackground } from '@/components/shared/SilkBackground'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export function CustomerLoginPageClient({ params }: LoginPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'
  const t = useTranslations('auth')

  return (
    <>
      <SilkBackground />
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="no-scrollbar"
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '70px 16px 20px 16px',
          overflowY: 'auto',
          zIndex: 1,
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 16px',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="auth-lang-switcher"
            style={{
              '--border': 'rgba(212, 174, 120, 0.25)',
              '--text-secondary': '#E6D5BF',
              '--bg-subtle': 'rgba(20, 13, 9, 0.65)',
              '--card': '#1E140E',
              '--card-bg': '#1E140E',
              '--foreground': '#FAF6F0',
              '--text-primary': '#FAF6F0',
              '--shadow-elevated': '0 10px 32px rgba(0, 0, 0, 0.5)',
            } as React.CSSProperties}
          >
            <LanguageSwitcher locale={locale} align={isRTL ? 'end' : 'start'} />
          </div>

          <Link
            href={`/${locale}/signup`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '40px',
              padding: '0 16px',
              borderRadius: '10px',
              border: '1px solid rgba(212, 174, 120, 0.25)',
              backgroundColor: 'rgba(20, 13, 9, 0.65)',
              color: '#FAF6F0',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            <UserPlus style={{ width: '16px', height: '16px', color: '#D4AE78' }} aria-hidden="true" />
            <span>{t('createAccountAction')}</span>
          </Link>
        </div>

        {/* Customer Login Card */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '460px',
            margin: 'auto',
            borderRadius: '18px',
          }}
        >
          <CustomerLoginCard
            locale={locale}
            isModal={false}
            onSuccess={() => {
              router.push(`/${locale}/account`)
              router.refresh()
            }}
          />
        </div>
      </div>
    </>
  )
}

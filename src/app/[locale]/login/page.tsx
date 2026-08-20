'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerLoginCard } from '@/components/auth/CustomerLoginCard'

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export default function CustomerLoginPage({ params }: LoginPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: '#140a03',
        overflowY: 'auto',
      }}
    >
      {/* Background pattern */}
      <div className="pattern-moroccan pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden="true"
      />

      {/* Customer Login Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '480px',
          margin: 'auto',
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
  )
}
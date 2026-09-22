import type { Metadata } from 'next'
import { CustomerSignupPageClient } from './_client'

interface SignupPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: SignupPageProps): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    ar: 'إنشاء حساب | ثريا المغربي',
    fr: 'Créer un compte | Thuraya Al-Maghribi',
    en: 'Create Account | Thuraya Al-Maghribi',
  }

  return {
    title: titles[locale] ?? titles.ar,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function CustomerSignupPage({ params }: SignupPageProps) {
  return <CustomerSignupPageClient params={params} />
}
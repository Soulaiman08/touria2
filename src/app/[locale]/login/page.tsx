import type { Metadata } from 'next'
import { CustomerLoginPageClient } from './_client'

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    ar: 'تسجيل الدخول | ثريا المغربي',
    fr: 'Connexion | Thuraya Al-Maghribi',
    en: 'Sign In | Thuraya Al-Maghribi',
  }

  return {
    title: titles[locale] ?? titles.ar,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function CustomerLoginPage({ params }: LoginPageProps) {
  return <CustomerLoginPageClient params={params} />
}
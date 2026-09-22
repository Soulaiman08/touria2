import type { Metadata } from 'next'
import { AccountPageClient } from './_client'

interface AccountPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AccountPageProps): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    ar: 'حسابي | ثريا المغربي',
    fr: 'Mon compte | Thuraya Al-Maghribi',
    en: 'My Account | Thuraya Al-Maghribi',
  }

  return {
    title: titles[locale] ?? titles.ar,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function AccountPage({ params }: AccountPageProps) {
  return <AccountPageClient params={params} />
}

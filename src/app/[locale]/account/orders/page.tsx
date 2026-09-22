import type { Metadata } from 'next'
import { AccountOrdersPageClient } from './_client'

interface AccountOrdersPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AccountOrdersPageProps): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    ar: 'طلباتي | ثريا المغربي',
    fr: 'Mes commandes | Thuraya Al-Maghribi',
    en: 'My Orders | Thuraya Al-Maghribi',
  }

  return {
    title: titles[locale] ?? titles.ar,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function AccountOrdersPage({ params }: AccountOrdersPageProps) {
  return <AccountOrdersPageClient params={params} />
}
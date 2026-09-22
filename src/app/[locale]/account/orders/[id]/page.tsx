import type { Metadata } from 'next'
import { AccountOrderDetailPageClient } from './_client'

interface AccountOrderDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: AccountOrderDetailPageProps): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    ar: 'تفاصيل الطلب | ثريا المغربي',
    fr: 'Détails de la commande | Thuraya Al-Maghribi',
    en: 'Order Details | Thuraya Al-Maghribi',
  }

  return {
    title: titles[locale] ?? titles.ar,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function AccountOrderDetailPage({ params }: AccountOrderDetailPageProps) {
  return <AccountOrderDetailPageClient params={params} />
}
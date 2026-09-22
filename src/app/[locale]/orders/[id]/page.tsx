import type { Metadata } from 'next'
import { OrderTrackingPageClient } from './_client'

interface TrackingPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: TrackingPageProps): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    ar: 'تتبع طلبك | ثريا المغربي',
    fr: 'Suivi de commande | Thuraya Al-Maghribi',
    en: 'Track Order | Thuraya Al-Maghribi',
  }

  return {
    title: titles[locale] ?? titles.ar,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function OrderTrackingPage({ params }: TrackingPageProps) {
  return <OrderTrackingPageClient params={params} />
}

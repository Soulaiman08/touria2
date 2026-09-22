import type { Metadata } from 'next'
import { OrdersPageClient } from './_client'

/**
 * Server Component wrapper for the Orders page.
 *
 * Exports noindex metadata so Google (and other search engines) do not index
 * this private page.  Google can still crawl the URL to discover the directive.
 * We intentionally do NOT block this URL in robots.txt for that reason.
 */

interface OrdersPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: OrdersPageProps): Promise<Metadata> {
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

export default function OrdersPage({ params }: OrdersPageProps) {
  return <OrdersPageClient params={params} />
}

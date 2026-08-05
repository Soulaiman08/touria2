import type { Metadata } from 'next'
import { DM_Sans, Cormorant_Garamond, Cairo } from 'next/font/google'
import './globals.css'

/* ── Latin Sans (body text) ── */
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

/* ── Display / Serif ── */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

/* ── Arabic (headings + body) ── */
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://thuraya-almaghribi.ma'
  ),
  title: {
    default: 'ثريا المغربي – أناقة مغربية أصيلة',
    template: '%s | ثريا المغربي',
  },
  description:
    'متجر ثريا المغربي – وجهتك الأولى للجلابيات والنقابات المغربية المصنوعة يدوياً بأجود الخامات وأرقى التصاميم.',
  keywords: [
    'جلابية', 'نقاب', 'ثريا المغربي', 'ملابس مغربية',
    'djellaba', 'niqab', 'maroc', 'moroccan fashion', 'تقليدي',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_MA',
    alternateLocale: ['fr_MA', 'en_US'],
    siteName: 'ثريا المغربي',
    images: [{ url: '/images/brand/og-image.jpg', width: 1200, height: 630, alt: 'ثريا المغربي' }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@thuraya_almaghribi',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/brand/logo-icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/images/brand/logo-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body
        className={`${dmSans.variable} ${cormorant.variable} ${cairo.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}

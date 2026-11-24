import React from 'react'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import {
  AdminI18nProvider,
  type AdminLocale,
} from '@/components/admin/providers/AdminI18nContext'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

const ADMIN_LOCALE_COOKIE = 'thuraya_admin_locale'

export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const raw = cookieStore.get(ADMIN_LOCALE_COOKIE)?.value
  const initialLocale: AdminLocale = raw === 'en' ? 'en' : 'ar'
  return <AdminI18nProvider initialLocale={initialLocale}>{children}</AdminI18nProvider>
}

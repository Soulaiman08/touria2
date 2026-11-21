import React from 'react'
import { AdminI18nProvider } from '@/components/admin/providers/AdminI18nContext'

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return <AdminI18nProvider>{children}</AdminI18nProvider>
}

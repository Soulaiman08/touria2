'use client'

import { useEffect } from 'react'

export function LocaleDocumentSync({ locale }: { locale: string }) {
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [locale, dir])

  return null
}

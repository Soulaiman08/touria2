'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-dvh flex items-center justify-center bg-[#f6f1ea] text-[#24160e] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#e3d7c6] bg-white p-6 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#faf5ee] text-[#9b4819]">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold mb-2">
            تعذّر تحميل الصفحة مؤقتاً
          </h1>
          <p className="text-sm text-[#6b5648] mb-6 leading-relaxed">
            يرجى إعادة المحاولة أو تحديث المتصفح للمتابعة.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#9b4819] px-5 text-sm font-semibold text-white cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      </body>
    </html>
  )
}

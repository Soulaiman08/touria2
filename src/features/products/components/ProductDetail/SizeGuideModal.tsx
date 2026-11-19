'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Ruler, Info } from 'lucide-react'

interface SizeGuideModalProps {
  isOpen: boolean
  onClose: () => void
  locale: string
}

interface SizeRow {
  size: string
  chest: string
  length: string
  shoulder: string
  height: string
}

const SIZE_ROWS: SizeRow[] = [
  { size: 'XS', chest: '96–100', length: '134', shoulder: '40', height: '152–158' },
  { size: 'S', chest: '101–105', length: '137', shoulder: '42', height: '158–163' },
  { size: 'M', chest: '106–112', length: '140', shoulder: '44', height: '163–168' },
  { size: 'L', chest: '113–118', length: '143', shoulder: '46', height: '168–173' },
  { size: 'XL', chest: '119–124', length: '146', shoulder: '48', height: '172–177' },
  { size: 'XXL', chest: '125–132', length: '148', shoulder: '50', height: '175–180' },
  { size: 'XXXL', chest: '133–140', length: '150', shoulder: '52', height: '176–182' },
]

export function SizeGuideModal({ isOpen, onClose, locale }: SizeGuideModalProps) {
  const isRTL = locale === 'ar'

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  const title =
    locale === 'ar'
      ? 'دليل مقاسات الجلابة المغربية'
      : locale === 'fr'
        ? 'Guide des tailles — Djellaba'
        : 'Djellaba Size Guide'

  const subtitle =
    locale === 'ar'
      ? 'جميع القياسات بالسنتيمتر (سم) ومصممة بقصة مريحة ومحتشمة.'
      : locale === 'fr'
        ? 'Toutes les mesures sont en centimètres (cm), coupe ample et pudique.'
        : 'All measurements are in centimeters (cm) tailored for a modest, flowing fit.'

  const headers =
    locale === 'ar'
      ? {
          size: 'المقاس',
          chest: 'محيط الصدر',
          length: 'الطول الكلي',
          shoulder: 'الكتف',
          height: 'الطول الموصى به',
        }
      : locale === 'fr'
        ? {
            size: 'Taille',
            chest: 'Poitrine (cm)',
            length: 'Longueur (cm)',
            shoulder: 'Épaules (cm)',
            height: 'Stature (cm)',
          }
        : {
            size: 'Size',
            chest: 'Chest (cm)',
            length: 'Length (cm)',
            shoulder: 'Shoulder (cm)',
            height: 'Rec. Height',
          }

  const tip =
    locale === 'ar'
      ? 'نصيحة ثريا: الجلابة المغربية تأتي بقصة واسعة وأنيقة. إذا كان قياسك بين مقاسين، نوصي باختيار المقاس الأكبر لراحة أكبر.'
      : locale === 'fr'
        ? 'Conseil Thuraya : la coupe est ample et fluide. Entre deux tailles, privilégiez la taille supérieure pour plus de confort.'
        : 'Thuraya fit note: Our djellabas have a generous modest drape. If between two sizes, choose the larger size for optimal drape.'

  const closeLabel =
    locale === 'ar' ? 'إغلاق دليل المقاسات' : locale === 'fr' ? 'Fermer le guide' : 'Close size guide'

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[88dvh] overflow-y-auto no-scrollbar rounded-2xl border p-4 sm:p-6 shadow-2xl"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-3 pb-3.5 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <div
              className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border"
              style={{
                background: 'var(--accent-light)',
                borderColor: 'var(--accent-ring)',
                color: 'var(--accent)',
              }}
            >
              <Ruler className="h-4 w-4" />
            </div>
            <div className="text-start">
              <h2
                id="size-guide-title"
                className="text-base sm:text-lg font-bold leading-snug text-start"
                style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
              >
                {title}
              </h2>
              <p className="text-xs mt-0.5 text-start" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto no-scrollbar rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-start border-collapse text-xs sm:text-sm tabular-nums">
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                <th className="py-2.5 px-3 font-semibold text-start border-b" style={{ borderColor: 'var(--border)' }}>
                  {headers.size}
                </th>
                <th className="py-2.5 px-3 font-semibold text-start border-b" style={{ borderColor: 'var(--border)' }}>
                  {headers.chest}
                </th>
                <th className="py-2.5 px-3 font-semibold text-start border-b" style={{ borderColor: 'var(--border)' }}>
                  {headers.length}
                </th>
                <th className="py-2.5 px-3 font-semibold text-start border-b" style={{ borderColor: 'var(--border)' }}>
                  {headers.shoulder}
                </th>
                <th className="py-2.5 px-3 font-semibold text-start border-b" style={{ borderColor: 'var(--border)' }}>
                  {headers.height}
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZE_ROWS.map((row, idx) => (
                <tr
                  key={row.size}
                  className="transition-colors hover:bg-[var(--bg-subtle)]/70"
                  style={{
                    borderTop: idx > 0 ? '1px solid var(--border-subtle)' : undefined,
                  }}
                >
                  <td className="py-2.5 px-3 font-bold text-start" style={{ color: 'var(--accent)' }}>
                    <span dir="ltr" className="inline-block">{row.size}</span>
                  </td>
                  <td className="py-2.5 px-3 text-start" style={{ color: 'var(--text-primary)' }}>
                    <span dir="ltr" className="inline-block">{row.chest}</span>
                  </td>
                  <td className="py-2.5 px-3 text-start" style={{ color: 'var(--text-primary)' }}>
                    <span dir="ltr" className="inline-block">{row.length}</span>
                  </td>
                  <td className="py-2.5 px-3 text-start" style={{ color: 'var(--text-primary)' }}>
                    <span dir="ltr" className="inline-block">{row.shoulder}</span>
                  </td>
                  <td className="py-2.5 px-3 text-start" style={{ color: 'var(--text-muted)' }}>
                    <span dir="ltr" className="inline-block">{row.height}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="mt-4 flex items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed text-start"
          style={{
            background: 'var(--accent-light)',
            borderColor: 'var(--accent-ring)',
            color: 'var(--text-secondary)',
          }}
        >
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
          <p className="text-start m-0">{tip}</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}

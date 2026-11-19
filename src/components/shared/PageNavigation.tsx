import { Fragment } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  href: string
  label: string
  locale: string
  className?: string
}

export function BackButton({ href, label, locale, className }: BackButtonProps) {
  const isRTL = locale === 'ar'

  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-2 h-9 sm:h-10 ps-1.5 pe-3 sm:pe-3.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]/95 text-xs sm:text-[13px] font-semibold text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 active:scale-[0.98] whitespace-nowrap shrink-0 no-underline',
        className
      )}
    >
      <span className="flex h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--accent-ring)] bg-[var(--accent-light)] text-[var(--accent)] transition-colors duration-200 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-white">
        <ArrowLeft
          aria-hidden="true"
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-200',
            isRTL ? 'rotate-180 group-hover:translate-x-0.5' : 'group-hover:-translate-x-0.5'
          )}
        />
      </span>
      <span>{label}</span>
    </Link>
  )
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbBarProps {
  items: BreadcrumbItem[]
  locale: string
  backHref?: string
  backLabel?: string
  className?: string
}

export function BreadcrumbBar({
  items,
  locale,
  backHref,
  backLabel,
  className,
}: BreadcrumbBarProps) {
  const isRTL = locale === 'ar'

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={cn('flex flex-wrap items-center justify-between gap-2 sm:gap-3', className)}
    >
      <nav
        aria-label={isRTL ? 'مسار التنقل' : locale === 'fr' ? "Fil d'Ariane" : 'Breadcrumb'}
        className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 h-9 sm:h-10 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]/95 shadow-[var(--shadow-sm)] text-[11px] sm:text-xs min-w-0 max-w-full overflow-hidden"
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          const isFirst = idx === 0
          return (
            <Fragment key={`${item.label}-${idx}`}>
              {idx > 0 && (
                <ChevronRight
                  aria-hidden="true"
                  className={cn(
                    'w-3.5 h-3.5 flex-shrink-0 text-[var(--gold)]/75',
                    isRTL && 'rotate-180'
                  )}
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 px-1.5 sm:px-2 py-1 rounded-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)] transition-colors whitespace-nowrap flex-shrink-0 no-underline"
                >
                  {isFirst && (
                    <Home
                      aria-hidden="true"
                      className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0"
                    />
                  )}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="px-1.5 sm:px-2 py-1 font-bold text-[var(--text-primary)] truncate"
                >
                  {item.label}
                </span>
              )}
            </Fragment>
          )
        })}
      </nav>

      {backHref && backLabel && (
        <BackButton href={backHref} label={backLabel} locale={locale} className="max-sm:ms-auto" />
      )}
    </div>
  )
}

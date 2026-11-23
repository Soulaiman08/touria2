import { Fragment } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ChevronRight, Home } from 'lucide-react'
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
        'group inline-flex items-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-lg border border-[var(--border)] bg-[var(--card-bg)]/90 text-xs font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]/50 active:scale-[0.98] whitespace-nowrap shrink-0 no-underline',
        className
      )}
    >
      <ArrowLeft
        aria-hidden="true"
        className={cn(
          'w-3.5 h-3.5 text-[var(--accent)] transition-transform duration-200 flex-shrink-0',
          isRTL ? 'rotate-180 group-hover:translate-x-0.5' : 'group-hover:-translate-x-0.5'
        )}
      />
      <span>{label}</span>
    </Link>
  )
}

interface ForwardButtonProps {
  href: string
  label: string
  locale: string
  className?: string
  size?: 'sm' | 'md'
  variant?: 'default' | 'accent'
}

export function ForwardButton({
  href,
  label,
  locale,
  className,
  size = 'md',
  variant = 'default',
}: ForwardButtonProps) {
  const isRTL = locale === 'ar'

  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-1.5 rounded-lg border bg-[var(--card-bg)]/90 font-semibold transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]/50 active:scale-[0.98] whitespace-nowrap shrink-0 no-underline',
        size === 'sm'
          ? 'h-8 px-2.5 sm:px-3 text-[11px] sm:text-xs'
          : 'h-8 sm:h-9 px-3 sm:px-3.5 text-xs',
        variant === 'accent'
          ? 'border-[var(--accent-ring)] text-[var(--accent)]'
          : 'border-[var(--border)] text-[var(--text-secondary)]',
        className
      )}
    >
      <span>{label}</span>
      <ArrowRight
        aria-hidden="true"
        className={cn(
          'w-3.5 h-3.5 text-[var(--accent)] transition-transform duration-200 flex-shrink-0',
          isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
        )}
      />
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
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-1 sm:pb-1.5 min-w-0 w-full',
        className
      )}
    >
      <nav
        aria-label={isRTL ? 'مسار التنقل' : locale === 'fr' ? "Fil d'Ariane" : 'Breadcrumb'}
        className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-[13px] min-w-[min(100%,13.5rem)] flex-1 overflow-hidden"
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
                    'w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)]/60',
                    isRTL && 'rotate-180'
                  )}
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 py-1 font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors whitespace-nowrap flex-shrink-0 no-underline"
                >
                  {isFirst && (
                    <Home
                      aria-hidden="true"
                      className="w-3.5 h-3.5 text-[var(--gold)] flex-shrink-0"
                    />
                  )}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="py-1 font-semibold text-[var(--text-primary)] truncate min-w-0"
                >
                  {item.label}
                </span>
              )}
            </Fragment>
          )
        })}
      </nav>

      {backHref && backLabel && (
        <BackButton href={backHref} label={backLabel} locale={locale} className="ms-auto" />
      )}
    </div>
  )
}

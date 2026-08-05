'use client'

import { siteConfig } from '@/config/site'

// SVG icons defined once, no JSX overhead on server
const SOCIAL_ICONS = {
  TikTok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.38a8.16 8.16 0 004.77 1.52V7.47a4.85 4.85 0 01-1-.78z"/>
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
}

const LINKS = [
  { href: siteConfig.social.tiktok,                      label: 'TikTok',   hoverColor: '#000000' },
  { href: siteConfig.social.facebook,                    label: 'Facebook', hoverColor: '#1877F2' },
  { href: 'https://youtube.com/@thuraya.almaghribi',     label: 'YouTube',  hoverColor: '#FF0000' },
] as const

/**
 * Social pill buttons row used in the homepage Contact section.
 * Must be a Client Component because it uses onMouseEnter/onMouseLeave.
 */
export function SocialPills() {
  return (
    <div className="mt-10 flex flex-wrap justify-center gap-4" dir="ltr">
      {LINKS.map(s => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all hover:scale-105"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--card-bg)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = s.hoverColor }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)' }}
        >
          {SOCIAL_ICONS[s.label]}
          {s.label}
        </a>
      ))}
    </div>
  )
}

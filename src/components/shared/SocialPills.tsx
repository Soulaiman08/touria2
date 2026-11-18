'use client'

import { FaTiktok, FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa6'
import { siteConfig } from '@/config/site'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const SOCIAL_ICONS = {
  TikTok: <FaTiktok className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />,
  Facebook: <FaFacebookF className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />,
  YouTube: <FaYoutube className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />,
  Instagram: <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />,
}

export function SocialPills() {
  const { settings } = useSiteSettings()

  const links = [
    { href: settings?.instagram?.trim() || siteConfig.social.instagram, label: 'Instagram' as const, colorClass: 'social-brand-instagram' },
    { href: settings?.tiktok?.trim() || siteConfig.social.tiktok,       label: 'TikTok' as const,    colorClass: 'social-brand-tiktok' },
    { href: settings?.facebook?.trim() || siteConfig.social.facebook,   label: 'Facebook' as const,  colorClass: 'social-brand-facebook' },
    { href: settings?.youtube?.trim() || siteConfig.social.youtube,     label: 'YouTube' as const,   colorClass: 'social-brand-youtube' },
  ].filter(item => Boolean(item.href))

  return (
    <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4" dir="ltr">
      {links.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-300 hover:scale-105 ${s.colorClass}`}
        >
          {SOCIAL_ICONS[s.label]}
          <span>{s.label}</span>
        </a>
      ))}
    </div>
  )
}

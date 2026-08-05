'use client'

import Link from 'next/link'
import Image from 'next/image'
import { siteConfig } from '@/config/site'

interface FooterProps { locale: string }

const SOCIAL = [
  {
    name: 'Instagram', href: siteConfig.social.instagram,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    name: 'TikTok', href: siteConfig.social.tiktok,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.38a8.16 8.16 0 004.77 1.52V7.47a4.85 4.85 0 01-1-.78z"/>
      </svg>
    ),
  },
  {
    name: 'Facebook', href: siteConfig.social.facebook,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: 'WhatsApp', href: `https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    ),
  },
  {
    name: 'YouTube', href: 'https://youtube.com/@thuraya.almaghribi',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
]

const QUICK_LINKS = (locale: string, isRTL: boolean) => [
  { href: `/${locale}`,                          label: isRTL ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home' },
  { href: `/${locale}/products`,                 label: isRTL ? 'الجلابيات' : locale === 'fr' ? 'Djellabas' : 'Djellabas' },
  { href: `/${locale}/products?category=niqabs`, label: isRTL ? 'النقابات' : locale === 'fr' ? 'Niqabs' : 'Niqabs' },
  { href: `/${locale}/about`,                    label: isRTL ? 'عن المتجر' : locale === 'fr' ? 'À propos' : 'About' },
]

const LEGAL_LINKS = (locale: string, isRTL: boolean) => [
  { href: `/${locale}/privacy`,  label: isRTL ? 'سياسة الخصوصية' : locale === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy' },
  { href: `/${locale}/returns`,  label: isRTL ? 'سياسة الإرجاع'  : locale === 'fr' ? 'Politique de retour' : 'Return Policy' },
  { href: `/${locale}/faq`,      label: isRTL ? 'الأسئلة الشائعة' : locale === 'fr' ? 'FAQ' : 'FAQ' },
]

export function Footer({ locale }: FooterProps) {
  const isRTL = locale === 'ar'
  const year  = new Date().getFullYear()

  return (
    <footer
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'var(--brown-900, #1e0d04)', color: '#d4c5a9' }}
      role="contentinfo"
    >
      {/* Gold ornament top border */}
      <div
        className="h-0.5 w-full"
        style={{ background: 'linear-gradient(to right, transparent, #b8965a 40%, #d4ae78 50%, #b8965a 60%, transparent)' }}
      />

      <div className="container-brand py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={`/${locale}`} className="inline-block mb-4">
              <Image
                src="/images/brand/logo-full.png"
                alt={siteConfig.name}
                width={130} height={50}
                className="h-12 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#a08060' }}>
              {isRTL
                ? 'متجر ثريا المغربي — وجهتكِ الأولى للجلابيات والنقابات المغربية الأصيلة المصنوعة بأجود الخامات.'
                : locale === 'fr'
                  ? 'Thuraya Al-Maghribi — Votre destination pour les djellabas et niqabs marocains artisanaux.'
                  : 'Thuraya Al-Maghribi — Your destination for authentic handcrafted Moroccan fashion.'}
            </p>

            {/* Social Icons */}
            <div className="flex flex-wrap gap-2 mt-5">
              {SOCIAL.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: 'rgba(184,150,90,0.1)', color: '#b8965a' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(196,98,45,0.15)'
                    ;(e.currentTarget as HTMLElement).style.color = '#c4622d'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(184,150,90,0.1)'
                    ;(e.currentTarget as HTMLElement).style.color = '#b8965a'
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#b8965a', letterSpacing: '0.1em' }}>
              {isRTL ? 'روابط سريعة' : locale === 'fr' ? 'Liens rapides' : 'Quick Links'}
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS(locale, isRTL).map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors duration-150 hover:text-[#d4ae78]"
                    style={{ color: '#a08060' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#b8965a', letterSpacing: '0.1em' }}>
              {isRTL ? 'معلومات قانونية' : locale === 'fr' ? 'Informations légales' : 'Legal'}
            </h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS(locale, isRTL).map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors duration-150 hover:text-[#d4ae78]"
                    style={{ color: '#a08060' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#b8965a', letterSpacing: '0.1em' }}>
              {isRTL ? 'تواصل معنا' : locale === 'fr' ? 'Contact' : 'Contact'}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-[#d4ae78]"
                  style={{ color: '#a08060' }}
                  dir="ltr"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {siteConfig.contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm transition-colors hover:text-[#25D366]"
                  style={{ color: '#a08060' }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: '#25D366' }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-[#d4ae78] break-all"
                  style={{ color: '#a08060' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <p className="text-xs mt-1" style={{ color: '#6b4828' }}>
                  {isRTL ? 'الإثنين – الجمعة: 9ص – 6م' : 'Mon – Fri: 9AM – 6PM'}
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: '1px solid rgba(184,150,90,0.12)', color: '#6b4828' }}
        >
          <p>
            © {year}{' '}
            <span style={{ color: '#b8965a' }}>{siteConfig.name}</span>
            {' '}—{' '}
            {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
          <div className="flex items-center gap-1 opacity-60">
            <span>🇲🇦</span>
            <span>{isRTL ? 'صُنع في المغرب' : 'Made in Morocco'}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

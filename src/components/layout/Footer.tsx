'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { siteConfig } from '@/config/site'
import { useSiteSettings } from '@/hooks/useSiteSettings'

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  const isRTL = locale === 'ar'
  const year = new Date().getFullYear()
  const pathname = usePathname()
  const { settings } = useSiteSettings()
  const [logoError, setLogoError] = useState(false)

  const t = useTranslations('footer')

  // ── Contact & Social from database / settings ──────────────────────
  const phone = settings?.contactPhone?.trim() || siteConfig.contact.phone
  const email = settings?.contactEmail?.trim() || siteConfig.contact.email
  const address = settings?.address?.trim() || (isRTL ? 'الدار البيضاء، المغرب' : locale === 'fr' ? 'Casablanca, Maroc' : 'Casablanca, Morocco')

  const rawWhatsapp = settings?.whatsapp?.trim() || siteConfig.contact.whatsapp || ''
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '')
  const whatsappUrl = cleanWhatsapp
    ? rawWhatsapp.startsWith('http')
      ? rawWhatsapp
      : `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
          locale === 'ar'
            ? 'مرحباً، أريد الاستفسار عن منتجاتكم'
            : locale === 'fr'
              ? 'Bonjour, je souhaite me renseigner sur vos produits'
              : 'Hello, I would like to inquire about your products'
        )}`
    : ''

  const instagramUrl = settings?.instagram?.trim() || siteConfig.social.instagram || ''
  const facebookUrl = settings?.facebook?.trim() || siteConfig.social.facebook || ''
  const tiktokUrl = settings?.tiktok?.trim() || siteConfig.social.tiktok || ''
  const youtubeUrl = settings?.youtube?.trim() || siteConfig.social.youtube || ''

  const storeLogo = settings?.logo?.trim() || '/images/brand/logo-full.png'
  const storeName = settings?.storeName?.trim() || (isRTL ? siteConfig.name : siteConfig.nameEn)

  // ── Smooth Scroll Handler for Contact Us ───────────────────────────
  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/` || pathname === '/'
    if (isHomePage) {
      e.preventDefault()
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
        window.history.replaceState(null, '', `#contact`)
      }
    }
  }

  // ── Column 2: Quick Links ──────────────────────────────────────────
  const quickLinks = [
    { href: `/${locale}`, label: isRTL ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home' },
    { href: `/${locale}/products`, label: isRTL ? 'الجلابات' : locale === 'fr' ? 'Djellabas' : 'Djellabas' },
    { href: `/${locale}/products?category=niqabs`, label: isRTL ? 'النقاب' : locale === 'fr' ? 'Niqab' : 'Niqabs' },
    { href: `/${locale}/products?sort=sale`, label: isRTL ? 'العروض' : locale === 'fr' ? 'Offres' : 'Offers' },
    { href: `/${locale}/about`, label: isRTL ? 'من نحن' : locale === 'fr' ? 'À propos' : 'About Us' },
    { href: `/${locale}#contact`, label: isRTL ? 'اتصل بنا' : locale === 'fr' ? 'Contact' : 'Contact Us', isContact: true },
  ]

  // ── Column 3: Information & Policies ───────────────────────────────
  const infoLinks = [
    { href: `/${locale}/privacy`, label: isRTL ? 'سياسة الخصوصية' : locale === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy' },
    { href: `/${locale}/faq`, label: isRTL ? 'الأسئلة الشائعة' : locale === 'fr' ? 'FAQ' : 'FAQ' },
    { href: `/${locale}/orders`, label: isRTL ? 'تتبع الطلبات' : locale === 'fr' ? 'Suivi des commandes' : 'Track Orders' },
    { href: `/${locale}/faq#shipping`, label: isRTL ? 'الشحن والتوصيل' : locale === 'fr' ? 'Livraison' : 'Shipping & Delivery' },
  ]

  // Hide footer on dedicated auth pages (login, signup)
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/signup')
  if (isAuthPage) return null

  return (
    <footer
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        background: 'var(--footer-bg)',
        color: 'var(--footer-text)',
        borderTop: '1px solid var(--footer-border)',
      }}
      role="contentinfo"
      className="relative overflow-hidden"
    >
      {/* ── Luxury Gold Gradient Divider ────────────────────────────── */}
      <div
        className="h-[2px] w-full"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(184,150,90,0.4) 25%, #d4ae78 50%, rgba(184,150,90,0.4) 75%, transparent 100%)',
        }}
      />

      <div className="container-brand py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">

          {/* ── Column 1: Brand (lg:col-span-4) ────────────────────────── */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col items-start text-start">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 mb-3 group focus:outline-none"
              aria-label={storeName}
            >
              {!logoError ? (
                <Image
                  src={storeLogo}
                  alt={storeName}
                  width={140}
                  height={48}
                  className="h-10 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                  onError={() => setLogoError(true)}
                  priority={false}
                />
              ) : (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--footer-border)]"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="text-base font-extrabold tracking-wider" style={{ color: 'var(--footer-accent)' }}>
                    {storeName}
                  </span>
                </div>
              )}
            </Link>

            <h2 className="text-sm sm:text-base font-bold mb-1.5 tracking-wide" style={{ color: 'var(--footer-heading)' }}>
              {storeName}
            </h2>

            <p
              className="text-xs sm:text-sm leading-relaxed max-w-sm"
              style={{ color: 'var(--footer-muted)', textAlign: 'start' }}
            >
              {t('description')}
            </p>

            {/* Unified Social Media Icons */}
            <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
              {/* WhatsApp */}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all duration-300 hover:scale-110 hover:shadow-md"
                  style={{
                    borderColor: 'rgba(37,211,102,0.3)',
                    background: 'rgba(37,211,102,0.12)',
                    color: '#25D366',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              )}

              {/* Instagram */}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all duration-300 hover:scale-110 hover:shadow-md"
                  style={{
                    borderColor: 'rgba(225,48,108,0.3)',
                    background: 'rgba(225,48,108,0.12)',
                    color: '#E1306C',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              )}

              {/* TikTok */}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all duration-300 hover:scale-110 hover:shadow-md"
                  style={{
                    borderColor: 'rgba(255,255,255,0.25)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.38a8.16 8.16 0 004.77 1.52V7.47a4.85 4.85 0 01-1-.78z" />
                  </svg>
                </a>
              )}

              {/* Facebook */}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all duration-300 hover:scale-110 hover:shadow-md"
                  style={{
                    borderColor: 'rgba(24,119,242,0.3)',
                    background: 'rgba(24,119,242,0.12)',
                    color: '#1877F2',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}

              {/* YouTube */}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all duration-300 hover:scale-110 hover:shadow-md"
                  style={{
                    borderColor: 'rgba(255,0,0,0.3)',
                    background: 'rgba(255,0,0,0.12)',
                    color: '#FF0000',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* ── Compact Links Grid for Mobile (2 Columns) / Desktop ── */}
          <div className="grid grid-cols-2 gap-6 sm:contents lg:contents">
            {/* ── Column 2: Quick Links ── */}
            <div className="lg:col-span-2">
              <h3
                className="text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-2.5 sm:mb-4"
                style={{ color: 'var(--footer-heading)', letterSpacing: '0.08em' }}
              >
                {isRTL ? 'روابط سريعة' : locale === 'fr' ? 'Liens rapides' : 'Quick Links'}
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                {quickLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={l.isContact ? handleContactClick : undefined}
                      className="transition-colors duration-150 hover:text-[var(--footer-accent)] inline-block py-0.5"
                      style={{ color: 'var(--footer-text)' }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 3: Information & Policies ── */}
            <div className="lg:col-span-3">
              <h3
                className="text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-2.5 sm:mb-4"
                style={{ color: 'var(--footer-heading)', letterSpacing: '0.08em' }}
              >
                {isRTL ? 'المعلومات والسياسات' : locale === 'fr' ? 'Informations' : 'Information'}
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                {infoLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="transition-colors duration-150 hover:text-[var(--footer-accent)] inline-block py-0.5"
                      style={{ color: 'var(--footer-text)' }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Column 4: Contact & WhatsApp (lg:col-span-3) ───────────── */}
          <div className="lg:col-span-3 mt-2 sm:mt-0">
            <h3
              className="text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-2.5 sm:mb-4"
              style={{ color: 'var(--footer-heading)', letterSpacing: '0.08em' }}
            >
              {isRTL ? 'تواصل معنا' : locale === 'fr' ? 'Contact' : 'Contact'}
            </h3>

            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              {/* Phone */}
              {phone && (
                <li>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2.5 transition-colors hover:text-[var(--footer-accent)]"
                    style={{ color: 'var(--footer-text)' }}
                    dir="ltr"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
                      style={{ borderColor: 'var(--footer-border)', background: 'rgba(255,255,255,0.04)' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <span>{phone}</span>
                  </a>
                </li>
              )}

              {/* WhatsApp */}
              {whatsappUrl && (
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 transition-colors hover:text-[#25D366]"
                    style={{ color: 'var(--footer-text)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
                      style={{ borderColor: 'rgba(37,211,102,0.3)', background: 'rgba(37,211,102,0.1)' }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#25D366]">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </div>
                    <span>WhatsApp</span>
                  </a>
                </li>
              )}

              {/* Email */}
              {email && (
                <li>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 transition-colors hover:text-[var(--footer-accent)] break-all"
                    style={{ color: 'var(--footer-text)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
                      style={{ borderColor: 'var(--footer-border)', background: 'rgba(255,255,255,0.04)' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <span className="truncate">{email}</span>
                  </a>
                </li>
              )}

              {/* Location */}
              {address && (
                <li className="flex items-center gap-2.5" style={{ color: 'var(--footer-muted)' }}>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
                    style={{ borderColor: 'var(--footer-border)', background: 'rgba(255,255,255,0.04)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <span>{address}</span>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* ── Bottom Bar ────────────────────────────────────────────── */}
        <div
          className="mt-8 sm:mt-12 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs"
          style={{
            borderTop: '1px solid var(--footer-border)',
            color: 'var(--footer-muted)',
          }}
        >
          <p className="text-center sm:text-start">
            © {year}{' '}
            <span style={{ color: 'var(--footer-accent)', fontWeight: 600 }}>{storeName}</span>
            {' '}—{' '}
            {t('rights')}
          </p>

          <div className="flex items-center gap-1.5 opacity-80">
            <span>🇲🇦</span>
            <span>{isRTL ? 'صُنع في المغرب بكل فخر' : locale === 'fr' ? 'Fait au Maroc avec fierté' : 'Proudly Made in Morocco'}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Phone, Mail, MapPin, MessageCircle, Camera, Share2, Music2, PlayCircle } from 'lucide-react'
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

  const phone = settings?.contactPhone?.trim() || siteConfig.contact.phone
  const email = settings?.contactEmail?.trim() || siteConfig.contact.email
  const address =
    settings?.address?.trim() ||
    (isRTL ? 'الدار البيضاء، المغرب' : locale === 'fr' ? 'Casablanca, Maroc' : 'Casablanca, Morocco')

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

  const storeLogo = !logoError && settings?.logo?.trim() ? settings.logo.trim() : '/images/brand/logo-icon.png'
  const storeName = settings?.storeName?.trim() || (isRTL ? siteConfig.name : siteConfig.nameEn)

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/` || pathname === '/'
    if (isHomePage) {
      e.preventDefault()
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
        window.history.replaceState(null, '', '#contact')
      }
    }
  }

  const quickLinks = [
    { href: `/${locale}`, label: isRTL ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home' },
    { href: `/${locale}/products`, label: isRTL ? 'الجلابات' : locale === 'fr' ? 'Djellabas' : 'Djellabas' },
    { href: `/${locale}/products?category=niqabs`, label: isRTL ? 'النقاب' : locale === 'fr' ? 'Niqab' : 'Niqabs' },
    { href: `/${locale}/products?sort=sale`, label: isRTL ? 'العروض' : locale === 'fr' ? 'Offres' : 'Offers' },
    { href: `/${locale}/about`, label: isRTL ? 'من نحن' : locale === 'fr' ? 'À propos' : 'About Us' },
    { href: `/${locale}#contact`, label: isRTL ? 'اتصل بنا' : locale === 'fr' ? 'Contact' : 'Contact Us', isContact: true },
  ]

  const infoLinks = [
    { href: `/${locale}/privacy`, label: isRTL ? 'سياسة الخصوصية' : locale === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy' },
    { href: `/${locale}/faq`, label: isRTL ? 'الأسئلة الشائعة' : locale === 'fr' ? 'FAQ' : 'FAQ' },
    { href: `/${locale}/orders`, label: isRTL ? 'تتبع الطلبات' : locale === 'fr' ? 'Suivi des commandes' : 'Track Orders' },
    { href: `/${locale}/faq#shipping`, label: isRTL ? 'الشحن والتوصيل' : locale === 'fr' ? 'Livraison' : 'Shipping & Delivery' },
  ]

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
      {/* Subtle Brass Hairline Accent */}
      <div
        className="h-[1.5px] w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212,174,120,0.35) 25%, #D4AE78 50%, rgba(212,174,120,0.35) 75%, transparent 100%)',
        }}
      />

      <div className="container-brand py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-7 lg:gap-8">
          {/* Column 1: Framed Medallion Brand + Description + Restrained Social */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col items-start text-start">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-3 mb-3.5 group focus:outline-none no-underline"
              aria-label={storeName}
            >
              <div
                className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border transition-transform duration-200 group-hover:scale-105"
                style={{
                  borderColor: 'rgba(212, 174, 120, 0.45)',
                  background: '#FAF6F0',
                }}
              >
                <Image
                  src={storeLogo}
                  alt={storeName}
                  fill
                  sizes="48px"
                  className="object-cover"
                  onError={() => setLogoError(true)}
                />
              </div>

              <div>
                <h2
                  className="text-base sm:text-lg font-bold tracking-wide leading-tight"
                  style={{
                    color: 'var(--footer-heading)',
                    fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                  }}
                >
                  {storeName}
                </h2>
                <span className="text-[0.6875rem] font-medium" style={{ color: 'var(--footer-accent)' }}>
                  {isRTL ? 'دار الأزياء المغربية الأصيلة' : locale === 'fr' ? 'Maison d’Artisanat Marocain' : 'Moroccan Craft Atelier'}
                </span>
              </div>
            </Link>

            <p
              className="text-xs sm:text-sm leading-relaxed max-w-sm"
              style={{ color: 'var(--footer-muted)', textAlign: 'start' }}
            >
              {t('description')}
            </p>

            {/* Restrained Warm-Brass Social Controls */}
            <div className="flex flex-wrap gap-2 mt-4">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors duration-200 hover:border-[var(--footer-accent)] hover:text-[var(--footer-accent)]"
                  style={{
                    borderColor: 'var(--footer-border)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--footer-text)',
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors duration-200 hover:border-[var(--footer-accent)] hover:text-[var(--footer-accent)]"
                  style={{
                    borderColor: 'var(--footer-border)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--footer-text)',
                  }}
                >
                  <Camera className="w-4 h-4" />
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors duration-200 hover:border-[var(--footer-accent)] hover:text-[var(--footer-accent)]"
                  style={{
                    borderColor: 'var(--footer-border)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--footer-text)',
                  }}
                >
                  <Music2 className="w-4 h-4" />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors duration-200 hover:border-[var(--footer-accent)] hover:text-[var(--footer-accent)]"
                  style={{
                    borderColor: 'var(--footer-border)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--footer-text)',
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors duration-200 hover:border-[var(--footer-accent)] hover:text-[var(--footer-accent)]"
                  style={{
                    borderColor: 'var(--footer-border)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--footer-text)',
                  }}
                >
                  <PlayCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Columns 2 & 3: Quick Links & Information */}
          <div className="grid grid-cols-2 gap-6 sm:contents lg:contents">
            <div className="lg:col-span-2">
              <h3
                className="text-xs sm:text-sm font-bold mb-3"
                style={{ color: 'var(--footer-heading)' }}
              >
                {isRTL ? 'روابط سريعة' : locale === 'fr' ? 'Liens rapides' : 'Quick Links'}
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                {quickLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={l.isContact ? handleContactClick : undefined}
                      className="transition-colors duration-150 hover:text-[var(--footer-accent)] inline-block py-0.5 no-underline"
                      style={{ color: 'var(--footer-text)' }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h3
                className="text-xs sm:text-sm font-bold mb-3"
                style={{ color: 'var(--footer-heading)' }}
              >
                {isRTL ? 'المعلومات والسياسات' : locale === 'fr' ? 'Informations' : 'Information'}
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                {infoLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="transition-colors duration-150 hover:text-[var(--footer-accent)] inline-block py-0.5 no-underline"
                      style={{ color: 'var(--footer-text)' }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 4: Contact Details */}
          <div className="lg:col-span-3">
            <h3
              className="text-xs sm:text-sm font-bold mb-3"
              style={{ color: 'var(--footer-heading)' }}
            >
              {isRTL ? 'تواصل معنا' : locale === 'fr' ? 'Contact' : 'Contact'}
            </h3>

            <ul className="space-y-2.5 text-xs sm:text-sm">
              {phone && (
                <li>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2.5 transition-colors hover:text-[var(--footer-accent)] no-underline"
                    style={{ color: 'var(--footer-text)' }}
                    dir="ltr"
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
                      style={{ borderColor: 'var(--footer-border)', background: 'rgba(255,255,255,0.04)' }}
                    >
                      <Phone className="w-3.5 h-3.5" style={{ color: 'var(--footer-accent)' }} />
                    </span>
                    <span className="tabular-nums">{phone}</span>
                  </a>
                </li>
              )}

              {whatsappUrl && (
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 transition-colors hover:text-[var(--footer-accent)] no-underline"
                    style={{ color: 'var(--footer-text)' }}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
                      style={{ borderColor: 'var(--footer-border)', background: 'rgba(255,255,255,0.04)' }}
                    >
                      <MessageCircle className="w-3.5 h-3.5" style={{ color: 'var(--footer-accent)' }} />
                    </span>
                    <span>WhatsApp</span>
                  </a>
                </li>
              )}

              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2.5 transition-colors hover:text-[var(--footer-accent)] break-all no-underline"
                    style={{ color: 'var(--footer-text)' }}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
                      style={{ borderColor: 'var(--footer-border)', background: 'rgba(255,255,255,0.04)' }}
                    >
                      <Mail className="w-3.5 h-3.5" style={{ color: 'var(--footer-accent)' }} />
                    </span>
                    <span className="truncate">{email}</span>
                  </a>
                </li>
              )}

              {address && (
                <li className="flex items-center gap-2.5" style={{ color: 'var(--footer-muted)' }}>
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
                    style={{ borderColor: 'var(--footer-border)', background: 'rgba(255,255,255,0.04)' }}
                  >
                    <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--footer-accent)' }} />
                  </span>
                  <span>{address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div
          className="mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{
            borderTop: '1px solid var(--footer-border)',
            color: 'var(--footer-muted)',
          }}
        >
          <p className="text-center sm:text-start">
            © {year}{' '}
            <span style={{ color: 'var(--footer-accent)', fontWeight: 600 }}>{storeName}</span>
            {' · '}
            {t('rights')}
          </p>

          <p className="text-center sm:text-end">
            {isRTL ? 'صُنع في المغرب بكل إتقان' : locale === 'fr' ? 'Savoir-faire artisanal marocain' : 'Crafted in Morocco'}
          </p>
        </div>
      </div>
    </footer>
  )
}

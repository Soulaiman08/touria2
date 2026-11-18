'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Phone, Mail, MapPin } from 'lucide-react'
import { FaWhatsapp, FaInstagram, FaTiktok, FaFacebookF, FaYoutube } from 'react-icons/fa6'
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

  const linkClass =
    'inline-flex items-center py-0.5 text-[0.75rem] sm:text-[0.8125rem] leading-4 sm:leading-5 transition-colors duration-150 hover:text-[var(--footer-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--footer-accent)] rounded no-underline truncate max-w-full'

  const socialLinkClass =
    'footer-social-btn w-[1.625rem] h-[1.625rem] sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--footer-accent)]'

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
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212,174,120,0.35) 25%, #D4AE78 50%, rgba(212,174,120,0.35) 75%, transparent 100%)',
        }}
      />

      <div className="container-brand py-3.5 sm:py-5 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 lg:gap-8 items-start">
          {/* Column 1: Brand + Socials (inline header on mobile, vertical stack on desktop) */}
          <div className="lg:col-span-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 lg:flex-col lg:items-start lg:justify-start lg:gap-0 text-start min-w-0">
            <Link
              href={`/${locale}`}
              className="order-1 inline-flex items-center gap-2 sm:gap-2.5 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--footer-accent)] rounded-lg no-underline min-w-0"
              aria-label={storeName}
            >
              <div
                className="relative h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 overflow-hidden rounded-full border transition-transform duration-200 group-hover:scale-105"
                style={{
                  borderColor: 'rgba(212, 174, 120, 0.45)',
                  background: '#FAF6F0',
                }}
              >
                <Image
                  src={storeLogo}
                  alt={storeName}
                  fill
                  sizes="40px"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                  onError={() => setLogoError(true)}
                />
              </div>

              <div className="min-w-0">
                <h2
                  className="text-[0.8125rem] sm:text-base font-bold tracking-wide leading-tight truncate"
                  style={{
                    color: 'var(--footer-heading)',
                    fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                  }}
                >
                  {storeName}
                </h2>
                <span className="block text-[0.625rem] sm:text-[0.6875rem] font-medium leading-tight mt-0.5 truncate" style={{ color: 'var(--footer-accent)' }}>
                  {isRTL ? 'دار الأزياء المغربية الأصيلة' : locale === 'fr' ? 'Maison d’Artisanat Marocain' : 'Moroccan Craft Atelier'}
                </span>
              </div>
            </Link>

            {/* Compact Brand Social Controls */}
            <div className="order-2 lg:order-3 flex items-center gap-1 sm:gap-1.5 lg:mt-3 flex-shrink-0">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  title="WhatsApp"
                  className={`${socialLinkClass} footer-social-whatsapp`}
                >
                  <FaWhatsapp className="w-3.5 h-3.5" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className={`${socialLinkClass} footer-social-instagram`}
                >
                  <FaInstagram className="w-3.5 h-3.5" />
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  title="TikTok"
                  className={`${socialLinkClass} footer-social-tiktok`}
                >
                  <FaTiktok className="w-3.5 h-3.5" />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                  className={`${socialLinkClass} footer-social-facebook`}
                >
                  <FaFacebookF className="w-3.5 h-3.5" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  title="YouTube"
                  className={`${socialLinkClass} footer-social-youtube`}
                >
                  <FaYoutube className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <p
              className="order-3 w-full lg:order-2 lg:mt-2 text-[0.6875rem] sm:text-xs leading-snug sm:leading-relaxed max-w-sm"
              style={{ color: 'var(--footer-muted)', textAlign: 'start' }}
            >
              {t('description')}
            </p>
          </div>

          {/* Columns 2 & 3: Quick Links (3-col on mobile = 2 rows, 2x3 on desktop) & Information (2-col on mobile = 2 rows, 1-col on desktop) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:gap-5 lg:contents">
            <div className="sm:col-span-6 lg:col-span-3 min-w-0">
              <h3
                className="text-[0.6875rem] sm:text-xs font-semibold tracking-wide mb-1 sm:mb-2 pb-1 border-b"
                style={{ color: 'var(--footer-heading)', borderColor: 'var(--footer-border)' }}
              >
                {isRTL ? 'روابط سريعة' : locale === 'fr' ? 'Liens rapides' : 'Quick Links'}
              </h3>
              <ul className="grid grid-cols-3 gap-x-2 gap-y-0.5 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-1">
                {quickLinks.map((l) => (
                  <li key={l.href} className="min-w-0">
                    <Link
                      href={l.href}
                      onClick={l.isContact ? handleContactClick : undefined}
                      className={linkClass}
                      style={{ color: 'var(--footer-text)' }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:col-span-6 lg:col-span-2 min-w-0">
              <h3
                className="text-[0.6875rem] sm:text-xs font-semibold tracking-wide mb-1 sm:mb-2 pb-1 border-b"
                style={{ color: 'var(--footer-heading)', borderColor: 'var(--footer-border)' }}
              >
                {isRTL ? 'المعلومات والسياسات' : locale === 'fr' ? 'Informations' : 'Information'}
              </h3>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 lg:grid-cols-1 lg:gap-y-1">
                {infoLinks.map((l) => (
                  <li key={l.href} className="min-w-0">
                    <Link
                      href={l.href}
                      className={linkClass}
                      style={{ color: 'var(--footer-text)' }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 4: Compact Contact Details (2x2 on mobile/tablet, aligned vertical stack on desktop) */}
          <div className="lg:col-span-3 min-w-0">
            <h3
              className="text-[0.6875rem] sm:text-xs font-semibold tracking-wide mb-1 sm:mb-2 pb-1 border-b"
              style={{ color: 'var(--footer-heading)', borderColor: 'var(--footer-border)' }}
            >
              {isRTL ? 'تواصل معنا' : locale === 'fr' ? 'Contact' : 'Contact'}
            </h3>

            <ul className="grid grid-cols-2 gap-x-3 gap-y-1 sm:gap-y-1.5 lg:grid-cols-1 text-[0.75rem] sm:text-[0.8125rem]">
              {phone && (
                <li className="min-w-0">
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 sm:gap-2 max-w-full py-0.5 transition-colors hover:text-[var(--footer-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--footer-accent)] rounded no-underline"
                    style={{ color: 'var(--footer-text)' }}
                    title={phone}
                  >
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" style={{ color: 'var(--footer-accent)' }} />
                    <span className="tabular-nums truncate" dir="ltr">
                      {phone}
                    </span>
                  </a>
                </li>
              )}

              {whatsappUrl && (
                <li className="min-w-0">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 sm:gap-2 max-w-full py-0.5 transition-colors hover:text-[var(--footer-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--footer-accent)] rounded no-underline"
                    style={{ color: 'var(--footer-text)' }}
                  >
                    <FaWhatsapp className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" style={{ color: '#25D366' }} />
                    <span className="truncate">WhatsApp</span>
                  </a>
                </li>
              )}

              {email && (
                <li className="min-w-0">
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-1.5 sm:gap-2 max-w-full py-0.5 transition-colors hover:text-[var(--footer-accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--footer-accent)] rounded no-underline"
                    style={{ color: 'var(--footer-text)' }}
                    title={email}
                  >
                    <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" style={{ color: 'var(--footer-accent)' }} />
                    <span className="truncate">{email}</span>
                  </a>
                </li>
              )}

              {address && (
                <li
                  className="inline-flex items-center gap-1.5 sm:gap-2 min-w-0 py-0.5"
                  style={{ color: 'var(--footer-muted)' }}
                  title={address}
                >
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" style={{ color: 'var(--footer-accent)' }} />
                  <span className="truncate">{address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div
          className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 flex flex-col sm:flex-row items-center justify-between gap-0.5 sm:gap-4 text-[0.6875rem] sm:text-xs"
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

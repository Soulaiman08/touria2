'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/config/site'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export function WhatsAppButton() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const btnRef = useRef<HTMLAnchorElement>(null)
  const { settings } = useSiteSettings()

  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/signup')

  const rawWhatsapp = settings?.whatsapp?.trim() || siteConfig.contact.whatsapp || ''
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '')
  const whatsappUrl = cleanWhatsapp
    ? rawWhatsapp.startsWith('http')
      ? rawWhatsapp
      : `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن منتجاتكم')}`
    : ''

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer')
      if (!footer || !btnRef.current) return
      const rect = footer.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.top < vh) {
        const overlap = vh - rect.top + 16
        btnRef.current.style.bottom = `${24 + overlap}px`
      } else {
        btnRef.current.style.bottom = '1.5rem'
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  if (isAuthPage || !visible || !whatsappUrl) return null

  return (
    <a
      ref={btnRef}
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="whatsapp-fab no-print animate-slide-up"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: '300ms',
        animationFillMode: 'both',
      }}
    >
      {/* Pulse ring */}
      <span
        className="absolute inset-0 rounded-full animate-pulse-ring"
        style={{ background: '#25D366', opacity: 0.4 }}
        aria-hidden
      />

      {/* WhatsApp SVG */}
      <svg
        viewBox="0 0 24 24"
        fill="white"
        className="w-7 h-7 relative z-10 transition-transform duration-200"
        style={{ transform: hovered ? 'scale(1.1)' : 'scale(1)' }}
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>

      {/* Tooltip */}
      {hovered && (
        <span
          className="absolute bottom-full mb-2 end-0 whitespace-nowrap text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white pointer-events-none animate-fade-in shadow-lg"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
        >
          WhatsApp
        </span>
      )}
    </a>
  )
}

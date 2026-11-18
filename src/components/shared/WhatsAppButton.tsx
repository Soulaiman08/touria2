'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { FaWhatsapp } from 'react-icons/fa6'
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
      <FaWhatsapp
        className="w-6 h-6 text-white relative z-10 transition-transform duration-200"
        style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
        aria-hidden
      />

      {hovered && (
        <span
          className="absolute bottom-full mb-2 end-0 whitespace-nowrap text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white pointer-events-none animate-fade-in shadow-lg"
          style={{ background: 'var(--footer-bg)', border: '1px solid var(--footer-border)' }}
        >
          WhatsApp
        </span>
      )}
    </a>
  )
}

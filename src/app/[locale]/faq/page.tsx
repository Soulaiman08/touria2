'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  HelpCircle,
  ChevronDown,
  MessageCircle,
  ArrowLeft,
  Truck,
  CreditCard,
  Sparkles,
} from 'lucide-react'
import { siteConfig } from '@/config/site'
import { useSiteSettings } from '@/hooks/useSiteSettings'

interface FaqPageProps {
  params: Promise<{ locale: string }>
}

type FaqItem = {
  id: string
  q: string
  a: string
  category: 'orders' | 'shipping' | 'quality'
}

export default function FaqPage({ params }: FaqPageProps) {
  const { locale } = use(params)
  const isRTL = locale === 'ar'
  const { settings } = useSiteSettings()

  const rawWhatsapp = settings?.whatsapp?.trim() || siteConfig.contact.whatsapp || ''
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '')
  const whatsappUrl = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
        isRTL
          ? 'مرحباً، لدي استفسار بخصوص منتجاتكم'
          : locale === 'fr'
            ? 'Bonjour, j\'ai une question concernant vos produits'
            : 'Hello, I have a question regarding your products'
      )}`
    : ''

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ 'q1': true })

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const categories = [
    { id: 'all', label: isRTL ? 'الكل' : locale === 'fr' ? 'Tous' : 'All' },
    { id: 'orders', label: isRTL ? 'الطلب والدفع' : locale === 'fr' ? 'Commandes & Paiement' : 'Orders & Payment', icon: CreditCard },
    { id: 'shipping', label: isRTL ? 'الشحن والتوصيل' : locale === 'fr' ? 'Livraison' : 'Shipping', icon: Truck },
    { id: 'quality', label: isRTL ? 'الجودة والمقاسات' : locale === 'fr' ? 'Qualité & Tailles' : 'Quality & Sizes', icon: Sparkles },
  ]

  const faqs: FaqItem[] = isRTL
    ? [
        {
          id: 'q1',
          category: 'orders',
          q: 'كيف يمكنني إتمام الطلب من متجر ثريا المغربي؟',
          a: 'اختاري الجلابة أو النقاب المناسب مع تحديد المقاس واللون المفضل، ثم اضغطي على "إضافة إلى السلة" واضغطي "إتمام الطلب". قومي بملء بيانات الاسم والعنوان ورقم الهاتف وسيتم تأكيد طلبك فوراً.',
        },
        {
          id: 'q2',
          category: 'orders',
          q: 'ما هي طرق الدفع المتاحة لديكم؟',
          a: 'نوفر حالياً خدمة الدفع عند الاستلام (COD) في جميع مدن المملكة المغربية. تدفعين نقداً فقط عند وصول المندوب واستلام طلبيتكِ بكل راحة وأمان.',
        },
        {
          id: 'q3',
          category: 'shipping',
          q: 'كم يستغرق التوصيل وإلى أي مدن يتم الشحن؟',
          a: 'نقوم بالتوصيل إلى جميع مدن ومناطق المملكة المغربية. يستغرق التوصيل عادةً من 2 إلى 4 أيام عمل بعد تأكيد الطلب.',
        },
        {
          id: 'q4',
          category: 'shipping',
          q: 'كيف يمكنني تتبع حالة طلبي؟',
          a: 'يمكنكِ تتبع الطلب بكل سهولة من خلال زيارة صفحة "تتبع الطلب" في الموقع وإدخال رقم طلبكِ (Order Number) لمعرفة المرحلة الحالية للتجهيز والشحن.',
        },
        {
          id: 'q6',
          category: 'quality',
          q: 'ما نوع الأقمشة المستخدمة في جلابياتكم؟',
          a: 'نختار بعناية فائقة أجود أنواع الأقمشة الفاخرة مثل الكريب الملكي، المليفة، والحرير، مع تطريز وخياطة يدوية متقنة بأيدي أمهر الصناع التقليديين بالمغرب لضمان أقصى درجات الفخامة والراحة.',
        },
        {
          id: 'q7',
          category: 'quality',
          q: 'كيف أختار المقاس المناسب لي بدقة؟',
          a: 'يتوفر جدول تفصيلي للمقاسات في صفحة كل منتج يوضح مقاسات الصدر والكتف والطول. كما يمكنكِ التواصل معنا مباشرة عبر واتساب وسيسعد فريقنا بمساعدتكِ في اختيار المقاس المثالي.',
        },
      ]
    : locale === 'fr'
      ? [
          {
            id: 'q1',
            category: 'orders',
            q: 'Comment passer commande sur Thuraya Al-Maghribi ?',
            a: 'Choisissez votre djellaba ou niqab, sélectionnez votre taille et couleur préférées, ajoutez l\'article à votre panier puis cliquez sur "Commander". Remplissez simplement vos coordonnées et votre commande sera validée.',
          },
          {
            id: 'q2',
            category: 'orders',
            q: 'Quels sont les modes de paiement acceptés ?',
            a: 'Nous proposons exclusivement le paiement à la livraison (Cash on Delivery) partout au Maroc. Vous payez en toute sécurité à la réception de votre colis.',
          },
          {
            id: 'q3',
            category: 'shipping',
            q: 'Quels sont les délais et zones de livraison ?',
            a: 'Nous livrons dans toutes les villes et régions du Maroc. Le délai de livraison moyen est de 2 à 4 jours ouvrables après confirmation de votre commande.',
          },
          {
            id: 'q4',
            category: 'shipping',
            q: 'Comment puis-je suivre l\'état de ma commande ?',
            a: 'Vous pouvez suivre l\'état d\'avancement de votre commande à tout moment via la page "Suivi des commandes" en saisissant votre numéro de commande.',
          },
          {
            id: 'q6',
            category: 'quality',
            q: 'Quels tissus et finitions utilisez-vous ?',
            a: 'Nous sélectionnons des étoffes d\'exception (Crêpe noble, Mlifa, Soie) avec broderies et coutures artisanales réalisées par des maîtres artisans marocains.',
          },
          {
            id: 'q7',
            category: 'quality',
            q: 'Comment bien choisir ma taille ?',
            a: 'Un guide des tailles est disponible sur chaque fiche produit. Notre équipe reste également disponible sur WhatsApp pour vous orienter vers la taille parfaite.',
          },
        ]
      : [
          {
            id: 'q1',
            category: 'orders',
            q: 'How do I place an order on Thuraya Al-Maghribi?',
            a: 'Select your preferred djellaba or niqab, choose your size and color, add to cart, and proceed to checkout. Enter your shipping details and your order will be placed instantly.',
          },
          {
            id: 'q2',
            category: 'orders',
            q: 'What payment methods do you accept?',
            a: 'We offer Cash on Delivery (COD) across all cities in Morocco. You pay securely in cash upon receiving your order.',
          },
          {
            id: 'q3',
            category: 'shipping',
            q: 'What are the delivery times and shipping coverage?',
            a: 'We ship nationwide to all cities and regions across Morocco. Delivery usually takes between 2 to 4 business days after confirmation.',
          },
          {
            id: 'q4',
            category: 'shipping',
            q: 'How can I track my order?',
            a: 'You can easily track your order on our "Track Orders" page by entering your order number to see real-time updates.',
          },
          {
            id: 'q6',
            category: 'quality',
            q: 'What fabrics and craftsmanship do you use?',
            a: 'We hand-pick premium fabrics such as royal crepe, mlifa, and silk, tailored with meticulous Moroccan artisan embroidery for timeless elegance.',
          },
          {
            id: 'q7',
            category: 'quality',
            q: 'How do I choose the correct size?',
            a: 'A detailed size guide is available on every product page. You can also reach out to our team on WhatsApp for personalized assistance.',
          },
        ]

  const filteredFaqs = activeCategory === 'all'
    ? faqs
    : faqs.filter((item) => item.category === activeCategory)

  return (
    <div
      className="container-brand page-shell"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ maxWidth: 860, paddingLeft: 'max(16px, 4vw)', paddingRight: 'max(16px, 4vw)' }}
    >
      {/* ── Back Navigation ───────────────────────────────────────── */}
      <Link
        href={`/${locale}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 700,
          color: '#C4622D',
          textDecoration: 'none',
          marginBottom: 20,
          border: '1px solid #C4622D',
          borderRadius: 12,
          transition: 'background 0.2s',
        }}
      >
        <ArrowLeft style={{ width: 16, height: 16, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
        {isRTL ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
      </Link>

      {/* ── Hero Header Card ──────────────────────────────────────── */}
      <div
        style={{
          borderRadius: 24,
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(196,98,45,0.06) 0%, rgba(184,150,90,0.04) 100%)',
            padding: '32px 24px 28px',
            textAlign: 'center',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              border: '1px solid var(--accent-ring)',
            }}
          >
            <HelpCircle style={{ width: 28, height: 28, color: 'var(--accent)' }} />
          </div>

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2.5"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-ring)',
            }}
          >
            <span>✦</span>
            <span>{isRTL ? 'مركز المساعدة والإجابات' : locale === 'fr' ? 'Centre d\'aide' : 'Help Center'}</span>
            <span>✦</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 1.85rem)',
              fontWeight: 900,
              color: 'var(--foreground)',
              margin: '0 0 8px',
              fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
            }}
          >
            {isRTL ? 'الأسئلة الشائعة' : locale === 'fr' ? 'Foire Aux Questions' : 'Frequently Asked Questions'}
          </h1>

          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0, maxWidth: 500, marginInline: 'auto' }}>
            {isRTL
              ? 'كل ما تحتاجين معرفته حول الطلب، الشحن والمقاسات في مكان واحد.'
              : locale === 'fr'
                ? 'Tout ce que vous devez savoir sur vos commandes, la livraison et les tailles.'
                : 'Everything you need to know about ordering, delivery, and sizes in one place.'}
          </p>
        </div>

        {/* ── Category Filter Tabs ──────────────────────────────────── */}
        <div
          style={{
            padding: '14px 20px',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            background: 'var(--bg-subtle)',
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: isActive ? 'var(--accent)' : 'var(--card)',
                  color: isActive ? '#fff' : 'var(--foreground)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 12px rgba(196,98,45,0.2)' : 'none',
                }}
              >
                {Icon && <Icon style={{ width: 13, height: 13 }} />}
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Accordion List ────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {filteredFaqs.map((faq) => {
          const isOpen = Boolean(openIds[faq.id])
          return (
            <div
              key={faq.id}
              style={{
                borderRadius: 16,
                border: `1px solid ${isOpen ? 'var(--accent-ring)' : 'var(--border)'}`,
                background: 'var(--card)',
                boxShadow: isOpen ? '0 8px 24px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                  padding: '16px 20px',
                  background: isOpen ? 'rgba(196,98,45,0.03)' : 'transparent',
                  border: 'none',
                  textAlign: isRTL ? 'right' : 'left',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isOpen ? '#C4622D' : 'var(--foreground)',
                    lineHeight: 1.4,
                    transition: 'color 0.2s',
                  }}
                >
                  {faq.q}
                </span>

                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: isOpen ? 'var(--accent-light)' : 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'transform 0.3s ease',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  <ChevronDown
                    style={{
                      width: 15,
                      height: 15,
                      color: isOpen ? 'var(--accent)' : 'var(--muted-foreground)',
                    }}
                  />
                </div>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '0 20px 18px',
                    borderTop: '1px solid var(--border-subtle)',
                    background: 'rgba(196,98,45,0.015)',
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: 'var(--muted-foreground)',
                      margin: '14px 0 0',
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── WhatsApp Direct Support Banner ────────────────────────── */}
      <div
        style={{
          borderRadius: 20,
          border: '1px solid rgba(37,211,102,0.3)',
          background: 'linear-gradient(135deg, rgba(37,211,102,0.06) 0%, rgba(37,211,102,0.02) 100%)',
          padding: '24px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'rgba(37,211,102,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#25D366',
          }}
        >
          <MessageCircle style={{ width: 22, height: 22 }} />
        </div>

        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--foreground)', margin: '0 0 4px' }}>
            {isRTL ? 'هل لديكِ سؤال آخر لم تجدي إجابته؟' : locale === 'fr' ? 'Vous avez d\'autres questions ?' : 'Still have questions?'}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--muted-foreground)', margin: 0 }}>
            {isRTL
              ? 'فريق خدمة العملاء جاهز للإجابة على جميع استفساراتكِ ومساعدتكِ فوراً عبر واتساب.'
              : locale === 'fr'
                ? 'Notre équipe est à votre disposition sur WhatsApp pour vous assister.'
                : 'Our customer support team is available on WhatsApp to assist you immediately.'}
          </p>
        </div>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 22px',
              borderRadius: 12,
              background: '#25D366',
              color: '#fff',
              fontSize: 13,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
              marginTop: 4,
              transition: 'transform 0.2s',
            }}
          >
            <MessageCircle style={{ width: 16, height: 16 }} />
            <span>{isRTL ? 'تواصلي معنا عبر واتساب' : locale === 'fr' ? 'Discuter sur WhatsApp' : 'Chat on WhatsApp'}</span>
          </a>
        )}
      </div>
    </div>
  )
}

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
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ q1: true })

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
      style={{ maxWidth: 860 }}
    >
      {/* ── Back Navigation ───────────────────────────────────────── */}
      <Link href={`/${locale}`} className="btn btn-outline btn-sm btn-round mb-5">
        <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
        <span>{isRTL ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}</span>
      </Link>

      {/* ── Hero Header Card ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden mb-6">
        <div className="p-7 text-center border-b border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="w-14 h-14 rounded-full bg-[var(--accent-light)] border border-[var(--accent-ring)] flex items-center justify-center mx-auto mb-3.5">
            <HelpCircle className="w-7 h-7 text-[var(--accent)]" />
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-1.5">
            {isRTL ? 'مركز المساعدة والإجابات' : locale === 'fr' ? 'Centre d\'aide' : 'Help Center'}
          </p>

          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-2"
            style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
          >
            {isRTL ? 'الأسئلة الشائعة' : locale === 'fr' ? 'Foire Aux Questions' : 'Frequently Asked Questions'}
          </h1>

          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto m-0">
            {isRTL
              ? 'كل ما تحتاجين معرفته حول الطلب، الشحن والمقاسات في مكان واحد.'
              : locale === 'fr'
                ? 'Tout ce que vous devez savoir sur vos commandes, la livraison et les tailles.'
                : 'Everything you need to know about ordering, delivery, and sizes in one place.'}
          </p>
        </div>

        {/* ── Category Filter Tabs ──────────────────────────────────── */}
        <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar bg-[var(--card-bg)]">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border whitespace-nowrap cursor-pointer transition-colors"
                style={{
                  borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                  background: isActive ? 'var(--accent)' : 'var(--bg-subtle)',
                  color: isActive ? '#ffffff' : 'var(--text-primary)',
                }}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Accordion List ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-7">
        {filteredFaqs.map((faq) => {
          const isOpen = Boolean(openIds[faq.id])
          return (
            <div
              key={faq.id}
              className="rounded-2xl border bg-[var(--card-bg)] overflow-hidden transition-colors"
              style={{
                borderColor: isOpen ? 'var(--accent-ring)' : 'var(--border)',
              }}
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                className="w-full flex items-center justify-between gap-3.5 px-5 py-4 border-0 text-start cursor-pointer"
                style={{
                  background: isOpen ? 'var(--accent-light)' : 'transparent',
                }}
              >
                <span
                  className="text-sm font-bold leading-snug transition-colors"
                  style={{
                    color: isOpen ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                >
                  {faq.q}
                </span>

                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300"
                  style={{
                    background: isOpen ? 'var(--card-bg)' : 'var(--bg-subtle)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  <ChevronDown
                    className="w-4 h-4"
                    style={{ color: isOpen ? 'var(--accent)' : 'var(--text-muted)' }}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-3 border-t border-[var(--border)] bg-[var(--card-bg)]">
                  <p className="text-sm leading-relaxed text-[var(--text-muted)] m-0">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── WhatsApp Direct Support Banner ────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-6 text-center flex flex-col items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] flex items-center justify-center text-[var(--accent)]">
          <MessageCircle className="w-5 h-5" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-1">
            {isRTL ? 'هل لديكِ سؤال آخر لم تجدي إجابته؟' : locale === 'fr' ? 'Vous avez d\'autres questions ?' : 'Still have questions?'}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] m-0">
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
            className="btn btn-primary btn-round px-6 py-2.5 text-sm mt-1"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{isRTL ? 'تواصلي معنا عبر واتساب' : locale === 'fr' ? 'Discuter sur WhatsApp' : 'Chat on WhatsApp'}</span>
          </a>
        )}
      </div>
    </div>
  )
}

'use client'

import { use, useState } from 'react'
import {
  HelpCircle,
  ChevronDown,
  Truck,
  CreditCard,
  Sparkles,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa6'
import { siteConfig } from '@/config/site'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { BackButton } from '@/components/shared/PageNavigation'

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
      style={{ maxWidth: '55rem' }}
    >
      {/* ── Back Navigation ───────────────────────────────────────── */}
      <div className="mb-6">
        <BackButton
          href={`/${locale}`}
          locale={locale}
          label={isRTL ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
        />
      </div>

      {/* ── Editorial Page Header ─────────────────────────────────── */}
      <header className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-14 rounded-t-[999px] rounded-b-xl bg-[var(--accent-light)] border border-[var(--gold-ring)] flex items-center justify-center mx-auto mb-3.5 text-[var(--accent)]">
          <HelpCircle className="w-5 h-5" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-1.5">
          {isRTL ? 'مركز المساعدة والإجابات' : locale === 'fr' ? 'Centre d\'aide' : 'Help Center'}
        </p>

        <h1
          className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-2.5 text-balance"
          style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
        >
          {isRTL ? 'الأسئلة الشائعة' : locale === 'fr' ? 'Foire Aux Questions' : 'Frequently Asked Questions'}
        </h1>

        <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto m-0 leading-relaxed">
          {isRTL
            ? 'كل ما تحتاجين معرفته حول الطلب، الشحن والمقاسات في مكان واحد.'
            : locale === 'fr'
              ? 'Tout ce que vous devez savoir sur vos commandes, la livraison et les tailles.'
              : 'Everything you need to know about ordering, delivery, and sizes in one place.'}
        </p>
      </header>

      {/* ── Clean Segmented Category Tabs ─────────────────────────── */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-1 p-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] max-w-full overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 border-0 ${
                  isActive
                    ? 'bg-[var(--card-bg)] text-[var(--accent)] shadow-[var(--shadow-sm)]'
                    : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Calm Accordion List ───────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-8">
        {filteredFaqs.map((faq) => {
          const isOpen = Boolean(openIds[faq.id])
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border bg-[var(--card-bg)] overflow-hidden transition-colors ${
                isOpen ? 'border-[var(--accent-ring)]' : 'border-[var(--border)]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                aria-expanded={isOpen}
                className={`w-full min-h-[54px] flex items-center justify-between gap-3.5 px-5 py-3.5 border-0 text-start cursor-pointer transition-colors ${
                  isOpen ? 'bg-[var(--accent-light)]' : 'bg-transparent hover:bg-[var(--bg-subtle)]/50'
                }`}
              >
                <span
                  className={`text-sm font-bold leading-snug transition-colors ${
                    isOpen ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {faq.q}
                </span>

                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-[var(--card-bg)] rotate-180 text-[var(--accent)]' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              {isOpen && (
                <div className="px-5 py-4 border-t border-[var(--border)] bg-[var(--card-bg)]">
                  <p className="text-sm leading-relaxed text-[var(--text-muted)] m-0">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Concierge Direct Support Card ─────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 sm:p-7 text-center flex flex-col items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#25D366]/12 border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
          <FaWhatsapp className="w-5 h-5" />
        </div>

        <div>
          <h2 className="text-base font-extrabold text-[var(--text-primary)] mb-1">
            {isRTL ? 'هل لديكِ سؤال آخر لم تجدي إجابته؟' : locale === 'fr' ? 'Vous avez d\'autres questions ?' : 'Still have questions?'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] m-0 max-w-md leading-relaxed">
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
            className="btn btn-primary btn-round px-6 h-11 text-sm mt-1"
          >
            <FaWhatsapp className="w-4 h-4" />
            <span>{isRTL ? 'تواصلي معنا عبر واتساب' : locale === 'fr' ? 'Discuter sur WhatsApp' : 'Chat on WhatsApp'}</span>
          </a>
        )}
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { buildLocaleAlternates, getDefaultOgImages } from '@/lib/seo.server'
import { FaqPageClient, type FaqItem } from './_client'

interface FaqPageProps {
  params: Promise<{ locale: string }>
}

function getLocalizedFaqs(locale: string): FaqItem[] {
  if (locale === 'ar') {
    return [
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
  }

  if (locale === 'fr') {
    return [
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
  }

  return [
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
}

export async function generateMetadata({
  params,
}: FaqPageProps): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = siteConfig.url
  const brandSuffix = locale === 'ar' ? 'ثريا المغربي' : 'Thuraya Al-Maghribi'

  const titles: Record<string, string> = {
    ar: 'الأسئلة الشائعة — الطلب والتوصيل والمقاسات',
    fr: 'Questions Fréquentes — Commandes & Livraison',
    en: 'Frequently Asked Questions — Orders & Delivery',
  }

  const descriptions: Record<string, string> = {
    ar: 'إجابات شاملة حول الطلب، الدفع عند الاستلام، مدة التوصيل لجميع المدن المغربية، واختيار المقاس المناسب في متجر ثريا المغربي.',
    fr: 'Toutes les réponses sur les commandes, le paiement à la livraison au Maroc, les délais d\'expédition et le choix des tailles.',
    en: 'Answers to common questions about ordering, cash on delivery across Morocco, shipping times, fabrics, and sizing at Thuraya Al-Maghribi.',
  }

  const title = titles[locale] ?? titles.ar
  const fullSocialTitle = `${title} | ${brandSuffix}`
  const description = descriptions[locale] ?? descriptions.ar
  const ogImages = getDefaultOgImages(fullSocialTitle)

  return {
    title,
    description,
    alternates: buildLocaleAlternates('/faq', locale),
    openGraph: {
      title: fullSocialTitle,
      description,
      url: `${baseUrl}/${locale}/faq`,
      siteName: brandSuffix,
      locale: locale === 'ar' ? 'ar_MA' : locale === 'fr' ? 'fr_MA' : 'en_US',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullSocialTitle,
      description,
      images: ogImages.map((img) => img.url),
    },
  }
}

export default async function FaqPage({ params }: FaqPageProps) {
  const { locale } = await params
  const faqs = getLocalizedFaqs(locale)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqPageClient locale={locale} faqs={faqs} />
    </>
  )
}

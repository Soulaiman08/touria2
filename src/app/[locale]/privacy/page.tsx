import { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  EyeOff,
  UserCheck,
  FileText,
  Cookie,
  Mail,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa6'
import { siteConfig } from '@/config/site'
import { prisma } from '@/lib/prisma'

interface PrivacyPageProps {
  params: Promise<{ locale: string }>
}

type SiteSettings = {
  contactPhone?: string
  whatsapp?: string
  contactEmail?: string
}

const DEFAULT_SETTINGS: SiteSettings = {
  contactPhone: siteConfig.contact.phoneDisplay,
  whatsapp: siteConfig.contact.whatsapp,
  contactEmail: '',
}

async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settingsList = await prisma.siteSetting.findMany()
    const settings: SiteSettings = { ...DEFAULT_SETTINGS }
    for (const item of settingsList) {
      if (item.key in settings) {
        settings[item.key as keyof SiteSettings] = item.value
      }
    }
    return settings
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params
  const isRTL = locale === 'ar'
  const isFR = locale === 'fr'

  const title = isRTL
    ? 'سياسة الخصوصية وحماية البيانات | ثريا المغربي'
    : isFR
      ? 'Politique de Confidentialité | Thuraya Al-Maghribi'
      : 'Privacy Policy & Data Protection | Thuraya Al-Maghribi'

  const description = isRTL
    ? 'تعرف على سياسة الخصوصية في متجر ثريا المغربي، وكيف نحمي بياناتك الشخصية ونضمن أمان وسرية معلوماتك أثناء التسوق والتوصيل.'
    : isFR
      ? 'Découvrez comment Thuraya Al-Maghribi protège vos données personnelles et garantit la confidentialité de vos achats et livraisons.'
      : 'Learn how Thuraya Al-Maghribi protects your personal data and ensures privacy and confidentiality during your shopping and delivery.'

  return {
    title,
    description,
  }
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params
  const isRTL = locale === 'ar'
  const isFR = locale === 'fr'

  const settings = await getSiteSettings()
  const rawWhatsapp = settings.whatsapp?.trim() || siteConfig.contact.whatsapp || ''
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '')
  const whatsappUrl = cleanWhatsapp
    ? rawWhatsapp.startsWith('http')
      ? rawWhatsapp
      : `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
          isRTL
            ? 'مرحباً، لدي استفسار حول سياسة الخصوصية وحماية البيانات في ثريا المغربي'
            : isFR
              ? 'Bonjour, j\'ai une question concernant la politique de confidentialité de Thuraya Al-Maghribi'
              : 'Hello, I have a question regarding Thuraya Al-Maghribi\'s privacy policy'
        )}`
    : ''

  const trustHighlights = [
    {
      icon: Lock,
      title: isRTL ? 'تشفير وأمان فائق' : isFR ? 'Chiffrement & Sécurité' : 'Encrypted & Secure',
      desc: isRTL
        ? 'اتصال آمن ومشفر بأحدث بروتوكولات SSL لحماية بيانات تصفحك وطلبك بالكامل.'
        : isFR
          ? 'Connexion sécurisée SSL pour protéger l\'ensemble de votre navigation et vos commandes.'
          : 'Secure SSL encrypted connection to fully safeguard your browsing and orders.',
    },
    {
      icon: CreditCard,
      title: isRTL ? 'دفع عند الاستلام' : isFR ? 'Paiement à la livraison' : 'Cash on Delivery',
      desc: isRTL
        ? 'لا نطلب ولا نخزن أي بيانات بنكية أو بطاقات ائتمانية. الدفع نقدًا عند باب منزلك.'
        : isFR
          ? 'Aucune coordonnée bancaire enregistrée. Paiement sécurisé en espèces à la livraison.'
          : 'Zero banking or card details required or stored. Pay securely in cash at your doorstep.',
    },
    {
      icon: Truck,
      title: isRTL ? 'سرية بيانات الشحن' : isFR ? 'Livraison Confidentielle' : 'Confidential Shipping',
      desc: isRTL
        ? 'عنوانك ورقم هاتفك يُشاركان فقط مع مندوب التوصيل لإتمام وصول طلبيتك بدقة.'
        : isFR
          ? 'Vos coordonnées sont transmises uniquement au livreur pour l\'acheminement de votre colis.'
          : 'Your address and phone are shared strictly with the courier solely to deliver your parcel.',
    },
    {
      icon: EyeOff,
      title: isRTL ? 'صفر رسائل مزعجة' : isFR ? 'Zéro Spam Garanti' : 'Zero Spam Guarantee',
      desc: isRTL
        ? 'لا نرسل رسائل إعلانية متطفلة ولا نبيع أو نؤجر بياناتك لأي جهة إطلاقاً.'
        : isFR
          ? 'Nous ne vendons ni ne louons vos informations. Aucune communication intrusive.'
          : 'We strictly never sell or rent your data. Zero unwanted promotional spam.',
    },
  ]

  const policySections = [
    {
      number: '01',
      icon: FileText,
      title: isRTL ? 'المعلومات التي نقوم بجمعها' : isFR ? 'Informations que nous collectons' : 'Information We Collect',
      badge: isRTL ? 'البيانات الأساسية' : isFR ? 'Données de base' : 'Basic Data',
      content: isRTL
        ? [
            'نجمع فقط الحد الأدنى من المعلومات الضرورية لتنفيذ وتوصيل طلبيتك من الجلابيات والنقابات المغربية:',
            'الاسم الكامل: للتعريف بمالك الطلب وإصدار إيصال الشحن.',
            'رقم الهاتف المحمول: للتواصل معك عبر الاتصال أو واتساب لتأكيد الطلب وتحديد موعد التسليم مع المندوب.',
            'عنوان التوصيل والمدينة: لتوجيه مندوب الشحن مباشرة إلى موقعك بدقة وسرعة.',
            'تفضيلات المقاس واللون: لضمان تفصيل وتجهيز القطعة حسب رغبتك التامة.',
            'ملاحظة هامة: نظراً لاعتمادنا نظام الدفع عند الاستلام (COD)، فإننا لا نطلب أو نحتفظ بأي معلومات بنكية أو بطاقات دفع إلكترونية.',
          ]
        : isFR
          ? [
              'Nous recueillons uniquement les informations strictement indispensables au traitement et à la livraison de vos articles :',
              'Nom et prénom : Pour identifier le destinataire de la commande.',
              'Numéro de téléphone : Pour confirmer votre commande et coordonner la livraison avec le transporteur.',
              'Adresse de livraison et ville : Pour assurer l\'acheminement précis et rapide de votre colis partout au Maroc.',
              'Choix de taille et couleur : Pour préparer avec soin votre djellaba ou niqab selon vos souhaits.',
              'Note importante : Nous ne vous demanderons jamais vos numéros de carte bancaire, nos commandes étant réglées exclusivement à la livraison.',
            ]
          : [
              'We only collect the essential information required to fulfill and deliver your handcrafted Moroccan djellabas and niqabs:',
              'Full Name: To identify the recipient and prepare the delivery invoice.',
              'Phone Number: To confirm your order via phone or WhatsApp and coordinate delivery timing.',
              'Shipping Address & City: To ensure prompt and accurate delivery across Morocco.',
              'Size & Color Preferences: To tailor and prepare your garments to your exact choice.',
              'Important Note: Because we use Cash on Delivery (COD), we never ask for or store any bank or credit card numbers.',
            ],
    },
    {
      number: '02',
      icon: UserCheck,
      title: isRTL ? 'كيف نستخدم معلوماتك الشخصية' : isFR ? 'Utilisation de vos données' : 'How We Use Your Information',
      badge: isRTL ? 'معالجة الطلبات' : isFR ? 'Traitement' : 'Order Processing',
      content: isRTL
        ? [
            'تُستخدم المعلومات التي تقدمينها حصرياً للأغراض المباشرة التالية:',
            'تجهيز وتغليف طلبيتكِ بعناية من ورش الخياطة التقليدية التابعة لنا.',
            'التنسيق مع شركات التوصيل المعتمدة لنقل الشحنة إلى عنوانكِ المحدد.',
            'إرسال تحديثات حالة الطلب وتتبع الشحنة عبر رسائل واتساب أو الرسائل القصيرة (SMS).',
            'تقديم الدعم الفني وخدمة العملاء والإجابة على أي استفسارات تخص المقاسات أو التبديل.',
            'تحسين تجربة التسوق في المتجر وتطوير خدماتنا بما يتناسب مع رغباتكم.',
          ]
        : isFR
          ? [
              'Vos données personnelles sont utilisées exclusivement pour les finalités suivantes :',
              'La confection, la préparation soignée et le conditionnement de votre commande.',
              'La coordination avec notre réseau de transporteurs partenaires pour la livraison à domicile.',
              'L\'envoi des notifications de suivi et de confirmation de commande par WhatsApp ou SMS.',
              'L\'assistance client, le conseil sur les tailles et le service après-vente.',
              'L\'amélioration continue de votre expérience de navigation et de nos collections artisanales.',
            ]
          : [
              'The information you provide is used exclusively for the following purposes:',
              'Processing, crafting, and packing your order with utmost care from our artisan workshops.',
              'Coordinating with trusted courier partners for safe doorstep delivery across Morocco.',
              'Sending order confirmation and tracking status updates via WhatsApp or SMS.',
              'Providing personalized customer service, size guidance, and after-sales support.',
              'Improving your overall shopping and browsing experience on our platform.',
            ],
    },
    {
      number: '03',
      icon: ShieldCheck,
      title: isRTL ? 'حماية وأمان البيانات' : isFR ? 'Sécurité et conservation' : 'Data Security & Storage',
      badge: isRTL ? 'حماية مشددة' : isFR ? 'Protection' : 'High Security',
      content: isRTL
        ? [
            'نلتزم بأعلى معايير الأمان التقنية والإدارية لحماية خصوصيتك:',
            'تشفير الاتصال بالكامل باستخدام بروتوكول HTTPS ومعايير تشفير SSL المتقدمة.',
            'حصر الوصول إلى بيانات العملاء على الموظفين المخولين فقط المسؤولين عن تجهيز وشحن الطلبات.',
            'خوادم آمنة ومحمية بأنظمة جدار حماية لمنع أي وصول غير مصرح به.',
            'الامتثال للقوانين والأنظمة المعمول بها في المملكة المغربية بشأن حماية المعطيات ذات الطابع الشخصي (القانون رقم 09-08).',
          ]
        : isFR
          ? [
              'Nous appliquons des mesures de sécurité rigoureuses pour préserver vos données :',
              'Chiffrement complet de l\'ensemble des communications via les protocoles HTTPS et SSL.',
              'Accès strictement restreint aux seuls collaborateurs en charge de la préparation et du suivi des colis.',
              'Hébergement sécurisé avec pare-feu et monitoring régulier contre tout accès non autorisé.',
              'Conformité stricte avec la législation marocaine relative à la protection des données personnelles (Loi n° 09-08).',
            ]
          : [
              'We implement stringent security measures to safeguard your personal data:',
              'Full SSL/HTTPS encryption across all pages and interactions on our store.',
              'Strict access control limiting customer details solely to authorized fulfillment staff.',
              'Secure cloud infrastructure protected by modern firewall and security monitoring systems.',
              'Full compliance with Moroccan regulations regarding personal data protection (Law No. 09-08).',
            ],
    },
    {
      number: '04',
      icon: Truck,
      title: isRTL ? 'مشاركة البيانات مع أطراف ثالثة' : isFR ? 'Partage avec des tiers' : 'Third-Party Sharing',
      badge: isRTL ? 'شركاء الشحن فقط' : isFR ? 'Transporteurs' : 'Logistics Only',
      content: isRTL
        ? [
            'نلتزم بشكل قاطع بعدم بيع أو تأجير أو المتاجرة ببياناتكِ مع أي طرف ثالث لأغراض تسويقية أو تجارية.',
            'الطرف الوحيد الذي نشارك معه بياناتك هو شركة التوصيل المعتمدة (الاسم، العنوان، رقم الهاتف، وقيمة الطلب) لغرض واحد فقط وهو إيصال الشحنة واستلام المبلغ عند التسليم.',
            'يلتزم شركاء الشحن معنا باتفاقيات سرية تمنعهم من استخدام بياناتكِ لأي غرض آخر غير التوصيل.',
          ]
        : isFR
          ? [
              'Nous nous engageons formellement à ne jamais vendre, louer ou commercialiser vos informations personnelles.',
              'Le seul partage effectué concerne nos sociétés de livraison partenaires (Nom, adresse, téléphone, montant) pour le strict besoin de l\'acheminement et de l\'encaissement.',
              'Nos transporteurs sont contractuellement tenus au secret professionnel et à la stricte confidentialité de vos coordonnées.',
            ]
          : [
              'We firmly commit to never selling, renting, or trading your personal data for marketing purposes.',
              'The sole third party with whom details are shared is our authorized courier service (Name, phone, address, and order total) exclusively to complete the delivery and collect cash payment.',
              'Our shipping partners are bound by strict confidentiality agreements prohibiting any other use of your information.',
            ],
    },
    {
      number: '05',
      icon: Cookie,
      title: isRTL ? 'ملفات تعريف الارتباط (Cookies)' : isFR ? 'Témoins de connexion (Cookies)' : 'Cookies & Tracking',
      badge: isRTL ? 'تفضيلات التصفح' : isFR ? 'Navigation' : 'Preferences',
      content: isRTL
        ? [
            'نستخدم ملفات تعريف الارتباط التقنية البسيطة لتحسين تجربة تصفحكِ للمتجر:',
            'حفظ محتويات سلة التسوق عند التنقل بين صفحات الموقع.',
            'تذكر لغتكِ المفضلة (العربية، الفرنسية، أو الإنجليزية) والمظهر (الفاتح أو الداكن).',
            'تحليل حركة الزوار بشكل مجهول الهوية لتحسين سرعة وأداء الموقع.',
            'يمكنكِ في أي وقت التحكم في ملفات الكوكيز أو تعطيلها من خلال إعدادات المتصفح الخاص بكِ.',
          ]
        : isFR
          ? [
              'Nous utilisons des cookies strictement fonctionnels pour optimiser votre expérience d\'achat :',
              'Mémorisation des articles ajoutés à votre panier pendant votre navigation.',
              'Enregistrement de vos préférences linguistiques (Arabe, Français, Anglais) et du thème (Clair/Sombre).',
              'Mesures d\'audience anonymes afin de garantir la rapidité et la fiabilité de notre boutique.',
              'Vous pouvez configurer ou désactiver les cookies à tout moment depuis les paramètres de votre navigateur.',
            ]
          : [
              'We use essential cookies to provide you with a smooth shopping experience:',
              'Maintaining your cart contents as you navigate between different collection pages.',
              'Remembering your chosen language (Arabic, French, or English) and theme preference (Light/Dark mode).',
              'Anonymous performance metrics to improve store loading speed and reliability.',
              'You can adjust or disable cookies at any time through your web browser settings.',
            ],
    },
    {
      number: '06',
      icon: Sparkles,
      title: isRTL ? 'حقوقك والتحكم في بياناتك' : isFR ? 'Vos droits & Contrôle' : 'Your Rights & Choices',
      badge: isRTL ? 'حقوقك مضمونة' : isFR ? 'Vos droits' : 'Your Rights',
      content: isRTL
        ? [
            'بموجب القوانين وحرصاً على رضاكِ التام، تتمتعين بالحقوق الكاملة التالية:',
            'حق الاطلاع: طلب نسخة من أي بيانات شخصية مسجلة لدينا مرتبطة بطلباتكِ.',
            'حق التصحيح: تعديل أو تحديث أي معلومات خاطئة (مثل تعديل العنوان أو رقم الهاتف).',
            'حق الحذف: طلب حذف سجلكِ وبياناتكِ نهائياً من أنظمتنا بعد اكتمال تسليم الطلبيات.',
            'لممارسة أي من هذه الحقوق، يكفي التواصل معنا مباشرة عبر واتساب أو البريد الإلكتروني وسنقوم بتلبية طلبكِ فوراً.',
          ]
        : isFR
          ? [
              'Conformément aux réglementations, vous disposez d\'un contrôle total sur vos données :',
              'Droit d\'accès : Obtenir un récapitulatif des informations vous concernant.',
              'Droit de rectification : Corriger ou mettre à jour une coordonnée (adresse, numéro).',
              'Droit à l\'oubli : Demander la suppression définitive de vos données de nos systèmes après livraison.',
              'Pour exercer vos droits, contactez simplement notre service client via WhatsApp ou email.',
            ]
          : [
              'In accordance with privacy standards, you maintain full control over your personal data:',
              'Right of Access: Request a copy of the personal information we hold related to your orders.',
              'Right to Rectification: Correct or update any inaccurate contact details (address, phone number).',
              'Right to Erasure: Request permanent deletion of your data once orders are fulfilled.',
              'To exercise any of these rights, simply message our team on WhatsApp or via email.',
            ],
    },
  ]

  return (
    <div
      className="container-brand page-shell"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ maxWidth: '60rem' }}
    >
      {/* ── Top Navigation ────────────────────────────────────────── */}
      <div className="mb-6">
        <Link href={`/${locale}`} className="btn btn-outline btn-sm btn-round">
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{isRTL ? 'العودة للرئيسية' : isFR ? 'Retour à l\'accueil' : 'Back to Home'}</span>
        </Link>
      </div>

      {/* ── Editorial Hero Header ─────────────────────────────────── */}
      <header className="text-center mb-8">
        <div className="w-12 h-14 rounded-t-[999px] rounded-b-xl bg-[var(--accent-light)] border border-[var(--gold-ring)] flex items-center justify-center mx-auto mb-3.5 text-[var(--accent)]">
          <ShieldCheck className="w-5 h-5" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-1.5">
          {isRTL
            ? 'خصوصيتكِ أمانتنا ومسؤوليتنا'
            : isFR
              ? 'Protection & Sécurité Garantie'
              : 'Privacy & Data Protection Guaranteed'}
        </p>

        <h1
          className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-3 text-balance"
          style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
        >
          {isRTL
            ? 'سياسة الخصوصية وحماية البيانات'
            : isFR
              ? 'Politique de Confidentialité'
              : 'Privacy Policy & Data Security'}
        </h1>

        {/* Subtle Moroccan Hairline */}
        <div className="flex items-center justify-center gap-2.5 my-3" aria-hidden="true">
          <span className="h-[1px] w-10 bg-[var(--gold)] opacity-60" />
          <span className="w-1.5 h-1.5 rotate-45 bg-[var(--gold)]" />
          <span className="h-[1px] w-10 bg-[var(--gold)] opacity-60" />
        </div>

        <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed mb-3">
          {isRTL
            ? 'في متجر ثريا المغربي نعتز بثقتكم ونلتزم بحماية بياناتكم الشخصية وفقاً لأعلى معايير الأمان والشفافية في كل مرحلة من مراحل التسوق والتوصيل.'
            : isFR
              ? 'Chez Thuraya Al-Maghribi, nous veillons avec le plus grand soin à la protection de votre vie privée et à la sécurité de vos informations personnelles.'
              : 'At Thuraya Al-Maghribi, we deeply value your trust and are committed to protecting your personal data with utmost security and transparency.'}
        </p>

        {/* Quiet Inline Metadata */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--text-muted)] tabular-nums">
          <span>{isRTL ? 'آخر تحديث: 2026' : isFR ? 'Mise à jour : 2026' : 'Updated: 2026'}</span>
          <span aria-hidden="true">·</span>
          <span>
            {isRTL
              ? 'مطابق لقانون حماية المعطيات الشخصية'
              : isFR
                ? 'Conforme Loi 09-08'
                : 'Compliant with Data Protection Laws'}
          </span>
        </div>
      </header>

      {/* ── Trust Highlights (4 Calm Cards) ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {trustHighlights.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 flex flex-col gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>

              <h2 className="text-sm font-extrabold text-[var(--text-primary)] m-0">
                {item.title}
              </h2>

              <p className="text-xs leading-relaxed text-[var(--text-muted)] m-0">
                {item.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── Policy Chapters (Clean Hairline Rows, No Nested Cards) ── */}
      <div className="flex flex-col gap-5 mb-8">
        {policySections.map((section, idx) => {
          const Icon = section.icon
          return (
            <section
              key={idx}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-subtle)] flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold text-[var(--text-primary)] m-0">
                      <span className="tabular-nums text-[var(--accent)] me-2">{section.number}.</span>
                      {section.title}
                    </h2>
                  </div>
                </div>

                <span className="text-xs font-medium text-[var(--text-muted)]">
                  {section.badge}
                </span>
              </div>

              <div className="p-5 sm:p-6 flex flex-col gap-3">
                {section.content.map((paragraph, pIdx) => {
                  const isNote = paragraph.startsWith('ملاحظة') || paragraph.startsWith('Note') || paragraph.startsWith('Important')
                  const isSubitem = paragraph.includes(':') && !isNote && pIdx > 0

                  if (isSubitem) {
                    const [heading, ...rest] = paragraph.split(':')
                    return (
                      <div
                        key={pIdx}
                        className="flex items-start gap-2.5 py-2 border-b last:border-b-0 border-[var(--border-subtle)]"
                      >
                        <span className="w-1.5 h-1.5 rotate-45 bg-[var(--gold)] mt-2 flex-shrink-0" aria-hidden="true" />
                        <div className="text-sm leading-relaxed">
                          <strong className="text-[var(--text-primary)] font-bold">
                            {heading}:
                          </strong>{' '}
                          <span className="text-[var(--text-muted)]">{rest.join(':')}</span>
                        </div>
                      </div>
                    )
                  }

                  if (isNote) {
                    return (
                      <div
                        key={pIdx}
                        className="mt-1 px-4 py-3 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed"
                      >
                        <ShieldCheck className="w-4 h-4 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                        <span>{paragraph}</span>
                      </div>
                    )
                  }

                  return (
                    <p
                      key={pIdx}
                      className="text-sm leading-relaxed text-[var(--text-muted)] m-0"
                    >
                      {paragraph}
                    </p>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* ── Direct Privacy Concierge Banner ──────────────────────── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 sm:p-7 text-center flex flex-col items-center gap-3.5 mb-7">
        <div className="w-11 h-11 rounded-xl bg-[#25D366]/12 border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
          <FaWhatsapp className="w-5 h-5" />
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] mb-1">
            {isRTL
              ? 'هل لديكِ أي استفسار حول خصوصيتكِ أو طلباتكِ؟'
              : isFR
                ? 'Une question sur vos données ou votre commande ?'
                : 'Questions about your privacy or orders?'}
          </h2>
          <p className="text-sm text-[var(--text-muted)] m-0 max-w-lg leading-relaxed">
            {isRTL
              ? 'فريق خدمة عملاء ثريا المغربي مستعد دائماً للإجابة الفورية ومساعدتكِ في كل ما يخص بياناتكِ ومشترياتكِ بكل سرور وأمان.'
              : isFR
                ? 'Notre équipe est à votre entière disposition pour répondre à toutes vos interrogations en toute transparence.'
                : 'Our customer support team is always ready to assist you regarding your privacy and orders with complete security.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-round px-6 h-11 text-sm"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>{isRTL ? 'تواصلي معنا عبر واتساب' : isFR ? 'Discuter sur WhatsApp' : 'Chat on WhatsApp'}</span>
            </a>
          )}

          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(settings.contactEmail?.trim() || siteConfig.contact.email)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-round px-6 h-11 text-sm"
          >
            <Mail className="w-4 h-4 text-[var(--accent)]" />
            <span>{isRTL ? 'البريد الإلكتروني' : isFR ? 'Envoyer un Email' : 'Email Us'}</span>
          </a>
        </div>
      </div>

      {/* ── Bottom Navigation CTA ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          href={`/${locale}`}
          className="btn btn-outline btn-sm btn-round inline-flex w-full sm:w-auto justify-center"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{isRTL ? 'العودة للرئيسية' : isFR ? 'Retour à l\'accueil' : 'Back to Home'}</span>
        </Link>

        <Link
          href={`/${locale}/products`}
          className="btn btn-primary btn-sm btn-round inline-flex w-full sm:w-auto justify-center"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isRTL ? 'اكتشفي تشكيلة المنتجات' : isFR ? 'Découvrir nos créations' : 'Explore Collections'}</span>
        </Link>
      </div>
    </div>
  )
}

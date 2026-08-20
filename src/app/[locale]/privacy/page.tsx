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
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
} from 'lucide-react'
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

  // 4 Main Trust Highlights
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

  // Detailed Policy Articles
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
      style={{
        maxWidth: 960,
        margin: '0 auto',
        paddingLeft: 'max(16px, 3.5vw)',
        paddingRight: 'max(16px, 3.5vw)',
        paddingTop: 'clamp(14px, 2.5vw, 28px)',
        paddingBottom: 'clamp(36px, 5vw, 64px)',
      }}
    >
      {/* ── 1. Top Navigation / Breadcrumb ───────────────────────── */}
      <div style={{ marginBottom: 'clamp(14px, 2vw, 22px)' }}>
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
            border: '1px solid #C4622D',
            borderRadius: 12,
            transition: 'background 0.2s',
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
          <span>{isRTL ? 'العودة للرئيسية' : isFR ? 'Retour à l\'accueil' : 'Back to Home'}</span>
        </Link>
      </div>

      {/* ── 2. Hero Header Card ──────────────────────────────────── */}
      <div
        style={{
          borderRadius: 'clamp(18px, 3vw, 28px)',
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 8px 32px rgba(61,31,10,0.04)',
          overflow: 'hidden',
          marginBottom: 'clamp(20px, 3vw, 32px)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(196,98,45,0.08) 0%, rgba(184,150,90,0.05) 50%, rgba(61,31,10,0.02) 100%)',
            padding: 'clamp(26px, 4vw, 42px) clamp(16px, 3.5vw, 36px)',
            textAlign: 'center',
            borderBottom: '1px solid var(--border)',
            position: 'relative',
          }}
        >
          {/* Decorative Top Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(196,98,45,0.12) 0%, transparent 65%)',
            }}
          />

          {/* Hero Icon Emblem */}
          <div
            style={{
              width: 'clamp(52px, 7vw, 68px)',
              height: 'clamp(52px, 7vw, 68px)',
              borderRadius: '50%',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto clamp(12px, 2vw, 18px)',
              border: '2px solid var(--accent-ring)',
              boxShadow: '0 6px 20px rgba(196,98,45,0.15)',
              position: 'relative',
            }}
          >
            <ShieldCheck style={{ width: 'clamp(26px, 3.5vw, 34px)', height: 'clamp(26px, 3.5vw, 34px)', color: 'var(--accent)' }} />
          </div>

          {/* Overline Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-ring)',
            }}
          >
            <span className="text-amber-500 text-xs">✦</span>
            <span>
              {isRTL
                ? 'خصوصيتكِ أمانتنا ومسؤوليتنا'
                : isFR
                  ? 'Protection & Sécurité Garantie'
                  : 'Privacy & Data Protection Guaranteed'}
            </span>
            <span className="text-amber-500 text-xs">✦</span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 'clamp(1.45rem, 3.2vw, 2.2rem)',
              fontWeight: 900,
              color: 'var(--foreground)',
              margin: '0 0 10px',
              fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
              lineHeight: 1.25,
            }}
          >
            {isRTL
              ? 'سياسة الخصوصية وحماية البيانات'
              : isFR
                ? 'Politique de Confidentialité'
                : 'Privacy Policy & Data Security'}
          </h1>

          {/* Moroccan Separator */}
          <div
            className="flex items-center justify-center gap-2.5 my-2.5"
            aria-hidden="true"
          >
            <span
              className="h-[1.5px] w-8 sm:w-12 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--accent-ring), var(--gold))',
              }}
            />
            <span
              className="text-xs sm:text-sm font-serif"
              style={{ color: 'var(--gold)' }}
            >
              ✦
            </span>
            <span
              className="h-[1.5px] w-8 sm:w-12 rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--gold), var(--accent-ring), transparent)',
              }}
            />
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(12px, 1.3vw, 14.5px)',
              color: 'var(--muted-foreground)',
              maxWidth: 580,
              margin: '0 auto',
              lineHeight: 1.65,
            }}
          >
            {isRTL
              ? 'في متجر ثريا المغربي نعتز بثقتكم ونلتزم بحماية بياناتكم الشخصية وفقاً لأعلى معايير الأمان والشفافية في كل مرحلة من مراحل التسوق والتوصيل.'
              : isFR
                ? 'Chez Thuraya Al-Maghribi, nous veillons avec le plus grand soin à la protection de votre vie privée et à la sécurité de vos informations personnelles.'
                : 'At Thuraya Al-Maghribi, we deeply value your trust and are committed to protecting your personal data with utmost security and transparency.'}
          </p>

          {/* Metadata Badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(6px, 1vw, 10px)',
              marginTop: 'clamp(14px, 2vw, 20px)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--muted-foreground)',
              }}
            >
              <CheckCircle2 style={{ width: 12, height: 12, color: 'var(--accent)' }} />
              <span>{isRTL ? 'آخر تحديث: 2026' : isFR ? 'Mise à jour : 2026' : 'Updated: 2026'}</span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--muted-foreground)',
              }}
            >
              <ShieldCheck style={{ width: 12, height: 12, color: '#16a34a' }} />
              <span>
                {isRTL
                  ? 'مطابق لمعايير حماية البيانات'
                  : isFR
                    ? 'Conforme Loi 09-08'
                    : 'Compliant with Data Laws'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Trust Highlights (4 Quick Cards) ──────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: 'clamp(10px, 1.8vw, 16px)',
          marginBottom: 'clamp(24px, 3.5vw, 36px)',
        }}
      >
        {trustHighlights.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              style={{
                borderRadius: 'clamp(14px, 2vw, 18px)',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                padding: 'clamp(14px, 2vw, 18px) clamp(12px, 1.8vw, 16px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                boxShadow: '0 3px 12px rgba(61,31,10,0.03)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 'clamp(32px, 4vw, 40px)',
                  height: 'clamp(32px, 4vw, 40px)',
                  borderRadius: 10,
                  background: 'var(--accent-light)',
                  border: '1px solid var(--accent-ring)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: 'clamp(16px, 2vw, 20px)', height: 'clamp(16px, 2vw, 20px)' }} />
              </div>

              <h2
                style={{
                  fontSize: 'clamp(12.5px, 1.4vw, 14.5px)',
                  fontWeight: 800,
                  color: 'var(--foreground)',
                  margin: 0,
                }}
              >
                {item.title}
              </h2>

              <p
                style={{
                  fontSize: 'clamp(11px, 1.15vw, 12.5px)',
                  lineHeight: 1.55,
                  color: 'var(--muted-foreground)',
                  margin: 0,
                }}
              >
                {item.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── 4. Main Policy Sections ──────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(14px, 2vw, 20px)',
          marginBottom: 'clamp(24px, 3.5vw, 36px)',
        }}
      >
        {policySections.map((section, idx) => {
          const Icon = section.icon
          return (
            <section
              key={idx}
              style={{
                borderRadius: 'clamp(16px, 2.5vw, 22px)',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                boxShadow: '0 4px 16px rgba(61,31,10,0.03)',
                overflow: 'hidden',
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Section Header */}
              <div
                style={{
                  padding: 'clamp(14px, 2vw, 20px) clamp(16px, 2.5vw, 24px)',
                  borderBottom: '1px solid var(--border-subtle, var(--border))',
                  background: 'linear-gradient(90deg, var(--bg-subtle) 0%, var(--card) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)' }}>
                  <div
                    style={{
                      width: 'clamp(30px, 3.5vw, 38px)',
                      height: 'clamp(30px, 3.5vw, 38px)',
                      borderRadius: 10,
                      background: 'var(--accent-light)',
                      border: '1px solid var(--accent-ring)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: 'clamp(15px, 1.8vw, 19px)', height: 'clamp(15px, 1.8vw, 19px)' }} />
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        color: 'var(--accent)',
                        display: 'block',
                        marginBottom: 1,
                      }}
                    >
                      {section.number}
                    </span>
                    <h2
                      style={{
                        fontSize: 'clamp(13.5px, 1.6vw, 17px)',
                        fontWeight: 800,
                        color: 'var(--foreground)',
                        margin: 0,
                      }}
                    >
                      {section.title}
                    </h2>
                  </div>
                </div>

                <div
                  style={{
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--muted-foreground)',
                  }}
                >
                  {section.badge}
                </div>
              </div>

              {/* Section Body */}
              <div
                style={{
                  padding: 'clamp(16px, 2.5vw, 24px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(8px, 1.2vw, 12px)',
                }}
              >
                {section.content.map((paragraph, pIdx) => {
                  const isNote = paragraph.startsWith('ملاحظة') || paragraph.startsWith('Note')
                  const isSubitem = paragraph.includes(':') && !isNote && pIdx > 0

                  if (isSubitem) {
                    const [heading, ...rest] = paragraph.split(':')
                    return (
                      <div
                        key={pIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '8px 12px',
                          borderRadius: 12,
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            marginTop: 7,
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ fontSize: 'clamp(11.5px, 1.2vw, 13.5px)', lineHeight: 1.65 }}>
                          <strong style={{ color: 'var(--foreground)', fontWeight: 700 }}>
                            {heading}:
                          </strong>{' '}
                          <span style={{ color: 'var(--muted-foreground)' }}>{rest.join(':')}</span>
                        </div>
                      </div>
                    )
                  }

                  if (isNote) {
                    return (
                      <div
                        key={pIdx}
                        style={{
                          marginTop: 4,
                          padding: '10px 14px',
                          borderRadius: 12,
                          background: 'var(--accent-light)',
                          border: '1px solid var(--accent-ring)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 'clamp(11px, 1.15vw, 13px)',
                          color: 'var(--foreground)',
                          lineHeight: 1.6,
                        }}
                      >
                        <span style={{ color: 'var(--accent)', fontWeight: 800, flexShrink: 0 }}>✦</span>
                        <span>{paragraph}</span>
                      </div>
                    )
                  }

                  return (
                    <p
                      key={pIdx}
                      style={{
                        fontSize: 'clamp(12px, 1.25vw, 14px)',
                        lineHeight: 1.7,
                        color: 'var(--muted-foreground)',
                        margin: 0,
                      }}
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

      {/* ── 5. WhatsApp & Direct Support Banner ──────────────────── */}
      <div
        style={{
          borderRadius: 'clamp(18px, 2.5vw, 24px)',
          border: '1px solid rgba(37,211,102,0.35)',
          background: 'linear-gradient(135deg, rgba(37,211,102,0.07) 0%, rgba(37,211,102,0.02) 100%)',
          padding: 'clamp(20px, 3.5vw, 32px) clamp(16px, 3vw, 28px)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(10px, 1.5vw, 14px)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.04)',
          marginBottom: 'clamp(24px, 3vw, 36px)',
        }}
      >
        <div
          style={{
            width: 'clamp(44px, 5vw, 52px)',
            height: 'clamp(44px, 5vw, 52px)',
            borderRadius: 16,
            background: 'rgba(37,211,102,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#25D366',
          }}
        >
          <MessageCircle style={{ width: 'clamp(22px, 2.8vw, 26px)', height: 'clamp(22px, 2.8vw, 26px)' }} />
        </div>

        <div>
          <h2
            style={{
              fontSize: 'clamp(14.5px, 2vw, 18px)',
              fontWeight: 800,
              color: 'var(--foreground)',
              margin: '0 0 6px',
            }}
          >
            {isRTL
              ? 'هل لديكِ أي استفسار حول خصوصيتكِ أو طلباتكِ؟'
              : isFR
                ? 'Une question sur vos données ou votre commande ?'
                : 'Questions about your privacy or orders?'}
          </h2>
          <p
            style={{
              fontSize: 'clamp(11.5px, 1.2vw, 13.5px)',
              color: 'var(--muted-foreground)',
              margin: 0,
              maxWidth: 520,
              lineHeight: 1.6,
            }}
          >
            {isRTL
              ? 'فريق خدمة عملاء ثريا المغربي مستعد دائماً للإجابة الفورية ومساعدتكِ في كل ما يخص بياناتكِ ومشترياتكِ بكل سرور وأمان.'
              : isFR
                ? 'Notre équipe est à votre entière disposition pour répondre à toutes vos interrogations en toute transparence.'
                : 'Our customer support team is always ready to assist you regarding your privacy and orders with complete security.'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginTop: 4,
          }}
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 12,
              background: '#25D366',
              color: '#ffffff',
              fontSize: 'clamp(12px, 1.2vw, 13.5px)',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
              transition: 'transform 0.2s ease',
            }}
          >
            <MessageCircle style={{ width: 16, height: 16 }} />
            <span>{isRTL ? 'تواصلي معنا عبر واتساب' : isFR ? 'Discuter sur WhatsApp' : 'Chat on WhatsApp'}</span>
          </a>

          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(settings.contactEmail?.trim() || siteConfig.contact.email)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 12,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontSize: 'clamp(12px, 1.2vw, 13.5px)',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'background 0.2s ease',
            }}
          >
            <Mail style={{ width: 15, height: 15, color: 'var(--accent)' }} />
            <span>{isRTL ? 'البريد الإلكتروني' : isFR ? 'Envoyer un Email' : 'Email Us'}</span>
          </a>
        </div>
      </div>

      {/* ── 6. Bottom Navigation CTA ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          href={`/${locale}`}
          className="btn btn-outline btn-sm btn-round inline-flex w-full sm:w-auto"
          style={{ justifyContent: 'center' }}
        >
          <ArrowLeft style={{ width: 13, height: 13, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
          <span>{isRTL ? 'العودة للرئيسية' : isFR ? 'Retour à l\'accueil' : 'Back to Home'}</span>
        </Link>

        <Link
          href={`/${locale}/products`}
          className="btn btn-primary btn-sm btn-round inline-flex w-full sm:w-auto shadow-md"
          style={{ justifyContent: 'center' }}
        >
          <ShoppingBag style={{ width: 14, height: 14 }} />
          <span>{isRTL ? 'اكتشفي تشكيلة المنتجات' : isFR ? 'Découvrir nos créations' : 'Explore Collections'}</span>
        </Link>
      </div>
    </div>
  )
}

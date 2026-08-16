export const siteConfig = {
  name: 'ثريا المغربي',
  nameEn: 'Thuraya Al-Maghribi',
  nameFr: 'Thuraya Al-Maghribi',
  tagline: {
    ar: 'أناقة مغربية أصيلة',
    fr: 'Élégance marocaine authentique',
    en: 'Authentic Moroccan Elegance',
  },
  description: {
    ar: 'متجر ثريا المغربي – وجهتك الأولى للجلابيات والنقابات المغربية المصنوعة يدوياً بأجود الخامات.',
    fr: 'Thuraya Al-Maghribi – Votre destination pour les djellabas et niqabs marocains artisanaux.',
    en: 'Thuraya Al-Maghribi – Your destination for handcrafted Moroccan djellabas and niqabs.',
  },
  url: 'https://thuraya-almaghribi.ma',
  ogImage: '/images/brand/og-image.jpg',
  logoFull: '/images/brand/logo-full.png',
  logoIcon: '/images/brand/logo-icon.png',
  contact: {
    phone: '+212600000000',
    phoneDisplay: '+212 6XX XXX XXX',
    email: 'contact@thuraya-almaghribi.ma',
    whatsapp: '+212600000000',
  },
  social: {
    instagram: 'https://instagram.com/thuraya.almaghribi',
    facebook: 'https://facebook.com/thuraya.almaghribi',
    tiktok: 'https://tiktok.com/@thuraya.almaghribi',
    youtube: 'https://youtube.com/@thuraya.almaghribi',
  },
  colors: {
    primary: '#C4622D',
    primaryDark: '#A34E23',
    primaryLight: '#D97B4A',
    gold: '#B8965A',
    goldLight: '#D4AE78',
    cream: '#F2E4CE',
    creamDark: '#E8D5B5',
    brown: '#3D1F0A',
    brownLight: '#5C3015',
  },
  currency: {
    code: 'MAD',
    symbol: 'د.م.',
    symbolEn: 'DH',
    symbolFr: 'DH',
  },
  shipping: {
    freeThreshold: null, // no free shipping threshold currently
    estimatedDays: '3-5',
  },
  locales: ['ar', 'fr', 'en'] as const,
  defaultLocale: 'ar' as const,
  rtlLocales: ['ar'] as const,
} as const

export type SiteConfig = typeof siteConfig

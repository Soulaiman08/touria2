export interface BannerTranslations {
  titleAr: string
  titleFr: string
  titleEn: string
  subtitleAr: string | null
  subtitleFr: string | null
  subtitleEn: string | null
  buttonTextAr: string | null
  buttonTextFr: string | null
  buttonTextEn: string | null
}

export interface BannerBaseRecord {
  id: string
  title: string
  subtitle?: string | null
  buttonText?: string | null
}

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/

export const BANNER_I18N_KEY_PREFIX = 'banner_i18n:'

const PREVIEW_BANNER_TRANSLATIONS: Record<string, BannerTranslations> = {
  'banner-preview-1': {
    titleAr: 'تشكيلة ثريا المغربي الجديدة',
    titleFr: 'Nouvelle Collection Thuraya',
    titleEn: 'New Thuraya Collection',
    subtitleAr: 'جلابيات مغربية فاخرة مصنوعة يدوياً بأرقى الأثواب',
    subtitleFr: 'Djellabas marocaines de luxe confectionnées à la main',
    subtitleEn: 'Handcrafted luxury Moroccan djellabas tailored with heritage detail',
    buttonTextAr: 'تسوقي الآن',
    buttonTextFr: 'Découvrir',
    buttonTextEn: 'Shop Now',
  },
  'banner-preview-2': {
    titleAr: 'تطريز المعلم المغربي الأصيل',
    titleFr: "Broderie Maâlem d'Exception",
    titleEn: 'Artisanal Maâlem Embroidery',
    subtitleAr: 'سفيفة وعقاد منسوجة يدوياً بلمسة دار ثريا الراقية',
    subtitleFr: 'Sfifa et âaqad tissés à la main dans la pure tradition',
    subtitleEn: 'Hand-woven sfifa trim and traditional Moroccan buttonwork',
    buttonTextAr: 'اكتشفي الجلابيات',
    buttonTextFr: 'Voir les djellabas',
    buttonTextEn: 'Explore Djellabas',
  },
  'banner-preview-3': {
    titleAr: 'نقابات حرير المدينة والكريب',
    titleFr: 'Niqabs Soie de Médine & Crêpe',
    titleEn: 'Medina Silk & Crepe Niqabs',
    subtitleAr: 'تصاميم محتشمة مريحة وخفيفة للاستعمال اليومي',
    subtitleFr: 'Coupes fluides, légères et confortables au quotidien',
    subtitleEn: 'Breathable, graceful modest silhouettes for everyday comfort',
    buttonTextAr: 'تصفحي النقابات',
    buttonTextFr: 'Voir les niqabs',
    buttonTextEn: 'Shop Niqabs',
  },
  'banner-preview-4': {
    titleAr: 'خدمة التوصيل والدفع عند الاستلام',
    titleFr: 'Livraison Nationale & Paiement à la Réception',
    titleEn: 'Nationwide Delivery & Cash on Delivery',
    subtitleAr: 'توصيل سريع وآمن إلى جميع المدن المغربية',
    subtitleFr: 'Expédition rapide et sécurisée partout au Maroc',
    subtitleEn: 'Fast, reliable doorstep delivery across Morocco',
    buttonTextAr: 'تعرفي علينا',
    buttonTextFr: 'Notre maison',
    buttonTextEn: 'Our Craft',
  },
}

export function containsArabicScript(text?: string | null): boolean {
  if (!text) return false
  return ARABIC_CHAR_REGEX.test(text)
}

function cleanOptionalText(val: unknown): string | null {
  if (typeof val !== 'string') return null
  const trimmed = val.trim()
  return trimmed.length > 0 ? trimmed : null
}

function findPreviewBannerSeed(base: BannerBaseRecord): BannerTranslations | null {
  if (base.id in PREVIEW_BANNER_TRANSLATIONS) {
    return PREVIEW_BANNER_TRANSLATIONS[base.id]
  }
  const normalizedTitle = base.title.trim()
  return (
    Object.values(PREVIEW_BANNER_TRANSLATIONS).find(
      (item) => item.titleAr === normalizedTitle
    ) ?? null
  )
}

export function buildBannerTranslations(
  raw: unknown,
  base: BannerBaseRecord
): BannerTranslations {
  const rec = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const seed = findPreviewBannerSeed(base)

  const baseTitle = base.title.trim()
  const baseIsArabic = containsArabicScript(baseTitle)

  const titleAr =
    cleanOptionalText(rec.titleAr) ||
    (baseIsArabic ? baseTitle : '') ||
    seed?.titleAr ||
    baseTitle

  const titleFr =
    cleanOptionalText(rec.titleFr) ||
    (!baseIsArabic && baseTitle ? baseTitle : '') ||
    seed?.titleFr ||
    ''

  const titleEn =
    cleanOptionalText(rec.titleEn) ||
    (!baseIsArabic && baseTitle ? baseTitle : '') ||
    seed?.titleEn ||
    ''

  const baseSubtitle = cleanOptionalText(base.subtitle)
  const subIsArabic = containsArabicScript(baseSubtitle)

  const subtitleAr =
    cleanOptionalText(rec.subtitleAr) ??
    (subIsArabic ? baseSubtitle : null) ??
    seed?.subtitleAr ??
    null

  const subtitleFr =
    cleanOptionalText(rec.subtitleFr) ??
    (!subIsArabic ? baseSubtitle : null) ??
    seed?.subtitleFr ??
    null

  const subtitleEn =
    cleanOptionalText(rec.subtitleEn) ??
    (!subIsArabic ? baseSubtitle : null) ??
    seed?.subtitleEn ??
    null

  const baseBtn = cleanOptionalText(base.buttonText)
  const btnIsArabic = containsArabicScript(baseBtn)

  const buttonTextAr =
    cleanOptionalText(rec.buttonTextAr) ??
    (btnIsArabic ? baseBtn : null) ??
    seed?.buttonTextAr ??
    null

  const buttonTextFr =
    cleanOptionalText(rec.buttonTextFr) ??
    (!btnIsArabic ? baseBtn : null) ??
    seed?.buttonTextFr ??
    null

  const buttonTextEn =
    cleanOptionalText(rec.buttonTextEn) ??
    (!btnIsArabic ? baseBtn : null) ??
    seed?.buttonTextEn ??
    null

  return {
    titleAr,
    titleFr,
    titleEn,
    subtitleAr,
    subtitleFr,
    subtitleEn,
    buttonTextAr,
    buttonTextFr,
    buttonTextEn,
  }
}

export function resolveBannerForLocale(
  translations: BannerTranslations,
  base: BannerBaseRecord,
  locale: string
): {
  title: string
  subtitle: string | null
  buttonText: string | null
  isTextRTL: boolean
} {
  let title = base.title
  let subtitle: string | null = base.subtitle ?? null
  let buttonText: string | null = base.buttonText ?? null

  if (locale === 'fr') {
    title = translations.titleFr || translations.titleEn || translations.titleAr || base.title
    subtitle = translations.subtitleFr ?? translations.subtitleEn ?? translations.subtitleAr ?? subtitle
    buttonText =
      translations.buttonTextFr ??
      translations.buttonTextEn ??
      translations.buttonTextAr ??
      buttonText
  } else if (locale === 'en') {
    title = translations.titleEn || translations.titleFr || translations.titleAr || base.title
    subtitle = translations.subtitleEn ?? translations.subtitleFr ?? translations.subtitleAr ?? subtitle
    buttonText =
      translations.buttonTextEn ??
      translations.buttonTextFr ??
      translations.buttonTextAr ??
      buttonText
  } else {
    title = translations.titleAr || translations.titleFr || translations.titleEn || base.title
    subtitle = translations.subtitleAr ?? translations.subtitleFr ?? translations.subtitleEn ?? subtitle
    buttonText =
      translations.buttonTextAr ??
      translations.buttonTextFr ??
      translations.buttonTextEn ??
      buttonText
  }

  return {
    title,
    subtitle,
    buttonText,
    isTextRTL: containsArabicScript(title),
  }
}

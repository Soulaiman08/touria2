type ColorLocale = 'ar' | 'fr' | 'en'

const COLORS: Record<string, Record<ColorLocale, string>> = {
  '#000': { ar: 'أسود', fr: 'Noir', en: 'Black' }, '#000000': { ar: 'أسود', fr: 'Noir', en: 'Black' },
  '#fff': { ar: 'أبيض', fr: 'Blanc', en: 'White' }, '#ffffff': { ar: 'أبيض', fr: 'Blanc', en: 'White' },
  '#964b00': { ar: 'بني', fr: 'Marron', en: 'Brown' }, '#6b4226': { ar: 'بني', fr: 'Marron', en: 'Brown' }, '#8b4513': { ar: 'بني', fr: 'Marron', en: 'Brown' }, '#5c4033': { ar: 'بني', fr: 'Marron', en: 'Brown' },
  '#f5f5dc': { ar: 'بيج', fr: 'Beige', en: 'Beige' }, '#e8dcc8': { ar: 'بيج', fr: 'Beige', en: 'Beige' }, '#f2e4ce': { ar: 'بيج', fr: 'Beige', en: 'Beige' }, '#fff8dc': { ar: 'بيج', fr: 'Beige', en: 'Beige' },
  '#c4622d': { ar: 'تيراكوتا', fr: 'Terracotta', en: 'Terracotta' }, '#8b1a1a': { ar: 'خمري', fr: 'Bordeaux', en: 'Burgundy' },
  '#1e3a5f': { ar: 'أزرق كحلي', fr: 'Bleu marine', en: 'Navy blue' }, '#1f4d2e': { ar: 'أخضر', fr: 'Vert', en: 'Green' },
}

export function getColorName(code: string, locale: ColorLocale): string {
  return COLORS[code.trim().toLowerCase()]?.[locale] || code
}

export function getColorNames(code: string) {
  return { nameAr: getColorName(code, 'ar'), nameFr: getColorName(code, 'fr'), nameEn: getColorName(code, 'en') }
}

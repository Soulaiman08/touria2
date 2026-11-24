export type CategorySizingMode = 'letter' | 'numeric' | 'standard' | 'bundle_no_size'
export type SizeGuideProfile = 'djellaba' | 'abaya' | 'none'
export type CategoryColorMode = 'multi' | 'single'
export type CategoryCardAspectRatio = '3:4' | '1:1'

export interface CategoryConfig {
  sizingMode: CategorySizingMode
  defaultSizes: string[]
  cardAspectRatio: CategoryCardAspectRatio
  allowCustomNote: boolean

  minOrderQuantity: number
  maxOrderQuantity: number | null
  allowMatchingNiqab: boolean
  colorMode: CategoryColorMode
  defaultColors: string[]

  unitNounAr: string
  unitNounFr: string
  unitNounEn: string
  unitPluralAr: string
  unitPluralFr: string
  unitPluralEn: string

  sizeGuideProfile: SizeGuideProfile
  careNoteAr: string
  careNoteFr: string
  careNoteEn: string

  showInHomeTabs: boolean
  showInFooter: boolean
  showSizeFilter: boolean
}

export interface CategoryIdentityLike {
  id?: string
  slug?: string | null
  name?: string | null
  nameAr?: string | null
  nameFr?: string | null
  nameEn?: string | null
}

export const CATEGORY_CONFIG_KEY_PREFIX = 'category_config:'

export const LETTER_PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
export const NUMERIC_PRESET_SIZES = ['50', '52', '54', '56', '58', '60']
export const STANDARD_PRESET_SIZES = ['Standard']

const LETTER_SIZE_ORDER: Record<string, number> = {
  XXS: 5,
  XS: 10,
  S: 20,
  M: 30,
  L: 40,
  XL: 50,
  XXL: 60,
  '2XL': 60,
  XXXL: 70,
  '3XL': 70,
  XXXXL: 80,
  '4XL': 80,
  '5XL': 90,
  '6XL': 100,
}

export function normalizeSizeToken(raw: string): string {
  const trimmed = String(raw || '').trim()
  if (!trimmed) return ''
  const upper = trimmed.toUpperCase()
  if (upper === '2XL') return 'XXL'
  if (upper === '3XL') return 'XXXL'
  if (upper === '4XL' || upper === 'XXXXL') return '4XL'
  if (upper in LETTER_SIZE_ORDER) return upper
  if (upper === 'STANDARD') return 'Standard'
  return trimmed
}

export function getSizeSortRank(size: string): number {
  const upper = String(size || '').trim().toUpperCase()
  if (!upper) return 9999
  if (upper in LETTER_SIZE_ORDER) return LETTER_SIZE_ORDER[upper]
  if (/^\d+(\.\d+)?$/.test(upper)) return 1000 + Number(upper)
  if (
    upper === 'STANDARD' ||
    upper === 'ONE SIZE' ||
    upper === 'ONESIZE' ||
    upper === 'FREE SIZE' ||
    upper === 'UNIQUE'
  ) {
    return 2000
  }
  return 3000
}

export function sortSizesCanonical(sizes: readonly string[]): string[] {
  const seen = new Set<string>()
  const unique: string[] = []
  for (const s of sizes) {
    const trimmed = String(s || '').trim()
    if (!trimmed) continue
    const key = trimmed.toUpperCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(trimmed)
  }
  return unique.sort((a, b) => {
    const rankDiff = getSizeSortRank(a) - getSizeSortRank(b)
    if (rankDiff !== 0) return rankDiff
    return a.localeCompare(b)
  })
}

export function sortVariantsCanonical<T extends { size: string }>(variants: readonly T[]): T[] {
  return [...variants].sort((a, b) => {
    const rankDiff = getSizeSortRank(a.size) - getSizeSortRank(b.size)
    if (rankDiff !== 0) return rankDiff
    return a.size.localeCompare(b.size)
  })
}

export const DEFAULT_APPAREL_COLORS = ['#C4622D', '#F2E4CE', '#000000']
export const DEFAULT_ACCESSORY_COLORS = ['#000000']

export function getPresetSizesForMode(mode: CategorySizingMode): string[] {
  switch (mode) {
    case 'letter':
      return ['S', 'M', 'L', 'XL']
    case 'numeric':
      return ['52', '54', '56', '58']
    case 'standard':
      return ['Standard']
    case 'bundle_no_size':
      return []
  }
}

export function getSuggestedConfigForMode(
  mode: CategorySizingMode,
  current?: Partial<CategoryConfig>
): Partial<CategoryConfig> {
  if (mode === 'bundle_no_size') {
    return {
      sizingMode: mode,
      defaultSizes: [],
      cardAspectRatio: '1:1',
      allowCustomNote: false,
      allowMatchingNiqab: false,
      sizeGuideProfile: 'none',
      showSizeFilter: false,
      minOrderQuantity: current?.minOrderQuantity && current.minOrderQuantity > 1 ? current.minOrderQuantity : 1,
      defaultColors: current?.defaultColors?.length ? current.defaultColors : DEFAULT_ACCESSORY_COLORS,
    }
  }
  if (mode === 'standard') {
    return {
      sizingMode: mode,
      defaultSizes: ['Standard'],
      cardAspectRatio: '1:1',
      allowCustomNote: false,
      allowMatchingNiqab: false,
      sizeGuideProfile: 'none',
      showSizeFilter: false,
      minOrderQuantity: 1,
      defaultColors: current?.defaultColors?.length ? current.defaultColors : DEFAULT_ACCESSORY_COLORS,
    }
  }
  if (mode === 'numeric') {
    return {
      sizingMode: mode,
      defaultSizes: ['52', '54', '56', '58'],
      cardAspectRatio: '3:4',
      allowCustomNote: true,
      allowMatchingNiqab: true,
      sizeGuideProfile: 'abaya',
      showSizeFilter: true,
      minOrderQuantity: 1,
      defaultColors: current?.defaultColors?.length ? current.defaultColors : DEFAULT_APPAREL_COLORS,
    }
  }
  return {
    sizingMode: 'letter',
    defaultSizes: ['S', 'M', 'L', 'XL'],
    cardAspectRatio: '3:4',
    allowCustomNote: true,
    allowMatchingNiqab: true,
    sizeGuideProfile: 'djellaba',
    showSizeFilter: true,
    minOrderQuantity: 1,
    defaultColors: current?.defaultColors?.length ? current.defaultColors : DEFAULT_APPAREL_COLORS,
  }
}

function categoryTokens(cat?: CategoryIdentityLike | null): string[] {
  if (!cat) return []
  return [cat.slug, cat.name, cat.nameAr, cat.nameFr, cat.nameEn]
    .filter(Boolean)
    .map((v) => String(v).trim().toLowerCase())
}

export function isNiqabIdentity(cat?: CategoryIdentityLike | null): boolean {
  const tokens = categoryTokens(cat)
  return tokens.some(
    (val) =>
      val === 'niqab' ||
      val === 'نقاب' ||
      val.includes('niqab') ||
      val.includes('niquab') ||
      val.includes('نقاب')
  )
}

export function isAbayaIdentity(cat?: CategoryIdentityLike | null): boolean {
  const tokens = categoryTokens(cat)
  return tokens.some(
    (val) =>
      val.includes('abaya') ||
      val.includes('عباء') ||
      val.includes('عباي') ||
      val.includes('kaftan') ||
      val.includes('caftan') ||
      val.includes('قفطان')
  )
}

export function isAccessoryIdentity(cat?: CategoryIdentityLike | null): boolean {
  const tokens = categoryTokens(cat)
  const keywords = [
    'glove',
    'gant',
    'قفاز',
    'كفوف',
    'sock',
    'chaussette',
    'جوارب',
    'accessori',
    'accessoire',
    'إكسسوار',
    'اكسسوار',
    'scarf',
    'khimar',
    'خمار',
    'شال',
    'perfume',
    'parfum',
    'عطر',
  ]
  return tokens.some((val) => keywords.some((kw) => val.includes(kw)))
}

export function getDefaultCategoryConfig(cat?: CategoryIdentityLike | null): CategoryConfig {
  if (isNiqabIdentity(cat)) {
    return {
      sizingMode: 'bundle_no_size',
      defaultSizes: [],
      cardAspectRatio: '1:1',
      allowCustomNote: false,
      minOrderQuantity: 5,
      maxOrderQuantity: null,
      allowMatchingNiqab: false,
      colorMode: 'multi',
      defaultColors: ['#000000', '#3B2316', '#F2E4CE'],
      unitNounAr: 'نقاب',
      unitNounFr: 'niqab',
      unitNounEn: 'niqab',
      unitPluralAr: 'نقابات',
      unitPluralFr: 'niqabs',
      unitPluralEn: 'niqabs',
      sizeGuideProfile: 'none',
      careNoteAr: '',
      careNoteFr: '',
      careNoteEn: '',
      showInHomeTabs: true,
      showInFooter: true,
      showSizeFilter: false,
    }
  }

  if (isAccessoryIdentity(cat)) {
    return {
      sizingMode: 'standard',
      defaultSizes: ['Standard'],
      cardAspectRatio: '1:1',
      allowCustomNote: false,
      minOrderQuantity: 1,
      maxOrderQuantity: null,
      allowMatchingNiqab: false,
      colorMode: 'multi',
      defaultColors: ['#000000'],
      unitNounAr: 'قطعة',
      unitNounFr: 'article',
      unitNounEn: 'item',
      unitPluralAr: 'قطع',
      unitPluralFr: 'articles',
      unitPluralEn: 'items',
      sizeGuideProfile: 'none',
      careNoteAr: '',
      careNoteFr: '',
      careNoteEn: '',
      showInHomeTabs: true,
      showInFooter: true,
      showSizeFilter: false,
    }
  }

  if (isAbayaIdentity(cat)) {
    return {
      sizingMode: 'numeric',
      defaultSizes: ['52', '54', '56', '58'],
      cardAspectRatio: '3:4',
      allowCustomNote: true,
      minOrderQuantity: 1,
      maxOrderQuantity: null,
      allowMatchingNiqab: true,
      colorMode: 'multi',
      defaultColors: ['#000000', '#3B2316', '#F2E4CE'],
      unitNounAr: 'عباءة',
      unitNounFr: 'abaya',
      unitNounEn: 'abaya',
      unitPluralAr: 'عباءات',
      unitPluralFr: 'abayas',
      unitPluralEn: 'abayas',
      sizeGuideProfile: 'abaya',
      careNoteAr: '',
      careNoteFr: '',
      careNoteEn: '',
      showInHomeTabs: true,
      showInFooter: true,
      showSizeFilter: true,
    }
  }

  const isDjellaba = categoryTokens(cat).some(
    (v) => v.includes('djellaba') || v.includes('jellaba') || v.includes('جلاب')
  )

  return {
    sizingMode: 'letter',
    defaultSizes: ['S', 'M', 'L', 'XL'],
    cardAspectRatio: '3:4',
    allowCustomNote: true,
    minOrderQuantity: 1,
    maxOrderQuantity: null,
    allowMatchingNiqab: true,
    colorMode: 'multi',
    defaultColors: DEFAULT_APPAREL_COLORS,
    unitNounAr: isDjellaba ? 'جلابة' : 'قطعة',
    unitNounFr: isDjellaba ? 'djellaba' : 'article',
    unitNounEn: isDjellaba ? 'djellaba' : 'item',
    unitPluralAr: isDjellaba ? 'جلابيات' : 'قطع',
    unitPluralFr: isDjellaba ? 'djellabas' : 'articles',
    unitPluralEn: isDjellaba ? 'djellabas' : 'items',
    sizeGuideProfile: isDjellaba || !cat ? 'djellaba' : 'djellaba',
    careNoteAr: '',
    careNoteFr: '',
    careNoteEn: '',
    showInHomeTabs: true,
    showInFooter: true,
    showSizeFilter: true,
  }
}

export function sanitizeCategoryConfig(
  raw: unknown,
  fallbackIdentity?: CategoryIdentityLike | null
): CategoryConfig {
  const base = getDefaultCategoryConfig(fallbackIdentity)
  if (!raw || typeof raw !== 'object') {
    return base
  }
  const input = raw as Record<string, unknown>

  const sizingMode: CategorySizingMode =
    input.sizingMode === 'letter' ||
    input.sizingMode === 'numeric' ||
    input.sizingMode === 'standard' ||
    input.sizingMode === 'bundle_no_size'
      ? input.sizingMode
      : base.sizingMode

  const sizeGuideProfile: SizeGuideProfile =
    input.sizeGuideProfile === 'djellaba' ||
    input.sizeGuideProfile === 'abaya' ||
    input.sizeGuideProfile === 'none'
      ? input.sizeGuideProfile
      : base.sizeGuideProfile

  const colorMode: CategoryColorMode =
    input.colorMode === 'multi' || input.colorMode === 'single'
      ? input.colorMode
      : base.colorMode

  const cardAspectRatio: CategoryCardAspectRatio =
    input.cardAspectRatio === '3:4' || input.cardAspectRatio === '1:1'
      ? input.cardAspectRatio
      : base.cardAspectRatio

  const defaultSizes = Array.isArray(input.defaultSizes)
    ? sortSizesCanonical(
        input.defaultSizes
          .map((s) => (typeof s === 'string' ? normalizeSizeToken(s) : ''))
          .filter(Boolean)
      )
    : sortSizesCanonical(base.defaultSizes)

  const defaultColors = Array.isArray(input.defaultColors)
    ? Array.from(
        new Set(
          input.defaultColors
            .map((c) => {
              if (typeof c !== 'string') return ''
              const trimmed = c.trim()
              if (!trimmed) return ''
              const normalized = (trimmed.startsWith('#') ? trimmed : `#${trimmed}`).toUpperCase()
              return /^#[0-9A-F]{3,8}$/.test(normalized) ? normalized : ''
            })
            .filter(Boolean)
        )
      )
    : base.defaultColors

  const rawMin = Number(input.minOrderQuantity)
  const minOrderQuantity =
    Number.isFinite(rawMin) && rawMin >= 1 ? Math.min(99, Math.floor(rawMin)) : base.minOrderQuantity

  let maxOrderQuantity: number | null = base.maxOrderQuantity
  if (input.maxOrderQuantity === null || input.maxOrderQuantity === '' || input.maxOrderQuantity === undefined) {
    maxOrderQuantity = null
  } else {
    const rawMax = Number(input.maxOrderQuantity)
    if (Number.isFinite(rawMax) && rawMax >= minOrderQuantity) {
      maxOrderQuantity = Math.min(999, Math.floor(rawMax))
    } else if (Number.isFinite(rawMax) && rawMax > 0) {
      maxOrderQuantity = minOrderQuantity
    }
  }

  const pickString = (val: unknown, fallback: string) =>
    typeof val === 'string' ? val.trim() : fallback

  const pickBool = (val: unknown, fallback: boolean) =>
    typeof val === 'boolean' ? val : fallback

  return {
    sizingMode,
    defaultSizes: sizingMode === 'bundle_no_size' ? [] : defaultSizes,
    cardAspectRatio,
    allowCustomNote: pickBool(input.allowCustomNote, base.allowCustomNote),
    minOrderQuantity,
    maxOrderQuantity,
    allowMatchingNiqab: pickBool(input.allowMatchingNiqab, base.allowMatchingNiqab),
    colorMode,
    defaultColors: defaultColors.length > 0 ? defaultColors : base.defaultColors,
    unitNounAr: pickString(input.unitNounAr, base.unitNounAr) || base.unitNounAr,
    unitNounFr: pickString(input.unitNounFr, base.unitNounFr) || base.unitNounFr,
    unitNounEn: pickString(input.unitNounEn, base.unitNounEn) || base.unitNounEn,
    unitPluralAr: pickString(input.unitPluralAr, base.unitPluralAr) || base.unitPluralAr,
    unitPluralFr: pickString(input.unitPluralFr, base.unitPluralFr) || base.unitPluralFr,
    unitPluralEn: pickString(input.unitPluralEn, base.unitPluralEn) || base.unitPluralEn,
    sizeGuideProfile,
    careNoteAr: pickString(input.careNoteAr, base.careNoteAr),
    careNoteFr: pickString(input.careNoteFr, base.careNoteFr),
    careNoteEn: pickString(input.careNoteEn, base.careNoteEn),
    showInHomeTabs: pickBool(input.showInHomeTabs, base.showInHomeTabs),
    showInFooter: pickBool(input.showInFooter, base.showInFooter),
    showSizeFilter: pickBool(input.showSizeFilter, base.showSizeFilter),
  }
}

export function getCategoryUnitLabels(
  config: CategoryConfig,
  locale: string
): { singular: string; plural: string } {
  if (locale === 'ar') {
    return { singular: config.unitNounAr || 'قطعة', plural: config.unitPluralAr || 'قطع' }
  }
  if (locale === 'fr') {
    return { singular: config.unitNounFr || 'article', plural: config.unitPluralFr || 'articles' }
  }
  return { singular: config.unitNounEn || 'item', plural: config.unitPluralEn || 'items' }
}

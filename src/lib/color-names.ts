export type ColorLocale = 'ar' | 'fr' | 'en'

export interface ColorTranslation {
  ar: string
  fr: string
  en: string
}

// ══════════════════════════════════════════════════════════════════════════════
// CENTRAL COLOR DICTIONARY (Standard store colors & variations)
// ══════════════════════════════════════════════════════════════════════════════
export const COLOR_DICTIONARY: Record<string, ColorTranslation> = {
  // ── Blacks & Dark Tones ─────────────────────────────────────────────────────
  '#000000': { ar: 'أسود', fr: 'Noir', en: 'Black' },
  '#000': { ar: 'أسود', fr: 'Noir', en: 'Black' },
  '#111111': { ar: 'أسود', fr: 'Noir', en: 'Black' },
  '#18181b': { ar: 'أسود فحمي', fr: 'Noir Charbon', en: 'Charcoal Black' },
  '#1a1a1a': { ar: 'أسود', fr: 'Noir', en: 'Black' },
  '#222222': { ar: 'أسود غامق', fr: 'Noir Profond', en: 'Deep Black' },
  '#27272a': { ar: 'فحمي داكن', fr: 'Anthracite', en: 'Anthracite' },
  '#333333': { ar: 'رمادي فحمي', fr: 'Gris Anthracite', en: 'Charcoal Grey' },

  // ── Whites & Off-Whites ─────────────────────────────────────────────────────
  '#ffffff': { ar: 'أبيض', fr: 'Blanc', en: 'White' },
  '#fff': { ar: 'أبيض', fr: 'Blanc', en: 'White' },
  '#fafafa': { ar: 'أبيض ناصع', fr: 'Blanc Pur', en: 'Pure White' },
  '#fdfdfd': { ar: 'أبيض', fr: 'Blanc', en: 'White' },
  '#f5f5f5': { ar: 'أبيض عاجي', fr: 'Blanc Cassé', en: 'Off-White' },
  '#fffff0': { ar: 'عاجي', fr: 'Ivoire', en: 'Ivory' },
  '#f8f9fa': { ar: 'أبيض فاتح', fr: 'Blanc Clair', en: 'Light White' },
  '#faf9f6': { ar: 'أبيض لؤلؤي', fr: 'Blanc Perle', en: 'Pearl White' },

  // ── Creams & Beiges ─────────────────────────────────────────────────────────
  '#f2e4ce': { ar: 'كريمي', fr: 'Crème', en: 'Cream' },
  '#f5e6d3': { ar: 'بيج', fr: 'Beige', en: 'Beige' },
  '#eed9c4': { ar: 'كريمي دافئ', fr: 'Crème Chaud', en: 'Warm Cream' },
  '#fffaf3': { ar: 'كريمي فاتح', fr: 'Crème Clair', en: 'Light Cream' },
  '#f5f5dc': { ar: 'بيج', fr: 'Beige', en: 'Beige' },
  '#e8dcc8': { ar: 'بيج رملي', fr: 'Beige Sable', en: 'Sand Beige' },
  '#fff8dc': { ar: 'بيج حريري', fr: 'Beige Soie', en: 'Silk Beige' },
  '#f7efe4': { ar: 'بيج ناعم', fr: 'Beige Doux', en: 'Soft Beige' },
  '#faf0e6': { ar: 'كتاني', fr: 'Lin', en: 'Linen' },
  '#ede6d6': { ar: 'بيج طبيعي', fr: 'Beige Naturel', en: 'Natural Beige' },
  '#e6d5b8': { ar: 'بيج مغربي', fr: 'Beige Marocain', en: 'Moroccan Beige' },
  '#d2b48c': { ar: 'بيج داكن', fr: 'Beige Foncé', en: 'Tan / Dark Beige' },

  // ── Terracotta, Rust & Warm Earth Tones ─────────────────────────────────────
  '#c4622d': { ar: 'تيراكوتا', fr: 'Terracotta', en: 'Terracotta' },
  '#d97b4a': { ar: 'تيراكوتا فاتح', fr: 'Terracotta Clair', en: 'Light Terracotta' },
  '#b97845': { ar: 'طوبي', fr: 'Brique', en: 'Brick' },
  '#cc5500': { ar: 'برتقالي محروق', fr: 'Orange Brûlé', en: 'Burnt Orange' },
  '#d35400': { ar: 'قرميدي', fr: 'Rouille', en: 'Rust' },
  '#e07a5f': { ar: 'مرجاني ترابي', fr: 'Corail Terracotta', en: 'Earthy Coral' },
  '#cd5c5c': { ar: 'أحمر قرميدي', fr: 'Rouge Brique', en: 'Indian Red' },
  '#b85d19': { ar: 'نحاسي', fr: 'Cuivré', en: 'Copper' },
  '#a84b1d': { ar: 'تيراكوتا داكن', fr: 'Terracotta Foncé', en: 'Dark Terracotta' },

  // ── Olive Greens, Emeralds & Forest Greens ──────────────────────────────────
  '#2d5a27': { ar: 'أخضر زيتوني', fr: 'Vert Olive', en: 'Olive Green' },
  '#1f4d2e': { ar: 'أخضر ملكي', fr: 'Vert Royal', en: 'Royal Green' },
  '#556b2f': { ar: 'زيتي داكن', fr: 'Olive Foncé', en: 'Dark Olive' },
  '#3b5323': { ar: 'أخضر جيشي', fr: 'Vert Kaki', en: 'Khaki Green' },
  '#4f7942': { ar: 'أخضر سرخسي', fr: 'Vert Fougère', en: 'Fern Green' },
  '#6b8e23': { ar: 'زيتي', fr: 'Olive', en: 'Olive' },
  '#3e6b38': { ar: 'أخضر عشبي', fr: 'Vert Herbe', en: 'Grass Green' },
  '#2e8b57': { ar: 'أخضر بحري داكن', fr: 'Vert Mer', en: 'Sea Green' },
  '#006400': { ar: 'أخضر داكن', fr: 'Vert Foncé', en: 'Dark Green' },
  '#355e3b': { ar: 'أخضر غابي', fr: 'Vert Forêt', en: 'Forest Green' },
  '#2e5a36': { ar: 'أخضر زمردي', fr: 'Vert Émeraude', en: 'Emerald Green' },
  '#00ff00': { ar: 'أخضر', fr: 'Vert', en: 'Green' },
  '#22c55e': { ar: 'أخضر زاهي', fr: 'Vert Vif', en: 'Bright Green' },
  '#16a34a': { ar: 'أخضر متوسط', fr: 'Vert Moyen', en: 'Medium Green' },
  '#10b981': { ar: 'زمردي فاتح', fr: 'Émeraude Clair', en: 'Emerald' },
  '#8fbc8f': { ar: 'ميرمية', fr: 'Sauge', en: 'Sage Green' },
  '#a3c1ad': { ar: 'أخضر فستقي', fr: 'Pistache', en: 'Pistachio' },
  '#008080': { ar: 'بترولي', fr: 'Bleu Canard', en: 'Teal' },
  '#005f73': { ar: 'أخضر بترولي داكن', fr: 'Pétrole Foncé', en: 'Dark Teal' },

  // ── Blues & Navies ──────────────────────────────────────────────────────────
  '#1b2b4b': { ar: 'أزرق داكن', fr: 'Bleu Marine', en: 'Navy Blue' },
  '#1e3a5f': { ar: 'كحلي', fr: 'Bleu Nuit', en: 'Midnight Blue' },
  '#000080': { ar: 'كحلي كلاسيكي', fr: 'Marine', en: 'Navy' },
  '#0f172a': { ar: 'كحلي فحمي', fr: 'Marine Profond', en: 'Deep Navy' },
  '#1e293b': { ar: 'أزرق رمادي داكن', fr: 'Bleu Ardoise', en: 'Slate Navy' },
  '#4169e1': { ar: 'أزرق ملكي', fr: 'Bleu Royal', en: 'Royal Blue' },
  '#2563eb': { ar: 'أزرق نيلي', fr: 'Bleu Indigo', en: 'Indigo Blue' },
  '#1d4ed8': { ar: 'أزرق غامق', fr: 'Bleu Foncé', en: 'Dark Blue' },
  '#0000ff': { ar: 'أزرق', fr: 'Bleu', en: 'Blue' },
  '#2c3e50': { ar: 'أزرق بترولي', fr: 'Bleu Pétrole', en: 'Petrol Blue' },
  '#0284c7': { ar: 'أزرق سماوي داكن', fr: 'Bleu Ciel Foncé', en: 'Deep Sky Blue' },
  '#4682b4': { ar: 'أزرق صلب', fr: 'Bleu Acier', en: 'Steel Blue' },
  '#87ceeb': { ar: 'أزرق سماوي', fr: 'Bleu Ciel', en: 'Sky Blue' },
  '#add8e6': { ar: 'أزرق فاتح', fr: 'Bleu Clair', en: 'Light Blue' },

  // ── Burgundies, Dark Reds & Bordeau ─────────────────────────────────────────
  '#8b1a1a': { ar: 'خمري', fr: 'Bordeaux', en: 'Burgundy' },
  '#800000': { ar: 'عنابي', fr: 'Marron Rouge', en: 'Maroon' },
  '#800020': { ar: 'بورغندي', fr: 'Bourgogne', en: 'Burgundy' },
  '#4a0e17': { ar: 'خمري داكن', fr: 'Bordeaux Foncé', en: 'Dark Burgundy' },
  '#58111a': { ar: 'دم الغزال', fr: 'Rouge Sang', en: 'Deep Crimson' },
  '#722f37': { ar: 'نبيذي', fr: 'Lie de Vin', en: 'Wine' },
  '#8b0000': { ar: 'أحمر داكن', fr: 'Rouge Sombre', en: 'Dark Red' },
  '#990000': { ar: 'أحمر قاني', fr: 'Rouge Profond', en: 'Deep Red' },
  '#ff0000': { ar: 'أحمر', fr: 'Rouge', en: 'Red' },
  '#dc143c': { ar: 'أحمر ياقوتي', fr: 'Cramoisi', en: 'Crimson' },
  '#b22222': { ar: 'أحمر ناري', fr: 'Rouge Brique', en: 'Firebrick' },
  '#e63946': { ar: 'أحمر وردي', fr: 'Rouge Cerise', en: 'Cherry Red' },

  // ── Browns, Choco & Camels ──────────────────────────────────────────────────
  '#964b00': { ar: 'بني', fr: 'Marron', en: 'Brown' },
  '#6b4226': { ar: 'بني شوكولاتة', fr: 'Marron Chocolat', en: 'Chocolate Brown' },
  '#8b4513': { ar: 'بني سرجي', fr: 'Marron Selle', en: 'Saddle Brown' },
  '#5c4033': { ar: 'بني داكن', fr: 'Marron Foncé', en: 'Dark Brown' },
  '#3d1f0a': { ar: 'بني مغربي أصيل', fr: 'Brun Marocain', en: 'Deep Moroccan Brown' },
  '#6b3a2a': { ar: 'بني قرميدي', fr: 'Brun Cuivré', en: 'Warm Brown' },
  '#4a2619': { ar: 'بني محروق', fr: 'Brun Brûlé', en: 'Burnt Brown' },
  '#7a5a40': { ar: 'بني متوسط', fr: 'Brun Moyen', en: 'Medium Brown' },
  '#a0522d': { ar: 'بني سيينا', fr: 'Sienne', en: 'Sienna Brown' },
  '#8b5a2b': { ar: 'بني كستنائي', fr: 'Châtaigne', en: 'Chestnut' },
  '#c19a6b': { ar: 'جملي', fr: 'Camel', en: 'Camel' },
  '#b07946': { ar: 'جملي داكن', fr: 'Camel Foncé', en: 'Dark Camel' },
  '#d2691e': { ar: 'كراميل', fr: 'Caramel', en: 'Caramel' },

  // ── Golds, Mustards & Yellows ───────────────────────────────────────────────
  '#b8965a': { ar: 'ذهبي', fr: 'Doré', en: 'Gold' },
  '#d4ae78': { ar: 'ذهبي فاتح', fr: 'Doré Clair', en: 'Light Gold' },
  '#e4c48e': { ar: 'ذهبي شاحب', fr: 'Doré Pâle', en: 'Pale Gold' },
  '#daa520': { ar: 'ذهبي كلاسيكي', fr: 'Or Doré', en: 'Goldenrod' },
  '#b8860b': { ar: 'ذهبي داكن', fr: 'Or Foncé', en: 'Dark Goldenrod' },
  '#d4af37': { ar: 'ذهب عيار', fr: 'Or Pur', en: 'Metallic Gold' },
  '#ffd700': { ar: 'أصفر ذهبي', fr: 'Jaune Or', en: 'Gold Yellow' },
  '#f59e0b': { ar: 'عنبري', fr: 'Ambre', en: 'Amber' },
  '#d97706': { ar: 'خردلي', fr: 'Moutarde', en: 'Mustard' },
  '#ffff00': { ar: 'أصفر', fr: 'Jaune', en: 'Yellow' },

  // ── Pinks, Dusty Rose & Mauves ──────────────────────────────────────────────
  '#dda0dd': { ar: 'وردي بنفسجي', fr: 'Prune Clair', en: 'Plum Pink' },
  '#bc8f8f': { ar: 'وردي مغبر', fr: 'Vieux Rose', en: 'Dusty Rose' },
  '#d8bfd8': { ar: 'وردي ناعم', fr: 'Chardon', en: 'Thistle' },
  '#c08081': { ar: 'وردي ترابي', fr: 'Rose Terreux', en: 'Earthy Pink' },
  '#db7093': { ar: 'زهري داكن', fr: 'Rose Foncé', en: 'Pale Violet Red' },
  '#c71585': { ar: 'فوشيا ملكي', fr: 'Fuchsia', en: 'Royal Fuchsia' },
  '#e8c5c8': { ar: 'زهري فاتح', fr: 'Rose Pâle', en: 'Pale Pink' },
  '#d4a5a5': { ar: 'وردي عتيق', fr: 'Rose Vintage', en: 'Vintage Pink' },
  '#ffc0cb': { ar: 'وردي', fr: 'Rose', en: 'Pink' },
  '#e0b0ff': { ar: 'موف', fr: 'Mauve', en: 'Mauve' },

  // ── Purples, Violets & Plums ────────────────────────────────────────────────
  '#4b0082': { ar: 'بنفسجي داكن', fr: 'Indigo', en: 'Indigo Purple' },
  '#483d8b': { ar: 'بنفسجي رمادي', fr: 'Ardoise Foncé', en: 'Dark Slate Purple' },
  '#800080': { ar: 'بنفسجي', fr: 'Violet', en: 'Purple' },
  '#8a2be2': { ar: 'أرجواني', fr: 'Pourpre', en: 'Blue Violet' },
  '#9370db': { ar: 'بنفسجي فاتح', fr: 'Violet Clair', en: 'Medium Purple' },
  '#301934': { ar: 'باذنجاني داكن', fr: 'Aubergine', en: 'Eggplant / Aubergine' },
  '#36013f': { ar: 'باذنجاني ملكي', fr: 'Aubergine Royale', en: 'Royal Aubergine' },
  '#5d3954': { ar: 'خوخي داكن', fr: 'Prune Foncé', en: 'Dark Plum' },

  // ── Greys & Silvers ─────────────────────────────────────────────────────────
  '#808080': { ar: 'رمادي', fr: 'Gris', en: 'Grey' },
  '#71717a': { ar: 'رمادي متوسط', fr: 'Gris Moyen', en: 'Medium Grey' },
  '#a1a1aa': { ar: 'رمادي فضي', fr: 'Gris Argenté', en: 'Silver Grey' },
  '#d4d4d8': { ar: 'رمادي فاتح', fr: 'Gris Clair', en: 'Light Grey' },
  '#e4e4e7': { ar: 'فضي فاتح', fr: 'Argent Clair', en: 'Bright Silver' },
  '#52525b': { ar: 'رمادي داكن', fr: 'Gris Foncé', en: 'Dark Grey' },
  '#3f3f46': { ar: 'رصاصي', fr: 'Plomb', en: 'Slate Grey' },
  '#c0c0c0': { ar: 'فضي', fr: 'Argent', en: 'Silver' },
}

// ══════════════════════════════════════════════════════════════════════════════
// HEX NORMALIZATION & COLOR DISTANCE MATCHING
// ══════════════════════════════════════════════════════════════════════════════

/** Normalize 3-digit or 6-digit hex string to standard lowercase #rrggbb format */
export function normalizeHex(hex: string): string | null {
  if (!hex || typeof hex !== 'string') return null
  const cleaned = hex.trim().replace(/^#/, '').toLowerCase()

  if (/^[0-9a-f]{6}$/i.test(cleaned)) {
    return `#${cleaned}`
  }
  if (/^[0-9a-f]{3}$/i.test(cleaned)) {
    return `#${cleaned[0]}${cleaned[0]}${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}`
  }
  if (/^[0-9a-f]{8}$/i.test(cleaned)) {
    return `#${cleaned.slice(0, 6)}`
  }
  return null
}

function hexToRgb(hex: string): [number, number, number] | null {
  const norm = normalizeHex(hex)
  if (!norm) return null
  const num = parseInt(norm.slice(1), 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const dr = rgb1[0] - rgb2[0]
  const dg = rgb1[1] - rgb2[1]
  const db = rgb1[2] - rgb2[2]
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

/**
 * Finds the closest matching color translation from the dictionary.
 * If distance is within threshold (<= 45 in RGB Euclidean space), returns the matched name.
 * Otherwise returns the hex fallback.
 */
function findClosestColor(hex: string, locale: ColorLocale): string {
  const norm = normalizeHex(hex)
  if (!norm) return hex

  // 1. Direct exact lookup
  if (COLOR_DICTIONARY[norm]) {
    return COLOR_DICTIONARY[norm][locale]
  }

  // 2. Proximity lookup within tolerance
  const targetRgb = hexToRgb(norm)
  if (!targetRgb) return norm

  let closestHex: string | null = null
  let minDistance = Infinity

  for (const dictHex of Object.keys(COLOR_DICTIONARY)) {
    const dictRgb = hexToRgb(dictHex)
    if (!dictRgb) continue
    const dist = colorDistance(targetRgb, dictRgb)
    if (dist < minDistance) {
      minDistance = dist
      closestHex = dictHex
    }
  }

  // Tolerance threshold: distance <= 45 matches visually close shades
  if (closestHex && minDistance <= 45) {
    return COLOR_DICTIONARY[closestHex][locale]
  }

  // Fallback to original uppercase hex if totally unknown
  return norm.toUpperCase()
}

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC APIS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Returns the localized name for a given color hex code (e.g. '#F5E6D3' -> 'بيج')
 */
export function getColorName(code: string, locale: ColorLocale = 'ar'): string {
  if (!code || typeof code !== 'string') return ''
  const trimmed = code.trim()
  if (!trimmed) return ''

  // If it's a HEX code:
  if (/^#?[0-9a-f]{3,8}$/i.test(trimmed)) {
    return findClosestColor(trimmed, locale)
  }

  // If already a named string, return it
  return trimmed
}

/**
 * Returns Arabic, French, and English names for a given hex code
 */
export function getColorNames(code: string): ColorTranslation {
  return {
    ar: getColorName(code, 'ar'),
    fr: getColorName(code, 'fr'),
    en: getColorName(code, 'en'),
  }
}

/**
 * Resolves color name and hex code from any snapshot/order color representation.
 * - Extracts saved Arabic name if valid and not a raw hex code.
 * - Otherwise translates the hex code using the central color dictionary.
 * - Guarantees an Arabic name for all store colors with the exact HEX preserved for the color dot.
 */
export function resolveOrderColor(value: unknown, targetLocale: ColorLocale = 'ar'): { name: string; code: string } {
  if (!value) return { name: '', code: '' }

  let code = ''
  let savedName = ''

  if (typeof value === 'object' && value !== null) {
    const obj = value as {
      code?: string
      colorCode?: string
      nameAr?: string
      nameFr?: string
      nameEn?: string
      name?: string
      label?: string
    }

    code = (obj.code || obj.colorCode || '').trim()

    // Extract saved localized name based on target locale, with Arabic priority
    if (targetLocale === 'ar') {
      savedName = (obj.nameAr || obj.name || obj.label || '').trim()
    } else if (targetLocale === 'fr') {
      savedName = (obj.nameFr || obj.name || obj.label || '').trim()
    } else {
      savedName = (obj.nameEn || obj.name || obj.label || '').trim()
    }

    // If preferred locale is missing, fall back to any available name
    if (!savedName) {
      savedName = (obj.nameAr || obj.nameFr || obj.nameEn || obj.name || '').trim()
    }
  } else if (typeof value === 'string') {
    const trimmed = value.trim()
    if (/^#?[0-9a-f]{3,8}$/i.test(trimmed)) {
      code = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
    } else {
      savedName = trimmed
    }
  }

  // Check if savedName is just a raw hex code or empty or generic placeholder
  const isHexName = /^#?[0-9a-f]{3,8}$/i.test(savedName)
  const isGeneric = ['color', 'couleur', 'لون', 'undefined', 'null'].includes(savedName.toLowerCase())

  if (savedName && !isHexName && !isGeneric) {
    // If the saved name was non-Arabic (e.g. French 'Terracotta' or English 'Cream') and target is 'ar',
    // check if it matches a known English/French name in dictionary to translate it to Arabic
    if (targetLocale === 'ar' && !/[\u0600-\u06FF]/.test(savedName)) {
      const lowerName = savedName.toLowerCase()
      for (const trans of Object.values(COLOR_DICTIONARY)) {
        if (trans.fr.toLowerCase() === lowerName || trans.en.toLowerCase() === lowerName) {
          return { name: trans.ar, code: normalizeHex(code) || code }
        }
      }
    }
    return { name: savedName, code: normalizeHex(code) || code }
  }

  // If savedName was empty or a raw hex, resolve using the central dictionary
  if (code) {
    const resolvedName = getColorName(code, targetLocale)
    return { name: resolvedName, code: normalizeHex(code) || code }
  }

  return { name: '', code: '' }
}

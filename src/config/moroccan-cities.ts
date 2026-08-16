// ============================================================
// MOROCCAN CITIES – Complete list by official region (2024)
// ============================================================

/**
 * Default shipping price in MAD used for any city without a custom price.
 * This is the single source of truth — never hardcode 35 elsewhere.
 */
export const DEFAULT_SHIPPING_PRICE = 35

export interface MoroccanCity {
  value: string
  ar: string
  fr: string
  en: string
  regionId: string
  shipping?: number
}

export const MOROCCAN_CITIES: MoroccanCity[] = [
  // ── جهة طنجة - تطوان - الحسيمة ──────────────────────────
  { value: 'tangier', ar: 'طنجة', fr: 'Tanger', en: 'Tangier', regionId: 'tth' },
  { value: 'tetouan', ar: 'تطوان', fr: 'Tétouan', en: 'Tetouan', regionId: 'tth' },
  { value: 'al-hoceima', ar: 'الحسيمة', fr: 'Al Hoceïma', en: 'Al Hoceima', regionId: 'tth' },
  { value: 'chefchaouen', ar: 'شفشاون', fr: 'Chefchaouen', en: 'Chefchaouen', regionId: 'tth' },
  { value: 'larache', ar: 'العرائش', fr: 'Larache', en: 'Larache', regionId: 'tth' },
  { value: 'ouazzane', ar: 'وزان', fr: 'Ouazzane', en: 'Ouazzane', regionId: 'tth' },
  { value: 'fnideq', ar: 'الفنيدق', fr: 'Fnideq', en: 'Fnideq', regionId: 'tth' },
  { value: 'mdiq', ar: 'المضيق', fr: "M'diq", en: 'Mdiq', regionId: 'tth' },
  { value: 'ksar-el-kebir', ar: 'القصر الكبير', fr: 'Ksar El Kébir', en: 'Ksar El Kebir', regionId: 'tth' },
  { value: 'asilah', ar: 'أصيلة', fr: 'Asilah', en: 'Asilah', regionId: 'tth' },

  // ── جهة الشرق ────────────────────────────────────────────
  { value: 'oujda', ar: 'وجدة', fr: 'Oujda', en: 'Oujda', regionId: 'oriental' },
  { value: 'nador', ar: 'الناظور', fr: 'Nador', en: 'Nador', regionId: 'oriental' },
  { value: 'berkane', ar: 'بركان', fr: 'Berkane', en: 'Berkane', regionId: 'oriental' },
  { value: 'taourirt', ar: 'تاوريرت', fr: 'Taourirt', en: 'Taourirt', regionId: 'oriental' },
  { value: 'jerada', ar: 'جرادة', fr: 'Jerada', en: 'Jerada', regionId: 'oriental' },
  { value: 'driouch', ar: 'دريوش', fr: 'Driouch', en: 'Driouch', regionId: 'oriental' },
  { value: 'figuig', ar: 'فكيك', fr: 'Figuig', en: 'Figuig', regionId: 'oriental' },
  { value: 'guercif', ar: 'كرسيف', fr: 'Guercif', en: 'Guercif', regionId: 'oriental' },

  // ── جهة فاس - مكناس ──────────────────────────────────────
  { value: 'fes', ar: 'فاس', fr: 'Fès', en: 'Fez', regionId: 'fm' },
  { value: 'meknes', ar: 'مكناس', fr: 'Meknès', en: 'Meknes', regionId: 'fm' },
  { value: 'ifrane', ar: 'إفران', fr: 'Ifrane', en: 'Ifrane', regionId: 'fm' },
  { value: 'sefrou', ar: 'صفرو', fr: 'Sefrou', en: 'Sefrou', regionId: 'fm' },
  { value: 'taounate', ar: 'تاونات', fr: 'Taounate', en: 'Taounate', regionId: 'fm' },
  { value: 'taza', ar: 'تازة', fr: 'Taza', en: 'Taza', regionId: 'fm' },
  { value: 'el-hajeb', ar: 'الحاجب', fr: 'El Hajeb', en: 'El Hajeb', regionId: 'fm' },
  { value: 'boulemane', ar: 'بولمان', fr: 'Boulemane', en: 'Boulemane', regionId: 'fm' },
  { value: 'moulay-yacoub', ar: 'مولاي يعقوب', fr: 'Moulay Yacoub', en: 'Moulay Yacoub', regionId: 'fm' },

  // ── جهة الرباط - سلا - القنيطرة ──────────────────────────
  { value: 'rabat', ar: 'الرباط', fr: 'Rabat', en: 'Rabat', regionId: 'rsk' },
  { value: 'sale', ar: 'سلا', fr: 'Salé', en: 'Salé', regionId: 'rsk' },
  { value: 'kenitra', ar: 'القنيطرة', fr: 'Kénitra', en: 'Kenitra', regionId: 'rsk' },
  { value: 'temara', ar: 'تمارة', fr: 'Témara', en: 'Temara', regionId: 'rsk' },
  { value: 'khemisset', ar: 'الخميسات', fr: 'Khémisset', en: 'Khemisset', regionId: 'rsk' },
  { value: 'sidi-kacem', ar: 'سيدي قاسم', fr: 'Sidi Kacem', en: 'Sidi Kacem', regionId: 'rsk' },
  { value: 'sidi-slimane', ar: 'سيدي سليمان', fr: 'Sidi Slimane', en: 'Sidi Slimane', regionId: 'rsk' },
  { value: 'skhirat', ar: 'الصخيرات', fr: 'Skhirat', en: 'Skhirat', regionId: 'rsk' },

  // ── جهة بني ملال - خنيفرة ────────────────────────────────
  { value: 'beni-mellal', ar: 'بني ملال', fr: 'Béni Mellal', en: 'Beni Mellal', regionId: 'bk' },
  { value: 'khenifra', ar: 'خنيفرة', fr: 'Khénifra', en: 'Khenifra', regionId: 'bk' },
  { value: 'khouribga', ar: 'خريبكة', fr: 'Khouribga', en: 'Khouribga', regionId: 'bk' },
  { value: 'azilal', ar: 'أزيلال', fr: 'Azilal', en: 'Azilal', regionId: 'bk' },
  { value: 'fqih-ben-salah', ar: 'الفقيه بن صالح', fr: 'Fquih Ben Salah', en: 'Fquih Ben Salah', regionId: 'bk' },

  // ── جهة الدار البيضاء - سطات ──────────────────────────────
  { value: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca', en: 'Casablanca', regionId: 'cs' },
  { value: 'mohammedia', ar: 'المحمدية', fr: 'Mohammédia', en: 'Mohammedia', regionId: 'cs' },
  { value: 'berrechid', ar: 'برشيد', fr: 'Berrechid', en: 'Berrechid', regionId: 'cs' },
  { value: 'settat', ar: 'سطات', fr: 'Settat', en: 'Settat', regionId: 'cs' },
  { value: 'benslimane', ar: 'بنسليمان', fr: 'Benslimane', en: 'Benslimane', regionId: 'cs' },
  { value: 'mediouna', ar: 'مديونة', fr: 'Médiouna', en: 'Mediouna', regionId: 'cs' },
  { value: 'el-jadida', ar: 'الجديدة', fr: 'El Jadida', en: 'El Jadida', regionId: 'cs' },
  { value: 'sidi-bennour', ar: 'سيدي بنور', fr: 'Sidi Bennour', en: 'Sidi Bennour', regionId: 'cs' },
  { value: 'ben-guerir', ar: 'بن كرير', fr: 'Ben Guerir', en: 'Ben Guerir', regionId: 'cs' },

  // ── جهة مراكش - آسفي ──────────────────────────────────────
  { value: 'marrakech', ar: 'مراكش', fr: 'Marrakech', en: 'Marrakech', regionId: 'ms' },
  { value: 'safi', ar: 'آسفي', fr: 'Safi', en: 'Safi', regionId: 'ms' },
  { value: 'essaouira', ar: 'الصويرة', fr: 'Essaouira', en: 'Essaouira', regionId: 'ms' },
  { value: 'el-kelaa-des-sraghna', ar: 'قلعة السراغنة', fr: 'El Kelaâ des Sraghna', en: 'El Kelaa des Sraghna', regionId: 'ms' },
  { value: 'chichaoua', ar: 'شيشاوة', fr: 'Chichaoua', en: 'Chichaoua', regionId: 'ms' },
  { value: 'youssoufia', ar: 'اليوسفية', fr: 'Youssoufia', en: 'Youssoufia', regionId: 'ms' },
  { value: 'rehamna', ar: 'الرحامنة', fr: 'Rehamna', en: 'Rehamna', regionId: 'ms' },
  { value: 'al-haouz', ar: 'الحوز', fr: 'Al Haouz', en: 'Al Haouz', regionId: 'ms' },

  // ── جهة درعة - تافيلالت ────────────────────────────────────
  { value: 'errachidia', ar: 'الرشيدية', fr: 'Errachidia', en: 'Errachidia', regionId: 'dt' },
  { value: 'ouarzazate', ar: 'ورزازات', fr: 'Ouarzazate', en: 'Ouarzazate', regionId: 'dt' },
  { value: 'midelt', ar: 'ميدلت', fr: 'Midelt', en: 'Midelt', regionId: 'dt' },
  { value: 'zagora', ar: 'زاكورة', fr: 'Zagora', en: 'Zagora', regionId: 'dt' },
  { value: 'tinghir', ar: 'تنغير', fr: 'Tinghir', en: 'Tinghir', regionId: 'dt' },

  // ── جهة سوس - ماسة ─────────────────────────────────────────
  { value: 'agadir', ar: 'أكادير', fr: 'Agadir', en: 'Agadir', regionId: 'sm' },
  { value: 'inzegane', ar: 'إنزكان', fr: 'Inezgane', en: 'Inezgane', regionId: 'sm' },
  { value: 'ait-melloul', ar: 'آيت ملول', fr: 'Aït Melloul', en: 'Ait Melloul', regionId: 'sm' },
  { value: 'taroudant', ar: 'تارودانت', fr: 'Taroudant', en: 'Taroudant', regionId: 'sm' },
  { value: 'tiznit', ar: 'تيزنيت', fr: 'Tiznit', en: 'Tiznit', regionId: 'sm' },
  { value: 'biougra', ar: 'بيوكرى', fr: 'Biougra', en: 'Biougra', regionId: 'sm' },
  { value: 'oulad-teima', ar: 'أولاد تايمة', fr: 'Oulad Teima', en: 'Oulad Teima', regionId: 'sm' },
  { value: 'tafraout', ar: 'تافراوت', fr: 'Tafraoute', en: 'Tafraoute', regionId: 'sm' },
  { value: 'chtouka-ait-baha', ar: 'شتوكة آيت باها', fr: 'Chtouka-Aït Baha', en: 'Chtouka-Ait Baha', regionId: 'sm' },

  // ── جهة كلميم - واد نون ────────────────────────────────────
  { value: 'guelmim', ar: 'كلميم', fr: 'Guelmim', en: 'Guelmim', regionId: 'gon' },
  { value: 'sidi-ifni', ar: 'سيدي إفني', fr: 'Sidi Ifni', en: 'Sidi Ifni', regionId: 'gon' },
  { value: 'tan-tan', ar: 'طانطان', fr: 'Tan-Tan', en: 'Tan-Tan', regionId: 'gon' },
  { value: 'assa-zag', ar: 'آسا الزاك', fr: 'Assa-Zag', en: 'Assa-Zag', regionId: 'gon' },

  // ── جهة العيون - الساقية الحمراء ───────────────────────────
  { value: 'laayoune', ar: 'العيون', fr: 'Laâyoune', en: 'Laayoune', regionId: 'lsh' },
  { value: 'smara', ar: 'السمارة', fr: 'Smara', en: 'Smara', regionId: 'lsh' },
  { value: 'tarfaya', ar: 'طرفاية', fr: 'Tarfaya', en: 'Tarfaya', regionId: 'lsh' },
  { value: 'boujdour', ar: 'بوجدور', fr: 'Boujdour', en: 'Boujdour', regionId: 'lsh' },

  // ── جهة الداخلة - وادي الذهب ────────────────────────────────
  { value: 'dakhla', ar: 'الداخلة', fr: 'Dakhla', en: 'Dakhla', regionId: 'dod' },
  { value: 'aousserd', ar: 'أوسرد', fr: 'Aousserd', en: 'Aousserd', regionId: 'dod' },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Client-side static fallback: returns DEFAULT_SHIPPING_PRICE for any city.
 * For server-side order creation, always use the DB lookup via the API.
 */
export function getShippingCost(_cityValue: string): number {
  return DEFAULT_SHIPPING_PRICE
}

/**
 * Returns all cities belonging to a given region ID.
 */
export function getCitiesByRegion(regionId: string): MoroccanCity[] {
  return MOROCCAN_CITIES.filter((c) => c.regionId === regionId)
}

/**
 * Returns the city object for a given city value, or undefined if not found.
 */
export function getCityByValue(cityValue: string): MoroccanCity | undefined {
  return MOROCCAN_CITIES.find((c) => c.value === cityValue)
}

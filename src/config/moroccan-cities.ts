// ============================================================
// MOROCCAN CITIES – Complete list by official region (2024)
// ============================================================

export interface MoroccanCity {
  value: string
  ar: string
  fr: string
  en: string
  regionId: string
  shipping: number
}

export const MOROCCAN_CITIES: MoroccanCity[] = [
  // ── جهة طنجة - تطوان - الحسيمة ──────────────────────────
  { value: 'tangier', ar: 'طنجة', fr: 'Tanger', en: 'Tangier', regionId: 'tth', shipping: 35 },
  { value: 'tetouan', ar: 'تطوان', fr: 'Tétouan', en: 'Tetouan', regionId: 'tth', shipping: 35 },
  { value: 'al-hoceima', ar: 'الحسيمة', fr: 'Al Hoceïma', en: 'Al Hoceima', regionId: 'tth', shipping: 35 },
  { value: 'chefchaouen', ar: 'شفشاون', fr: 'Chefchaouen', en: 'Chefchaouen', regionId: 'tth', shipping: 35 },
  { value: 'larache', ar: 'العرائش', fr: 'Larache', en: 'Larache', regionId: 'tth', shipping: 35 },
  { value: 'ouazzane', ar: 'وزان', fr: 'Ouazzane', en: 'Ouazzane', regionId: 'tth', shipping: 35 },
  { value: 'fnideq', ar: 'الفنيدق', fr: 'Fnideq', en: 'Fnideq', regionId: 'tth', shipping: 35 },
  { value: 'mdiq', ar: 'المضيق', fr: "M'diq", en: 'Mdiq', regionId: 'tth', shipping: 35 },
  { value: 'ksar-el-kebir', ar: 'القصر الكبير', fr: 'Ksar El Kébir', en: 'Ksar El Kebir', regionId: 'tth', shipping: 35 },
  { value: 'asilah', ar: 'أصيلة', fr: 'Asilah', en: 'Asilah', regionId: 'tth', shipping: 35 },

  // ── جهة الشرق ────────────────────────────────────────────
  { value: 'oujda', ar: 'وجدة', fr: 'Oujda', en: 'Oujda', regionId: 'oriental', shipping: 35 },
  { value: 'nador', ar: 'الناظور', fr: 'Nador', en: 'Nador', regionId: 'oriental', shipping: 35 },
  { value: 'berkane', ar: 'بركان', fr: 'Berkane', en: 'Berkane', regionId: 'oriental', shipping: 35 },
  { value: 'taourirt', ar: 'تاوريرت', fr: 'Taourirt', en: 'Taourirt', regionId: 'oriental', shipping: 35 },
  { value: 'jerada', ar: 'جرادة', fr: 'Jerada', en: 'Jerada', regionId: 'oriental', shipping: 35 },
  { value: 'driouch', ar: 'دريوش', fr: 'Driouch', en: 'Driouch', regionId: 'oriental', shipping: 35 },
  { value: 'figuig', ar: 'فكيك', fr: 'Figuig', en: 'Figuig', regionId: 'oriental', shipping: 35 },
  { value: 'guercif', ar: 'كرسيف', fr: 'Guercif', en: 'Guercif', regionId: 'oriental', shipping: 35 },

  // ── جهة فاس - مكناس ──────────────────────────────────────
  { value: 'fes', ar: 'فاس', fr: 'Fès', en: 'Fez', regionId: 'fm', shipping: 35 },
  { value: 'meknes', ar: 'مكناس', fr: 'Meknès', en: 'Meknes', regionId: 'fm', shipping: 35 },
  { value: 'ifrane', ar: 'إفران', fr: 'Ifrane', en: 'Ifrane', regionId: 'fm', shipping: 35 },
  { value: 'sefrou', ar: 'صفرو', fr: 'Sefrou', en: 'Sefrou', regionId: 'fm', shipping: 35 },
  { value: 'taounate', ar: 'تاونات', fr: 'Taounate', en: 'Taounate', regionId: 'fm', shipping: 35 },
  { value: 'taza', ar: 'تازة', fr: 'Taza', en: 'Taza', regionId: 'fm', shipping: 35 },
  { value: 'el-hajeb', ar: 'الحاجب', fr: 'El Hajeb', en: 'El Hajeb', regionId: 'fm', shipping: 35 },
  { value: 'boulemane', ar: 'بولمان', fr: 'Boulemane', en: 'Boulemane', regionId: 'fm', shipping: 35 },
  { value: 'moulay-yacoub', ar: 'مولاي يعقوب', fr: 'Moulay Yacoub', en: 'Moulay Yacoub', regionId: 'fm', shipping: 35 },

  // ── جهة الرباط - سلا - القنيطرة ──────────────────────────
  { value: 'rabat', ar: 'الرباط', fr: 'Rabat', en: 'Rabat', regionId: 'rsk', shipping: 35 },
  { value: 'sale', ar: 'سلا', fr: 'Salé', en: 'Salé', regionId: 'rsk', shipping: 35 },
  { value: 'kenitra', ar: 'القنيطرة', fr: 'Kénitra', en: 'Kenitra', regionId: 'rsk', shipping: 35 },
  { value: 'temara', ar: 'تمارة', fr: 'Témara', en: 'Temara', regionId: 'rsk', shipping: 35 },
  { value: 'khemisset', ar: 'الخميسات', fr: 'Khémisset', en: 'Khemisset', regionId: 'rsk', shipping: 35 },
  { value: 'sidi-kacem', ar: 'سيدي قاسم', fr: 'Sidi Kacem', en: 'Sidi Kacem', regionId: 'rsk', shipping: 35 },
  { value: 'sidi-slimane', ar: 'سيدي سليمان', fr: 'Sidi Slimane', en: 'Sidi Slimane', regionId: 'rsk', shipping: 35 },
  { value: 'skhirat', ar: 'الصخيرات', fr: 'Skhirat', en: 'Skhirat', regionId: 'rsk', shipping: 35 },

  // ── جهة بني ملال - خنيفرة ────────────────────────────────
  { value: 'beni-mellal', ar: 'بني ملال', fr: 'Béni Mellal', en: 'Beni Mellal', regionId: 'bk', shipping: 35 },
  { value: 'khenifra', ar: 'خنيفرة', fr: 'Khénifra', en: 'Khenifra', regionId: 'bk', shipping: 35 },
  { value: 'khouribga', ar: 'خريبكة', fr: 'Khouribga', en: 'Khouribga', regionId: 'bk', shipping: 35 },
  { value: 'azilal', ar: 'أزيلال', fr: 'Azilal', en: 'Azilal', regionId: 'bk', shipping: 35 },
  { value: 'fqih-ben-salah', ar: 'الفقيه بن صالح', fr: 'Fquih Ben Salah', en: 'Fquih Ben Salah', regionId: 'bk', shipping: 35 },

  // ── جهة الدار البيضاء - سطات ──────────────────────────────
  { value: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca', en: 'Casablanca', regionId: 'cs', shipping: 35 },
  { value: 'mohammedia', ar: 'المحمدية', fr: 'Mohammédia', en: 'Mohammedia', regionId: 'cs', shipping: 35 },
  { value: 'berrechid', ar: 'برشيد', fr: 'Berrechid', en: 'Berrechid', regionId: 'cs', shipping: 35 },
  { value: 'settat', ar: 'سطات', fr: 'Settat', en: 'Settat', regionId: 'cs', shipping: 35 },
  { value: 'benslimane', ar: 'بنسليمان', fr: 'Benslimane', en: 'Benslimane', regionId: 'cs', shipping: 35 },
  { value: 'mediouna', ar: 'مديونة', fr: 'Médiouna', en: 'Mediouna', regionId: 'cs', shipping: 35 },
  { value: 'el-jadida', ar: 'الجديدة', fr: 'El Jadida', en: 'El Jadida', regionId: 'cs', shipping: 35 },
  { value: 'sidi-bennour', ar: 'سيدي بنور', fr: 'Sidi Bennour', en: 'Sidi Bennour', regionId: 'cs', shipping: 35 },
  { value: 'ben-guerir', ar: 'بن كرير', fr: 'Ben Guerir', en: 'Ben Guerir', regionId: 'cs', shipping: 35 },

  // ── جهة مراكش - آسفي ──────────────────────────────────────
  { value: 'marrakech', ar: 'مراكش', fr: 'Marrakech', en: 'Marrakech', regionId: 'ms', shipping: 35 },
  { value: 'safi', ar: 'آسفي', fr: 'Safi', en: 'Safi', regionId: 'ms', shipping: 35 },
  { value: 'essaouira', ar: 'الصويرة', fr: 'Essaouira', en: 'Essaouira', regionId: 'ms', shipping: 35 },
  { value: 'el-kelaa-des-sraghna', ar: 'قلعة السراغنة', fr: 'El Kelaâ des Sraghna', en: 'El Kelaa des Sraghna', regionId: 'ms', shipping: 35 },
  { value: 'chichaoua', ar: 'شيشاوة', fr: 'Chichaoua', en: 'Chichaoua', regionId: 'ms', shipping: 35 },
  { value: 'youssoufia', ar: 'اليوسفية', fr: 'Youssoufia', en: 'Youssoufia', regionId: 'ms', shipping: 35 },
  { value: 'rehamna', ar: 'الرحامنة', fr: 'Rehamna', en: 'Rehamna', regionId: 'ms', shipping: 35 },
  { value: 'al-haouz', ar: 'الحوز', fr: 'Al Haouz', en: 'Al Haouz', regionId: 'ms', shipping: 35 },

  // ── جهة درعة - تافيلالت ────────────────────────────────────
  { value: 'errachidia', ar: 'الرشيدية', fr: 'Errachidia', en: 'Errachidia', regionId: 'dt', shipping: 35 },
  { value: 'ouarzazate', ar: 'ورزازات', fr: 'Ouarzazate', en: 'Ouarzazate', regionId: 'dt', shipping: 35 },
  { value: 'midelt', ar: 'ميدلت', fr: 'Midelt', en: 'Midelt', regionId: 'dt', shipping: 35 },
  { value: 'zagora', ar: 'زاكورة', fr: 'Zagora', en: 'Zagora', regionId: 'dt', shipping: 35 },
  { value: 'tinghir', ar: 'تنغير', fr: 'Tinghir', en: 'Tinghir', regionId: 'dt', shipping: 35 },

  // ── جهة سوس - ماسة ─────────────────────────────────────────
  { value: 'agadir', ar: 'أكادير', fr: 'Agadir', en: 'Agadir', regionId: 'sm', shipping: 35 },
  { value: 'inzegane', ar: 'إنزكان', fr: 'Inezgane', en: 'Inezgane', regionId: 'sm', shipping: 35 },
  { value: 'ait-melloul', ar: 'آيت ملول', fr: 'Aït Melloul', en: 'Ait Melloul', regionId: 'sm', shipping: 35 },
  { value: 'taroudant', ar: 'تارودانت', fr: 'Taroudant', en: 'Taroudant', regionId: 'sm', shipping: 35 },
  { value: 'tiznit', ar: 'تيزنيت', fr: 'Tiznit', en: 'Tiznit', regionId: 'sm', shipping: 35 },
  { value: 'biougra', ar: 'بيوكرى', fr: 'Biougra', en: 'Biougra', regionId: 'sm', shipping: 35 },
  { value: 'oulad-teima', ar: 'أولاد تايمة', fr: 'Oulad Teima', en: 'Oulad Teima', regionId: 'sm', shipping: 35 },
  { value: 'tafraout', ar: 'تافراوت', fr: 'Tafraoute', en: 'Tafraoute', regionId: 'sm', shipping: 35 },
  { value: 'chtouka-ait-baha', ar: 'شتوكة آيت باها', fr: 'Chtouka-Aït Baha', en: 'Chtouka-Ait Baha', regionId: 'sm', shipping: 35 },

  // ── جهة كلميم - واد نون ────────────────────────────────────
  { value: 'guelmim', ar: 'كلميم', fr: 'Guelmim', en: 'Guelmim', regionId: 'gon', shipping: 35 },
  { value: 'sidi-ifni', ar: 'سيدي إفني', fr: 'Sidi Ifni', en: 'Sidi Ifni', regionId: 'gon', shipping: 35 },
  { value: 'tan-tan', ar: 'طانطان', fr: 'Tan-Tan', en: 'Tan-Tan', regionId: 'gon', shipping: 35 },
  { value: 'assa-zag', ar: 'آسا الزاك', fr: 'Assa-Zag', en: 'Assa-Zag', regionId: 'gon', shipping: 35 },

  // ── جهة العيون - الساقية الحمراء ───────────────────────────
  { value: 'laayoune', ar: 'العيون', fr: 'Laâyoune', en: 'Laayoune', regionId: 'lsh', shipping: 35 },
  { value: 'smara', ar: 'السمارة', fr: 'Smara', en: 'Smara', regionId: 'lsh', shipping: 35 },
  { value: 'tarfaya', ar: 'طرفاية', fr: 'Tarfaya', en: 'Tarfaya', regionId: 'lsh', shipping: 35 },
  { value: 'boujdour', ar: 'بوجدور', fr: 'Boujdour', en: 'Boujdour', regionId: 'lsh', shipping: 35 },

  // ── جهة الداخلة - وادي الذهب ────────────────────────────────
  { value: 'dakhla', ar: 'الداخلة', fr: 'Dakhla', en: 'Dakhla', regionId: 'dod', shipping: 35 },
  { value: 'aousserd', ar: 'أوسرد', fr: 'Aousserd', en: 'Aousserd', regionId: 'dod', shipping: 35 },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Returns the shipping cost for a given city value.
 * Falls back to 35 MAD if city is not found.
 */
export function getShippingCost(cityValue: string): number {
  const city = MOROCCAN_CITIES.find((c) => c.value === cityValue)
  return city ? city.shipping : 35
}

/**
 * Returns all cities belonging to a given region ID.
 */
export function getCitiesByRegion(regionId: string): MoroccanCity[] {
  return MOROCCAN_CITIES.filter((c) => c.regionId === regionId)
}

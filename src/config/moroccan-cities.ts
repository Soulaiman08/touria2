export const MOROCCAN_CITIES = [
  // Grandes villes / المدن الكبرى
  { value: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca', en: 'Casablanca', shippingCost: 30 },
  { value: 'rabat', ar: 'الرباط', fr: 'Rabat', en: 'Rabat', shippingCost: 30 },
  { value: 'fes', ar: 'فاس', fr: 'Fès', en: 'Fes', shippingCost: 35 },
  { value: 'marrakech', ar: 'مراكش', fr: 'Marrakech', en: 'Marrakech', shippingCost: 35 },
  { value: 'tanger', ar: 'طنجة', fr: 'Tanger', en: 'Tangier', shippingCost: 35 },
  { value: 'agadir', ar: 'أكادير', fr: 'Agadir', en: 'Agadir', shippingCost: 40 },
  { value: 'meknes', ar: 'مكناس', fr: 'Meknès', en: 'Meknes', shippingCost: 35 },
  { value: 'oujda', ar: 'وجدة', fr: 'Oujda', en: 'Oujda', shippingCost: 40 },
  { value: 'kenitra', ar: 'القنيطرة', fr: 'Kénitra', en: 'Kenitra', shippingCost: 30 },
  { value: 'tetouan', ar: 'تطوان', fr: 'Tétouan', en: 'Tetouan', shippingCost: 35 },
  { value: 'sale', ar: 'سلا', fr: 'Salé', en: 'Sale', shippingCost: 30 },
  { value: 'nador', ar: 'الناظور', fr: 'Nador', en: 'Nador', shippingCost: 40 },
  { value: 'safi', ar: 'آسفي', fr: 'Safi', en: 'Safi', shippingCost: 40 },
  { value: 'el-jadida', ar: 'الجديدة', fr: 'El Jadida', en: 'El Jadida', shippingCost: 35 },
  { value: 'beni-mellal', ar: 'بني ملال', fr: 'Béni Mellal', en: 'Beni Mellal', shippingCost: 40 },
  { value: 'mohammedia', ar: 'المحمدية', fr: 'Mohammedia', en: 'Mohammedia', shippingCost: 30 },
  { value: 'khouribga', ar: 'خريبكة', fr: 'Khouribga', en: 'Khouribga', shippingCost: 40 },
  { value: 'ait-melloul', ar: 'أيت ملول', fr: 'Aït Melloul', en: 'Ait Melloul', shippingCost: 40 },
  { value: 'khemisset', ar: 'الخميسات', fr: 'Khémisset', en: 'Khemisset', shippingCost: 35 },
  { value: 'essaouira', ar: 'الصويرة', fr: 'Essaouira', en: 'Essaouira', shippingCost: 45 },
  { value: 'taza', ar: 'تازة', fr: 'Taza', en: 'Taza', shippingCost: 40 },
  { value: 'settat', ar: 'سطات', fr: 'Settat', en: 'Settat', shippingCost: 35 },
  { value: 'larache', ar: 'العرائش', fr: 'Larache', en: 'Larache', shippingCost: 35 },
  { value: 'ksar-el-kebir', ar: 'القصر الكبير', fr: 'Ksar El Kébir', en: 'Ksar el Kebir', shippingCost: 35 },
  { value: 'berrechid', ar: 'برشيد', fr: 'Berrechid', en: 'Berrechid', shippingCost: 35 },
  { value: 'errachidia', ar: 'الراشيدية', fr: 'Errachidia', en: 'Errachidia', shippingCost: 50 },
  { value: 'ouarzazate', ar: 'ورزازات', fr: 'Ouarzazate', en: 'Ouarzazate', shippingCost: 50 },
  { value: 'guelmim', ar: 'كلميم', fr: 'Guelmim', en: 'Guelmim', shippingCost: 55 },
  { value: 'laayoune', ar: 'العيون', fr: 'Laâyoune', en: 'Laayoune', shippingCost: 60 },
  { value: 'dakhla', ar: 'الداخلة', fr: 'Dakhla', en: 'Dakhla', shippingCost: 70 },
  { value: 'ifrane', ar: 'إفران', fr: 'Ifrane', en: 'Ifrane', shippingCost: 40 },
  { value: 'azrou', ar: 'أزرو', fr: 'Azrou', en: 'Azrou', shippingCost: 40 },
  { value: 'tiznit', ar: 'تيزنيت', fr: 'Tiznit', en: 'Tiznit', shippingCost: 50 },
  { value: 'taroudant', ar: 'تارودانت', fr: 'Taroudant', en: 'Taroudant', shippingCost: 50 },
  { value: 'al-hoceima', ar: 'الحسيمة', fr: 'Al Hoceïma', en: 'Al Hoceima', shippingCost: 45 },
  { value: 'chefchaouen', ar: 'شفشاون', fr: 'Chefchaouen', en: 'Chefchaouen', shippingCost: 40 },
  { value: 'azilal', ar: 'أزيلال', fr: 'Azilal', en: 'Azilal', shippingCost: 45 },
  { value: 'midelt', ar: 'ميدلت', fr: 'Midelt', en: 'Midelt', shippingCost: 45 },
  { value: 'zagora', ar: 'زاكورة', fr: 'Zagora', en: 'Zagora', shippingCost: 55 },
] as const

export type MoroccanCity = (typeof MOROCCAN_CITIES)[number]

export const DEFAULT_SHIPPING_COST = 40 // MAD

export function getShippingCost(cityValue: string): number {
  const city = MOROCCAN_CITIES.find((c) => c.value === cityValue)
  return city?.shippingCost ?? DEFAULT_SHIPPING_COST
}

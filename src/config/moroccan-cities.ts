// ============================================================
// MOROCCAN CITIES – Official list by administrative region (12 Regions)
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
  // ── 1. جهة طنجة - تطوان - الحسيمة (tth) ──────────────────────────
  { value: 'tangier', ar: 'طنجة', fr: 'Tanger', en: 'Tangier', regionId: 'tth' },
  { value: 'tetouan', ar: 'تطوان', fr: 'Tétouan', en: 'Tetouan', regionId: 'tth' },
  { value: 'al-hoceima', ar: 'الحسيمة', fr: 'Al Hoceïma', en: 'Al Hoceima', regionId: 'tth' },
  { value: 'chefchaouen', ar: 'شفشاون', fr: 'Chefchaouen', en: 'Chefchaouen', regionId: 'tth' },
  { value: 'larache', ar: 'العرائش', fr: 'Larache', en: 'Larache', regionId: 'tth' },
  { value: 'ksar-el-kebir', ar: 'القصر الكبير', fr: 'Ksar El Kébir', en: 'Ksar El Kebir', regionId: 'tth' },
  { value: 'ouazzane', ar: 'وزان', fr: 'Ouazzane', en: 'Ouazzane', regionId: 'tth' },
  { value: 'fnideq', ar: 'الفنيدق', fr: 'Fnideq', en: 'Fnideq', regionId: 'tth' },
  { value: 'mdiq', ar: 'المضيق', fr: "M'diq", en: 'Mdiq', regionId: 'tth' },
  { value: 'martil', ar: 'مرتيل', fr: 'Martil', en: 'Martil', regionId: 'tth' },
  { value: 'asilah', ar: 'أصيلة', fr: 'Asilah', en: 'Asilah', regionId: 'tth' },
  { value: 'ksar-sghir', ar: 'القصر الصغير', fr: 'Ksar Sghir', en: 'Ksar Sghir', regionId: 'tth' },
  { value: 'bab-berred', ar: 'باب برد', fr: 'Bab Berred', en: 'Bab Berred', regionId: 'tth' },
  { value: 'el-jebha', ar: 'الجبهة', fr: 'El Jebha', en: 'El Jebha', regionId: 'tth' },

  // ── 2. جهة الشرق (oriental) ────────────────────────────────────
  { value: 'oujda', ar: 'وجدة', fr: 'Oujda', en: 'Oujda', regionId: 'oriental' },
  { value: 'nador', ar: 'الناظور', fr: 'Nador', en: 'Nador', regionId: 'oriental' },
  { value: 'berkane', ar: 'بركان', fr: 'Berkane', en: 'Berkane', regionId: 'oriental' },
  { value: 'taourirt', ar: 'تاوريرت', fr: 'Taourirt', en: 'Taourirt', regionId: 'oriental' },
  { value: 'guercif', ar: 'كرسيف', fr: 'Guercif', en: 'Guercif', regionId: 'oriental' },
  { value: 'jerada', ar: 'جرادة', fr: 'Jerada', en: 'Jerada', regionId: 'oriental' },
  { value: 'driouch', ar: 'دريوش', fr: 'Driouch', en: 'Driouch', regionId: 'oriental' },
  { value: 'midar', ar: 'ميضار', fr: 'Midar', en: 'Midar', regionId: 'oriental' },
  { value: 'zaio', ar: 'زايو', fr: 'Zaïo', en: 'Zaio', regionId: 'oriental' },
  { value: 'al-aaroui', ar: 'العروي', fr: 'Al Aaroui', en: 'Al Aaroui', regionId: 'oriental' },
  { value: 'selouane', ar: 'سلوان', fr: 'Selouane', en: 'Selouane', regionId: 'oriental' },
  { value: 'saidia', ar: 'السعيدية', fr: 'Saïdia', en: 'Saidia', regionId: 'oriental' },
  { value: 'ahfir', ar: 'أحفير', fr: 'Ahfir', en: 'Ahfir', regionId: 'oriental' },
  { value: 'figuig', ar: 'فكيك', fr: 'Figuig', en: 'Figuig', regionId: 'oriental' },
  { value: 'bouarfa', ar: 'بوعرفة', fr: 'Bouarfa', en: 'Bouarfa', regionId: 'oriental' },
  { value: 'el-aaiun-sidi-mellouk', ar: 'العيون سيدي ملوك', fr: 'El Aïoun Sidi Mellouk', en: 'El Aaiun Sidi Mellouk', regionId: 'oriental' },

  // ── 3. جهة فاس - مكناس (fm) ───────────────────────────────────
  { value: 'fes', ar: 'فاس', fr: 'Fès', en: 'Fez', regionId: 'fm' },
  { value: 'meknes', ar: 'مكناس', fr: 'Meknès', en: 'Meknes', regionId: 'fm' },
  { value: 'taza', ar: 'تازة', fr: 'Taza', en: 'Taza', regionId: 'fm' },
  { value: 'taounate', ar: 'تاونات', fr: 'Taounate', en: 'Taounate', regionId: 'fm' },
  { value: 'sefrou', ar: 'صفرو', fr: 'Sefrou', en: 'Sefrou', regionId: 'fm' },
  { value: 'ifrane', ar: 'إفران', fr: 'Ifrane', en: 'Ifrane', regionId: 'fm' },
  { value: 'azrou', ar: 'أزرو', fr: 'Azrou', en: 'Azrou', regionId: 'fm' },
  { value: 'el-hajeb', ar: 'الحاجب', fr: 'El Hajeb', en: 'El Hajeb', regionId: 'fm' },
  { value: 'ain-taoujdate', ar: 'عين تاوجطات', fr: 'Aïn Taoujdate', en: 'Ain Taoujdate', regionId: 'fm' },
  { value: 'ouislane', ar: 'ويسلان', fr: 'Ouislane', en: 'Ouislane', regionId: 'fm' },
  { value: 'boulemane', ar: 'بولمان', fr: 'Boulemane', en: 'Boulemane', regionId: 'fm' },
  { value: 'missour', ar: 'ميسور', fr: 'Missour', en: 'Missour', regionId: 'fm' },
  { value: 'moulay-yacoub', ar: 'مولاي يعقوب', fr: 'Moulay Yacoub', en: 'Moulay Yacoub', regionId: 'fm' },
  { value: 'moulay-driss-zerhoun', ar: 'مولاي إدريس زرهون', fr: 'Moulay Driss Zerhoun', en: 'Moulay Driss Zerhoun', regionId: 'fm' },
  { value: 'bhalil', ar: 'البهاليل', fr: 'Bhalil', en: 'Bhalil', regionId: 'fm' },
  { value: 'tissa', ar: 'تيسة', fr: 'Tissa', en: 'Tissa', regionId: 'fm' },
  { value: 'ribat-el-kheir', ar: 'رباط الخير', fr: 'Ribat El Kheir', en: 'Ribat El Kheir', regionId: 'fm' },

  // ── 4. جهة الرباط - سلا - القنيطرة (rsk) ──────────────────────
  { value: 'rabat', ar: 'الرباط', fr: 'Rabat', en: 'Rabat', regionId: 'rsk' },
  { value: 'sale', ar: 'سلا', fr: 'Salé', en: 'Salé', regionId: 'rsk' },
  { value: 'kenitra', ar: 'القنيطرة', fr: 'Kénitra', en: 'Kenitra', regionId: 'rsk' },
  { value: 'temara', ar: 'تمارة', fr: 'Témara', en: 'Temara', regionId: 'rsk' },
  { value: 'harhoura', ar: 'الهرهورة', fr: 'Harhoura', en: 'Harhoura', regionId: 'rsk' },
  { value: 'skhirat', ar: 'الصخيرات', fr: 'Skhirat', en: 'Skhirat', regionId: 'rsk' },
  { value: 'ain-el-aouda', ar: 'عين العودة', fr: 'Aïn El Aouda', en: 'Ain El Aouda', regionId: 'rsk' },
  { value: 'khemisset', ar: 'الخميسات', fr: 'Khémisset', en: 'Khemisset', regionId: 'rsk' },
  { value: 'tiflet', ar: 'تيفلت', fr: 'Tiflet', en: 'Tiflet', regionId: 'rsk' },
  { value: 'sidi-allal-el-bahraoui', ar: 'سيدي علال البحراوي', fr: 'Sidi Allal El Bahraoui', en: 'Sidi Allal El Bahraoui', regionId: 'rsk' },
  { value: 'rommani', ar: 'الرماني', fr: 'Rommani', en: 'Rommani', regionId: 'rsk' },
  { value: 'sidi-kacem', ar: 'سيدي قاسم', fr: 'Sidi Kacem', en: 'Sidi Kacem', regionId: 'rsk' },
  { value: 'sidi-slimane', ar: 'سيدي سليمان', fr: 'Sidi Slimane', en: 'Sidi Slimane', regionId: 'rsk' },
  { value: 'sidi-yahya-el-gharb', ar: 'سيدي يحيى الغرب', fr: 'Sidi Yahya El Gharb', en: 'Sidi Yahya El Gharb', regionId: 'rsk' },
  { value: 'souk-el-arbaa', ar: 'سوق الأربعاء الغرب', fr: 'Souk El Arbaa du Gharb', en: 'Souk El Arbaa du Gharb', regionId: 'rsk' },
  { value: 'mehdya', ar: 'المهدية', fr: 'Mehdya', en: 'Mehdya', regionId: 'rsk' },
  { value: 'sidi-taibi', ar: 'سيدي الطيبي', fr: 'Sidi Taïbi', en: 'Sidi Taibi', regionId: 'rsk' },
  { value: 'mechra-bel-ksiri', ar: 'مشرع بلقصيري', fr: 'Mechra Bel Ksiri', en: 'Mechra Bel Ksiri', regionId: 'rsk' },
  { value: 'dar-gueddari', ar: 'دار الكداري', fr: 'Dar Gueddari', en: 'Dar Gueddari', regionId: 'rsk' },
  { value: 'jorf-el-melha', ar: 'جرف الملحة', fr: 'Jorf El Melha', en: 'Jorf El Melha', regionId: 'rsk' },

  // ── 5. جهة بني ملال - خنيفرة (bk) ────────────────────────────
  { value: 'beni-mellal', ar: 'بني ملال', fr: 'Béni Mellal', en: 'Beni Mellal', regionId: 'bk' },
  { value: 'khenifra', ar: 'خنيفرة', fr: 'Khénifra', en: 'Khenifra', regionId: 'bk' },
  { value: 'mrirt', ar: 'مريرت', fr: 'Mrirt', en: 'Mrirt', regionId: 'bk' },
  { value: 'khouribga', ar: 'خريبكة', fr: 'Khouribga', en: 'Khouribga', regionId: 'bk' },
  { value: 'oued-zem', ar: 'وادي زم', fr: 'Oued Zem', en: 'Oued Zem', regionId: 'bk' },
  { value: 'bejaad', ar: 'أبي الجعد', fr: 'Boujad', en: 'Bejaad', regionId: 'bk' },
  { value: 'azilal', ar: 'أزيلال', fr: 'Azilal', en: 'Azilal', regionId: 'bk' },
  { value: 'demnate', ar: 'دمنات', fr: 'Demnate', en: 'Demnate', regionId: 'bk' },
  { value: 'fqih-ben-salah', ar: 'الفقيه بن صالح', fr: 'Fquih Ben Salah', en: 'Fquih Ben Salah', regionId: 'bk' },
  { value: 'souk-sebt-oulad-nemma', ar: 'سوق السبت أولاد النمة', fr: 'Souk Sebt Oulad Nemma', en: 'Souk Sebt Oulad Nemma', regionId: 'bk' },
  { value: 'kasba-tadla', ar: 'قصبة تادلة', fr: 'Kasba Tadla', en: 'Kasba Tadla', regionId: 'bk' },
  { value: 'zaouiat-cheikh', ar: 'زاوية الشيخ', fr: 'Zaouiat Cheikh', en: 'Zaouiat Cheikh', regionId: 'bk' },

  // ── 6. جهة الدار البيضاء - سطات (cs) ──────────────────────────
  { value: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca', en: 'Casablanca', regionId: 'cs' },
  { value: 'mohammedia', ar: 'المحمدية', fr: 'Mohammédia', en: 'Mohammedia', regionId: 'cs' },
  { value: 'el-jadida', ar: 'الجديدة', fr: 'El Jadida', en: 'El Jadida', regionId: 'cs' },
  { value: 'azemmour', ar: 'أزمور', fr: 'Azemmour', en: 'Azemmour', regionId: 'cs' },
  { value: 'settat', ar: 'سطات', fr: 'Settat', en: 'Settat', regionId: 'cs' },
  { value: 'berrechid', ar: 'برشيد', fr: 'Berrechid', en: 'Berrechid', regionId: 'cs' },
  { value: 'benslimane', ar: 'بنسليمان', fr: 'Benslimane', en: 'Benslimane', regionId: 'cs' },
  { value: 'bouznika', ar: 'بوزنيقة', fr: 'Bouznika', en: 'Bouznika', regionId: 'cs' },
  { value: 'mansouria', ar: 'المنصورية', fr: 'Mansouria', en: 'Mansouria', regionId: 'cs' },
  { value: 'mediouna', ar: 'مديونة', fr: 'Médiouna', en: 'Mediouna', regionId: 'cs' },
  { value: 'tit-mellil', ar: 'تيت مليل', fr: 'Tit Mellil', en: 'Tit Mellil', regionId: 'cs' },
  { value: 'nouaceur', ar: 'النواصر', fr: 'Nouaceur', en: 'Nouaceur', regionId: 'cs' },
  { value: 'bouskoura', ar: 'بوسكورة', fr: 'Bouskoura', en: 'Bouskoura', regionId: 'cs' },
  { value: 'dar-bouazza', ar: 'دار بوعزة', fr: 'Dar Bouazza', en: 'Dar Bouazza', regionId: 'cs' },
  { value: 'had-soualem', ar: 'حد السوالم', fr: 'Had Soualem', en: 'Had Soualem', regionId: 'cs' },
  { value: 'deroua', ar: 'الدروة', fr: 'Deroua', en: 'Deroua', regionId: 'cs' },
  { value: 'sidi-bennour', ar: 'سيدي بنور', fr: 'Sidi Bennour', en: 'Sidi Bennour', regionId: 'cs' },
  { value: 'zemamra', ar: 'الزمامرة', fr: 'Zemamra', en: 'Zemamra', regionId: 'cs' },
  { value: 'sidi-rahhal-chatai', ar: 'سيدي رحال الشاطئ', fr: 'Sidi Rahhal Chataï', en: 'Sidi Rahhal Chatai', regionId: 'cs' },
  { value: 'lahraouyine', ar: 'الهراويين', fr: 'Lahraouyine', en: 'Lahraouyine', regionId: 'cs' },

  // ── 7. جهة مراكش - آسفي (ms) ──────────────────────────────────
  { value: 'marrakech', ar: 'مراكش', fr: 'Marrakech', en: 'Marrakech', regionId: 'ms' },
  { value: 'safi', ar: 'آسفي', fr: 'Safi', en: 'Safi', regionId: 'ms' },
  { value: 'essaouira', ar: 'الصويرة', fr: 'Essaouira', en: 'Essaouira', regionId: 'ms' },
  { value: 'el-kelaa-des-sraghna', ar: 'قلعة السراغنة', fr: 'El Kelaâ des Sraghna', en: 'El Kelaa des Sraghna', regionId: 'ms' },
  { value: 'ben-guerir', ar: 'بن كرير', fr: 'Ben Guerir', en: 'Ben Guerir', regionId: 'ms' },
  { value: 'chichaoua', ar: 'شيشاوة', fr: 'Chichaoua', en: 'Chichaoua', regionId: 'ms' },
  { value: 'imintanoute', ar: 'إمنتانوت', fr: 'Imintanoute', en: 'Imintanoute', regionId: 'ms' },
  { value: 'youssoufia', ar: 'اليوسفية', fr: 'Youssoufia', en: 'Youssoufia', regionId: 'ms' },
  { value: 'chemaia', ar: 'الشماعية', fr: 'Chemaïa', en: 'Chemaia', regionId: 'ms' },
  { value: 'tahannaout', ar: 'تحناوت', fr: 'Tahannaout', en: 'Tahannaout', regionId: 'ms' },
  { value: 'ait-ourir', ar: 'آيت أورير', fr: 'Aït Ourir', en: 'Ait Ourir', regionId: 'ms' },
  { value: 'tamansourt', ar: 'تامنصورت', fr: 'Tamansourt', en: 'Tamansourt', regionId: 'ms' },
  { value: 'sidi-bou-othmane', ar: 'سيدي بو عثمان', fr: 'Sidi Bou Othmane', en: 'Sidi Bou Othmane', regionId: 'ms' },
  { value: 'ourika', ar: 'أوريكا', fr: 'Ourika', en: 'Ourika', regionId: 'ms' },

  // ── 8. جهة درعة - تافيلالت (dt) ────────────────────────────────
  { value: 'errachidia', ar: 'الرشيدية', fr: 'Errachidia', en: 'Errachidia', regionId: 'dt' },
  { value: 'ouarzazate', ar: 'ورزازات', fr: 'Ouarzazate', en: 'Ouarzazate', regionId: 'dt' },
  { value: 'midelt', ar: 'ميدلت', fr: 'Midelt', en: 'Midelt', regionId: 'dt' },
  { value: 'tinghir', ar: 'تنغير', fr: 'Tinghir', en: 'Tinghir', regionId: 'dt' },
  { value: 'zagora', ar: 'زاكورة', fr: 'Zagora', en: 'Zagora', regionId: 'dt' },
  { value: 'erfoud', ar: 'أرفود', fr: 'Erfoud', en: 'Erfoud', regionId: 'dt' },
  { value: 'rissani', ar: 'الريصاني', fr: 'Rissani', en: 'Rissani', regionId: 'dt' },
  { value: 'goulmima', ar: 'كلميمة', fr: 'Goulmima', en: 'Goulmima', regionId: 'dt' },
  { value: 'tinejdad', ar: 'تنجداد', fr: 'Tinejdad', en: 'Tinejdad', regionId: 'dt' },
  { value: 'kelaat-mgouna', ar: 'قلعة مكونة', fr: "Kelaat M'Gouna", en: 'Kelaat MGouna', regionId: 'dt' },
  { value: 'boumalne-dades', ar: 'بومالن دادس', fr: 'Boumalne Dadès', en: 'Boumalne Dades', regionId: 'dt' },
  { value: 'agdz', ar: 'أكدز', fr: 'Agdz', en: 'Agdz', regionId: 'dt' },
  { value: 'rich', ar: 'الريش', fr: 'Rich', en: 'Rich', regionId: 'dt' },

  // ── 9. جهة سوس - ماسة (sm) ─────────────────────────────────────
  { value: 'agadir', ar: 'أكادير', fr: 'Agadir', en: 'Agadir', regionId: 'sm' },
  { value: 'inzegane', ar: 'إنزكان', fr: 'Inezgane', en: 'Inezgane', regionId: 'sm' },
  { value: 'ait-melloul', ar: 'آيت ملول', fr: 'Aït Melloul', en: 'Ait Melloul', regionId: 'sm' },
  { value: 'dcheira-el-jihadia', ar: 'الدشيرة الجهادية', fr: 'Dcheira El Jihadia', en: 'Dcheira El Jihadia', regionId: 'sm' },
  { value: 'drargua', ar: 'الدراركة', fr: 'Drarga', en: 'Drargua', regionId: 'sm' },
  { value: 'taroudant', ar: 'تارودانت', fr: 'Taroudant', en: 'Taroudant', regionId: 'sm' },
  { value: 'oulad-teima', ar: 'أولاد تايمة', fr: 'Oulad Teïma', en: 'Oulad Teima', regionId: 'sm' },
  { value: 'tiznit', ar: 'تيزنيت', fr: 'Tiznit', en: 'Tiznit', regionId: 'sm' },
  { value: 'tafraout', ar: 'تافراوت', fr: 'Tafraoute', en: 'Tafraout', regionId: 'sm' },
  { value: 'biougra', ar: 'بيوكرى', fr: 'Biougra', en: 'Biougra', regionId: 'sm' },
  { value: 'ait-baha', ar: 'آيت باها', fr: 'Aït Baha', en: 'Ait Baha', regionId: 'sm' },
  { value: 'tata', ar: 'طاطا', fr: 'Tata', en: 'Tata', regionId: 'sm' },
  { value: 'oulad-berhil', ar: 'أولاد برحيل', fr: 'Oulad Berhil', en: 'Oulad Berhil', regionId: 'sm' },
  { value: 'taliouine', ar: 'تاليوين', fr: 'Taliouine', en: 'Taliouine', regionId: 'sm' },

  // ── 10. جهة كلميم - واد نون (gon) ────────────────────────────────
  { value: 'guelmim', ar: 'كلميم', fr: 'Guelmim', en: 'Guelmim', regionId: 'gon' },
  { value: 'sidi-ifni', ar: 'سيدي إفني', fr: 'Sidi Ifni', en: 'Sidi Ifni', regionId: 'gon' },
  { value: 'tan-tan', ar: 'طانطان', fr: 'Tan-Tan', en: 'Tan-Tan', regionId: 'gon' },
  { value: 'el-ouatia', ar: 'الوطية', fr: 'El Ouatia', en: 'El Ouatia', regionId: 'gon' },
  { value: 'bouizakarne', ar: 'بويزكارن', fr: 'Bouizakarne', en: 'Bouizakarne', regionId: 'gon' },
  { value: 'assa', ar: 'آسا', fr: 'Assa', en: 'Assa', regionId: 'gon' },
  { value: 'zag', ar: 'الزاك', fr: 'Zag', en: 'Zag', regionId: 'gon' },
  { value: 'lakhsas', ar: 'الأخصاص', fr: 'Lakhsas', en: 'Lakhsas', regionId: 'gon' },

  // ── 11. جهة العيون - الساقية الحمراء (lsh) ───────────────────────
  { value: 'laayoune', ar: 'العيون', fr: 'Laâyoune', en: 'Laayoune', regionId: 'lsh' },
  { value: 'el-marsa', ar: 'المرسى', fr: 'El Marsa', en: 'El Marsa', regionId: 'lsh' },
  { value: 'smara', ar: 'السمارة', fr: 'Es-Semara', en: 'Smara', regionId: 'lsh' },
  { value: 'boujdour', ar: 'بوجدور', fr: 'Boujdour', en: 'Boujdour', regionId: 'lsh' },
  { value: 'tarfaya', ar: 'طرفاية', fr: 'Tarfaya', en: 'Tarfaya', regionId: 'lsh' },

  // ── 12. جهة الداخلة - وادي الذهب (dod) ──────────────────────────
  { value: 'dakhla', ar: 'الداخلة', fr: 'Dakhla', en: 'Dakhla', regionId: 'dod' },
  { value: 'aousserd', ar: 'أوسرد', fr: 'Aousserd', en: 'Aousserd', regionId: 'dod' },
  { value: 'bir-gandouz', ar: 'بئر كندوز', fr: 'Bir Gandouz', en: 'Bir Gandouz', regionId: 'dod' },
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


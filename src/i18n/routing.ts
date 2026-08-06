import { MoroccanCity } from '@/config/moroccan-cities'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ar', 'fr', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always',
  localeDetection: true,
})

export type Locale = (typeof routing.locales)[number]
export const MOROCCAN_CITIES: MoroccanCity[] = [
  // جهة الرباط - سلا - القنيطرة
  {
    value: "rabat",
    ar: "الرباط",
    fr: "Rabat",
    en: "Rabat",
    regionId: "rsk",
    shipping: 35,
  },
  {
    value: "sale",
    ar: "سلا",
    fr: "Salé",
    en: "Salé",
    regionId: "rsk",
    shipping: 35,
  },
  {
    value: "kenitra",
    ar: "القنيطرة",
    fr: "Kénitra",
    en: "Kenitra",
    regionId: "rsk",
    shipping: 35,
  },
  {
    value: "temara",
    ar: "تمارة",
    fr: "Témara",
    en: "Temara",
    regionId: "rsk",
    shipping: 35,
  },
  {
    value: "khemisset",
    ar: "الخميسات",
    fr: "Khémisset",
    en: "Khemisset",
    regionId: "rsk",
    shipping: 35,
  },
  {
    value: "sidi-kacem",
    ar: "سيدي قاسم",
    fr: "Sidi Kacem",
    en: "Sidi Kacem",
    regionId: "rsk",
    shipping: 35,
  },
  {
    value: "sidi-slimane",
    ar: "سيدي سليمان",
    fr: "Sidi Slimane",
    en: "Sidi Slimane",
    regionId: "rsk",
    shipping: 35,
  },

  // جهة الدار البيضاء - سطات
  {
    value: "casablanca",
    ar: "الدار البيضاء",
    fr: "Casablanca",
    en: "Casablanca",
    regionId: "cs",
    shipping: 35,
  },
  {
    value: "mohammedia",
    ar: "المحمدية",
    fr: "Mohammédia",
    en: "Mohammedia",
    regionId: "cs",
    shipping: 35,
  },
  {
    value: "berrechid",
    ar: "برشيد",
    fr: "Berrechid",
    en: "Berrechid",
    regionId: "cs",
    shipping: 35,
  },
  {
    value: "settat",
    ar: "سطات",
    fr: "Settat",
    en: "Settat",
    regionId: "cs",
    shipping: 35,
  },
  {
    value: "benslimane",
    ar: "بنسليمان",
    fr: "Benslimane",
    en: "Benslimane",
    regionId: "cs",
    shipping: 35,
  },
  {
    value: "mediouna",
    ar: "مديونة",
    fr: "Médiouna",
    en: "Mediouna",
    regionId: "cs",
    shipping: 35,
  },
];

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_PUBLIC_SETTINGS = {
  storeName: 'Thuraya Al-Maghribi',
  logo: '/images/brand/logo-full.png',
  currency: 'MAD',
  contactEmail: 'contact@thuraya.com',
  contactPhone: '+212 6 12 34 56 78',
  address: 'Casablanca, Morocco',
  instagram: 'https://instagram.com/thuraya.ma',
  facebook: 'https://www.facebook.com/profile.php?id=100091985212461',
  tiktok: 'https://www.tiktok.com/@thuraya.ma',
  youtube: 'https://youtube.com/@thuraya.almaghribi',
  whatsapp: '+212612345678',
}

const PUBLIC_SETTING_KEYS = new Set(Object.keys(DEFAULT_PUBLIC_SETTINGS))

export async function GET() {
  try {
    const settingsList = await prisma.siteSetting.findMany({
      where: { key: { in: [...PUBLIC_SETTING_KEYS] } },
    })

    const settings = { ...DEFAULT_PUBLIC_SETTINGS }
    settingsList.forEach(({ key, value }) => {
      if (key in settings) {
        settings[key as keyof typeof settings] = value
      }
    })

    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ settings: DEFAULT_PUBLIC_SETTINGS })
  }
}

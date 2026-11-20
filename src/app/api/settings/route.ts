import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/config/site'

const DEFAULT_PUBLIC_SETTINGS: Record<string, string> = {
  storeName: siteConfig.nameEn,
  logo: siteConfig.logoFull,
  currency: siteConfig.currency.code,
  contactEmail: siteConfig.contact.email,
  contactPhone: siteConfig.contact.phone,
  address: 'Casablanca, Morocco',
  instagram: siteConfig.social.instagram,
  facebook: siteConfig.social.facebook,
  tiktok: siteConfig.social.tiktok,
  youtube: siteConfig.social.youtube,
  whatsapp: siteConfig.contact.whatsapp,
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
  } catch (error) {
    // Do not hide DB failures behind defaults: the consumer (Header) falls
    // back to its own defaults and logs the failure.
    console.error('Failed to load public settings:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 503 })
  }
}
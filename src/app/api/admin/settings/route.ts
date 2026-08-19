import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const DEFAULT_SETTINGS = {
  storeName: 'Thuraya Al-Maghribi | الثريا المغربي',
  logo: '/images/brand/logo-full.png',
  currency: 'MAD',
  shippingCost: '35',

  contactEmail: 'contact@thuraya.com',
  contactPhone: '+212 6 12 34 56 78',
  address: 'Casablanca, Morocco',

  instagram: 'https://instagram.com/thuraya.ma',
  facebook: 'https://www.facebook.com/profile.php?id=100091985212461',
  tiktok: 'https://www.tiktok.com/@thuraya.ma',
  youtube: 'https://youtube.com/@thuraya.almaghribi',
  whatsapp: '+212612345678',

  seoTitle: 'الثريا المغربي – أزياء وتصاميم مغربية تقليدية وفاخرة',
  seoDescription: 'تصفحي أرقى تشكيلات الجلابة المغربية والنقاب بأجود أنواع الأقمشة وتطريز يدوي أصيل.',
  seoKeywords: 'جلابة مغربية, نقاب, أزياء مغربية, ثريا المغربي, قفطان',
}

// The general settings tab saves the shipping price under "shippingCost",
// while checkout reads it from "shipping:default" (see order.service
// resolveShippingCost). Keep both keys in sync so edited values are
// actually used by the checkout.
const SHIPPING_DEFAULT_KEY = 'shipping:default'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const settingsList = await prisma.siteSetting.findMany()

    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS }
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value
    })

    // If no explicit shippingCost row exists but a shipping:default price
    // does, surface it in the general tab so both tabs agree.
    if (
      settingsMap['shippingCost'] === DEFAULT_SETTINGS.shippingCost &&
      settingsMap[SHIPPING_DEFAULT_KEY] !== undefined
    ) {
      settingsMap['shippingCost'] = settingsMap[SHIPPING_DEFAULT_KEY]
    }

    return NextResponse.json({ settings: settingsMap })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to load settings'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response

  try {
    const body = await request.json() as Record<string, unknown>;

    const entries = Object.entries(body)
      .filter(([, value]) => typeof value === 'string' || typeof value === 'number')

    for (const [key, value] of entries) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    // Keep checkout shipping price in sync when edited from the general tab.
    const shippingCost = body['shippingCost']
    if (typeof shippingCost === 'string' || typeof shippingCost === 'number') {
      await prisma.siteSetting.upsert({
        where: { key: SHIPPING_DEFAULT_KEY },
        update: { value: String(shippingCost) },
        create: { key: SHIPPING_DEFAULT_KEY, value: String(shippingCost) },
      });
    }

    return NextResponse.json({ success: true, settings: body });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
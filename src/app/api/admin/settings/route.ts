import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const withTimeout = <T>(promise: Promise<T>, fallback: T, ms = 1500): Promise<T> => {
  const timeout = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  return Promise.race([promise.catch(() => fallback), timeout])
}

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

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const settingsList = await withTimeout(prisma.siteSetting.findMany(), null)
    if (settingsList === null) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS })
    }

    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS }
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value
    })

    return NextResponse.json({ settings: settingsMap })
  } catch {
    return NextResponse.json({ settings: DEFAULT_SETTINGS })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response

  try {
    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' || typeof value === 'number') {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }

    return NextResponse.json({ success: true, settings: body });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

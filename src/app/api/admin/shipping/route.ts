import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MOROCCAN_CITIES, DEFAULT_SHIPPING_PRICE, getCityByValue } from '@/config/moroccan-cities'
import { MOROCCAN_REGIONS } from '@/config/moroccan-regions'
import { requireAdmin } from '@/lib/auth'

const CITY_KEY_PREFIX = 'shipping:city:'
const DEFAULT_KEY = 'shipping:default'

/** Build the SiteSetting key for a city */
function cityKey(cityValue: string) {
  return `${CITY_KEY_PREFIX}${cityValue}`
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { startsWith: 'shipping:' } },
    })

    // Build map: normalized cityValue -> price
    const cityPrices: Record<string, number> = {}
    let defaultPrice = DEFAULT_SHIPPING_PRICE

    for (const row of rows) {
      if (row.key === DEFAULT_KEY) {
        defaultPrice = Number(row.value) || DEFAULT_SHIPPING_PRICE
      } else if (row.key.startsWith(CITY_KEY_PREFIX)) {
        const city = row.key.slice(CITY_KEY_PREFIX.length).trim().toLowerCase()
        cityPrices[city] = Number(row.value) || DEFAULT_SHIPPING_PRICE
      }
    }

    // Return list of ALL cities with their effective price (custom or default)
    const cities = MOROCCAN_CITIES.map((city) => {
      const normalizedCityValue = city.value.trim().toLowerCase()
      const regionInfo = MOROCCAN_REGIONS.find((r) => r.id === city.regionId)
      return {
        cityValue: city.value,
        cityAr: city.ar,
        cityFr: city.fr,
        cityEn: city.en,
        regionId: city.regionId,
        regionAr: regionInfo?.ar ?? '',
        regionFr: regionInfo?.fr ?? '',
        regionEn: regionInfo?.en ?? '',
        price: cityPrices[normalizedCityValue] ?? null, // null = using default
        effectivePrice: cityPrices[normalizedCityValue] ?? defaultPrice,
      }
    })

    return NextResponse.json({ defaultPrice, cities })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to load shipping config'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    const body = await request.json() as {
      type: 'default' | 'city'
      price: number
      cityValue?: string
    }

    if (typeof body.price !== 'number' || body.price < 0 || body.price > 9999) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    if (body.type === 'default') {
      await prisma.siteSetting.upsert({
        where: { key: DEFAULT_KEY },
        update: { value: String(body.price) },
        create: { key: DEFAULT_KEY, value: String(body.price) },
      })
      return NextResponse.json({ success: true, key: DEFAULT_KEY, price: body.price })
    }

    if (body.type === 'city') {
      if (!body.cityValue) {
        return NextResponse.json({ error: 'cityValue is required' }, { status: 400 })
      }
      const normalizedCityValue = body.cityValue.trim().toLowerCase()
      // Validate city exists
      const cityInfo = getCityByValue(normalizedCityValue)
      if (!cityInfo) {
        return NextResponse.json({ error: 'Unknown city' }, { status: 400 })
      }
      const key = cityKey(cityInfo.value)
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(body.price) },
        create: { key, value: String(body.price) },
      })
      return NextResponse.json({ success: true, key, cityValue: cityInfo.value, price: body.price })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to save shipping price'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    const { searchParams } = new URL(request.url)
    const rawCity = searchParams.get('city')
    if (!rawCity) {
      return NextResponse.json({ error: 'city param required' }, { status: 400 })
    }
    const normalizedCity = rawCity.trim().toLowerCase()
    const cityInfo = getCityByValue(normalizedCity)
    if (!cityInfo) return NextResponse.json({ error: 'Unknown city' }, { status: 400 })
    const key = cityKey(cityInfo.value)
    await prisma.siteSetting.deleteMany({ where: { key } })
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to delete shipping price'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

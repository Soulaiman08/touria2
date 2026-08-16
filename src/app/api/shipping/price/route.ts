import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_SHIPPING_PRICE, getCityByValue } from '@/config/moroccan-cities'

const CITY_KEY_PREFIX = 'shipping:city:'
const DEFAULT_KEY = 'shipping:default'

/**
 * GET /api/shipping/price?city={cityValue}
 * Returns the shipping price for a given city.
 * Used by CheckoutForm to get live price after city selection.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawCity = searchParams.get('city')

    if (!rawCity) {
      return NextResponse.json({ error: 'city param required' }, { status: 400 })
    }

    const normalizedCity = rawCity.trim().toLowerCase()

    // Validate city is a known city
    const cityInfo = getCityByValue(normalizedCity)
    if (!cityInfo) {
      return NextResponse.json({ error: 'Unknown city' }, { status: 400 })
    }

    // Look up city-specific price first, then default, then hardcoded fallback
    const [cityRow, defaultRow] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: `${CITY_KEY_PREFIX}${cityInfo.value}` } }),
      prisma.siteSetting.findUnique({ where: { key: DEFAULT_KEY } }),
    ])

    const defaultPrice = defaultRow ? (Number(defaultRow.value) || DEFAULT_SHIPPING_PRICE) : DEFAULT_SHIPPING_PRICE
    const price = cityRow ? (Number(cityRow.value) || defaultPrice) : defaultPrice

    return NextResponse.json(
      { city: cityInfo.value, price, defaultPrice },
      {
        headers: {
          // Short cache: allow CDN/browser to cache for 60s, re-validate in background
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    // On any DB failure, return the hardcoded default so checkout still works
    const msg = error instanceof Error ? error.message : 'Failed to fetch shipping price'
    console.error('[/api/shipping/price]', msg)
    return NextResponse.json({ city: '', price: DEFAULT_SHIPPING_PRICE, defaultPrice: DEFAULT_SHIPPING_PRICE })
  }
}

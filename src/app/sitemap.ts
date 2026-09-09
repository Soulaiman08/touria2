import { MetadataRoute } from 'next'
import { productService } from '@/services/product.service'
import { categoryService } from '@/services/category.service'

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://thuraya-almaghribi.vercel.app'

const LOCALES = ['ar', 'fr', 'en'] as const

function buildAlternates(path: string) {
  return Object.fromEntries(
    LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static public pages ──────────────────────────────────────
  const staticPaths: Array<{ path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '',           priority: 1.0, freq: 'weekly'  },
    { path: '/products',  priority: 0.9, freq: 'daily'   },
    { path: '/about',     priority: 0.6, freq: 'monthly' },
    { path: '/faq',       priority: 0.5, freq: 'monthly' },
    { path: '/privacy',   priority: 0.3, freq: 'yearly'  },
    { path: '/returns',   priority: 0.4, freq: 'monthly' },
  ]

  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    staticPaths.map(({ path, priority, freq }) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: freq,
      priority,
      alternates: {
        languages: buildAlternates(path),
      },
    }))
  )

  const now = new Date()

  // ── Category pages ───────────────────────────────────────────
  let categoryEntries: MetadataRoute.Sitemap = []
  try {
    const categories = await categoryService.getCategories()
    categoryEntries = LOCALES.flatMap((locale) =>
      categories.map((cat) => ({
        url: `${BASE_URL}/${locale}/products?category=${cat.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}/products?category=${cat.slug}`])
          ),
        },
      }))
    )
  } catch {
    // non-fatal — skip category pages if DB unavailable
  }

  // ── Dynamic product pages ────────────────────────────────────
  let productEntries: MetadataRoute.Sitemap = []
  try {
    const { items } = await productService.getProducts({ limit: 500 })
    productEntries = LOCALES.flatMap((locale) =>
      items.map((product) => ({
        url: `${BASE_URL}/${locale}/products/${product.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}/products/${product.slug}`])
          ),
        },
      }))
    )
  } catch {
    // non-fatal — fall back to static entries only
  }

  return [...staticEntries, ...categoryEntries, ...productEntries]
}

import { MetadataRoute } from 'next'
import { productService } from '@/services/product.service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thuraya-almaghribi.ma'
  const locales = ['ar', 'fr', 'en']

  // Static pages
  const staticPages = [
    '',
    '/products',
    '/about',
  ]

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' : 'monthly',
      priority: page === '' ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}${page}`])
        ),
      },
    }))
  ) as MetadataRoute.Sitemap

  // Dynamic product pages
  try {
    const { items } = await productService.getProducts({ limit: 100 })
    const productEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
      items.map((product) => ({
        url: `${baseUrl}/${locale}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/products/${product.slug}`])
          ),
        },
      }))
    ) as MetadataRoute.Sitemap

    return [...staticEntries, ...productEntries]
  } catch {
    return staticEntries
  }
}

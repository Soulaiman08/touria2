import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

type MockCategory = {
  id: string
  slug: string
  nameAr: string
  nameFr: string
  nameEn: string
  descriptionAr: string | null
  descriptionFr: string | null
  descriptionEn: string | null
  image: string | null
  sortOrder: number
  isActive: boolean
  parentId: string | null
  createdAt: Date
  updatedAt: Date
}

type MockVariant = {
  id: string
  productId: string
  size: string
  colorCode: string
  colorNameAr: string
  colorNameFr: string
  colorNameEn: string
  stockQuantity: number
  priceModifier: number
  images: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type MockProduct = {
  id: string
  slug: string
  sku: string
  nameAr: string
  nameFr: string
  nameEn: string
  descriptionAr: string
  descriptionFr: string
  descriptionEn: string
  basePrice: number
  salePrice: number | null
  categoryId: string
  isActive: boolean
  isFeatured: boolean
  isNiqab: boolean
  canAddNiqab: boolean
  mainImage: string
  images: string[]
  tags: string[]
  metaTitleAr: string | null
  metaTitleFr: string | null
  metaTitleEn: string | null
  metaDescAr: string | null
  metaDescFr: string | null
  metaDescEn: string | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

type MockOrder = Record<string, unknown> & { id: string; orderNumber: string; createdAt: Date; updatedAt: Date }
type MockOrderItem = Record<string, unknown> & { id: string; orderId: string; createdAt: Date }
type MockOrderHistory = Record<string, unknown> & { id: string; orderId: string; createdAt: Date }
type MockReview = Record<string, unknown> & { id: string; productId: string; customerId: string; rating: number; comment: string; createdAt: Date; updatedAt: Date }

function createMockSeedData() {
  const now = new Date('2026-08-20T10:00:00.000Z')

  const categories: MockCategory[] = [
    {
      id: 'cat-djellabas',
      slug: 'djellabas',
      nameAr: 'جلابيات',
      nameFr: 'Djellabas',
      nameEn: 'Djellabas',
      descriptionAr: 'جلابيات مغربية مصنوعة يدوياً بأجود المواد',
      descriptionFr: 'Djellabas marocaines artisanales de qualité supérieure',
      descriptionEn: 'Handcrafted Moroccan djellabas of superior quality',
      image: '/images/brand/logo-full.png',
      sortOrder: 1,
      isActive: true,
      parentId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat-niqabs',
      slug: 'niqabs',
      nameAr: 'نقابات',
      nameFr: 'Niquab',
      nameEn: 'Niqabs',
      descriptionAr: 'نقابات مغربية أنيقة تتناسق مع جلابياتنا',
      descriptionFr: 'Niquab marocain élégant assorti à nos djellabas',
      descriptionEn: 'Elegant Moroccan niqabs matching our djellabas',
      image: '/images/brand/logo-full.png',
      sortOrder: 2,
      isActive: true,
      parentId: null,
      createdAt: now,
      updatedAt: now,
    },
  ]

  const products: MockProduct[] = [
    {
      id: 'prod-djellaba-1',
      slug: 'djellaba-classique-terracotta',
      sku: 'DJL-001-TERRA',
      nameAr: 'جلابة كلاسيكية – تيراكوتا',
      nameFr: 'Djellaba Classique – Terracotta',
      nameEn: 'Classic Djellaba – Terracotta',
      descriptionAr:
        'جلابة مغربية كلاسيكية مصنوعة من أجود أنواع القماش، تجمع بين الأناقة التقليدية والراحة العصرية. مثالية للمناسبات والارتداء اليومي.',
      descriptionFr:
        'Djellaba marocaine classique confectionnée dans les meilleures étoffes, alliant élégance traditionnelle et confort moderne. Parfaite pour les occasions et le quotidien.',
      descriptionEn:
        'Classic Moroccan djellaba crafted from the finest fabrics, blending traditional elegance with modern comfort. Perfect for occasions and daily wear.',
      basePrice: 599,
      salePrice: null,
      categoryId: 'cat-djellabas',
      isActive: true,
      isFeatured: true,
      isNiqab: false,
      canAddNiqab: true,
      mainImage: '/images/brand/logo-full.png',
      images: ['/images/brand/logo-full.png', '/images/brand/logo-icon.png'],
      tags: ['classique', 'terracotta', 'featured'],
      metaTitleAr: 'جلابة كلاسيكية تيراكوتا – ثريا المغربي',
      metaTitleFr: 'Djellaba Classique Terracotta – ثريا المغربي',
      metaTitleEn: 'Classic Terracotta Djellaba – ثريا المغربي',
      metaDescAr: null,
      metaDescFr: null,
      metaDescEn: null,
      sortOrder: 1,
      createdAt: new Date(now.getTime() + 4000),
      updatedAt: now,
    },
    {
      id: 'prod-djellaba-2',
      slug: 'djellaba-royale-creme',
      sku: 'DJL-002-CREME',
      nameAr: 'جلابة رويال – كريمي',
      nameFr: 'Djellaba Royale – Crème',
      nameEn: 'Royal Djellaba – Cream',
      descriptionAr:
        'جلابة فاخرة بتصميم ملكي مزينة بتطريز يدوي أصيل. رمز للأناقة المغربية في أبهى صورها.',
      descriptionFr:
        "Djellaba de luxe au design royal ornée de broderies artisanales authentiques. Symbole de l'élégance marocaine dans sa plus belle expression.",
      descriptionEn:
        'Luxurious djellaba with royal design adorned with authentic handmade embroidery. A symbol of Moroccan elegance at its finest.',
      basePrice: 850,
      salePrice: 750,
      categoryId: 'cat-djellabas',
      isActive: true,
      isFeatured: true,
      isNiqab: false,
      canAddNiqab: true,
      mainImage: '/images/brand/logo-full.png',
      images: ['/images/brand/logo-full.png'],
      tags: ['royale', 'creme', 'broderie', 'featured', 'sale'],
      metaTitleAr: null,
      metaTitleFr: null,
      metaTitleEn: null,
      metaDescAr: null,
      metaDescFr: null,
      metaDescEn: null,
      sortOrder: 2,
      createdAt: new Date(now.getTime() + 3000),
      updatedAt: now,
    },
    {
      id: 'prod-djellaba-3',
      slug: 'djellaba-moderne-marine',
      sku: 'DJL-003-MARINE',
      nameAr: 'جلابة عصرية – أزرق داكن',
      nameFr: 'Djellaba Moderne – Marine',
      nameEn: 'Modern Djellaba – Navy',
      descriptionAr:
        'جلابة عصرية بقصة أنيقة تجمع بين التراث المغربي الأصيل والتصميم المعاصر. مناسبة لكل المناسبات.',
      descriptionFr:
        'Djellaba moderne à la coupe élégante alliant patrimoine marocain authentique et design contemporain. Adaptée à toutes les occasions.',
      descriptionEn:
        'Modern djellaba with elegant cut blending authentic Moroccan heritage with contemporary design. Suitable for all occasions.',
      basePrice: 680,
      salePrice: null,
      categoryId: 'cat-djellabas',
      isActive: true,
      isFeatured: true,
      isNiqab: false,
      canAddNiqab: true,
      mainImage: '/images/brand/logo-full.png',
      images: ['/images/brand/logo-full.png'],
      tags: ['moderne', 'marine'],
      metaTitleAr: null,
      metaTitleFr: null,
      metaTitleEn: null,
      metaDescAr: null,
      metaDescFr: null,
      metaDescEn: null,
      sortOrder: 3,
      createdAt: new Date(now.getTime() + 2000),
      updatedAt: now,
    },
    {
      id: 'prod-djellaba-4',
      slug: 'djellaba-elegance-olive',
      sku: 'DJL-004-OLIVE',
      nameAr: 'جلابة أناقة – أخضر زيتوني',
      nameFr: 'Djellaba Élégance – Vert Olive',
      nameEn: 'Elegance Djellaba – Olive Green',
      descriptionAr:
        'جلابة مغربية راقية بلون أخضر زيتوني هادئ وتفاصيل تقليدية متقنة تضفي حضوراً مميزاً.',
      descriptionFr:
        'Djellaba marocaine raffinée en vert olive apaisant avec des finitions traditionnelles soignées.',
      descriptionEn:
        'Refined Moroccan djellaba in serene olive green with meticulous traditional finishing.',
      basePrice: 720,
      salePrice: 640,
      categoryId: 'cat-djellabas',
      isActive: true,
      isFeatured: true,
      isNiqab: false,
      canAddNiqab: true,
      mainImage: '/images/brand/logo-full.png',
      images: ['/images/brand/logo-full.png'],
      tags: ['elegance', 'olive', 'featured', 'sale'],
      metaTitleAr: null,
      metaTitleFr: null,
      metaTitleEn: null,
      metaDescAr: null,
      metaDescFr: null,
      metaDescEn: null,
      sortOrder: 4,
      createdAt: new Date(now.getTime() + 1000),
      updatedAt: now,
    },
    {
      id: 'prod-niqab-1',
      slug: 'niqab-classique-terracotta',
      sku: 'NQB-001-TERRA',
      nameAr: 'نقاب كلاسيكي – تيراكوتا',
      nameFr: 'Niqab Classique – Terracotta',
      nameEn: 'Classic Niqab – Terracotta',
      descriptionAr: 'نقاب مغربي أنيق يتناسق مع جلابيات ثريا المغربي.',
      descriptionFr: 'Niqab marocain élégant assorti aux djellabas Thuraya Al-Maghribi.',
      descriptionEn: 'Elegant Moroccan niqab matching Thuraya Al-Maghribi djellabas.',
      basePrice: 150,
      salePrice: null,
      categoryId: 'cat-niqabs',
      isActive: true,
      isFeatured: false,
      isNiqab: true,
      canAddNiqab: false,
      mainImage: '/images/brand/logo-full.png',
      images: ['/images/brand/logo-full.png'],
      tags: ['niqab', 'terracotta'],
      metaTitleAr: null,
      metaTitleFr: null,
      metaTitleEn: null,
      metaDescAr: null,
      metaDescFr: null,
      metaDescEn: null,
      sortOrder: 5,
      createdAt: now,
      updatedAt: now,
    },
  ]

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  const colors = [
    { code: '#C4622D', ar: 'تيراكوتا', fr: 'Terracotta', en: 'Terracotta' },
    { code: '#F2E4CE', ar: 'كريمي', fr: 'Crème', en: 'Cream' },
    { code: '#1B2B4B', ar: 'أزرق داكن', fr: 'Marine', en: 'Navy' },
    { code: '#2D5A27', ar: 'أخضر زيتوني', fr: 'Vert Olive', en: 'Olive Green' },
    { code: '#8B1A1A', ar: 'أحمر غامق', fr: 'Rouge Foncé', en: 'Dark Red' },
  ]

  const variants: MockVariant[] = []
  let vIdx = 1

  for (const prod of products) {
    if (prod.isNiqab) {
      for (const color of colors) {
        variants.push({
          id: `var-${vIdx++}`,
          productId: prod.id,
          size: 'Standard',
          colorCode: color.code,
          colorNameAr: color.ar,
          colorNameFr: color.fr,
          colorNameEn: color.en,
          stockQuantity: 25,
          priceModifier: 0,
          images: [],
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
      }
    } else {
      for (const size of sizes) {
        for (const color of colors) {
          variants.push({
            id: `var-${vIdx++}`,
            productId: prod.id,
            size,
            colorCode: color.code,
            colorNameAr: color.ar,
            colorNameFr: color.fr,
            colorNameEn: color.en,
            stockQuantity: 25,
            priceModifier: 0,
            images: [],
            isActive: true,
            createdAt: now,
            updatedAt: now,
          })
        }
      }
    }
  }

  return { categories, products, variants }
}

function matchStringFilter(actual: unknown, expected: unknown): boolean {
  if (typeof expected === 'string') {
    return actual === expected
  }
  if (expected && typeof expected === 'object') {
    const filter = expected as Record<string, unknown>
    const str = String(actual ?? '')
    const insensitive = filter.mode === 'insensitive'
    if (typeof filter.contains === 'string') {
      const needle = insensitive ? filter.contains.toLowerCase() : filter.contains
      const haystack = insensitive ? str.toLowerCase() : str
      return haystack.includes(needle)
    }
    if (typeof filter.equals === 'string') {
      return insensitive ? str.toLowerCase() === filter.equals.toLowerCase() : str === filter.equals
    }
    if (Array.isArray(filter.in)) {
      return filter.in.includes(actual)
    }
  }
  return true
}

function sortRecords<T extends Record<string, unknown>>(
  list: T[],
  orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>
): T[] {
  if (!orderBy) return list
  const entries = Array.isArray(orderBy)
    ? orderBy.flatMap((o) => Object.entries(o))
    : Object.entries(orderBy)
  if (entries.length === 0) return list

  return [...list].sort((a, b) => {
    for (const [field, dir] of entries) {
      const av = a[field]
      const bv = b[field]
      let cmp = 0
      if (av instanceof Date && bv instanceof Date) {
        cmp = av.getTime() - bv.getTime()
      } else if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv
      } else if (typeof av === 'boolean' && typeof bv === 'boolean') {
        cmp = Number(av) - Number(bv)
      } else {
        cmp = String(av ?? '').localeCompare(String(bv ?? ''))
      }
      if (cmp !== 0) return dir === 'desc' ? -cmp : cmp
    }
    return 0
  })
}

function createMockPrismaClient(): PrismaClient {
  console.warn('[AI Studio] Database not connected — using in-memory mock with sample test products')
  const { categories, products, variants } = createMockSeedData()
  const siteSettingsStore = new Map<string, string>()
  const ordersStore: MockOrder[] = []
  const orderItemsStore: MockOrderItem[] = []
  const orderHistoryStore: MockOrderHistory[] = []
  const reviewsStore: MockReview[] = []
  let idCounter = 100

  const matchCategoryWhere = (cat: MockCategory, where?: Record<string, unknown>): boolean => {
    if (!where) return true
    if (typeof where.isActive === 'boolean' && cat.isActive !== where.isActive) return false
    if (where.id !== undefined && !matchStringFilter(cat.id, where.id)) return false
    if (where.slug !== undefined && !matchStringFilter(cat.slug, where.slug)) return false
    if (Array.isArray(where.OR)) {
      return where.OR.some((sub) => matchCategoryWhere(cat, sub as Record<string, unknown>))
    }
    return true
  }

  const matchProductWhere = (prod: MockProduct, where?: Record<string, unknown>): boolean => {
    if (!where) return true
    if (typeof where.isActive === 'boolean' && prod.isActive !== where.isActive) return false
    if (typeof where.isFeatured === 'boolean' && prod.isFeatured !== where.isFeatured) return false
    if (typeof where.isNiqab === 'boolean' && prod.isNiqab !== where.isNiqab) return false
    if (where.id !== undefined && !matchStringFilter(prod.id, where.id)) return false
    if (where.slug !== undefined && !matchStringFilter(prod.slug, where.slug)) return false
    if (where.sku !== undefined && !matchStringFilter(prod.sku, where.sku)) return false
    if (where.categoryId !== undefined && !matchStringFilter(prod.categoryId, where.categoryId)) return false

    if (where.category && typeof where.category === 'object') {
      const cat = categories.find((c) => c.id === prod.categoryId)
      if (!cat || !matchCategoryWhere(cat, where.category as Record<string, unknown>)) return false
    }

    if (where.basePrice && typeof where.basePrice === 'object') {
      const pf = where.basePrice as { gte?: number; lte?: number }
      if (pf.gte !== undefined && prod.basePrice < pf.gte) return false
      if (pf.lte !== undefined && prod.basePrice > pf.lte) return false
    }

    if (where.variants && typeof where.variants === 'object') {
      const vf = where.variants as { some?: Record<string, unknown> }
      if (vf.some) {
        const prodVariants = variants.filter((v) => v.productId === prod.id)
        const hasMatch = prodVariants.some((v) => {
          if (typeof vf.some?.isActive === 'boolean' && v.isActive !== vf.some.isActive) return false
          if (vf.some?.size !== undefined && !matchStringFilter(v.size, vf.some.size)) return false
          if (vf.some?.colorCode !== undefined && !matchStringFilter(v.colorCode, vf.some.colorCode)) return false
          return true
        })
        if (!hasMatch) return false
      }
    }

    if (where.nameAr !== undefined && !matchStringFilter(prod.nameAr, where.nameAr)) return false
    if (where.nameFr !== undefined && !matchStringFilter(prod.nameFr, where.nameFr)) return false
    if (where.nameEn !== undefined && !matchStringFilter(prod.nameEn, where.nameEn)) return false

    if (Array.isArray(where.OR)) {
      const matchedOr = where.OR.some((sub) => matchProductWhere(prod, sub as Record<string, unknown>))
      if (!matchedOr) return false
    }

    return true
  }

  const hydrateProduct = (prod: MockProduct, include?: Record<string, unknown>) => {
    const result: Record<string, unknown> = { ...prod }
    if (include?.category) {
      result.category = categories.find((c) => c.id === prod.categoryId) ?? null
    }
    if (include?.variants) {
      let prodVariants = variants.filter((v) => v.productId === prod.id)
      if (typeof include.variants === 'object' && include.variants !== null) {
        const varInclude = include.variants as { where?: { isActive?: boolean } }
        if (typeof varInclude.where?.isActive === 'boolean') {
          prodVariants = prodVariants.filter((v) => v.isActive === varInclude.where?.isActive)
        }
      }
      result.variants = prodVariants
    }
    return result
  }

  const createModelMock = (modelName: string) => {
    const noOp = {
      findMany: async (args?: {
        where?: Record<string, unknown>
        include?: Record<string, unknown>
        orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>
        skip?: number
        take?: number
      }) => {
        if (modelName === 'siteSetting') {
          return Array.from(siteSettingsStore.entries()).map(([key, value]) => ({
            id: key,
            key,
            value,
            updatedAt: new Date(),
          }))
        }
        if (modelName === 'category') {
          const filtered = categories.filter((c) => matchCategoryWhere(c, args?.where))
          const sorted = sortRecords(filtered as unknown as Array<Record<string, unknown>>, args?.orderBy)
          const start = args?.skip ?? 0
          const end = args?.take !== undefined ? start + args.take : undefined
          return sorted.slice(start, end)
        }
        if (modelName === 'product') {
          const filtered = products.filter((p) => matchProductWhere(p, args?.where))
          const sorted = sortRecords(filtered as unknown as Array<Record<string, unknown>>, args?.orderBy) as unknown as MockProduct[]
          const start = args?.skip ?? 0
          const end = args?.take !== undefined ? start + args.take : undefined
          return sorted.slice(start, end).map((p) => hydrateProduct(p, args?.include))
        }
        if (modelName === 'productVariant') {
          let filtered = [...variants]
          const w = args?.where
          if (w?.productId) filtered = filtered.filter((v) => v.productId === w.productId)
          if (typeof w?.isActive === 'boolean') filtered = filtered.filter((v) => v.isActive === w.isActive)
          if (w?.id && typeof w.id === 'object' && Array.isArray((w.id as { in?: string[] }).in)) {
            const ids = (w.id as { in: string[] }).in
            filtered = filtered.filter((v) => ids.includes(v.id))
          }
          return filtered.map((v) =>
            args?.include?.product
              ? { ...v, product: products.find((p) => p.id === v.productId) ?? null }
              : v
          )
        }
        if (modelName === 'review') {
          const pid = args?.where?.productId
          return pid ? reviewsStore.filter((r) => r.productId === pid) : reviewsStore
        }
        if (modelName === 'order') {
          return ordersStore.map((o) => ({
            ...o,
            items: orderItemsStore.filter((i) => i.orderId === o.id),
            statusHistory: orderHistoryStore.filter((h) => h.orderId === o.id),
          }))
        }
        return []
      },

      findFirst: async (args?: {
        where?: Record<string, unknown>
        include?: Record<string, unknown>
        orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>
      }) => {
        if (modelName === 'category') {
          const found = categories.find((c) => matchCategoryWhere(c, args?.where))
          return found ?? null
        }
        if (modelName === 'product') {
          const filtered = products.filter((p) => matchProductWhere(p, args?.where))
          const sorted = sortRecords(filtered as unknown as Array<Record<string, unknown>>, args?.orderBy) as unknown as MockProduct[]
          return sorted[0] ? hydrateProduct(sorted[0], args?.include) : null
        }
        if (modelName === 'order') {
          const w = args?.where
          const found = ordersStore.find((o) => {
            if (!w) return true
            if (Array.isArray(w.OR)) {
              return w.OR.some((sub) => {
                const s = sub as Record<string, unknown>
                return (s.id && o.id === s.id) || (s.orderNumber && o.orderNumber === s.orderNumber)
              })
            }
            if (w.id && o.id !== w.id) return false
            if (w.orderNumber && o.orderNumber !== w.orderNumber) return false
            return true
          })
          if (!found) return null
          return {
            ...found,
            items: orderItemsStore.filter((i) => i.orderId === found.id),
            statusHistory: orderHistoryStore.filter((h) => h.orderId === found.id),
          }
        }
        return null
      },

      findFirstOrThrow: async () => {
        throw new Error(`Mock DB: ${modelName} record not found`)
      },

      findUnique: async (args?: {
        where?: Record<string, unknown>
        include?: Record<string, unknown>
      }) => {
        if (modelName === 'siteSetting' && typeof args?.where?.key === 'string') {
          const val = siteSettingsStore.get(args.where.key)
          return val !== undefined ? { id: args.where.key, key: args.where.key, value: val, updatedAt: new Date() } : null
        }
        if (modelName === 'category' && args?.where) {
          const found = categories.find((c) => matchCategoryWhere(c, args.where))
          return found ?? null
        }
        if (modelName === 'product' && args?.where) {
          const found = products.find((p) => matchProductWhere(p, args.where))
          return found ? hydrateProduct(found, args.include) : null
        }
        if (modelName === 'review' && args?.where?.customerId_productId) {
          const comp = args.where.customerId_productId as { customerId: string; productId: string }
          return reviewsStore.find((r) => r.customerId === comp.customerId && r.productId === comp.productId) ?? null
        }
        return null
      },

      findUniqueOrThrow: async () => {
        throw new Error(`Mock DB: ${modelName} record not found`)
      },

      count: async (args?: { where?: Record<string, unknown> }) => {
        if (modelName === 'category') {
          return categories.filter((c) => matchCategoryWhere(c, args?.where)).length
        }
        if (modelName === 'product') {
          return products.filter((p) => matchProductWhere(p, args?.where)).length
        }
        if (modelName === 'order') {
          return ordersStore.length
        }
        return 0
      },

      aggregate: async (args?: { where?: { productId?: string } }) => {
        if (modelName === 'review') {
          const matching = args?.where?.productId
            ? reviewsStore.filter((r) => r.productId === args.where?.productId)
            : reviewsStore
          const count = matching.length
          const avg = count > 0 ? matching.reduce((s, r) => s + r.rating, 0) / count : null
          return {
            _sum: { total: 0 },
            _avg: { rating: avg },
            _count: count,
          }
        }
        return {
          _sum: { total: 0 },
          _avg: { rating: null },
          _count: { _all: 0, rating: 0 },
        }
      },

      groupBy: async () => [],

      create: async (args?: { data?: Record<string, unknown> }) => {
        const data = args?.data ?? {}
        const id = typeof data.id === 'string' ? data.id : `mock-${++idCounter}`
        const createdAt = new Date()
        const updatedAt = new Date()

        if (modelName === 'siteSetting' && typeof data.key === 'string' && typeof data.value === 'string') {
          siteSettingsStore.set(data.key, data.value)
        } else if (modelName === 'product') {
          const newProduct: MockProduct = {
            id,
            slug: String(data.slug ?? id),
            sku: String(data.sku ?? id),
            nameAr: String(data.nameAr ?? ''),
            nameFr: String(data.nameFr ?? ''),
            nameEn: String(data.nameEn ?? ''),
            descriptionAr: String(data.descriptionAr ?? ''),
            descriptionFr: String(data.descriptionFr ?? ''),
            descriptionEn: String(data.descriptionEn ?? ''),
            basePrice: Number(data.basePrice ?? 0),
            salePrice: data.salePrice !== undefined && data.salePrice !== null ? Number(data.salePrice) : null,
            categoryId: String(data.categoryId ?? 'cat-djellabas'),
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
            isFeatured: Boolean(data.isFeatured),
            isNiqab: Boolean(data.isNiqab),
            canAddNiqab: data.canAddNiqab !== undefined ? Boolean(data.canAddNiqab) : true,
            mainImage: String(data.mainImage ?? '/images/brand/logo-full.png'),
            images: Array.isArray(data.images) ? (data.images as string[]) : ['/images/brand/logo-full.png'],
            tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
            metaTitleAr: null,
            metaTitleFr: null,
            metaTitleEn: null,
            metaDescAr: null,
            metaDescFr: null,
            metaDescEn: null,
            sortOrder: Number(data.sortOrder ?? products.length + 1),
            createdAt,
            updatedAt,
          }
          products.unshift(newProduct)
          return newProduct
        } else if (modelName === 'productVariant') {
          const newVar: MockVariant = {
            id,
            productId: String(data.productId ?? ''),
            size: String(data.size ?? 'Standard'),
            colorCode: String(data.colorCode ?? '#000000'),
            colorNameAr: String(data.colorNameAr ?? ''),
            colorNameFr: String(data.colorNameFr ?? ''),
            colorNameEn: String(data.colorNameEn ?? ''),
            stockQuantity: Number(data.stockQuantity ?? 10),
            priceModifier: Number(data.priceModifier ?? 0),
            images: Array.isArray(data.images) ? (data.images as string[]) : [],
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
            createdAt,
            updatedAt,
          }
          variants.push(newVar)
          return newVar
        } else if (modelName === 'order') {
          const newOrder: MockOrder = {
            id,
            orderNumber: String(data.orderNumber ?? `THR-${idCounter}`),
            status: 'PENDING',
            paymentMethod: 'COD',
            paymentStatus: 'PENDING',
            discountAmount: 0,
            adminNotes: null,
            ...data,
            createdAt,
            updatedAt,
          }
          ordersStore.unshift(newOrder)
          return newOrder
        } else if (modelName === 'orderItem') {
          const item: MockOrderItem = { id, orderId: String(data.orderId ?? ''), ...data, createdAt }
          orderItemsStore.push(item)
          return item
        } else if (modelName === 'orderStatusHistory') {
          const hist: MockOrderHistory = { id, orderId: String(data.orderId ?? ''), ...data, createdAt }
          orderHistoryStore.push(hist)
          return hist
        } else if (modelName === 'review') {
          const rev: MockReview = {
            id,
            customerId: String(data.customerId ?? ''),
            productId: String(data.productId ?? ''),
            rating: Number(data.rating ?? 5),
            comment: String(data.comment ?? ''),
            createdAt,
            updatedAt,
          }
          reviewsStore.unshift(rev)
          return rev
        }

        return { id, ...data, createdAt, updatedAt }
      },

      createMany: async () => ({ count: 0 }),

      update: async (args?: { data?: Record<string, unknown> }) => ({
        id: 'mock-id',
        ...(args?.data ?? {}),
        updatedAt: new Date(),
      }),

      updateMany: async (args?: {
        where?: { id?: string; stockQuantity?: { gte?: number } }
        data?: { stockQuantity?: { decrement?: number } }
      }) => {
        if (modelName === 'productVariant' && args?.where?.id) {
          const v = variants.find((item) => item.id === args.where?.id)
          if (!v) return { count: 0 }
          const minStock = args.where.stockQuantity?.gte
          if (minStock !== undefined && v.stockQuantity < minStock) {
            return { count: 0 }
          }
          const dec = args.data?.stockQuantity?.decrement ?? 0
          v.stockQuantity = Math.max(0, v.stockQuantity - dec)
          return { count: 1 }
        }
        return { count: 0 }
      },

      upsert: async (args?: { create?: Record<string, unknown>; update?: Record<string, unknown> }) => ({
        id: 'mock-id',
        ...(args?.create ?? args?.update ?? {}),
        updatedAt: new Date(),
      }),

      delete: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    }
    return new Proxy(noOp, {
      get(target, prop) {
        if (prop in target) return target[prop as keyof typeof target]
        return async () => null
      },
    })
  }

  const modelCache = new Map<string, ReturnType<typeof createModelMock>>()

  const mockProxy: unknown = new Proxy(
    {},
    {
      get(_target, prop: string | symbol) {
        if (prop === 'then') return undefined
        if (prop === '$connect' || prop === '$disconnect') return async () => {}
        if (prop === '$on') return () => {}
        if (prop === '$executeRaw' || prop === '$executeRawUnsafe') return async () => 0
        if (prop === '$queryRaw' || prop === '$queryRawUnsafe') return async () => []
        if (prop === '$transaction') {
          return async (arg: unknown) => {
            if (Array.isArray(arg)) return Promise.all(arg)
            if (typeof arg === 'function') return arg(mockProxy)
            return []
          }
        }
        const key = String(prop)
        if (!modelCache.has(key)) {
          modelCache.set(key, createModelMock(key))
        }
        return modelCache.get(key)
      },
    }
  )

  return mockProxy as PrismaClient
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    return createMockPrismaClient()
  }
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  } catch {
    return createMockPrismaClient()
  }
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


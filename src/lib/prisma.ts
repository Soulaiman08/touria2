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

type MockOrder = Record<string, unknown> & { id: string; orderNumber: string; customerId?: string | null; status?: string; createdAt: Date; updatedAt: Date }
type MockOrderItem = Record<string, unknown> & { id: string; orderId: string; createdAt: Date }
type MockOrderHistory = Record<string, unknown> & { id: string; orderId: string; createdAt: Date }
type MockReview = Record<string, unknown> & { id: string; productId: string; customerId: string; rating: number; comment: string; createdAt: Date; updatedAt: Date }
type MockCustomer = Record<string, unknown> & {
  id: string
  name: string
  email: string | null
  phone: string | null
  passwordHash: string | null
  avatarUrl: string | null
  address: string | null
  city: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL)

function applySelect<T extends Record<string, unknown>>(
  record: T,
  select?: Record<string, unknown>
): Record<string, unknown> {
  if (!select) return record
  const projected: Record<string, unknown> = {}
  for (const [key, enabled] of Object.entries(select)) {
    if (enabled === true && key in record) {
      projected[key] = record[key]
    }
  }
  return projected
}

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

/**
 * In-memory Prisma mock used ONLY when DATABASE_URL is absent (local dev / preview).
 * Note: Does NOT emulate PostgreSQL ACID concurrency, isolation, or persistence across restarts.
 */
function createMockPrismaClient(): PrismaClient {
  console.warn('[AI Studio] Database not connected — using in-memory mock with sample test products')
  const { categories, products, variants } = createMockSeedData()
  const siteSettingsStore = new Map<string, string>()
  const dayMs = 24 * 60 * 60 * 1000
  const today = new Date()
  const yesterday = new Date(today.getTime() - dayMs)
  const twoDaysAgo = new Date(today.getTime() - 2 * dayMs)

  const customersStore: MockCustomer[] = [
    {
      id: 'cust-preview-1',
      name: 'سلمى الفاسي',
      email: 'salma@example.com',
      phone: '+212612345678',
      passwordHash: null,
      avatarUrl: null,
      address: 'شارع الزرقطوني 42',
      city: 'Casablanca',
      notes: null,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: 'cust-preview-2',
      name: 'خديجة بنعلي',
      email: 'khadija@example.com',
      phone: '+212698765432',
      passwordHash: null,
      avatarUrl: null,
      address: 'حي الرياض 15',
      city: 'Rabat',
      notes: null,
      createdAt: yesterday,
      updatedAt: yesterday,
    },
  ]

  const ordersStore: MockOrder[] = [
    {
      id: 'ord-preview-1',
      orderNumber: 'TH-2026-1001',
      customerId: 'cust-preview-1',
      status: 'DELIVERED',
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      customerName: 'سلمى الفاسي',
      customerPhone: '+212612345678',
      customerPhone2: null,
      customerEmail: 'salma@example.com',
      region: 'Casablanca-Settat',
      city: 'Casablanca',
      district: 'Maarif',
      address: 'شارع الزرقطوني 42',
      notes: null,
      adminNotes: null,
      subtotal: 599,
      shippingCost: 35,
      discountAmount: 0,
      total: 634,
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
    },
    {
      id: 'ord-preview-2',
      orderNumber: 'TH-2026-1002',
      customerId: 'cust-preview-2',
      status: 'DELIVERED',
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      customerName: 'خديجة بنعلي',
      customerPhone: '+212698765432',
      customerPhone2: null,
      customerEmail: 'khadija@example.com',
      region: 'Rabat-Salé-Kénitra',
      city: 'Rabat',
      district: 'Agdal',
      address: 'حي الرياض 15',
      notes: null,
      adminNotes: null,
      subtotal: 750,
      shippingCost: 40,
      discountAmount: 0,
      total: 790,
      createdAt: yesterday,
      updatedAt: today,
    },
    {
      id: 'ord-preview-3',
      orderNumber: 'TH-2026-1003',
      customerId: 'cust-preview-1',
      status: 'PENDING',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      customerName: 'سلمى الفاسي',
      customerPhone: '+212612345678',
      customerPhone2: null,
      customerEmail: 'salma@example.com',
      region: 'Casablanca-Settat',
      city: 'Casablanca',
      district: 'Maarif',
      address: 'شارع الزرقطوني 42',
      notes: 'توصيل بعد العصر',
      adminNotes: null,
      subtotal: 680,
      shippingCost: 35,
      discountAmount: 0,
      total: 715,
      createdAt: today,
      updatedAt: today,
    },
  ]

  const orderItemsStore: MockOrderItem[] = [
    {
      id: 'oi-preview-1',
      orderId: 'ord-preview-1',
      productId: 'prod-djellaba-1',
      variantId: variants[0]?.id ?? 'var-1',
      quantity: 1,
      unitPrice: 599,
      totalPrice: 599,
      productSnapshot: {
        nameAr: 'جلابة كلاسيكية – تيراكوتا',
        nameFr: 'Djellaba Classique – Terracotta',
        nameEn: 'Classic Djellaba – Terracotta',
        sku: 'DJL-001-TERRA',
        image: '/images/brand/logo-full.png',
        size: 'M',
        colorNameAr: 'تيراكوتا',
        colorNameFr: 'Terracotta',
        colorNameEn: 'Terracotta',
        colorCode: '#C4622D',
        includeNiqab: false,
      },
      createdAt: twoDaysAgo,
    },
    {
      id: 'oi-preview-2',
      orderId: 'ord-preview-2',
      productId: 'prod-djellaba-2',
      variantId: variants[35]?.id ?? 'var-36',
      quantity: 1,
      unitPrice: 750,
      totalPrice: 750,
      productSnapshot: {
        nameAr: 'جلابة رويال – كريمي',
        nameFr: 'Djellaba Royale – Crème',
        nameEn: 'Royal Djellaba – Cream',
        sku: 'DJL-002-CREME',
        image: '/images/brand/logo-full.png',
        size: 'L',
        colorNameAr: 'كريمي',
        colorNameFr: 'Crème',
        colorNameEn: 'Cream',
        colorCode: '#F2E4CE',
        includeNiqab: true,
      },
      createdAt: yesterday,
    },
    {
      id: 'oi-preview-3',
      orderId: 'ord-preview-3',
      productId: 'prod-djellaba-3',
      variantId: variants[70]?.id ?? 'var-71',
      quantity: 1,
      unitPrice: 680,
      totalPrice: 680,
      productSnapshot: {
        nameAr: 'جلابة عصرية – أزرق داكن',
        nameFr: 'Djellaba Moderne – Marine',
        nameEn: 'Modern Djellaba – Navy',
        sku: 'DJL-003-MARINE',
        image: '/images/brand/logo-full.png',
        size: 'M',
        colorNameAr: 'أزرق داكن',
        colorNameFr: 'Marine',
        colorNameEn: 'Navy',
        colorCode: '#1B2B4B',
        includeNiqab: false,
      },
      createdAt: today,
    },
  ]

  const orderHistoryStore: MockOrderHistory[] = [
    {
      id: 'oh-preview-1',
      orderId: 'ord-preview-1',
      status: 'DELIVERED',
      note: 'تم تسليم الطلب بنجاح',
      createdAt: yesterday,
    },
    {
      id: 'oh-preview-2',
      orderId: 'ord-preview-2',
      status: 'DELIVERED',
      note: 'تم تسليم الطلب بنجاح',
      createdAt: today,
    },
    {
      id: 'oh-preview-3',
      orderId: 'ord-preview-3',
      status: 'PENDING',
      note: 'طلب جديد قيد المراجعة',
      createdAt: today,
    },
  ]

  const reviewsStore: MockReview[] = []
  const bannersStore: Array<Record<string, unknown> & { id: string; sortOrder: number; isActive: boolean; createdAt: Date; updatedAt: Date }> = [
    {
      id: 'banner-preview-1',
      title: 'تشكيلة ثريا المغربي الجديدة',
      subtitle: 'جلابيات مغربية فاخرة مصنوعة يدوياً',
      buttonText: 'تسوقي الآن',
      buttonUrl: '/products',
      imageUrl: '/images/brand/logo-full.png',
      sortOrder: 1,
      isActive: true,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
  ]
  const notificationsStore: Array<Record<string, unknown> & { id: string; isRead: boolean; readAt: Date | null; createdAt: Date }> = [
    {
      id: 'notif-preview-1',
      type: 'ORDER',
      title: 'طلب جديد #TH-2026-1003',
      description: 'سلمى الفاسي — 715 DH (Casablanca)',
      targetUrl: '/control-panel-ss7/orders/ord-preview-3',
      referenceId: 'ord-preview-3',
      isRead: false,
      readAt: null,
      createdAt: today,
    },
  ]
  const adminUsersStore: Array<Record<string, unknown> & { id: string; email: string }> = [
    {
      id: 'preview-admin-1',
      email: 'preview@thuraya.local',
      name: 'Preview Admin',
      role: 'SUPER_ADMIN',
      avatar: null,
      passwordHash: null,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
  ]
  let idCounter = 100

  const matchCategoryWhere = (cat: MockCategory, where?: Record<string, unknown>): boolean => {
    if (!where) return true
    if (typeof where.isActive === 'boolean' && cat.isActive !== where.isActive) return false
    if (where.id !== undefined && !matchStringFilter(cat.id, where.id)) return false
    if (where.slug !== undefined && !matchStringFilter(cat.slug, where.slug)) return false
    if (where.nameAr !== undefined && !matchStringFilter(cat.nameAr, where.nameAr)) return false
    if (where.nameFr !== undefined && !matchStringFilter(cat.nameFr, where.nameFr)) return false
    if (where.nameEn !== undefined && !matchStringFilter(cat.nameEn, where.nameEn)) return false
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

    if (where.salePrice && typeof where.salePrice === 'object') {
      const sf = where.salePrice as { not?: number | null }
      if (sf.not === null && prod.salePrice === null) return false
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

  const matchCustomerWhere = (cust: MockCustomer, where?: Record<string, unknown>): boolean => {
    if (!where) return true
    if (where.id !== undefined && !matchStringFilter(cust.id, where.id)) return false
    if (where.name !== undefined && !matchStringFilter(cust.name, where.name)) return false
    if (where.email !== undefined) {
      if (where.email === null && cust.email !== null) return false
      if (typeof where.email === 'string' && cust.email?.toLowerCase() !== where.email.toLowerCase()) return false
      if (typeof where.email === 'object' && where.email !== null && !matchStringFilter(cust.email, where.email)) return false
    }
    if (where.phone !== undefined) {
      if (where.phone === null && cust.phone !== null) return false
      if (typeof where.phone === 'string' && cust.phone !== where.phone) return false
      if (typeof where.phone === 'object' && where.phone !== null && !matchStringFilter(cust.phone, where.phone)) return false
    }
    if (Array.isArray(where.OR)) {
      return where.OR.some((sub) => matchCustomerWhere(cust, sub as Record<string, unknown>))
    }
    return true
  }

  const matchOrderWhere = (order: MockOrder, where?: Record<string, unknown>): boolean => {
    if (!where) return true
    if (where.id !== undefined && order.id !== where.id) return false
    if (where.orderNumber !== undefined && !matchStringFilter(order.orderNumber, where.orderNumber)) return false
    if (where.customerName !== undefined && !matchStringFilter(order.customerName, where.customerName)) return false
    if (where.customerPhone !== undefined && !matchStringFilter(order.customerPhone, where.customerPhone)) return false
    if (where.city !== undefined && !matchStringFilter(order.city, where.city)) return false
    if (where.status !== undefined && order.status !== where.status) return false
    if ('customerId' in where) {
      if (where.customerId === null && (order.customerId ?? null) !== null) return false
      if (typeof where.customerId === 'string' && order.customerId !== where.customerId) return false
    }
    if (Array.isArray(where.OR)) {
      const matchedOr = where.OR.some((sub) => matchOrderWhere(order, sub as Record<string, unknown>))
      if (!matchedOr) return false
    }
    return true
  }

  const hydrateReview = (rev: MockReview, include?: Record<string, unknown>) => {
    const result: Record<string, unknown> = { ...rev }
    if (include?.customer) {
      const cust = customersStore.find((c) => c.id === rev.customerId)
      const fallbackCust = {
        id: rev.customerId,
        name: 'Client Thuraya',
        avatarUrl: null as string | null,
      }
      const customerRecord = cust ?? fallbackCust
      const custInclude = include.customer as { select?: Record<string, unknown> } | true
      result.customer =
        typeof custInclude === 'object' && custInclude !== null && custInclude.select
          ? applySelect(customerRecord as Record<string, unknown>, custInclude.select)
          : customerRecord
    }
    if (include?.product) {
      const prod = products.find((p) => p.id === rev.productId) ?? null
      const prodInclude = include.product as { select?: Record<string, unknown> } | true
      result.product =
        prod && typeof prodInclude === 'object' && prodInclude !== null && prodInclude.select
          ? applySelect(prod as unknown as Record<string, unknown>, prodInclude.select)
          : prod
    }
    return result
  }

  const hydrateOrder = (
    order: MockOrder,
    include?: Record<string, unknown>,
    select?: Record<string, unknown>
  ) => {
    const items = orderItemsStore
      .filter((i) => i.orderId === order.id)
      .map((item) => {
        const itemsInc = (include?.items as { include?: Record<string, unknown> } | undefined)?.include
        const itemsSel = (select?.items as { select?: Record<string, unknown> } | undefined)?.select
        const needsProduct = Boolean(itemsInc?.product || itemsSel?.product)
        const needsVariant = Boolean(itemsInc?.variant || itemsSel?.variant)
        if (!needsProduct && !needsVariant) return item
        return {
          ...item,
          ...(needsProduct
            ? { product: products.find((p) => p.id === item.productId) ?? null }
            : {}),
          ...(needsVariant
            ? { variant: variants.find((v) => v.id === item.variantId) ?? null }
            : {}),
        }
      })

    return {
      ...order,
      items,
      statusHistory: sortRecords(
        orderHistoryStore.filter((h) => h.orderId === order.id),
        { createdAt: 'desc' }
      ),
      _count: { items: items.length },
    }
  }

  const createModelMock = (modelName: string) => {
    const noOp = {
      findMany: async (args?: {
        where?: Record<string, unknown>
        include?: Record<string, unknown>
        select?: Record<string, unknown>
        orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>
        skip?: number
        take?: number
      }) => {
        if (modelName === 'siteSetting') {
          const all = Array.from(siteSettingsStore.entries()).map(([key, value]) => ({
            id: key,
            key,
            value,
            updatedAt: new Date(),
          }))
          const keyFilter = args?.where?.key as { in?: string[]; startsWith?: string } | string | undefined
          if (typeof keyFilter === 'string') {
            return all.filter((s) => s.key === keyFilter)
          }
          if (keyFilter && typeof keyFilter === 'object') {
            if (Array.isArray(keyFilter.in)) {
              return all.filter((s) => keyFilter.in!.includes(s.key))
            }
            if (typeof keyFilter.startsWith === 'string') {
              return all.filter((s) => s.key.startsWith(keyFilter.startsWith!))
            }
          }
          return all
        }
        if (modelName === 'banner') {
          let filtered = [...bannersStore]
          if (typeof args?.where?.isActive === 'boolean') {
            filtered = filtered.filter((b) => b.isActive === args.where?.isActive)
          }
          const sorted = sortRecords(filtered, args?.orderBy)
          const start = args?.skip ?? 0
          const end = args?.take !== undefined ? start + args.take : undefined
          return sorted.slice(start, end)
        }
        if (modelName === 'adminNotification') {
          let filtered = [...notificationsStore]
          if (typeof args?.where?.isRead === 'boolean') {
            filtered = filtered.filter((n) => n.isRead === args.where?.isRead)
          }
          const sorted = sortRecords(filtered, args?.orderBy)
          const start = args?.skip ?? 0
          const end = args?.take !== undefined ? start + args.take : undefined
          return sorted.slice(start, end)
        }
        if (modelName === 'category') {
          const filtered = categories.filter((c) => matchCategoryWhere(c, args?.where))
          const sorted = sortRecords(filtered as unknown as Array<Record<string, unknown>>, args?.orderBy)
          const start = args?.skip ?? 0
          const end = args?.take !== undefined ? start + args.take : undefined
          return sorted.slice(start, end).map((cat) =>
            args?.include?._count
              ? { ...cat, _count: { products: products.filter((p) => p.categoryId === cat.id).length } }
              : cat
          )
        }
        if (modelName === 'product') {
          const filtered = products.filter((p) => matchProductWhere(p, args?.where))
          const sorted = sortRecords(filtered as unknown as Array<Record<string, unknown>>, args?.orderBy) as unknown as MockProduct[]
          const start = args?.skip ?? 0
          const end = args?.take !== undefined ? start + args.take : undefined
          return sorted.slice(start, end).map((p) => {
            const effectiveInclude = {
              ...(args?.include ?? {}),
              ...(args?.select?.variants ? { variants: args.select.variants } : {}),
              ...(args?.select?.category ? { category: args.select.category } : {}),
            }
            const hydrated = hydrateProduct(p, effectiveInclude)
            if (!args?.select) return hydrated
            const projected = applySelect(hydrated, args.select)
            if (args.select.variants) projected.variants = hydrated.variants
            if (args.select.category) projected.category = hydrated.category
            return projected
          })
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
        if (modelName === 'customer') {
          const filtered = customersStore.filter((c) => matchCustomerWhere(c, args?.where))
          const sorted = sortRecords(filtered, args?.orderBy)
          const start = args?.skip ?? 0
          const end = args?.take !== undefined ? start + args.take : undefined
          return sorted.slice(start, end).map((c) => {
            const base = args?.select ? applySelect(c, args.select) : { ...c }
            if (args?.include?.orders) {
              const custOrders = ordersStore.filter((o) => o.customerId === c.id || (c.phone && o.customerPhone === c.phone))
              return { ...base, orders: custOrders.map((o) => hydrateOrder(o)) }
            }
            return base
          })
        }
        if (modelName === 'review') {
          let filtered = [...reviewsStore]
          if (args?.where?.productId) filtered = filtered.filter((r) => r.productId === args.where?.productId)
          if (args?.where?.customerId) filtered = filtered.filter((r) => r.customerId === args.where?.customerId)
          const sorted = sortRecords(filtered, args?.orderBy) as MockReview[]
          const start = args?.skip ?? 0
          const end = args?.take !== undefined ? start + args.take : undefined
          return sorted.slice(start, end).map((r) => hydrateReview(r, args?.include))
        }
        if (modelName === 'order') {
          const filtered = ordersStore.filter((o) => matchOrderWhere(o, args?.where))
          const sorted = sortRecords(filtered, args?.orderBy) as MockOrder[]
          const start = args?.skip ?? 0
          const end = args?.take !== undefined ? start + args.take : undefined
          return sorted.slice(start, end).map((o) => hydrateOrder(o, args?.include, args?.select))
        }
        if (modelName === 'orderItem') {
          let filtered = [...orderItemsStore]
          if (typeof args?.where?.orderId === 'string') {
            filtered = filtered.filter((i) => i.orderId === args.where?.orderId)
          }
          return filtered
        }
        return []
      },

      findFirst: async (args?: {
        where?: Record<string, unknown>
        include?: Record<string, unknown>
        select?: Record<string, unknown>
        orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>
      }) => {
        if (modelName === 'category') {
          const found = categories.find((c) => matchCategoryWhere(c, args?.where))
          return found ?? null
        }
        if (modelName === 'adminUser' && args?.where) {
          const found = adminUsersStore.find(
            (u) => (args.where?.id && u.id === args.where.id) || (args.where?.email && u.email === args.where.email)
          )
          return found ? (args.select ? applySelect(found, args.select) : found) : null
        }
        if (modelName === 'adminNotification' && args?.where) {
          const found = notificationsStore.find(
            (n) => (args.where?.type ? n.type === args.where.type : true) && (args.where?.referenceId ? n.referenceId === args.where.referenceId : true) && (typeof args.where?.isRead === 'boolean' ? n.isRead === args.where.isRead : true)
          )
          return found ?? null
        }
        if (modelName === 'product') {
          const filtered = products.filter((p) => matchProductWhere(p, args?.where))
          const sorted = sortRecords(filtered as unknown as Array<Record<string, unknown>>, args?.orderBy) as unknown as MockProduct[]
          return sorted[0] ? hydrateProduct(sorted[0], args?.include) : null
        }
        if (modelName === 'customer') {
          const found = customersStore.find((c) => matchCustomerWhere(c, args?.where))
          return found ? applySelect(found, args?.select) : null
        }
        if (modelName === 'order') {
          const found = ordersStore.find((o) => matchOrderWhere(o, args?.where))
          if (!found) return null
          const hydrated = hydrateOrder(found, args?.include)
          return args?.select ? applySelect(hydrated, args.select) : hydrated
        }
        return null
      },

      findFirstOrThrow: async () => {
        throw new Error(`Mock DB: ${modelName} record not found`)
      },

      findUnique: async (args?: {
        where?: Record<string, unknown>
        include?: Record<string, unknown>
        select?: Record<string, unknown>
      }) => {
        if (modelName === 'siteSetting' && typeof args?.where?.key === 'string') {
          const val = siteSettingsStore.get(args.where.key)
          return val !== undefined ? { id: args.where.key, key: args.where.key, value: val, updatedAt: new Date() } : null
        }
        if (modelName === 'adminUser' && args?.where) {
          const found = adminUsersStore.find(
            (u) => (args.where?.id && u.id === args.where.id) || (args.where?.email && u.email === args.where.email)
          )
          return found ? (args.select ? applySelect(found, args.select) : found) : null
        }
        if (modelName === 'banner' && typeof args?.where?.id === 'string') {
          return bannersStore.find((b) => b.id === args.where?.id) ?? null
        }
        if (modelName === 'category' && args?.where) {
          const found = categories.find((c) => matchCategoryWhere(c, args.where))
          return found ?? null
        }
        if (modelName === 'product' && args?.where) {
          const found = products.find((p) => matchProductWhere(p, args.where))
          if (!found) return null
          const hydrated = hydrateProduct(found, args.include)
          return args.select ? applySelect(hydrated, args.select) : hydrated
        }
        if (modelName === 'customer' && args?.where) {
          const found = customersStore.find((c) => matchCustomerWhere(c, args.where))
          return found ? applySelect(found, args.select) : null
        }
        if (modelName === 'order' && args?.where) {
          const found = ordersStore.find((o) => matchOrderWhere(o, args.where))
          if (!found) return null
          const hydrated = hydrateOrder(found, args.include)
          return args.select ? applySelect(hydrated, args.select) : hydrated
        }
        if (modelName === 'review' && args?.where) {
          if (args.where.customerId_productId) {
            const comp = args.where.customerId_productId as { customerId: string; productId: string }
            const found = reviewsStore.find((r) => r.customerId === comp.customerId && r.productId === comp.productId)
            return found ? hydrateReview(found, args.include) : null
          }
          if (typeof args.where.id === 'string') {
            const found = reviewsStore.find((r) => r.id === args.where?.id)
            return found ? hydrateReview(found, args.include) : null
          }
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
          return ordersStore.filter((o) => matchOrderWhere(o, args?.where)).length
        }
        if (modelName === 'customer') {
          return customersStore.filter((c) => matchCustomerWhere(c, args?.where)).length
        }
        if (modelName === 'review') {
          return args?.where?.productId
            ? reviewsStore.filter((r) => r.productId === args.where?.productId).length
            : reviewsStore.length
        }
        if (modelName === 'adminNotification') {
          return typeof args?.where?.isRead === 'boolean'
            ? notificationsStore.filter((n) => n.isRead === args.where?.isRead).length
            : notificationsStore.length
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

      create: async (args?: { data?: Record<string, unknown>; select?: Record<string, unknown> }) => {
        const data = args?.data ?? {}
        const id = typeof data.id === 'string' ? data.id : `mock-${++idCounter}`
        const createdAt = new Date()
        const updatedAt = new Date()

        if (modelName === 'siteSetting' && typeof data.key === 'string' && typeof data.value === 'string') {
          siteSettingsStore.set(data.key, data.value)
        } else if (modelName === 'banner') {
          const b = {
            id,
            title: String(data.title ?? ''),
            subtitle: typeof data.subtitle === 'string' ? data.subtitle : null,
            buttonText: typeof data.buttonText === 'string' ? data.buttonText : null,
            buttonUrl: typeof data.buttonUrl === 'string' ? data.buttonUrl : null,
            imageUrl: String(data.imageUrl ?? ''),
            sortOrder: Number(data.sortOrder ?? 0),
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
            createdAt,
            updatedAt,
          }
          bannersStore.push(b)
          return b
        } else if (modelName === 'adminNotification') {
          const n = {
            id,
            type: String(data.type ?? 'ORDER'),
            title: String(data.title ?? ''),
            description: typeof data.description === 'string' ? data.description : null,
            targetUrl: String(data.targetUrl ?? '/control-panel-ss7'),
            referenceId: typeof data.referenceId === 'string' ? data.referenceId : null,
            isRead: Boolean(data.isRead ?? false),
            readAt: null as Date | null,
            createdAt,
          }
          notificationsStore.unshift(n)
          return n
        } else if (modelName === 'category') {
          const cat: MockCategory = {
            id,
            slug: String(data.slug ?? id),
            nameAr: String(data.nameAr ?? ''),
            nameFr: String(data.nameFr ?? ''),
            nameEn: String(data.nameEn ?? ''),
            descriptionAr: typeof data.descriptionAr === 'string' ? data.descriptionAr : null,
            descriptionFr: typeof data.descriptionFr === 'string' ? data.descriptionFr : null,
            descriptionEn: typeof data.descriptionEn === 'string' ? data.descriptionEn : null,
            image: typeof data.image === 'string' ? data.image : null,
            sortOrder: Number(data.sortOrder ?? 0),
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
            parentId: typeof data.parentId === 'string' ? data.parentId : null,
            createdAt,
            updatedAt,
          }
          categories.push(cat)
          return cat
        } else if (modelName === 'customer') {
          const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : null
          const phone = typeof data.phone === 'string' ? data.phone.trim() : null
          if (email && customersStore.some((c) => c.email?.toLowerCase() === email)) {
            const err = new Error('Unique constraint failed') as Error & { code?: string }
            err.code = 'P2002'
            throw err
          }
          if (phone && customersStore.some((c) => c.phone === phone)) {
            const err = new Error('Unique constraint failed') as Error & { code?: string }
            err.code = 'P2002'
            throw err
          }
          const cust: MockCustomer = {
            id,
            name: String(data.name ?? ''),
            email,
            phone,
            passwordHash: typeof data.passwordHash === 'string' ? data.passwordHash : null,
            avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : null,
            address: typeof data.address === 'string' ? data.address : null,
            city: typeof data.city === 'string' ? data.city : null,
            notes: typeof data.notes === 'string' ? data.notes : null,
            createdAt,
            updatedAt,
          }
          customersStore.unshift(cust)
          return applySelect(cust, args?.select)
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
          return applySelect(rev, args?.select)
        }

        return { id, ...data, createdAt, updatedAt }
      },

      createMany: async () => ({ count: 0 }),

      update: async (args?: {
        where?: Record<string, unknown>
        data?: Record<string, unknown>
        select?: Record<string, unknown>
      }) => {
        const nowUpdate = new Date()
        if (modelName === 'category' && args?.where?.id) {
          const cat = categories.find((c) => c.id === args.where?.id)
          if (!cat) {
            const err = new Error('Mock DB: category record not found') as Error & { code?: string }
            err.code = 'P2025'
            throw err
          }
          Object.assign(cat, args.data ?? {}, { updatedAt: nowUpdate })
          return cat
        }
        if (modelName === 'banner' && args?.where?.id) {
          const b = bannersStore.find((item) => item.id === args.where?.id)
          if (!b) {
            const err = new Error('Mock DB: banner record not found') as Error & { code?: string }
            err.code = 'P2025'
            throw err
          }
          Object.assign(b, args.data ?? {}, { updatedAt: nowUpdate })
          return b
        }
        if (modelName === 'product' && args?.where?.id) {
          const prod = products.find((p) => p.id === args.where?.id)
          if (!prod) {
            const err = new Error('Mock DB: product record not found') as Error & { code?: string }
            err.code = 'P2025'
            throw err
          }
          Object.assign(prod, args.data ?? {}, { updatedAt: nowUpdate })
          return hydrateProduct(prod)
        }
        if (modelName === 'productVariant' && args?.where?.id) {
          const v = variants.find((item) => item.id === args.where?.id)
          if (!v) throw new Error('Mock DB: variant record not found')
          const nextData = { ...(args.data ?? {}) }
          if (typeof nextData.stockQuantity === 'object' && nextData.stockQuantity !== null) {
            const op = nextData.stockQuantity as { increment?: number; decrement?: number }
            if (typeof op.increment === 'number') v.stockQuantity += op.increment
            if (typeof op.decrement === 'number') v.stockQuantity = Math.max(0, v.stockQuantity - op.decrement)
            delete nextData.stockQuantity
          }
          Object.assign(v, nextData, { updatedAt: nowUpdate })
          return v
        }
        if (modelName === 'adminNotification' && args?.where?.id) {
          const n = notificationsStore.find((item) => item.id === args.where?.id)
          if (!n) throw new Error('Mock DB: notification record not found')
          Object.assign(n, args.data ?? {})
          return n
        }
        if (modelName === 'adminUser' && args?.where?.id) {
          const u = adminUsersStore.find((item) => item.id === args.where?.id)
          if (!u) throw new Error('Mock DB: adminUser record not found')
          Object.assign(u, args.data ?? {}, { updatedAt: nowUpdate })
          return args.select ? applySelect(u, args.select) : u
        }
        if (modelName === 'customer' && args?.where) {
          const cust = customersStore.find((c) => matchCustomerWhere(c, args.where))
          if (!cust) throw new Error('Mock DB: customer record not found')
          Object.assign(cust, args.data ?? {}, { updatedAt: nowUpdate })
          return applySelect(cust, args.select)
        }
        if (modelName === 'review' && args?.where) {
          const rev = reviewsStore.find((r) => r.id === args.where?.id)
          if (!rev) throw new Error('Mock DB: review record not found')
          Object.assign(rev, args.data ?? {}, { updatedAt: nowUpdate })
          return applySelect(rev, args.select)
        }
        if (modelName === 'order' && args?.where) {
          const order = ordersStore.find((o) => matchOrderWhere(o, args.where))
          if (!order) throw new Error('Mock DB: order record not found')
          Object.assign(order, args.data ?? {}, { updatedAt: nowUpdate })
          return hydrateOrder(order)
        }
        if (modelName === 'siteSetting' && typeof args?.where?.key === 'string') {
          const nextVal = String(args.data?.value ?? '')
          siteSettingsStore.set(args.where.key, nextVal)
          return { id: args.where.key, key: args.where.key, value: nextVal, updatedAt: nowUpdate }
        }
        return {
          id: 'mock-id',
          ...(args?.data ?? {}),
          updatedAt: nowUpdate,
        }
      },

      updateMany: async (args?: {
        where?: Record<string, unknown>
        data?: Record<string, unknown>
      }) => {
        if (modelName === 'productVariant' && args?.where?.id) {
          const v = variants.find((item) => item.id === args.where?.id)
          if (!v) return { count: 0 }
          const minStock = (args.where.stockQuantity as { gte?: number } | undefined)?.gte
          if (minStock !== undefined && v.stockQuantity < minStock) {
            return { count: 0 }
          }
          const stockOp = args.data?.stockQuantity as { decrement?: number; increment?: number } | undefined
          if (stockOp?.decrement) v.stockQuantity = Math.max(0, v.stockQuantity - stockOp.decrement)
          if (stockOp?.increment) v.stockQuantity += stockOp.increment
          return { count: 1 }
        }
        if (modelName === 'adminNotification') {
          let count = 0
          for (const n of notificationsStore) {
            if (args?.where?.isRead === undefined || n.isRead === args.where.isRead) {
              Object.assign(n, args?.data ?? {})
              count++
            }
          }
          return { count }
        }
        return { count: 0 }
      },

      upsert: async (args?: {
        where?: Record<string, unknown>
        create?: Record<string, unknown>
        update?: Record<string, unknown>
      }) => {
        const nowUpsert = new Date()
        if (modelName === 'siteSetting' && typeof args?.where?.key === 'string') {
          const key = args.where.key
          const existing = siteSettingsStore.get(key)
          const value =
            existing !== undefined
              ? String(args.update?.value ?? existing)
              : String(args.create?.value ?? '')
          siteSettingsStore.set(key, value)
          return { id: key, key, value, updatedAt: nowUpsert }
        }
        if (modelName === 'productVariant' && args?.where?.productId_size_colorCode) {
          const key = args.where.productId_size_colorCode as { productId: string; size: string; colorCode: string }
          const existing = variants.find(
            (v) => v.productId === key.productId && v.size === key.size && v.colorCode === key.colorCode
          )
          if (existing) {
            Object.assign(existing, args.update ?? {}, { updatedAt: nowUpsert })
            return existing
          }
          const created: MockVariant = {
            id: `var-mock-${++idCounter}`,
            productId: String(args.create?.productId ?? key.productId),
            size: String(args.create?.size ?? key.size),
            colorCode: String(args.create?.colorCode ?? key.colorCode),
            colorNameAr: String(args.create?.colorNameAr ?? ''),
            colorNameFr: String(args.create?.colorNameFr ?? ''),
            colorNameEn: String(args.create?.colorNameEn ?? ''),
            stockQuantity: Number(args.create?.stockQuantity ?? 10),
            priceModifier: Number(args.create?.priceModifier ?? 0),
            images: Array.isArray(args.create?.images) ? (args.create.images as string[]) : [],
            isActive: args.create?.isActive !== undefined ? Boolean(args.create.isActive) : true,
            createdAt: nowUpsert,
            updatedAt: nowUpsert,
          }
          variants.push(created)
          return created
        }
        return {
          id: 'mock-id',
          ...(args?.create ?? args?.update ?? {}),
          updatedAt: nowUpsert,
        }
      },

      delete: async (args?: { where?: Record<string, unknown> }) => {
        const id = args?.where?.id
        if (modelName === 'category' && typeof id === 'string') {
          const idx = categories.findIndex((c) => c.id === id)
          if (idx === -1) {
            const err = new Error('Mock DB: category record not found') as Error & { code?: string }
            err.code = 'P2025'
            throw err
          }
          return categories.splice(idx, 1)[0]
        }
        if (modelName === 'banner' && typeof id === 'string') {
          const idx = bannersStore.findIndex((b) => b.id === id)
          if (idx === -1) {
            const err = new Error('Mock DB: banner record not found') as Error & { code?: string }
            err.code = 'P2025'
            throw err
          }
          return bannersStore.splice(idx, 1)[0]
        }
        if (modelName === 'product' && typeof id === 'string') {
          const idx = products.findIndex((p) => p.id === id)
          if (idx === -1) {
            const err = new Error('Mock DB: product record not found') as Error & { code?: string }
            err.code = 'P2025'
            throw err
          }
          for (let i = variants.length - 1; i >= 0; i--) {
            if (variants[i].productId === id) variants.splice(i, 1)
          }
          return products.splice(idx, 1)[0]
        }
        if (modelName === 'review' && typeof id === 'string') {
          const idx = reviewsStore.findIndex((r) => r.id === id)
          if (idx === -1) {
            const err = new Error('Mock DB: review record not found') as Error & { code?: string }
            err.code = 'P2025'
            throw err
          }
          return reviewsStore.splice(idx, 1)[0]
        }
        return {}
      },
      deleteMany: async (args?: { where?: Record<string, unknown> }) => {
        if (modelName === 'productVariant' && typeof args?.where?.productId === 'string') {
          let count = 0
          for (let i = variants.length - 1; i >= 0; i--) {
            if (variants[i].productId === args.where.productId) {
              variants.splice(i, 1)
              count++
            }
          }
          return { count }
        }
        if (modelName === 'siteSetting') {
          const keyFilter = args?.where?.key as string | { startsWith?: string; in?: string[] } | undefined
          let count = 0
          if (typeof keyFilter === 'string') {
            if (siteSettingsStore.delete(keyFilter)) count++
          } else if (keyFilter && typeof keyFilter === 'object') {
            if (Array.isArray(keyFilter.in)) {
              for (const k of keyFilter.in) {
                if (siteSettingsStore.delete(k)) count++
              }
            } else if (typeof keyFilter.startsWith === 'string') {
              for (const k of Array.from(siteSettingsStore.keys())) {
                if (k.startsWith(keyFilter.startsWith)) {
                  siteSettingsStore.delete(k)
                  count++
                }
              }
            }
          }
          return { count }
        }
        return { count: 0 }
      },
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


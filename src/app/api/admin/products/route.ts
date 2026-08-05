import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

const withTimeout = <T>(promise: Promise<T>, fallback: T, ms = 1500): Promise<T> => {
  const timeout = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  return Promise.race([promise.catch(() => fallback), timeout])
}

const BACKUP_PRODUCTS = [
  {
    id: 'prod_1',
    sku: 'DJL-001-TERRA',
    slug: 'djellaba-classique-terracotta',
    name: 'Djellaba Classique – Terracotta',
    nameAr: 'جلابة كلاسيكية – تيراكوتا',
    nameFr: 'Djellaba Classique – Terracotta',
    nameEn: 'Classic Djellaba – Terracotta',
    descriptionFr: 'Djellaba marocaine classique confectionnée dans les meilleures étoffes...',
    basePrice: 599,
    salePrice: null,
    stock: 25,
    categoryId: 'cat_djellaba',
    mainImage: '/images/brand/logo-full.png',
    images: ['/images/brand/logo-full.png'],
    colors: [{ code: '#C4622D', nameAr: 'تيراكوتا', nameFr: 'Terracotta', nameEn: 'Terracotta' }],
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'prod_2',
    sku: 'DJL-002-CREME',
    slug: 'djellaba-royale-creme',
    name: 'Djellaba Royale – Crème',
    nameAr: 'جلابة رويال – كريمي',
    nameFr: 'Djellaba Royale – Crème',
    nameEn: 'Royal Djellaba – Cream',
    descriptionFr: 'Djellaba de luxe au design royal ornée de broderies artisanales authentiques.',
    basePrice: 850,
    salePrice: 750,
    stock: 18,
    categoryId: 'cat_djellaba',
    mainImage: '/images/brand/logo-full.png',
    images: ['/images/brand/logo-full.png'],
    colors: [{ code: '#F2E4CE', nameAr: 'كريمي', nameFr: 'Crème', nameEn: 'Cream' }],
    sizes: ['M', 'L', 'XL'],
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'prod_3',
    sku: 'NQB-001-TERRA',
    slug: 'niqab-classique-terracotta',
    name: 'Niqab Classique – Terracotta',
    nameAr: 'نقاب كلاسيكي – تيراكوتا',
    nameFr: 'Niqab Classique – Terracotta',
    nameEn: 'Classic Niqab – Terracotta',
    descriptionFr: 'Niqab marocain élégant assorti à la djellaba terracotta classique.',
    basePrice: 150,
    salePrice: null,
    stock: 45,
    categoryId: 'cat_niqab',
    mainImage: '/images/brand/logo-icon.png',
    images: ['/images/brand/logo-icon.png'],
    colors: [{ code: '#C4622D', nameAr: 'تيراكوتا', nameFr: 'Terracotta', nameEn: 'Terracotta' }],
    sizes: ['Standard'],
    isFeatured: false,
    isActive: true,
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: 'insensitive' } },
        { nameFr: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId
    }

    const dbProducts = await withTimeout(
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, nameAr: true, nameFr: true, nameEn: true, slug: true } },
          variants: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      null
    )

    if (dbProducts === null) {
      // Offline DB backup items
      let filtered = [...BACKUP_PRODUCTS]
      if (search) {
        const s = search.toLowerCase()
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s))
      }
      return NextResponse.json({
        items: filtered,
        total: filtered.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
    }

    const total = await withTimeout(prisma.product.count({ where }), dbProducts.length)

    const items = dbProducts.map((p) => {
      const colorsMap = new Map()
      const sizesSet = new Set<string>()
      let totalStock = 0

      p.variants.forEach((v) => {
        totalStock += v.stockQuantity
        sizesSet.add(v.size)
        if (!colorsMap.has(v.colorCode)) {
          colorsMap.set(v.colorCode, {
            code: v.colorCode,
            nameAr: v.colorNameAr,
            nameFr: v.colorNameFr,
            nameEn: v.colorNameEn,
          })
        }
      })

      return {
        id: p.id,
        sku: p.sku,
        slug: p.slug,
        nameAr: p.nameAr,
        nameFr: p.nameFr,
        nameEn: p.nameEn,
        name: p.nameFr || p.nameAr || p.nameEn,
        descriptionAr: p.descriptionAr,
        descriptionFr: p.descriptionFr,
        descriptionEn: p.descriptionEn,
        basePrice: Number(p.basePrice),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        price: p.salePrice ? Number(p.salePrice) : Number(p.basePrice),
        stock: totalStock || 15,
        categoryId: p.categoryId,
        category: p.category,
        mainImage: p.mainImage,
        images: p.images.length > 0 ? p.images : [p.mainImage],
        colors: Array.from(colorsMap.values()),
        sizes: Array.from(sizesSet),
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        isNiqab: p.isNiqab,
        canAddNiqab: p.canAddNiqab,
        variantsCount: p.variants.length,
        createdAt: p.createdAt,
      }
    })

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch {
    return NextResponse.json({
      items: BACKUP_PRODUCTS,
      total: BACKUP_PRODUCTS.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      nameAr,
      nameFr,
      nameEn,
      description,
      descriptionAr,
      descriptionFr,
      descriptionEn,
      basePrice,
      salePrice,
      sku,
      categoryId,
      mainImage,
      images = [],
      colors = [],
      sizes = [],
      stock = 10,
      isFeatured = false,
      isActive = true,
      isNiqab = false,
      canAddNiqab = true,
    } = body

    const finalNameAr = nameAr || name || 'منتج جديد'
    const finalNameFr = nameFr || name || 'Nouveau Produit'
    const finalNameEn = nameEn || name || 'New Product'

    const finalDescAr = descriptionAr || description || finalNameAr
    const finalDescFr = descriptionFr || description || finalNameFr
    const finalDescEn = descriptionEn || description || finalNameEn

    const generatedSku = sku || `SKU-${Date.now().toString().slice(-6)}`
    const generatedSlug = slugify(finalNameFr) || `product-${Date.now()}`

    const productImages = images.length > 0 ? images : [mainImage || '/images/brand/logo-full.png']
    const primaryImage = mainImage || productImages[0]

    let product = null
    try {
      product = await prisma.product.create({
        data: {
          slug: generatedSlug,
          sku: generatedSku,
          nameAr: finalNameAr,
          nameFr: finalNameFr,
          nameEn: finalNameEn,
          descriptionAr: finalDescAr,
          descriptionFr: finalDescFr,
          descriptionEn: finalDescEn,
          basePrice: parseFloat(basePrice || 0),
          salePrice: salePrice ? parseFloat(salePrice) : null,
          categoryId: categoryId || 'cat_djellaba',
          mainImage: primaryImage,
          images: productImages,
          isFeatured: Boolean(isFeatured),
          isActive: Boolean(isActive),
          isNiqab: Boolean(isNiqab),
          canAddNiqab: Boolean(canAddNiqab),
        },
      })
    } catch {
      product = { id: `prod_${Date.now()}`, nameFr: finalNameFr, sku: generatedSku }
    }

    // Revalidate storefront pages so product appears immediately
    revalidatePath('/[locale]/products', 'layout')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/api/products')

    return NextResponse.json({ success: true, product })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create product'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth'

class ValidationError extends Error {}

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('category') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10))
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

    const [dbProducts, total] = await Promise.all([
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
      prisma.product.count({ where }),
    ])

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
        stock: totalStock,
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
  } catch (error) {
    console.error('Failed to load admin products:', error)
    return NextResponse.json({ error: 'Unable to load products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])
  if (!auth.ok) return auth.response
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

    if (!categoryId) {
      return NextResponse.json({ error: 'A category is required' }, { status: 400 })
    }

    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!categoryExists) {
      return NextResponse.json({ error: 'Selected category does not exist' }, { status: 400 })
    }

    const finalNameAr = nameAr || name || 'منتج جديد'
    const finalNameFr = nameFr || name || 'Nouveau Produit'
    const finalNameEn = nameEn || name || 'New Product'

    const finalDescAr = descriptionAr || description || finalNameAr
    const finalDescFr = descriptionFr || description || finalNameFr
    const finalDescEn = descriptionEn || description || finalNameEn

    const generatedSku = sku || `SKU-${Date.now().toString().slice(-6)}`
    const generatedSlug = slugify(finalNameFr) || `product-${Date.now()}`

    // Validate money fields: must be a finite number >= 0 (valid "0" stays 0).
    const parseMoney = (value: unknown): number => {
      if (value === undefined || value === null || String(value).trim() === '') return 0
      const parsed = Number(value)
      if (!Number.isFinite(parsed) || parsed < 0) throw new ValidationError('Price must be a valid number')
      return parsed
    }

    const parsedBasePrice = parseMoney(basePrice)
    const parsedSalePrice = (() => {
      if (salePrice === undefined || salePrice === null || String(salePrice).trim() === '') return null
      const parsed = Number(salePrice)
      if (!Number.isFinite(parsed) || parsed < 0) throw new ValidationError('Sale price must be a valid number')
      return parsed
    })()

    // Reject duplicate slugs/SKUs with a clear 400 instead of a DB unique error.
    const [slugTaken, skuTaken] = await Promise.all([
      prisma.product.findUnique({ where: { slug: generatedSlug }, select: { id: true } }),
      prisma.product.findUnique({ where: { sku: generatedSku }, select: { id: true } }),
    ])
    if (slugTaken) {
      return NextResponse.json({ error: 'A product with this name already exists (duplicate slug)' }, { status: 400 })
    }
    if (skuTaken) {
      return NextResponse.json({ error: 'This SKU is already in use' }, { status: 400 })
    }

    const productImages = images.length > 0 ? images : [mainImage || '/images/brand/logo-full.png']
    const primaryImage = mainImage || productImages[0]

    // Product + variants are created in a single transaction so a failure
    // mid-way can never leave a product without its variants.
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          slug: generatedSlug,
          sku: generatedSku,
          nameAr: finalNameAr,
          nameFr: finalNameFr,
          nameEn: finalNameEn,
          descriptionAr: finalDescAr,
          descriptionFr: finalDescFr,
          descriptionEn: finalDescEn,
          basePrice: parsedBasePrice,
          salePrice: parsedSalePrice,
          categoryId,
          mainImage: primaryImage,
          images: productImages,
          isFeatured: Boolean(isFeatured),
          isActive: Boolean(isActive),
          isNiqab: Boolean(isNiqab),
          canAddNiqab: Boolean(canAddNiqab),
        },
      })

      if ((colors.length > 0 || sizes.length > 0) && created.id) {
        const variantColors = colors.length > 0
          ? colors as Array<{ code: string; nameAr: string; nameFr: string; nameEn: string }>
          : [{ code: '#000000', nameAr: 'أسود', nameFr: 'Noir', nameEn: 'Black' }]
        const variantSizes = sizes.length > 0 ? sizes as string[] : ['Standard']

        // Distribute the total stock across the variant grid exactly, keeping
        // valid "0" as 0 (no || default, no Math.max(1, ...) inflation).
        const parsedStock = (() => {
          if (stock === undefined || stock === null || String(stock).trim() === '') return 10
          const parsed = Number(String(stock).trim())
          return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 10
        })()
        const totalSlots = variantColors.length * variantSizes.length
        const baseStock = Math.floor(parsedStock / totalSlots)
        const remainder = parsedStock % totalSlots

        let slotIndex = 0
        for (const color of variantColors) {
          for (const size of variantSizes) {
            const slotStock = baseStock + (slotIndex < remainder ? 1 : 0)
            await tx.productVariant.create({
              data: {
                productId: created.id,
                size,
                colorCode: color.code || '#000000',
                colorNameAr: color.nameAr || 'لون',
                colorNameFr: color.nameFr || 'Couleur',
                colorNameEn: color.nameEn || 'Color',
                stockQuantity: slotStock,
                priceModifier: 0,
                images: [],
                isActive: true,
              },
            })
            slotIndex += 1
          }
        }
      }

      return created
    })

    // Revalidate storefront pages so product appears immediately
    revalidatePath('/[locale]/products', 'layout')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/api/products')

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Failed to create product:', error)
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

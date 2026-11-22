import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth'
import { getColorNames } from '@/lib/color-names'
import { isNiqabIdentity } from '@/lib/category-config'
import { getCategoryConfig } from '@/lib/category-config.server'

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

      // Only active variants drive the admin list, so Admin matches both the
      // storefront and the admin detail (GET /api/admin/products/[id]). Variants
      // removed by a previous edit are still stored (isActive=false, to keep
      // order-item FKs) but must not resurface as colors/sizes/stock here.
      const activeVariants = p.variants.filter((v) => v.isActive)
      activeVariants.forEach((v) => {
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
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
    }

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
    } = body as {
      name?: string
      nameAr?: string
      nameFr?: string
      nameEn?: string
      description?: string
      descriptionAr?: string
      descriptionFr?: string
      descriptionEn?: string
      basePrice?: unknown
      salePrice?: unknown
      sku?: string
      categoryId?: string
      mainImage?: string
      images?: string[]
      colors?: Array<{ code?: string; nameAr?: string; nameFr?: string; nameEn?: string }>
      sizes?: string[]
      stock?: unknown
      isFeatured?: boolean
      isActive?: boolean
      isNiqab?: boolean
      canAddNiqab?: boolean
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'A category is required' }, { status: 400 })
    }

    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!categoryExists) {
      return NextResponse.json({ error: 'Selected category does not exist' }, { status: 400 })
    }

    const catConfig = await getCategoryConfig(categoryExists)
    const effectiveIsNiqab = isNiqabIdentity(categoryExists) || Boolean(isNiqab && catConfig.sizingMode === 'bundle_no_size' && isNiqabIdentity(categoryExists))
    const effectiveCanAddNiqab = effectiveIsNiqab ? false : Boolean(canAddNiqab)

    const rawAr = typeof nameAr === 'string' ? nameAr.trim() : ''
    const rawFr = typeof nameFr === 'string' ? nameFr.trim() : ''
    const rawEn = typeof nameEn === 'string' ? nameEn.trim() : ''
    const rawFallback = typeof name === 'string' ? name.trim() : ''
    const primaryName = rawFr || rawAr || rawEn || rawFallback

    if (!primaryName) {
      return NextResponse.json({ error: 'At least one product name is required' }, { status: 400 })
    }

    const finalNameAr = rawAr || rawFallback || primaryName
    const finalNameFr = rawFr || rawFallback || primaryName
    const finalNameEn = rawEn || rawFallback || primaryName

    const finalDescAr = (typeof descriptionAr === 'string' && descriptionAr.trim()) || (typeof description === 'string' && description.trim()) || finalNameAr
    const finalDescFr = (typeof descriptionFr === 'string' && descriptionFr.trim()) || (typeof description === 'string' && description.trim()) || finalNameFr
    const finalDescEn = (typeof descriptionEn === 'string' && descriptionEn.trim()) || (typeof description === 'string' && description.trim()) || finalNameEn

    const generatedSku = (typeof sku === 'string' && sku.trim()) || `SKU-${Date.now().toString().slice(-6)}`
    const generatedSlug = slugify(finalNameFr) || slugify(finalNameEn) || `product-${Date.now()}`

    const parseMoney = (value: unknown): number => {
      if (value === undefined || value === null || String(value).trim() === '') {
        throw new ValidationError('Base price is required')
      }
      const parsed = Number(value)
      if (!Number.isFinite(parsed) || parsed < 0) throw new ValidationError('Price must be a valid number')
      return parsed
    }

    const parsedBasePrice = parseMoney(basePrice)
    const parsedSalePrice = (() => {
      if (salePrice === undefined || salePrice === null || String(salePrice).trim() === '') return null
      const parsed = Number(salePrice)
      if (!Number.isFinite(parsed) || parsed < 0) throw new ValidationError('Sale price must be a valid number')
      if (parsed >= parsedBasePrice) throw new ValidationError('Sale price must be lower than base price')
      return parsed
    })()

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

    const cleanImages = Array.isArray(images) ? images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0) : []
    const cleanMain = typeof mainImage === 'string' && mainImage.trim() ? mainImage.trim() : ''
    const productImages = cleanImages.length > 0 ? cleanImages : [cleanMain || '/images/brand/logo-full.png']
    const primaryImage = cleanMain || productImages[0]

    const product = await prisma.$transaction(
      async (tx) => {
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
            isNiqab: effectiveIsNiqab,
            canAddNiqab: effectiveCanAddNiqab,
          },
        })

        // Deduplicate colors & honor category colorMode (single vs multi)
        type RawColorInput = { code?: string; nameAr?: string; nameFr?: string; nameEn?: string }
        const defaultCatColors: RawColorInput[] =
          catConfig.defaultColors.length > 0
            ? catConfig.defaultColors.map((hex) => ({ code: hex }))
            : [{ code: '#000000' }]
        const rawColors: RawColorInput[] =
          Array.isArray(colors) && colors.length > 0 ? colors : defaultCatColors

        const uniqueColorMap = new Map<string, { code: string; nameAr: string; nameFr: string; nameEn: string }>()
        for (const c of rawColors) {
          const rawCode = (c.code || '#000000').trim()
          const code = (rawCode.startsWith('#') ? rawCode : `#${rawCode}`).toUpperCase()
          if (!/^#[0-9A-F]{3,8}$/.test(code)) continue
          if (!uniqueColorMap.has(code)) {
            const fallbackNames = getColorNames(code)
            const nameArVal = c.nameAr?.trim()
            const nameFrVal = c.nameFr?.trim()
            const nameEnVal = c.nameEn?.trim()
            uniqueColorMap.set(code, {
              code,
              nameAr: nameArVal && nameArVal !== 'لون' ? nameArVal : fallbackNames.ar,
              nameFr: nameFrVal && nameFrVal.toLowerCase() !== 'couleur' ? nameFrVal : fallbackNames.fr,
              nameEn: nameEnVal && nameEnVal.toLowerCase() !== 'color' ? nameEnVal : fallbackNames.en,
            })
          }
        }
        if (uniqueColorMap.size === 0) {
          const fallbackNames = getColorNames('#000000')
          uniqueColorMap.set('#000000', {
            code: '#000000',
            nameAr: fallbackNames.ar,
            nameFr: fallbackNames.fr,
            nameEn: fallbackNames.en,
          })
        }
        const allParsedColors = Array.from(uniqueColorMap.values())
        const variantColors =
          catConfig.colorMode === 'single' ? allParsedColors.slice(0, 1) : allParsedColors

        // Honor category sizingMode & niqab identity
        const variantSizes = (() => {
          if (effectiveIsNiqab || catConfig.sizingMode === 'bundle_no_size') {
            return ['Standard']
          }
          const incoming = Array.isArray(sizes)
            ? Array.from(new Set(sizes.map((s) => String(s).trim()).filter(Boolean)))
            : []
          if (incoming.length > 0) return incoming
          if (catConfig.defaultSizes.length > 0) return [...catConfig.defaultSizes]
          return catConfig.sizingMode === 'standard' ? ['Standard'] : ['S', 'M', 'L', 'XL']
        })()

        const parsedStock = (() => {
          if (stock === undefined || stock === null || String(stock).trim() === '') return 10
          const parsed = Number(String(stock).trim())
          if (!Number.isFinite(parsed) || parsed < 0) throw new ValidationError('Stock quantity must be a non-negative number')
          return Math.floor(parsed)
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
                colorCode: color.code,
                colorNameAr: color.nameAr,
                colorNameFr: color.nameFr,
                colorNameEn: color.nameEn,
                stockQuantity: slotStock,
                priceModifier: 0,
                images: [],
                isActive: true,
              },
            })
            slotIndex += 1
          }
        }

        return created
      },
      { timeout: 30000, maxWait: 5000 }
    )

    revalidatePath('/[locale]', 'layout')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/[locale]/products', 'layout')
    revalidatePath('/api/categories')
    revalidatePath('/api/products')

    return NextResponse.json({ success: true, product })
  } catch (error: unknown) {
    console.error('Failed to create product:', error)
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate SKU or slug' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

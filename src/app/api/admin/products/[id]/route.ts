import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { getColorNames } from '@/lib/color-names'
import { isNiqabIdentity, normalizeSizeToken, sortSizesCanonical } from '@/lib/category-config'
import { getCategoryConfig } from '@/lib/category-config.server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const colorsMap = new Map<string, { code: string; nameAr: string; nameFr: string; nameEn: string }>()
    const sizesSet = new Set<string>()
    let totalStock = 0

    // Only aggregate active variants: deactivated (isActive=false) variants
    // from a previous edit must not inflate stock or resurface as colors/sizes.
    const activeVariants = product.variants.filter((v) => v.isActive)
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

    return NextResponse.json({
      product: {
        ...product,
        basePrice: Number(product.basePrice),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        stock: totalStock,
        colors: Array.from(colorsMap.values()),
        sizes: sortSizesCanonical(Array.from(sizesSet)),
      },
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
    }

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const {
      name, nameAr, nameFr, nameEn,
      description, descriptionAr, descriptionFr, descriptionEn,
      basePrice, salePrice, sku, categoryId,
      mainImage, images, colors, sizes, stock,
      isFeatured, isActive, canAddNiqab,
    } = body

    const updateData: Record<string, unknown> = {}

    if (typeof nameAr === 'string' && nameAr.trim()) updateData.nameAr = nameAr.trim()
    else if (typeof name === 'string' && name.trim()) updateData.nameAr = name.trim()

    if (typeof nameFr === 'string' && nameFr.trim()) {
      const trimmedFr = nameFr.trim()
      updateData.nameFr = trimmedFr
      const candidateSlug = slugify(trimmedFr)
      if (candidateSlug && candidateSlug !== existing.slug) {
        const dup = await prisma.product.findUnique({ where: { slug: candidateSlug }, select: { id: true } })
        if (dup && dup.id !== id) {
          return NextResponse.json({ error: 'A product with this name already exists (duplicate slug)' }, { status: 400 })
        }
        updateData.slug = candidateSlug
      }
    } else if (typeof name === 'string' && name.trim()) {
      const trimmed = name.trim()
      updateData.nameFr = trimmed
      const candidateSlug = slugify(trimmed)
      if (candidateSlug && candidateSlug !== existing.slug) {
        const dup = await prisma.product.findUnique({ where: { slug: candidateSlug }, select: { id: true } })
        if (dup && dup.id !== id) {
          return NextResponse.json({ error: 'A product with this name already exists (duplicate slug)' }, { status: 400 })
        }
        updateData.slug = candidateSlug
      }
    }

    if (typeof nameEn === 'string' && nameEn.trim()) updateData.nameEn = nameEn.trim()
    else if (typeof name === 'string' && name.trim()) updateData.nameEn = name.trim()

    if (typeof descriptionAr === 'string' && descriptionAr.trim()) updateData.descriptionAr = descriptionAr.trim()
    else if (typeof description === 'string' && description.trim()) updateData.descriptionAr = description.trim()

    if (typeof descriptionFr === 'string' && descriptionFr.trim()) updateData.descriptionFr = descriptionFr.trim()
    else if (typeof description === 'string' && description.trim()) updateData.descriptionFr = description.trim()

    if (typeof descriptionEn === 'string' && descriptionEn.trim()) updateData.descriptionEn = descriptionEn.trim()
    else if (typeof description === 'string' && description.trim()) updateData.descriptionEn = description.trim()

    let effectiveBasePrice = Number(existing.basePrice)
    if (basePrice !== undefined) {
      const parsed = Number(basePrice)
      if (!Number.isFinite(parsed) || parsed < 0) {
        return NextResponse.json({ error: 'Price must be a valid number' }, { status: 400 })
      }
      effectiveBasePrice = parsed
      updateData.basePrice = parsed
    }

    if (salePrice !== undefined && salePrice !== null && String(salePrice).trim() !== '') {
      const parsed = Number(salePrice)
      if (!Number.isFinite(parsed) || parsed < 0) {
        return NextResponse.json({ error: 'Sale price must be a valid number' }, { status: 400 })
      }
      if (parsed >= effectiveBasePrice) {
        return NextResponse.json({ error: 'Sale price must be lower than base price' }, { status: 400 })
      }
      updateData.salePrice = parsed
    } else if (salePrice !== undefined) {
      updateData.salePrice = null
    } else if (existing.salePrice !== null && Number(existing.salePrice) >= effectiveBasePrice) {
      return NextResponse.json({ error: 'Base price must remain greater than existing sale price' }, { status: 400 })
    }

    if (typeof sku === 'string' && sku.trim()) {
      const cleanSku = sku.trim()
      if (cleanSku !== existing.sku) {
        const dup = await prisma.product.findUnique({ where: { sku: cleanSku }, select: { id: true } })
        if (dup && dup.id !== id) return NextResponse.json({ error: 'This SKU is already in use' }, { status: 400 })
      }
      updateData.sku = cleanSku
    }

    const requestedCategoryId =
      typeof categoryId === 'string' && categoryId.trim() ? categoryId.trim() : existing.categoryId
    const targetCategory = await prisma.category.findUnique({
      where: { id: requestedCategoryId },
    })
    if (!targetCategory) {
      return NextResponse.json({ error: 'Selected category does not exist' }, { status: 400 })
    }
    const categoryChanged = targetCategory.id !== existing.categoryId
    if (categoryChanged) {
      updateData.categoryId = targetCategory.id
    }

    const catConfig = await getCategoryConfig(targetCategory)
    const catIsNiqab = isNiqabIdentity(targetCategory)

    if (typeof mainImage === 'string' && mainImage.trim()) updateData.mainImage = mainImage.trim()
    if (Array.isArray(images)) updateData.images = images.filter((i): i is string => typeof i === 'string' && i.trim().length > 0)
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured)
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    updateData.isNiqab = catIsNiqab
    if (catIsNiqab) {
      updateData.canAddNiqab = false
    } else if (canAddNiqab !== undefined) {
      updateData.canAddNiqab = Boolean(canAddNiqab)
    } else if (categoryChanged) {
      updateData.canAddNiqab = catConfig.allowMatchingNiqab
    }

    let parsedStock: number | null = null
    if (stock !== undefined && stock !== null && String(stock).trim() !== '') {
      const parsed = Number(String(stock).trim())
      if (!Number.isFinite(parsed) || parsed < 0) {
        return NextResponse.json({ error: 'Stock quantity must be a non-negative number' }, { status: 400 })
      }
      parsedStock = Math.floor(parsed)
    }

    const updatedProduct = await prisma.$transaction(
      async (tx) => {
        const updated = await tx.product.update({
          where: { id },
          data: updateData,
        })

        if (stock !== undefined || colors !== undefined || sizes !== undefined || categoryChanged) {
          const existingActiveVariants = existing.variants.filter((v) => v.isActive)
          const existingActiveColorsMap = new Map<
            string,
            { code: string; nameAr: string; nameFr: string; nameEn: string }
          >()
          const existingActiveSizes: string[] = []
          for (const v of existingActiveVariants) {
            if (!existingActiveSizes.includes(v.size)) existingActiveSizes.push(v.size)
            const normCode = v.colorCode.trim().toUpperCase()
            if (!existingActiveColorsMap.has(normCode)) {
              existingActiveColorsMap.set(normCode, {
                code: normCode,
                nameAr: v.colorNameAr,
                nameFr: v.colorNameFr,
                nameEn: v.colorNameEn,
              })
            }
          }

          type RawColorInput = { code?: string; nameAr?: string; nameFr?: string; nameEn?: string }
          const rawColors: RawColorInput[] =
            Array.isArray(colors) && colors.length > 0
              ? (colors as RawColorInput[])
              : existingActiveColorsMap.size > 0
                ? Array.from(existingActiveColorsMap.values())
                : (catConfig.defaultColors.length > 0 ? catConfig.defaultColors : ['#000000']).map((hex) => ({
                    code: hex,
                  }))

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

          const variantSizes = (() => {
            if (catIsNiqab || catConfig.sizingMode === 'bundle_no_size') {
              return ['Standard']
            }
            if (Array.isArray(sizes)) {
              const cleaned = sortSizesCanonical(
                sizes.map((s) => normalizeSizeToken(String(s))).filter(Boolean)
              )
              if (cleaned.length > 0) return cleaned
            }
            if (!categoryChanged && existingActiveSizes.length > 0) {
              return sortSizesCanonical(existingActiveSizes)
            }
            if (catConfig.defaultSizes.length > 0) return sortSizesCanonical([...catConfig.defaultSizes])
            return catConfig.sizingMode === 'standard' ? ['Standard'] : ['S', 'M', 'L', 'XL']
          })()

          const totalSlots = variantColors.length * variantSizes.length
          const baseStock = parsedStock === null ? 0 : Math.floor(parsedStock / totalSlots)
          const remainder = parsedStock === null ? 0 : parsedStock % totalSlots

          const desiredKeys = new Set<string>()
          let slotIndex = 0
          for (const color of variantColors) {
            for (const size of variantSizes) {
              desiredKeys.add(`${size}:${color.code}`)
              const slotStock = parsedStock === null ? 10 : baseStock + (slotIndex < remainder ? 1 : 0)
              const variantUpdateData: Record<string, unknown> = {
                colorNameAr: color.nameAr,
                colorNameFr: color.nameFr,
                colorNameEn: color.nameEn,
                isActive: true,
              }
              if (parsedStock !== null) variantUpdateData.stockQuantity = slotStock
              await tx.productVariant.upsert({
                where: {
                  productId_size_colorCode: {
                    productId: id,
                    size,
                    colorCode: color.code,
                  },
                },
                update: variantUpdateData,
                create: {
                  productId: id,
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

          const allVariants = await tx.productVariant.findMany({ where: { productId: id } })
          for (const variant of allVariants) {
            if (!desiredKeys.has(`${variant.size}:${variant.colorCode.toUpperCase()}`)) {
              await tx.productVariant.update({
                where: { id: variant.id },
                data: { isActive: false },
              })
            }
          }
        }

        return updated
      },
      { timeout: 30000, maxWait: 5000 }
    )

    revalidatePath('/[locale]', 'layout')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/[locale]/products', 'layout')
    revalidatePath(`/[locale]/products/${updatedProduct.slug}`, 'page')
    if (existing.slug && existing.slug !== updatedProduct.slug) {
      revalidatePath(`/[locale]/products/${existing.slug}`, 'page')
    }
    revalidatePath('/api/categories')
    revalidatePath('/api/products')

    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error: unknown) {
    console.error('Error updating product:', error)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate SKU or slug' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Products referenced by past orders cannot be hard-deleted without
    // breaking order items (FK with no cascade). Soft-delete them instead:
    // they disappear from the storefront while order history stays intact.
    const linkedOrderItems = await prisma.orderItem.count({ where: { productId: id } })
    if (linkedOrderItems > 0) {
      await prisma.product.update({ where: { id }, data: { isActive: false } })

      revalidatePath('/[locale]', 'layout')
      revalidatePath('/[locale]', 'page')
      revalidatePath('/[locale]/products', 'layout')
      revalidatePath(`/[locale]/products/${product.slug}`, 'page')
      revalidatePath('/api/categories')
      revalidatePath('/api/products')

      return NextResponse.json({ success: true, softDeleted: true })
    }

    await prisma.productVariant.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })

    // Revalidate storefront caches so deletion appears immediately
    revalidatePath('/[locale]', 'layout')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/[locale]/products', 'layout')
    if (product?.slug) {
      revalidatePath(`/[locale]/products/${product.slug}`, 'page')
    }
    revalidatePath('/api/categories')
    revalidatePath('/api/products')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

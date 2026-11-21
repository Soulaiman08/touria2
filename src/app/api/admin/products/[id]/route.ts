import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'

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
        sizes: Array.from(sizesSet),
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

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const {
      name, nameAr, nameFr, nameEn,
      description, descriptionAr, descriptionFr, descriptionEn,
      basePrice, salePrice, sku, categoryId,
      mainImage, images, colors, sizes, stock,
      isFeatured, isActive, isNiqab, canAddNiqab,
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

    if (typeof categoryId === 'string' && categoryId.trim()) {
      const catExists = await prisma.category.findUnique({ where: { id: categoryId.trim() }, select: { id: true } })
      if (!catExists) {
        return NextResponse.json({ error: 'Selected category does not exist' }, { status: 400 })
      }
      updateData.categoryId = categoryId.trim()
    }

    if (typeof mainImage === 'string' && mainImage.trim()) updateData.mainImage = mainImage.trim()
    if (Array.isArray(images)) updateData.images = images.filter((i): i is string => typeof i === 'string' && i.trim().length > 0)
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured)
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)
    if (isNiqab !== undefined) updateData.isNiqab = Boolean(isNiqab)
    if (canAddNiqab !== undefined) updateData.canAddNiqab = Boolean(canAddNiqab)

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

        if (stock !== undefined || colors || sizes) {
          const rawColors = Array.isArray(colors) && colors.length > 0
            ? (colors as Array<{ code?: string; nameAr?: string; nameFr?: string; nameEn?: string }>)
            : [{ code: '#000000', nameAr: 'أسود', nameFr: 'Noir', nameEn: 'Black' }]

          const uniqueColorMap = new Map<string, { code: string; nameAr: string; nameFr: string; nameEn: string }>()
          for (const c of rawColors) {
            const code = (c.code || '#000000').trim().toUpperCase()
            if (!uniqueColorMap.has(code)) {
              uniqueColorMap.set(code, {
                code,
                nameAr: c.nameAr?.trim() || 'لون',
                nameFr: c.nameFr?.trim() || 'Couleur',
                nameEn: c.nameEn?.trim() || 'Color',
              })
            }
          }
          const variantColors = Array.from(uniqueColorMap.values())

          const rawSizes = Array.isArray(sizes) && sizes.length > 0 ? (sizes as string[]) : ['Standard']
          const variantSizes = Array.from(new Set(rawSizes.map((s) => String(s).trim()).filter(Boolean)))
          if (variantSizes.length === 0) variantSizes.push('Standard')

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

    revalidatePath('/[locale]/products', 'layout')
    revalidatePath(`/[locale]/products/${updatedProduct.slug}`, 'page')
    revalidatePath('/[locale]', 'page')
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

      revalidatePath('/[locale]/products', 'layout')
      revalidatePath(`/[locale]/products/${product.slug}`, 'page')
      revalidatePath('/[locale]', 'page')
      revalidatePath('/api/products')

      return NextResponse.json({ success: true, softDeleted: true })
    }

    await prisma.productVariant.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })

    // Revalidate storefront caches so deletion appears immediately
    revalidatePath('/[locale]/products', 'layout')
    if (product?.slug) {
      revalidatePath(`/[locale]/products/${product.slug}`, 'page')
    }
    revalidatePath('/[locale]', 'page')
    revalidatePath('/api/products')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

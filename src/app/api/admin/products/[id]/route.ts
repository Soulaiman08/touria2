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

    product.variants.forEach((v) => {
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
    const msg = error instanceof Error ? error.message : 'Error fetching product'
    return NextResponse.json({ error: msg }, { status: 500 })
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
    const body = await request.json() as Record<string, unknown>

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

    if (nameAr || name) updateData.nameAr = (nameAr || name) as string
    if (nameFr || name) updateData.nameFr = (nameFr || name) as string
    if (nameEn || name) updateData.nameEn = (nameEn || name) as string
    if (nameFr || name) updateData.slug = slugify((nameFr || name) as string)

    if (descriptionAr || description) updateData.descriptionAr = (descriptionAr || description) as string
    if (descriptionFr || description) updateData.descriptionFr = (descriptionFr || description) as string
    if (descriptionEn || description) updateData.descriptionEn = (descriptionEn || description) as string

    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice as string)
    if (salePrice !== undefined) updateData.salePrice = salePrice ? parseFloat(salePrice as string) : null
    if (sku) updateData.sku = sku as string
    if (categoryId) updateData.categoryId = categoryId as string
    if (mainImage) updateData.mainImage = mainImage as string
    if (Array.isArray(images)) updateData.images = images as string[]
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured)
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)
    if (isNiqab !== undefined) updateData.isNiqab = Boolean(isNiqab)
    if (canAddNiqab !== undefined) updateData.canAddNiqab = Boolean(canAddNiqab)

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    // Refresh variants if stock/colors/sizes were provided.
    // Upserts by (productId, size, colorCode) so existing variant IDs stay
    // stable (order items reference them); old combos are deactivated
    // instead of deleted to preserve order-item foreign keys.
    if (stock !== undefined || colors || sizes) {
      const variantColors = Array.isArray(colors) && colors.length > 0
        ? colors as Array<{ code: string; nameAr: string; nameFr: string; nameEn: string }>
        : [{ code: '#000000', nameAr: 'أسود', nameFr: 'Noir', nameEn: 'Black' }]
      const variantSizes = Array.isArray(sizes) && sizes.length > 0
        ? sizes as string[]
        : ['Standard']

      // When a total stock is provided, distribute it exactly across the
      // variant grid (valid "0" stays 0). When absent, existing per-variant
      // stock is preserved instead of being overwritten.
      let parsedStock: number | null = null
      if (stock !== undefined && stock !== null && String(stock).trim() !== '') {
        const parsed = Number(String(stock).trim())
        if (Number.isFinite(parsed)) parsedStock = Math.max(0, Math.floor(parsed))
      }
      const totalSlots = variantColors.length * variantSizes.length
      const baseStock = parsedStock === null ? 0 : Math.floor(parsedStock / totalSlots)
      const remainder = parsedStock === null ? 0 : parsedStock % totalSlots

      const desiredKeys = new Set<string>()
      let slotIndex = 0
      for (const color of variantColors) {
        for (const size of variantSizes) {
          desiredKeys.add(`${size}:${color.code || '#000000'}`)
          const slotStock = baseStock + (slotIndex < remainder ? 1 : 0)
          const updateData: Record<string, unknown> = {
            colorNameAr: color.nameAr || 'لون',
            colorNameFr: color.nameFr || 'Couleur',
            colorNameEn: color.nameEn || 'Color',
            isActive: true,
          }
          if (parsedStock !== null) updateData.stockQuantity = slotStock
          await prisma.productVariant.upsert({
            where: {
              productId_size_colorCode: {
                productId: id,
                size,
                colorCode: color.code || '#000000',
              },
            },
            update: updateData,
            create: {
              productId: id,
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

      const allVariants = await prisma.productVariant.findMany({ where: { productId: id } })
      for (const variant of allVariants) {
        if (!desiredKeys.has(`${variant.size}:${variant.colorCode}`)) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { isActive: false },
          })
        }
      }
    }

    // Revalidate storefront caches so changes appear immediately
    revalidatePath('/[locale]/products', 'layout')
    revalidatePath(`/[locale]/products/${updatedProduct.slug}`, 'page')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/api/products')

    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error) {
    console.error('Error updating product:', error)
    const msg = error instanceof Error ? error.message : 'Failed to update product'
    return NextResponse.json({ error: msg }, { status: 500 })
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
    const msg = error instanceof Error ? error.message : 'Failed to delete product'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

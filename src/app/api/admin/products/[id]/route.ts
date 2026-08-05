import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Refresh variants if stock/colors/sizes were provided
    if (stock !== undefined || colors || sizes) {
      const variantColors = Array.isArray(colors) && colors.length > 0
        ? colors as Array<{ code: string; nameAr: string; nameFr: string; nameEn: string }>
        : [{ code: '#000000', nameAr: 'أسود', nameFr: 'Noir', nameEn: 'Black' }]
      const variantSizes = Array.isArray(sizes) && sizes.length > 0
        ? sizes as string[]
        : ['Standard']
      const newStock = stock !== undefined ? parseInt(stock as string, 10) : 10
      const stockPerVariant = Math.max(1, Math.floor(newStock / (variantColors.length * variantSizes.length)))

      await prisma.productVariant.deleteMany({ where: { productId: id } })

      for (const color of variantColors) {
        for (const size of variantSizes) {
          await prisma.productVariant.create({
            data: {
              productId: id,
              size,
              colorCode: color.code || '#000000',
              colorNameAr: color.nameAr || 'لون',
              colorNameFr: color.nameFr || 'Couleur',
              colorNameEn: color.nameEn || 'Color',
              stockQuantity: stockPerVariant,
              priceModifier: 0,
              images: [],
              isActive: true,
            },
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
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } })

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

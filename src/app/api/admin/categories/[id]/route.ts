import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import {
  deleteCategoryConfig,
  getCategoryConfig,
  saveCategoryConfig,
} from '@/lib/category-config.server'
import { isNiqabIdentity, sortSizesCanonical } from '@/lib/category-config'
import { getColorNames } from '@/lib/color-names'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(['ADMIN', 'SUPER_ADMIN'])
  if (!auth.ok) return auth.response
  try {
    const { id } = await params
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 })
    }

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (typeof body.nameAr === 'string' && body.nameAr.trim()) updateData.nameAr = body.nameAr.trim()
    if (typeof body.nameFr === 'string' && body.nameFr.trim()) updateData.nameFr = body.nameFr.trim()
    if (typeof body.nameEn === 'string' && body.nameEn.trim()) updateData.nameEn = body.nameEn.trim()

    if (body.descriptionAr !== undefined) {
      updateData.descriptionAr = typeof body.descriptionAr === 'string' && body.descriptionAr.trim() ? body.descriptionAr.trim() : null
    }
    if (body.descriptionFr !== undefined) {
      updateData.descriptionFr = typeof body.descriptionFr === 'string' && body.descriptionFr.trim() ? body.descriptionFr.trim() : null
    }
    if (body.descriptionEn !== undefined) {
      updateData.descriptionEn = typeof body.descriptionEn === 'string' && body.descriptionEn.trim() ? body.descriptionEn.trim() : null
    }

    if (typeof body.slug === 'string' && body.slug.trim()) {
      const candidateSlug = slugify(body.slug)
      if (!candidateSlug) {
        return NextResponse.json({ error: 'Slug must contain URL-safe characters' }, { status: 400 })
      }
      if (candidateSlug !== existing.slug) {
        const dup = await prisma.category.findUnique({ where: { slug: candidateSlug }, select: { id: true } })
        if (dup && dup.id !== id) {
          return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 400 })
        }
        updateData.slug = candidateSlug
      }
    }

    if (body.image !== undefined) {
      updateData.image = typeof body.image === 'string' && body.image.trim() ? body.image.trim() : null
    }
    if (body.sortOrder !== undefined) {
      const parsedOrder = Number.parseInt(String(body.sortOrder), 10)
      updateData.sortOrder = Number.isFinite(parsedOrder) ? parsedOrder : 0
    }
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive)

    if (body.parentId !== undefined) {
      const rawParent = typeof body.parentId === 'string' ? body.parentId.trim() : ''
      if (!rawParent) {
        updateData.parentId = null
      } else {
        if (rawParent === id) {
          return NextResponse.json({ error: 'A category cannot be its own parent' }, { status: 400 })
        }
        const parentExists = await prisma.category.findUnique({
          where: { id: rawParent },
          select: { id: true },
        })
        if (!parentExists) {
          return NextResponse.json({ error: 'Selected parent category does not exist' }, { status: 400 })
        }
        updateData.parentId = parentExists.id
      }
    }

    const updated = await prisma.category.update({ where: { id }, data: updateData })
    const savedConfig =
      body.config !== undefined
        ? await saveCategoryConfig(updated, body.config)
        : await getCategoryConfig(updated)

    let syncedProductsCount = 0
    if (body.applyToExistingProducts === true) {
      const catIsNiqab = isNiqabIdentity(updated)
      const targetSizes = sortSizesCanonical(
        catIsNiqab || savedConfig.sizingMode === 'bundle_no_size'
          ? ['Standard']
          : savedConfig.defaultSizes.length > 0
            ? [...savedConfig.defaultSizes]
            : savedConfig.sizingMode === 'standard'
              ? ['Standard']
              : savedConfig.sizingMode === 'numeric'
                ? ['52', '54', '56', '58']
                : ['S', 'M', 'L', 'XL']
      )

      const rawColorHexes =
        savedConfig.defaultColors.length > 0 ? savedConfig.defaultColors : ['#000000']
      const scopedHexes =
        savedConfig.colorMode === 'single' ? rawColorHexes.slice(0, 1) : rawColorHexes
      const targetColors = Array.from(
        new Set(
          scopedHexes
            .map((c) => {
              const trimmed = c.trim()
              return (trimmed.startsWith('#') ? trimmed : `#${trimmed}`).toUpperCase()
            })
            .filter((c) => /^#[0-9A-F]{3,8}$/.test(c))
        )
      ).map((code) => {
        const names = getColorNames(code)
        return {
          code,
          nameAr: names.ar,
          nameFr: names.fr,
          nameEn: names.en,
        }
      })

      if (targetColors.length === 0) {
        const names = getColorNames('#000000')
        targetColors.push({ code: '#000000', nameAr: names.ar, nameFr: names.fr, nameEn: names.en })
      }

      syncedProductsCount = await prisma.$transaction(
        async (tx) => {
          const catProducts = await tx.product.findMany({
            where: { categoryId: id },
            include: { variants: true },
          })

          let synced = 0
          for (const prod of catProducts) {
            await tx.product.update({
              where: { id: prod.id },
              data: {
                isNiqab: catIsNiqab,
                canAddNiqab: catIsNiqab ? false : savedConfig.allowMatchingNiqab,
              },
            })

            const activeVariants = prod.variants.filter((v) => v.isActive)
            const currentTotalStock = activeVariants.reduce((sum, v) => sum + v.stockQuantity, 0)
            const targetStock = activeVariants.length === 0 && currentTotalStock === 0 ? 20 : currentTotalStock

            const totalSlots = targetColors.length * targetSizes.length
            const baseStock = Math.floor(targetStock / totalSlots)
            const remainder = targetStock % totalSlots

            const desiredKeys = new Set<string>()
            let slotIndex = 0
            for (const color of targetColors) {
              for (const size of targetSizes) {
                desiredKeys.add(`${size}:${color.code}`)
                const slotStock = baseStock + (slotIndex < remainder ? 1 : 0)
                await tx.productVariant.upsert({
                  where: {
                    productId_size_colorCode: {
                      productId: prod.id,
                      size,
                      colorCode: color.code,
                    },
                  },
                  update: {
                    colorNameAr: color.nameAr,
                    colorNameFr: color.nameFr,
                    colorNameEn: color.nameEn,
                    stockQuantity: slotStock,
                    isActive: true,
                  },
                  create: {
                    productId: prod.id,
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

            for (const variant of prod.variants) {
              if (!desiredKeys.has(`${variant.size}:${variant.colorCode.toUpperCase()}`)) {
                await tx.productVariant.update({
                  where: { id: variant.id },
                  data: { isActive: false },
                })
              }
            }

            synced += 1
          }

          return synced
        },
        { timeout: 30000, maxWait: 5000 }
      )
    }

    revalidatePath('/[locale]', 'layout')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/[locale]/products', 'layout')
    revalidatePath('/api/categories')
    revalidatePath('/api/products')

    return NextResponse.json({
      success: true,
      syncedProductsCount,
      category: { ...updated, config: savedConfig },
    })
  } catch (error: unknown) {
    console.error('Failed to update category:', error)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
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

    const existing = await prisma.category.findUnique({ where: { id }, select: { id: true } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const productCount = await prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${productCount} product(s) are linked to this category` },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id } })
    await deleteCategoryConfig(id)

    revalidatePath('/[locale]', 'layout')
    revalidatePath('/[locale]', 'page')
    revalidatePath('/[locale]/products', 'layout')
    revalidatePath('/api/categories')
    revalidatePath('/api/products')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}

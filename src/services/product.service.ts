import { prisma } from '@/lib/prisma'
import type { CategoryConfig } from '@/lib/category-config'
import { getCategoryConfig, getCategoryConfigMap } from '@/lib/category-config.server'
import type {
  ProductCard,
  Product,
  ProductFilters,
  PaginatedProducts,
} from '@/types/product'

// ======================================================
// NIQAB PRODUCT TYPE
// ======================================================

type NiqabProductData = {
  id: string
  nameAr: string
  nameFr: string
  nameEn: string
  mainImage: string
  basePrice: number
  salePrice: number | null
  variants: Array<{
    id: string
    productId: string
    size: string
    colorCode: string
    colorNameAr: string
    colorNameFr: string
    colorNameEn: string
    stockQuantity: number
    priceModifier: number | string
    images: string[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }>
}

// ======================================================
// GET REAL NIQAB PRODUCT
// ======================================================

async function getNiqabProduct(): Promise<NiqabProductData | null> {
  const niqab = await prisma.product.findFirst({
    where: {
      OR: [
        { isNiqab: true },
        { slug: { contains: 'niqab', mode: 'insensitive' } },
        { slug: { contains: 'niquab', mode: 'insensitive' } },
      ],
      isActive: true,
      category: {
        isActive: true,
      },
    },
    include: {
      variants: {
        where: {
          isActive: true,
        },
      },
    },
    orderBy: {
      sortOrder: 'asc',
    },
  })

  if (!niqab || !niqab.variants || niqab.variants.length === 0) {
    return null
  }

  return {
    id: niqab.id,
    nameAr: niqab.nameAr,
    nameFr: niqab.nameFr,
    nameEn: niqab.nameEn,
    mainImage: niqab.mainImage,
    basePrice: Number(niqab.basePrice),
    salePrice: niqab.salePrice !== null ? Number(niqab.salePrice) : null,
    variants: niqab.variants.map((variant) => ({
      ...variant,
      priceModifier: Number(variant.priceModifier),
    })),
  }
}

// ======================================================
// SERVICE
// ======================================================

export const productService = {
  // ====================================================
  // GET PRODUCTS
  // ====================================================

  async getProducts(
    filters: ProductFilters = {},
  ): Promise<PaginatedProducts> {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 12
    const skip = (page - 1) * limit

    const whereClause: Record<string, unknown> = {
      isActive: true,
    }

    // -----------------------------------------------
    // NIQAB FILTER
    // -----------------------------------------------
    if (filters.isNiqab !== undefined) {
      whereClause.isNiqab = filters.isNiqab
    }

    // -----------------------------------------------
    // FEATURED
    // -----------------------------------------------
    if (filters.isFeatured !== undefined) {
      whereClause.isFeatured = filters.isFeatured
    }

    // -----------------------------------------------
    // CATEGORY (Always require an active category)
    // -----------------------------------------------
    whereClause.category = filters.category
      ? {
          isActive: true,
          OR: [
            { slug: filters.category },
            { slug: filters.category.replace(/s$/, '') },
            { slug: `${filters.category}s` },
          ],
        }
      : {
          isActive: true,
        }

    // -----------------------------------------------
    // SIZE & COLOR (Combined variant query so neither overwrites the other)
    // -----------------------------------------------
    if (filters.size || filters.colorCode) {
      whereClause.variants = {
        some: {
          isActive: true,
          ...(filters.size ? { size: filters.size } : {}),
          ...(filters.colorCode ? { colorCode: filters.colorCode } : {}),
        },
      }
    }

    // -----------------------------------------------
    // PRICE
    // -----------------------------------------------
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {}
      if (filters.minPrice !== undefined) {
        priceFilter.gte = filters.minPrice
      }
      if (filters.maxPrice !== undefined) {
        priceFilter.lte = filters.maxPrice
      }
      whereClause.basePrice = priceFilter
    }

    // -----------------------------------------------
    // SEARCH
    // -----------------------------------------------
    if (filters.search) {
      whereClause.OR = [
        {
          nameAr: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          nameFr: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          nameEn: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ]
    }

    // -----------------------------------------------
    // ORDER
    // -----------------------------------------------
    let orderBy: Record<string, string> = {
      sortOrder: 'asc',
    }

    if (filters.sort === 'newest') {
      orderBy = {
        createdAt: 'desc',
      }
    } else if (filters.sort === 'priceAsc') {
      orderBy = {
        basePrice: 'asc',
      }
    } else if (filters.sort === 'priceDesc') {
      orderBy = {
        basePrice: 'desc',
      }
    } else if (filters.sort === 'featured') {
      orderBy = {
        isFeatured: 'desc',
      }
    } else if (filters.sort === 'sale') {
      whereClause.salePrice = {
        not: null,
      }
      orderBy = {
        salePrice: 'asc',
      }
    }

    // -----------------------------------------------
    // DATABASE
    // -----------------------------------------------
    const [dbProducts, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              slug: true,
              nameAr: true,
              nameFr: true,
              nameEn: true,
            },
          },
          variants: {
            where: {
              isActive: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: whereClause,
      }),
    ])

    // -----------------------------------------------
    // HYDRATE CATEGORY CONFIGS & MAP
    // -----------------------------------------------
    const uniqueCats = Array.from(
      new Map(
        dbProducts
          .map((p) => p.category)
          .filter((c): c is NonNullable<typeof c> => Boolean(c))
          .map((c) => [c.id, c])
      ).values()
    )
    const configMap = await getCategoryConfigMap(uniqueCats)

    const items = dbProducts.map((p) =>
      this.mapToCard({
        ...p,
        category: p.category
          ? {
              ...p.category,
              config: configMap.get(p.category.id),
            }
          : null,
        basePrice: Number(p.basePrice),
        salePrice: p.salePrice !== null ? Number(p.salePrice) : null,
      }),
    )

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  async getAvailableColors(): Promise<
    Array<{
      code: string
      nameAr: string
      nameFr: string
      nameEn: string
    }>
  > {
    const [variants, activeProducts] = await Promise.all([
      prisma.productVariant.findMany({
        where: { isActive: true },
        select: {
          productId: true,
          colorCode: true,
          colorNameAr: true,
          colorNameFr: true,
          colorNameEn: true,
        },
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          category: {
            isActive: true,
          },
        },
        select: { id: true },
      }),
    ])

    const activeProductIds = new Set(activeProducts.map((p) => p.id))
    const byColor = new Map<
      string,
      { code: string; nameAr: string; nameFr: string; nameEn: string }
    >()

    for (const v of variants) {
      if (!v.colorCode || !activeProductIds.has(v.productId)) continue
      const key = v.colorCode.toUpperCase()
      if (!byColor.has(key)) {
        byColor.set(key, {
          code: v.colorCode,
          nameAr: v.colorNameAr,
          nameFr: v.colorNameFr,
          nameEn: v.colorNameEn,
        })
      }
    }

    return Array.from(byColor.values())
  },

  // ====================================================
  // GET PRODUCT BY SLUG
  // ====================================================
  async getProductBySlug(slug: string): Promise<Product | null> {
    const dbProduct = await prisma.product.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        category: true,
        variants: {
          where: {
            isActive: true,
          },
        },
      },
    })

    if (!dbProduct || (dbProduct.category && !dbProduct.category.isActive)) {
      return null
    }

    const [niqabProduct, categoryConfig] = await Promise.all([
      dbProduct.canAddNiqab && !dbProduct.isNiqab ? getNiqabProduct() : Promise.resolve(null),
      dbProduct.category ? getCategoryConfig(dbProduct.category) : Promise.resolve(undefined),
    ])

    return {
      ...dbProduct,
      category: dbProduct.category
        ? {
            ...dbProduct.category,
            config: categoryConfig,
          }
        : undefined,
      basePrice: Number(dbProduct.basePrice),
      salePrice:
        dbProduct.salePrice !== null ? Number(dbProduct.salePrice) : null,
      variants: dbProduct.variants.map((variant) => ({
        ...variant,
        priceModifier: Number(variant.priceModifier),
      })),
      niqabProduct: niqabProduct || undefined,
    } as unknown as Product
  },

  // ====================================================
  // FEATURED PRODUCTS
  // ====================================================
  async getFeaturedProducts(limit = 24): Promise<ProductCard[]> {
    const res = await this.getProducts({
      isFeatured: true,
      limit,
    })
    return res.items
  },

  // ====================================================
  // MAP TO CARD
  // ====================================================
  mapToCard(p: {
    id: string
    slug: string
    nameAr: string
    nameFr: string
    nameEn: string
    basePrice: number | string
    salePrice?: number | string | null
    mainImage: string
    images?: string[]
    isFeatured: boolean
    isNiqab: boolean
    canAddNiqab: boolean
    category?: {
      id: string
      slug: string
      nameAr: string
      nameFr: string
      nameEn: string
      config?: CategoryConfig
    } | null
    variants?: Array<{
      colorCode: string
      colorNameAr: string
      colorNameFr: string
      colorNameEn: string
      size: string
    }>
  }): ProductCard {
    const variants = p.variants ?? []

    // -----------------------------------------------
    // REAL PRODUCT COLORS
    // -----------------------------------------------
    const availableColors = Array.from(
      new Map(
        variants.map((v) => [
          v.colorCode,
          {
            code: v.colorCode,
            nameAr: v.colorNameAr,
            nameFr: v.colorNameFr,
            nameEn: v.colorNameEn,
          },
        ]),
      ).values(),
    )

    // -----------------------------------------------
    // REAL PRODUCT SIZES
    // -----------------------------------------------
    const availableSizes = Array.from(
      new Set(variants.map((v) => v.size)),
    ) as string[]

    return {
      id: p.id,
      slug: p.slug,
      nameAr: p.nameAr,
      nameFr: p.nameFr,
      nameEn: p.nameEn,
      basePrice: Number(p.basePrice),
      salePrice:
        p.salePrice !== null && p.salePrice !== undefined
          ? Number(p.salePrice)
          : null,
      mainImage: p.mainImage,
      images: p.images ?? [],
      isFeatured: p.isFeatured,
      isNiqab: p.isNiqab,
      canAddNiqab: p.canAddNiqab,
      category: p.category
        ? {
            id: p.category.id,
            slug: p.category.slug,
            nameAr: p.category.nameAr,
            nameFr: p.category.nameFr,
            nameEn: p.category.nameEn,
            config: p.category.config,
          }
        : undefined,
      availableColors,
      availableSizes,
    }
  },
}
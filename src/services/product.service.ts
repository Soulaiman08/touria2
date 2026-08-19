import { prisma } from '@/lib/prisma'
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
  try {
    const niqab = await prisma.product.findFirst({
      where: {
        OR: [
          { isNiqab: true },
          { slug: { contains: 'niqab', mode: 'insensitive' } },
          { slug: { contains: 'niquab', mode: 'insensitive' } },
        ],
        isActive: true,
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

      variants: niqab.variants.map((variant) => ({
        ...variant,
        priceModifier: Number(
          variant.priceModifier,
        ),
      })),
    }
  } catch (error) {
    console.warn(
      'âš ï¸ Failed to load niqab product:',
      error,
    )

    return null
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
    try {
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
        whereClause.isNiqab =
          filters.isNiqab
      }

      // -----------------------------------------------
      // FEATURED
      // -----------------------------------------------

      if (filters.isFeatured !== undefined) {
        whereClause.isFeatured =
          filters.isFeatured
      }

      // -----------------------------------------------
      // CATEGORY
      // -----------------------------------------------

      if (filters.category) {
        whereClause.category = {
          slug: filters.category,
        }
      }

      // -----------------------------------------------
      // SIZE
      // -----------------------------------------------

      if (filters.size) {
        whereClause.variants = {
          some: {
            size: filters.size,
            isActive: true,
          },
        }
      }

      // -----------------------------------------------
      // COLOR
      // -----------------------------------------------

      if (filters.colorCode) {
        whereClause.variants = {
          some: {
            colorCode: filters.colorCode,
            isActive: true,
          },
        }
      }

      // -----------------------------------------------
      // PRICE
      // -----------------------------------------------

      if (
        filters.minPrice !== undefined ||
        filters.maxPrice !== undefined
      ) {
        const priceFilter: Record<
          string,
          number
        > = {}

        if (
          filters.minPrice !== undefined
        ) {
          priceFilter.gte =
            filters.minPrice
        }

        if (
          filters.maxPrice !== undefined
        ) {
          priceFilter.lte =
            filters.maxPrice
        }

        whereClause.basePrice =
          priceFilter
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

      let orderBy: Record<
        string,
        string
      > = {
        sortOrder: 'asc',
      }

      if (filters.sort === 'newest') {
        orderBy = {
          createdAt: 'desc',
        }
      }

      if (filters.sort === 'priceAsc') {
        orderBy = {
          basePrice: 'asc',
        }
      }

      if (filters.sort === 'priceDesc') {
        orderBy = {
          basePrice: 'desc',
        }
      }

      if (filters.sort === 'featured') {
        orderBy = {
          isFeatured: 'desc',
        }
      }

      // -----------------------------------------------
      // DATABASE
      // -----------------------------------------------

      const [
        dbProducts,
        total,
      ] = await Promise.all([
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
      // MAP
      // -----------------------------------------------

      const items =
        dbProducts.map((p) =>
          this.mapToCard({
            ...p,

            basePrice:
              Number(p.basePrice),

            salePrice:
              p.salePrice !== null
                ? Number(p.salePrice)
                : null,
          }),
        )

      return {
        items,
        total,
        page,
        limit,
        totalPages:
          Math.ceil(
            total / limit,
          ),
      }
    } catch (error) {
      console.warn(
        'âš ï¸ Database query failed, returning empty product list:',
        error,
      )

      const page =
        filters.page ?? 1

      const limit =
        filters.limit ?? 12

      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      }
    }
  },

  // ====================================================
  // GET PRODUCT BY SLUG
  // ====================================================

  async getProductBySlug(
    slug: string,
  ): Promise<Product | null> {
    try {

      // -----------------------------------------------
      // LOAD MAIN PRODUCT
      // -----------------------------------------------

      const dbProduct =
        await prisma.product.findUnique({
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

      // -----------------------------------------------
      // PRODUCT NOT FOUND
      // -----------------------------------------------

      if (!dbProduct) {
        return null
      }

      // -----------------------------------------------
      // LOAD NIQAB ONLY WHEN ALLOWED
      // -----------------------------------------------

      let niqabProduct:
        NiqabProductData | null =
        null

      if (
        dbProduct.canAddNiqab &&
        !dbProduct.isNiqab
      ) {
        niqabProduct =
          await getNiqabProduct()
      }

      // -----------------------------------------------
      // RETURN PRODUCT
      // -----------------------------------------------

      return {
        ...dbProduct,

        basePrice:
          Number(dbProduct.basePrice),

        salePrice:
          dbProduct.salePrice !== null
            ? Number(
              dbProduct.salePrice,
            )
            : null,

        variants:
          dbProduct.variants.map(
            (variant) => ({
              ...variant,

              priceModifier:
                Number(
                  variant.priceModifier,
                ),
            }),
          ),

        niqabProduct:
          niqabProduct || undefined,
      } as unknown as Product

    } catch (error) {
      console.warn(
        `âš ï¸ GetProductBySlug database query failed for [${slug}]:`,
        error,
      )

      return null
    }
  },

  // ====================================================
  // FEATURED PRODUCTS
  // ====================================================

  async getFeaturedProducts(): Promise<
    ProductCard[]
  > {
    const res =
      await this.getProducts({
        isFeatured: true,
        limit: 4,
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
    salePrice?:
    | number
    | string
    | null

    mainImage: string

    isFeatured: boolean
    isNiqab: boolean
    canAddNiqab: boolean

    category?: {
      id: string
      slug: string
      nameAr: string
      nameFr: string
      nameEn: string
    } | null

    variants?: Array<{
      colorCode: string
      colorNameAr: string
      colorNameFr: string
      colorNameEn: string
      size: string
    }>
  }): ProductCard {

    const variants =
      p.variants ?? []

    // -----------------------------------------------
    // REAL PRODUCT COLORS
    // -----------------------------------------------

    const availableColors =
      Array.from(
        new Map(
          variants.map(
            (v) => [
              v.colorCode,
              {
                code:
                  v.colorCode,

                nameAr:
                  v.colorNameAr,

                nameFr:
                  v.colorNameFr,

                nameEn:
                  v.colorNameEn,
              },
            ],
          ),
        ).values(),
      )

    // -----------------------------------------------
    // REAL PRODUCT SIZES
    // -----------------------------------------------

    const availableSizes =
      Array.from(
        new Set(
          variants.map(
            (v) => v.size,
          ),
        ),
      ) as string[]

    return {
      id: p.id,

      slug: p.slug,

      nameAr: p.nameAr,
      nameFr: p.nameFr,
      nameEn: p.nameEn,

      basePrice:
        Number(p.basePrice),

      salePrice:
        p.salePrice !== null &&
          p.salePrice !== undefined
          ? Number(
            p.salePrice,
          )
          : null,

      mainImage:
        p.mainImage,

      isFeatured:
        p.isFeatured,

      isNiqab:
        p.isNiqab,

      canAddNiqab:
        p.canAddNiqab,

      category:
        p.category
          ? {
            id:
              p.category.id,

            slug:
              p.category.slug,

            nameAr:
              p.category.nameAr,

            nameFr:
              p.category.nameFr,

            nameEn:
              p.category.nameEn,
          }
          : undefined,

      availableColors,

      availableSizes,
    }
  },
}
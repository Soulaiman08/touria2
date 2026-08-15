'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ShoppingBag, Eye } from 'lucide-react'

import { formatPrice, cn } from '@/lib/utils'
import type { ProductCard as ProductCardType } from '@/types/product'

interface ProductCardProps {
  product: ProductCardType
  locale: string
  onAddToCart?: (product: ProductCardType) => void
  className?: string
  isNew?: boolean
}

export function ProductCard({
  product,
  locale,
  onAddToCart,
  className,
  isNew,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false)

  const isRTL = locale === 'ar'

  // ============================================================
  // LOCALIZED DATA
  // ============================================================

  const name =
    locale === 'ar'
      ? product.nameAr
      : locale === 'fr'
        ? product.nameFr
        : product.nameEn

  const categoryName =
    locale === 'ar'
      ? product.category?.nameAr
      : locale === 'fr'
        ? product.category?.nameFr
        : product.category?.nameEn

  const viewLabel =
    locale === 'ar'
      ? 'عرض المنتج'
      : locale === 'fr'
        ? 'Voir le produit'
        : 'View Product'

  const newLabel =
    locale === 'ar'
      ? 'جديد'
      : locale === 'fr'
        ? 'Nouveau'
        : 'New'

  // ============================================================
  // DISCOUNT
  // ============================================================

  const discount =
    product.salePrice && product.basePrice > 0
      ? Math.round(
        ((product.basePrice - product.salePrice) /
          product.basePrice) *
        100,
      )
      : 0

  const saleLabel =
    locale === 'ar'
      ? `خصم ${discount}%`
      : `-${discount}%`

  // ============================================================
  // OUT OF STOCK
  // ============================================================

  const isOutOfStock =
    !product.availableSizes ||
    product.availableSizes.length === 0

  // ============================================================
  // URL
  // ============================================================

  const productUrl =
    `/${locale}/products/${product.slug}`

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <article
      className={cn(
        'product-card group',
        className,
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-label={name}
    >
      {/* ======================================================
          IMAGE
      ======================================================= */}

      <div className="product-card-img-wrap">
        <Link
          href={productUrl}
          tabIndex={-1}
          aria-hidden
          className="block"
        >
          <Image
            src={
              imgError
                ? '/images/placeholder-product.jpg'
                : product.mainImage
            }
            alt={name}
            fill
            sizes="
              (max-width: 640px) 50vw,
              (max-width: 1024px) 50vw,
              33vw
            "
            className="product-card-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </Link>

        {/* ====================================================
            BADGES
        ===================================================== */}

        <div className="product-card-badge flex flex-col gap-1.5">
          {isNew && (
            <span className="badge badge-gold text-[11px]">
              {newLabel}
            </span>
          )}

          {discount > 0 && (
            <span className="badge badge-accent text-[11px]">
              {saleLabel}
            </span>
          )}

          {isOutOfStock && (
            <span
              className="badge text-[11px]"
              style={{
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
              }}
            >
              {locale === 'ar'
                ? 'نفذ'
                : locale === 'fr'
                  ? 'Épuisé'
                  : 'Sold out'}
            </span>
          )}
        </div>

        {/* ====================================================
            HOVER ACTIONS - DESKTOP
        ===================================================== */}

        <div className="product-card-actions">
          <Link
            href={productUrl}
            className="
              flex-1
              flex
              items-center
              justify-center
              gap-1.5
              py-2
              px-3
              rounded-lg
              text-xs
              font-semibold
              text-white
              transition-all
            "
            style={{
              background:
                'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(4px)',
              border:
                '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <Eye className="w-3.5 h-3.5" />

            {viewLabel}
          </Link>

          {onAddToCart && (
            <button
              type="button"
              onClick={() =>
                onAddToCart(product)
              }
              className="
                flex
                items-center
                justify-center
                gap-1.5
                py-2
                px-3
                rounded-lg
                text-xs
                font-semibold
                text-white
                transition-all
              "
              style={{
                background:
                  'var(--accent)',
                border:
                  '1px solid rgba(255,255,255,0.2)',
              }}
              aria-label={
                locale === 'ar'
                  ? `إضافة ${name} إلى السلة`
                  : locale === 'fr'
                    ? `Ajouter ${name} au panier`
                    : `Add ${name} to cart`
              }
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ======================================================
          PRODUCT INFORMATION
      ======================================================= */}

      <div
        className="
          product-card-info
          px-3
          sm:px-4
          py-3
          sm:py-4
        "
      >
        {/* ====================================================
            CATEGORY
        ===================================================== */}

        {categoryName && (
          <p
            className="
              text-[10px]
              sm:text-[11px]
              font-semibold
              uppercase
              tracking-wider
              mb-1.5
            "
            style={{
              color: 'var(--gold)',
            }}
          >
            {categoryName}
          </p>
        )}

        {/* ====================================================
            NAME
        ===================================================== */}

        <h3
          className="
            font-semibold
            text-sm
            sm:text-sm
            leading-snug
            line-clamp-2
            min-h-[40px]
          "
          style={{
            color: 'var(--text-primary)',
          }}
        >
          <Link
            href={productUrl}
            className="
              transition-colors
              hover:text-[var(--accent)]
            "
          >
            {name}
          </Link>
        </h3>

        {/* ====================================================
            COLOR SWATCHES
        ===================================================== */}

        {product.availableColors &&
          product.availableColors.length > 0 && (
            <div
              className="
                flex
                items-center
                gap-1.5
                flex-wrap
                mt-2
                min-h-[20px]
              "
            >
              {product.availableColors
                .slice(0, 5)
                .map((c) => (
                  <span
                    key={c.code}
                    className="
                      w-4
                      h-4
                      rounded-full
                      border
                      shadow-sm
                      cursor-pointer
                      hover:ring-2
                      hover:ring-[var(--accent)]
                      transition-all
                      ring-offset-1
                    "
                    style={{
                      background: c.code,
                      borderColor:
                        'rgba(0,0,0,0.12)',
                      boxShadow:
                        'inset 0 0 0 0.5px rgba(0,0,0,0.1)',
                    }}
                    title={
                      locale === 'ar'
                        ? c.nameAr
                        : locale === 'fr'
                          ? c.nameFr
                          : c.nameEn
                    }
                  />
                ))}

              {product.availableColors.length >
                5 && (
                  <span
                    className="
                    text-[10px]
                    font-medium
                  "
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    +
                    {product.availableColors
                      .length - 5}
                  </span>
                )}
            </div>
          )}

        {/* Price + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-2.5 sm:pt-3 mt-auto border-t border-[var(--border)]/40 min-w-0">
          {/* Prices */}
          <div className="flex items-baseline gap-1.5 min-w-0">
            {product.salePrice ? (
              <div className="flex items-baseline gap-1.5">
                <span
                  className="price-sale text-sm sm:text-base font-bold whitespace-nowrap"
                  style={{ color: 'var(--accent)' }}
                >
                  {formatPrice(product.salePrice, locale)}
                </span>
                <span
                  className="price-original text-[11px] sm:text-xs whitespace-nowrap"
                  style={{
                    color: 'var(--text-muted)',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatPrice(product.basePrice, locale)}
                </span>
              </div>
            ) : (
              <span className="price-current text-sm sm:text-base font-bold whitespace-nowrap">
                {formatPrice(product.basePrice, locale)}
              </span>
            )}
          </div>

          {/* CTA */}
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="
              w-full
              sm:w-auto
              inline-flex
              items-center
              justify-center
              whitespace-nowrap
              rounded-lg
              sm:rounded-full
              font-semibold
              transition-all
              hover:opacity-90
              active:scale-95
              text-center
            "
            style={{
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '11px',
              padding: '6px 12px',
              minHeight: '28px',
            }}
            aria-label={`${viewLabel}: ${name}`}
          >
            {viewLabel}
          </Link>
        </div>
      </div>
    </article>
  )
}
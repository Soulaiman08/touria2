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

export function ProductCard({ product, locale, onAddToCart, className, isNew }: ProductCardProps) {
  const [imgError, setImgError] = useState(false)
  const isRTL = locale === 'ar'

  const name =
    locale === 'ar' ? product.nameAr
    : locale === 'fr' ? product.nameFr
    : product.nameEn

  const categoryName =
    locale === 'ar' ? product.category?.nameAr
    : locale === 'fr' ? product.category?.nameFr
    : product.category?.nameEn

  const discount =
    product.salePrice && product.basePrice > 0
      ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
      : 0

  const viewLabel =
    locale === 'ar' ? 'عرض المنتج'
    : locale === 'fr' ? 'Voir le produit'
    : 'View Product'


  const newLabel  = locale === 'ar' ? 'جديد' : locale === 'fr' ? 'Nouveau' : 'New'
  const saleLabel = locale === 'ar' ? `خصم ${discount}%` : `-${discount}%`

  return (
    <article
      className={cn('product-card group', className)}
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-label={name}
    >
      {/* ── Image Container ── */}
      <div className="product-card-img-wrap">
        <Link href={`/${locale}/products/${product.slug}`} tabIndex={-1} aria-hidden>
          <Image
            src={imgError ? '/images/placeholder-product.jpg' : product.mainImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="product-card-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="product-card-badge flex flex-col gap-1.5">
          {isNew && (
            <span className="badge badge-gold text-[11px]">{newLabel}</span>
          )}
          {discount > 0 && (
            <span className="badge badge-accent text-[11px]">{saleLabel}</span>
          )}
          {!product.availableSizes?.length && (
            <span
              className="badge text-[11px]"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
            >
              {locale === 'ar' ? 'نفذ' : 'Épuisé'}
            </span>
          )}
        </div>

        {/* Hover overlay actions */}
        <div className="product-card-actions">
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <Eye className="w-3.5 h-3.5" />
            {viewLabel}
          </Link>
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(product)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-white transition-all"
              style={{ background: 'var(--accent)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Product Info ── */}
      <div className="product-card-info">
        {/* Category */}
        {categoryName && (
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
            {categoryName}
          </p>
        )}

        {/* Name */}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="transition-colors hover:text-[var(--accent)]"
          >
            {name}
          </Link>
        </h3>

        {/* Color swatches */}
        {product.availableColors && product.availableColors.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.availableColors.slice(0, 5).map(c => (
              <span
                key={c.code}
                className="w-4 h-4 rounded-full border shadow-sm ring-offset-1 cursor-pointer hover:ring-2 hover:ring-[var(--accent)] transition-all"
                style={{
                  background: c.code,
                  borderColor: 'rgba(0,0,0,0.12)',
                  boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.1)',
                }}
                title={locale === 'ar' ? c.nameAr : locale === 'fr' ? c.nameFr : c.nameEn}
              />
            ))}
            {product.availableColors.length > 5 && (
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                +{product.availableColors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-baseline gap-1.5">
            {product.salePrice ? (
              <>
                <span className="price-sale text-base">{formatPrice(product.salePrice, locale)}</span>
                <span className="price-original text-xs">{formatPrice(product.basePrice, locale)}</span>
              </>
            ) : (
              <span className="price-current text-base">{formatPrice(product.basePrice, locale)}</span>
            )}
          </div>

          <Link
            href={`/${locale}/products/${product.slug}`}
            className="btn btn-primary btn-sm btn-round text-[11px] px-2.5 py-1.5 flex-shrink-0"
            aria-label={`${viewLabel}: ${name}`}
          >
            {viewLabel}
          </Link>
        </div>
      </div>
    </article>
  )
}

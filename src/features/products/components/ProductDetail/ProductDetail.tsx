'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/store/cart.store'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Info, ShieldAlert } from 'lucide-react'
import type { Product } from '@/types/product'

interface ProductDetailProps {
  product: Product
  locale: string
}

export function ProductDetail({ product, locale }: ProductDetailProps) {
  const t = useTranslations('products')
  const cartStore = useCartStore()
  const isRTL = locale === 'ar'

  // Pick unique sizes and colors from variants
  const sizes = Array.from(new Set(product.variants?.map((v) => v.size) || []))
  const colors = Array.from(
    new Map(
      product.variants?.map((v) => [
        v.colorCode,
        { code: v.colorCode, nameAr: v.colorNameAr, nameFr: v.colorNameFr, nameEn: v.colorNameEn },
      ]) || [],
    ).values(),
  )

  // State
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || 'Standard')
  const [selectedColor, setSelectedColor] = useState<typeof colors[0] | null>(colors[0] || null)
  const [quantity, setQuantity] = useState<number>(1)
  const [includeNiqab, setIncludeNiqab] = useState<boolean>(false)
  const [activeImage, setActiveImage] = useState<string>(product.mainImage)

  // Find selected variant
  const currentVariant = product.variants?.find(
    (v) => v.size === selectedSize && (!selectedColor || v.colorCode === selectedColor.code),
  )

  const hasStock = currentVariant ? currentVariant.stockQuantity > 0 : true
  const basePriceVal = Number(product.salePrice || product.basePrice)
  const niqabPrice = 20 // Constant for matching niqab add-on
  const finalPrice = includeNiqab ? basePriceVal + niqabPrice : basePriceVal

  const handleAddToCart = () => {
    // Construct cart item
    const colorNameAr = selectedColor?.nameAr || ''
    const colorNameFr = selectedColor?.nameFr || ''
    const colorNameEn = selectedColor?.nameEn || ''
    const colorCode = selectedColor?.code || ''

    cartStore.addItem({
      productId: product.id,
      variantId: currentVariant?.id,
      slug: product.slug,
      nameAr: product.nameAr,
      nameFr: product.nameFr,
      nameEn: product.nameEn,
      mainImage: product.mainImage,
      size: selectedSize,
      colorCode,
      colorNameAr,
      colorNameFr,
      colorNameEn,
      quantity,
      unitPrice: basePriceVal,
      isNiqab: product.isNiqab,
      niqabItem: includeNiqab
        ? {
          productId: 'niqab_addon',
          nameAr: 'نقاب مطابق',
          nameFr: 'Niqab assorti',
          nameEn: 'Matching Niqab',
          mainImage: '/images/brand/logo-icon.png',
          colorCode,
          colorNameAr,
          colorNameFr,
          colorNameEn,
          unitPrice: niqabPrice,
        }
        : undefined,
    })
  }

  const productName = locale === 'ar' ? product.nameAr : locale === 'fr' ? product.nameFr : product.nameEn
  const productDesc = locale === 'ar' ? product.descriptionAr : locale === 'fr' ? product.descriptionFr : product.descriptionEn

  return (
    <div className="product-detail-grid grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-8 xl:gap-10" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Visual Gallery Column ───────────────────────────── */}
      <div className="product-gallery-panel space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="product-main-image relative aspect-[4/5] overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <Image
            src={activeImage}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="product-thumbnails flex gap-3 overflow-x-auto pb-1" dir="ltr">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden border flex-shrink-0 transition-all ${activeImage === img ? 'border-2 border-[#C4622D] scale-95' : 'hover:border-[#C4622D]/60'
                  }`}
                style={{ borderColor: activeImage === img ? '#C4622D' : 'var(--border)' }}
              >
                <Image src={img} alt={`${productName} thumbnail ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Product Specifications Column ───────────────────── */}
      <div className="product-purchase-panel space-y-6">
        {/* Header Info */}
        <div className="product-title-block space-y-3" style={{ borderColor: 'var(--border)' }}>
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b8965a]">
              {locale === 'ar' ? product.category.nameAr : locale === 'fr' ? product.category.nameFr : product.category.nameEn}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--foreground)' }}>{productName}</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t('sku')}: {product.sku}</p>
        </div>

        {/* Pricing */}
        <div className="product-price-row flex items-baseline gap-3">
          {product.salePrice ? (
            <>
              <span className="text-xl sm:text-2xl font-bold text-[#C4622D]">
                {formatPrice(finalPrice, locale)}
              </span>
              <span className="text-sm line-through" style={{ color: 'var(--muted-foreground)' }}>
                {formatPrice(Number(product.basePrice) + (includeNiqab ? niqabPrice : 0), locale)}
              </span>
            </>
          ) : (
            <span className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              {formatPrice(finalPrice, locale)}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="product-description text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          {productDesc}
        </p>

        {/* Color Picker */}
        {colors.length > 0 && (
          <div className="product-option-group space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--foreground)' }}>
              {t('colors.select')}
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const colorLabel = locale === 'ar' ? color.nameAr : locale === 'fr' ? color.nameFr : color.nameEn
                const isSelected = selectedColor?.code === color.code
                return (
                  <button
                    key={color.code}
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${isSelected
                        ? 'border-[#C4622D] text-[#C4622D] bg-[rgba(196,98,45,0.05)]'
                        : 'hover:border-[#C4622D]/60'
                      }`}
                    style={{
                      borderColor: isSelected ? '#C4622D' : 'var(--border)',
                      color: isSelected ? '#C4622D' : 'var(--muted-foreground)',
                    }}
                    title={colorLabel}
                  >
                    <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ background: color.code }} />
                    {colorLabel}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Size Picker */}
        {sizes.length > 0 && (
          <div className="product-option-group space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold uppercase tracking-wider block" style={{ color: 'var(--foreground)' }}>
                {t('sizes.select')}
              </label>
              <button className="text-[#b8965a] hover:underline flex items-center gap-1 font-semibold">
                <Info className="w-3.5 h-3.5" />
                {t('sizes.guide')}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((sz) => {
                const isSelected = selectedSize === sz
                return (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xs font-bold transition-all ${isSelected
                        ? 'border-[#C4622D] text-[#C4622D] bg-[rgba(196,98,45,0.05)]'
                        : 'hover:border-[#C4622D]/60'
                      }`}
                    style={{
                      borderColor: isSelected ? '#C4622D' : 'var(--border)',
                      color: isSelected ? '#C4622D' : 'var(--muted-foreground)',
                    }}
                  >
                    {sz}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Optional Niqab Add-On Selection */}
        {product.canAddNiqab && (
          <div
            className={`product-addon p-4 rounded-xl border-2 transition-all ${includeNiqab ? 'border-[#C4622D] bg-[rgba(196,98,45,0.02)]' : 'border-dashed'
              }`}
            style={{ borderColor: includeNiqab ? '#C4622D' : 'var(--border)' }}
          >
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeNiqab}
                onChange={() => setIncludeNiqab(!includeNiqab)}
                className="mt-1 accent-[#C4622D] w-4 h-4 rounded"
              />
              <div className="space-y-1">
                <span className="font-bold text-sm block" style={{ color: 'var(--foreground)' }}>
                  {t('niqab.addOn')}
                </span>
                <span className="text-xs block" style={{ color: 'var(--muted-foreground)' }}>
                  {t('niqab.addOnDesc')} (+{formatPrice(niqabPrice, locale)})
                </span>
              </div>
            </label>
          </div>
        )}

        {/* Stock status indicator */}
        <div className="product-stock flex items-center gap-2 text-xs font-medium">
          {hasStock ? (
            <span className="flex items-center gap-1 text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse-soft" />
              {locale === 'ar' ? 'متوفر في المخزون' : locale === 'fr' ? 'En stock' : 'In stock'}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-600">
              <ShieldAlert className="w-3.5 h-3.5" />
              {t('outOfStock')}
            </span>
          )}
        </div>

        {/* Quantity and Actions */}
        <div className="product-actions flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Quantity selector */}
          {hasStock && (
            <div className="flex items-center justify-between sm:justify-start border rounded-xl overflow-hidden h-12" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 h-full transition-colors hover:bg-[rgba(196,98,45,0.08)] hover:text-[#C4622D] flex items-center justify-center font-bold"
                style={{ color: 'var(--muted-foreground)' }}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-4 text-sm font-semibold flex items-center justify-center" style={{ color: 'var(--foreground)' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 h-full transition-colors hover:bg-[rgba(196,98,45,0.08)] hover:text-[#C4622D] flex items-center justify-center font-bold"
                style={{ color: 'var(--muted-foreground)' }}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={!hasStock}
            className="w-full sm:flex-1 btn btn-primary h-10 sm:h-12 btn-round text-sm flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  )
}

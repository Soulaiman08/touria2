'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  ShoppingBag,
  ShieldAlert,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  Check,
  Truck,
  Banknote,
} from 'lucide-react'

import { useCartStore } from '@/store/cart.store'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/product'
import { ProductGallery } from './ProductGallery'
import { ProductReviews } from './ProductReviews'

interface ProductDetailProps {
  product: Product
  locale: string
}

interface NiqabSelection {
  id: string
  colorCode: string
  colorNameAr: string
  colorNameFr: string
  colorNameEn: string
  variantId?: string
  quantity: number
}

interface JellabaSelection {
  id: string
  colorCode: string
  colorNameAr: string
  colorNameFr: string
  colorNameEn: string
  size: string
  quantity: number
}

const NIQAB_PRICE = 20

interface NiqabColorDropdownProps {
  selectionId: string
  currentColorCode: string
  availableColors: Array<{
    code: string
    nameAr: string
    nameFr: string
    nameEn: string
    variantId?: string
  }>
  getDisplayColorName: (color: { code: string; nameAr: string; nameFr: string; nameEn: string }) => string
  onSelectColor: (id: string, colorCode: string) => void
}

function NiqabColorDropdown({
  selectionId,
  currentColorCode,
  availableColors,
  getDisplayColorName,
  onSelectColor,
}: NiqabColorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedColor = availableColors.find((c) => c.code === currentColorCode) || {
    code: currentColorCode,
    nameAr: '',
    nameFr: '',
    nameEn: '',
  }

  const selectedLabel = getDisplayColorName(selectedColor)

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 flex items-center justify-between gap-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors outline-none cursor-pointer"
        style={{
          background: 'var(--card-bg)',
          borderColor: isOpen ? 'var(--accent)' : 'var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          <span
            className="w-4 h-4 rounded-full border flex-shrink-0"
            style={{ background: selectedColor.code, borderColor: 'var(--border)' }}
          />
          <span className="truncate">{selectedLabel}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[var(--accent)]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 top-[calc(100%+4px)] start-0 w-full max-h-56 overflow-y-auto border shadow-lg rounded-xl py-1"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--border)',
          }}
        >
          {availableColors.map((color) => {
            const label = getDisplayColorName(color)
            const isSelected = color.code === currentColorCode

            return (
              <button
                key={color.code}
                type="button"
                onClick={() => {
                  onSelectColor(selectionId, color.code)
                  setIsOpen(false)
                }}
                className="w-full flex items-center justify-between gap-2.5 text-xs sm:text-sm font-semibold transition-colors px-3 py-2 cursor-pointer"
                style={{
                  background: isSelected ? 'var(--accent-light)' : 'transparent',
                  color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                }}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-4 h-4 rounded-full border flex-shrink-0"
                    style={{ background: color.code, borderColor: 'var(--border)' }}
                  />
                  <span className="truncate">{label}</span>
                </span>
                {isSelected && <Check className="h-4 w-4 text-[var(--accent)] flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ProductDetail({ product, locale }: ProductDetailProps) {
  const t = useTranslations('products')
  const cartStore = useCartStore()
  const isRTL = locale === 'ar'

  const sizes = Array.from(
    new Set(product.variants?.map((variant) => variant.size) || [])
  )

  const colors = Array.from(
    (() => {
      const map = new Map<string, { code: string; nameAr: string; nameFr: string; nameEn: string }>()
      for (const variant of product.variants || []) {
        const existing = map.get(variant.colorCode)
        const realAr = variant.colorNameAr && variant.colorNameAr !== 'لون' ? variant.colorNameAr : ''
        const realFr =
          variant.colorNameFr && variant.colorNameFr.toLowerCase() !== 'couleur'
            ? variant.colorNameFr
            : ''
        const realEn =
          variant.colorNameEn && variant.colorNameEn.toLowerCase() !== 'color'
            ? variant.colorNameEn
            : ''
        if (existing) {
          if (!existing.nameAr && realAr) existing.nameAr = realAr
          if (!existing.nameFr && realFr) existing.nameFr = realFr
          if (!existing.nameEn && realEn) existing.nameEn = realEn
        } else {
          map.set(variant.colorCode, {
            code: variant.colorCode,
            nameAr: realAr || '',
            nameFr: realFr || '',
            nameEn: realEn || '',
          })
        }
      }
      return map.values()
    })()
  )

  const niqabColors = useMemo(() => {
    const variants = product.isNiqab
      ? product.variants || []
      : product.niqabProduct?.variants || []

    return Array.from(
      new Map(
        variants
          .filter((variant) => variant.isActive)
          .map((variant) => [
            variant.colorCode,
            {
              code: variant.colorCode,
              nameAr: variant.colorNameAr,
              nameFr: variant.colorNameFr,
              nameEn: variant.colorNameEn,
              variantId: variant.id,
            },
          ])
      ).values()
    )
  }, [product.isNiqab, product.niqabProduct, product.variants])

  const [includeNiqab, setIncludeNiqab] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)

  const [niqabSelections, setNiqabSelections] = useState<NiqabSelection[]>(() =>
    product.isNiqab && niqabColors[0]
      ? [
          {
            id: crypto.randomUUID(),
            colorCode: niqabColors[0].code,
            colorNameAr: niqabColors[0].nameAr,
            colorNameFr: niqabColors[0].nameFr,
            colorNameEn: niqabColors[0].nameEn,
            variantId: niqabColors[0].variantId,
            quantity: 5,
          },
        ]
      : []
  )

  const [selectedJellabas, setSelectedJellabas] = useState<JellabaSelection[]>(() => {
    if (product.isNiqab || colors.length === 0) return []
    return [
      {
        id: crypto.randomUUID(),
        colorCode: colors[0].code,
        colorNameAr: colors[0].nameAr,
        colorNameFr: colors[0].nameFr,
        colorNameEn: colors[0].nameEn,
        size: sizes[0] || '',
        quantity: 1,
      },
    ]
  })

  const [activeImage, setActiveImage] = useState(product.mainImage)

  const currentVariant = product.variants?.find((variant) => {
    if (product.isNiqab) return true
    if (selectedJellabas.length > 0) {
      const first = selectedJellabas[0]
      return variant.colorCode === first.colorCode && variant.size === first.size
    }
    return false
  })

  const hasStock = product.isNiqab
    ? currentVariant
      ? currentVariant.stockQuantity > 0
      : true
    : selectedJellabas.every((sel) => {
        const v = product.variants?.find(
          (variant) => variant.colorCode === sel.colorCode && variant.size === sel.size
        )
        return v ? v.stockQuantity > 0 : true
      })

  const basePriceVal = Number(product.salePrice || product.basePrice)

  const selectedNiqabQuantity = niqabSelections.reduce((sum, item) => sum + item.quantity, 0)
  const niqabTotal = selectedNiqabQuantity * NIQAB_PRICE

  const jellabasTotal = selectedJellabas.reduce((sum, item) => {
    const variant = product.variants?.find(
      (v) => v.colorCode === item.colorCode && v.size === item.size
    )
    return sum + item.quantity * (basePriceVal + Number(variant?.priceModifier || 0))
  }, 0)

  const selectedJellabaQuantity = selectedJellabas.reduce((sum, item) => sum + item.quantity, 0)
  const usedJellabaColors = new Set(selectedJellabas.map((item) => item.colorCode))
  const availableJellabaColors = colors.filter((color) => !usedJellabaColors.has(color.code))

  const finalPrice = product.isNiqab
    ? selectedNiqabQuantity * basePriceVal
    : jellabasTotal + niqabTotal

  const usedNiqabColors = new Set(niqabSelections.map((item) => item.colorCode))
  const availableNiqabColors = niqabColors.filter((color) => !usedNiqabColors.has(color.code))

  const getDisplayColorName = (color: {
    code: string
    nameAr: string
    nameFr: string
    nameEn: string
  }): string => {
    const name =
      locale === 'ar' ? color.nameAr : locale === 'fr' ? color.nameFr : color.nameEn

    if (
      name &&
      name.trim() !== 'لون' &&
      name.toLowerCase().trim() !== 'color' &&
      name.toLowerCase().trim() !== 'couleur'
    ) {
      return name
    }

    const code = color.code.trim().toLowerCase()
    if (code === '#000000' || code === '#000' || code === 'black') {
      return locale === 'ar' ? 'أسود' : locale === 'fr' ? 'Noir' : 'Black'
    }
    if (['#964b00', '#6b4226', '#8b4513', '#5c4033'].includes(code)) {
      return locale === 'ar' ? 'بني' : locale === 'fr' ? 'Marron' : 'Brown'
    }
    if (['#f5f5dc', '#e8dcc8', '#fff8dc'].includes(code)) {
      return locale === 'ar' ? 'بيج' : locale === 'fr' ? 'Beige' : 'Beige'
    }
    if (code === '#c4622d') {
      return locale === 'ar' ? 'تيراكوتا' : locale === 'fr' ? 'Terracotta' : 'Terracotta'
    }
    if (code === '#f2e4ce') {
      return locale === 'ar' ? 'كريمي' : locale === 'fr' ? 'Crème' : 'Cream'
    }
    if (code === '#1b2b4b') {
      return locale === 'ar' ? 'أزرق داكن' : locale === 'fr' ? 'Marine' : 'Navy'
    }
    if (code === '#2d5a27') {
      return locale === 'ar' ? 'أخضر زيتوني' : locale === 'fr' ? 'Vert Olive' : 'Olive Green'
    }
    if (code === '#8b1a1a') {
      return locale === 'ar' ? 'أحمر غامق' : locale === 'fr' ? 'Rouge Foncé' : 'Dark Red'
    }
    const en =
      color.nameEn && color.nameEn.toLowerCase().trim() !== 'color' ? color.nameEn : null
    const fr =
      color.nameFr && color.nameFr.toLowerCase().trim() !== 'couleur' ? color.nameFr : null
    const ar = color.nameAr && color.nameAr.trim() !== 'لون' ? color.nameAr : null
    return locale === 'ar'
      ? ar || en || fr || color.code
      : locale === 'fr'
        ? fr || en || ar || color.code
        : en || fr || ar || color.code
  }

  const handleEnableNiqab = () => {
    if (niqabColors.length === 0) return
    setIncludeNiqab(true)
    if (niqabSelections.length > 0) return

    const blackColor = niqabColors.find((color) => {
      const code = color.code.trim().toLowerCase()
      const name = (color.nameAr + ' ' + color.nameEn + ' ' + color.nameFr).toLowerCase()
      return (
        code === '#000000' ||
        code === '#000' ||
        code === 'black' ||
        name.includes('أسود') ||
        name.includes('black') ||
        name.includes('noir')
      )
    })

    const defaultColor = blackColor || niqabColors[0]
    if (!defaultColor) return

    setNiqabSelections([
      {
        id: crypto.randomUUID(),
        colorCode: defaultColor.code,
        colorNameAr: defaultColor.nameAr,
        colorNameFr: defaultColor.nameFr,
        colorNameEn: defaultColor.nameEn,
        variantId: defaultColor.variantId,
        quantity: 1,
      },
    ])
  }

  const handleDisableNiqab = () => {
    setIncludeNiqab(false)
    setNiqabSelections([])
  }

  const handleAddNiqabColor = () => {
    const nextColor = availableNiqabColors[0]
    if (!nextColor) return
    setNiqabSelections((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        colorCode: nextColor.code,
        colorNameAr: nextColor.nameAr,
        colorNameFr: nextColor.nameFr,
        colorNameEn: nextColor.nameEn,
        variantId: nextColor.variantId,
        quantity: 1,
      },
    ])
  }

  const updateNiqabQuantity = (id: string, amount: number) => {
    setNiqabSelections((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
      )
    )
  }

  const removeNiqabColor = (id: string) => {
    setNiqabSelections((current) => {
      const next = current.filter((item) => item.id !== id)
      if (next.length === 0) setIncludeNiqab(false)
      return next
    })
  }

  const changeNiqabColor = (id: string, colorCode: string) => {
    const color = niqabColors.find((item) => item.code === colorCode)
    if (!color) return
    if (niqabSelections.some((item) => item.id !== id && item.colorCode === colorCode)) return
    setNiqabSelections((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              colorCode: color.code,
              colorNameAr: color.nameAr,
              colorNameFr: color.nameFr,
              colorNameEn: color.nameEn,
              variantId: color.variantId,
            }
          : item
      )
    )
  }

  const handleAddJellabaColor = () => {
    const nextColor = availableJellabaColors[0]
    if (!nextColor) return
    setSelectedJellabas((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        colorCode: nextColor.code,
        colorNameAr: nextColor.nameAr,
        colorNameFr: nextColor.nameFr,
        colorNameEn: nextColor.nameEn,
        size: sizes[0] || '',
        quantity: 1,
      },
    ])
  }

  const updateJellabaQuantity = (id: string, amount: number) => {
    setSelectedJellabas((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
      )
    )
  }

  const removeJellabaColor = (id: string) => {
    setSelectedJellabas((current) => current.filter((item) => item.id !== id))
  }

  const changeJellabaColor = (id: string, colorCode: string) => {
    const color = colors.find((c) => c.code === colorCode)
    if (!color) return
    if (selectedJellabas.some((item) => item.id !== id && item.colorCode === colorCode)) return
    setSelectedJellabas((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              colorCode: color.code,
              colorNameAr: color.nameAr,
              colorNameFr: color.nameFr,
              colorNameEn: color.nameEn,
            }
          : item
      )
    )
  }

  const changeJellabaSize = (id: string, size: string) => {
    setSelectedJellabas((current) =>
      current.map((item) => (item.id === id ? { ...item, size } : item))
    )
  }

  const triggerFeedback = () => {
    setAddedFeedback(true)
    window.setTimeout(() => setAddedFeedback(false), 1800)
  }

  const handleAddToCart = () => {
    if (product.isNiqab) {
      if (selectedNiqabQuantity < 5) return
      niqabSelections.forEach((selection) => {
        const variant = product.variants?.find((entry) => entry.id === selection.variantId)
        cartStore.addItem({
          productId: product.id,
          variantId: selection.variantId,
          slug: product.slug,
          nameAr: product.nameAr,
          nameFr: product.nameFr,
          nameEn: product.nameEn,
          mainImage: variant?.images[0] || product.mainImage,
          size: '',
          colorCode: selection.colorCode,
          colorNameAr: selection.colorNameAr,
          colorNameFr: selection.colorNameFr,
          colorNameEn: selection.colorNameEn,
          quantity: selection.quantity,
          unitPrice: basePriceVal + Number(variant?.priceModifier || 0),
          isNiqab: true,
        })
      })
      triggerFeedback()
      return
    }

    if (selectedJellabas.length === 0) return

    selectedJellabas.forEach((selection) => {
      const variant = product.variants?.find(
        (v) => v.colorCode === selection.colorCode && v.size === selection.size
      )

      cartStore.addItem({
        productId: product.id,
        variantId: variant?.id,
        slug: product.slug,
        nameAr: product.nameAr,
        nameFr: product.nameFr,
        nameEn: product.nameEn,
        mainImage: product.mainImage,
        size: selection.size,
        colorCode: selection.colorCode,
        colorNameAr: selection.colorNameAr,
        colorNameFr: selection.colorNameFr,
        colorNameEn: selection.colorNameEn,
        quantity: selection.quantity,
        unitPrice: basePriceVal + Number(variant?.priceModifier || 0),
        isNiqab: false,
        niqabItems:
          includeNiqab && niqabSelections.length > 0
            ? niqabSelections.map((item) => ({
                productId: product.niqabProduct?.id || 'niqab',
                variantId: item.variantId,
                nameAr: product.niqabProduct?.nameAr || 'نقاب',
                nameFr: product.niqabProduct?.nameFr || 'Niqab',
                nameEn: product.niqabProduct?.nameEn || 'Niqab',
                mainImage: product.niqabProduct?.mainImage || '/images/brand/logo-icon.png',
                colorCode: item.colorCode,
                colorNameAr: item.colorNameAr,
                colorNameFr: item.colorNameFr,
                colorNameEn: item.colorNameEn,
                quantity: item.quantity,
                unitPrice: NIQAB_PRICE,
              }))
            : undefined,
      })
    })
    triggerFeedback()
  }

  const productName =
    locale === 'ar' ? product.nameAr : locale === 'fr' ? product.nameFr : product.nameEn

  const productDesc =
    locale === 'ar'
      ? product.descriptionAr
      : locale === 'fr'
        ? product.descriptionFr
        : product.descriptionEn

  return (
    <>
      <div
        className="product-detail-grid grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-8 xl:gap-10"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* ── Gallery Column ─────────────────────────────────────────── */}
        <ProductGallery
          images={product.images || []}
          mainImage={product.mainImage}
          productName={productName}
          activeImage={activeImage}
          onSelectImage={setActiveImage}
          locale={locale}
        />

        {/* ── Purchase Atelier Column ────────────────────────────────── */}
        <div className="product-purchase-panel space-y-5">
          {/* Header */}
          <div className="product-title-block space-y-2 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            {product.category && (
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: 'var(--gold)' }}
              >
                {locale === 'ar'
                  ? product.category.nameAr
                  : locale === 'fr'
                    ? product.category.nameFr
                    : product.category.nameEn}
              </span>
            )}

            <h1
              className="text-2xl sm:text-3xl font-bold leading-tight"
              style={{
                color: 'var(--text-primary)',
                fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
              }}
            >
              {productName}
            </h1>

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                {t('sku')}: {product.sku}
              </p>
              {hasStock ? (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: 'var(--success)' }}
                >
                  <Check className="h-3.5 w-3.5" />
                  {locale === 'ar' ? 'متوفر' : locale === 'fr' ? 'En stock' : 'In stock'}
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: 'var(--error)' }}
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {t('outOfStock')}
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="product-price-row">
            <div className="flex flex-wrap items-baseline gap-2.5 tabular-nums">
              {product.salePrice ? (
                <>
                  <span
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: 'var(--accent)' }}
                  >
                    {formatPrice(basePriceVal, locale)}
                  </span>
                  <span
                    className="text-sm line-through"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {formatPrice(Number(product.basePrice), locale)}
                  </span>
                </>
              ) : (
                <span
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatPrice(basePriceVal, locale)}
                </span>
              )}

              {product.isNiqab && (
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {locale === 'ar'
                    ? 'للنقاب الواحد'
                    : locale === 'fr'
                      ? 'pour un niqab'
                      : 'per niqab'}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {productDesc}
          </p>

          {/* Jellaba Variant Builder */}
          {!product.isNiqab && colors.length > 0 && (
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-subtle)',
              }}
            >
              <div>
                <span className="font-bold text-sm block" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'ar'
                    ? 'اختاري الألوان والمقاسات'
                    : locale === 'fr'
                      ? 'Choisissez les couleurs et tailles'
                      : 'Choose colors and sizes'}
                </span>
                <span className="text-xs block mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {locale === 'ar'
                    ? 'أضيفي جلابات بألوان ومقاسات مختلفة في طلب واحد'
                    : locale === 'fr'
                      ? 'Ajoutez des djellabas en différentes couleurs et tailles'
                      : 'Add djellabas in different colors and sizes'}
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedJellabas.map((selection) => {
                  const rowAvailableColors = colors.filter(
                    (color) =>
                      !selectedJellabas.some(
                        (other) => other.id !== selection.id && other.colorCode === color.code
                      )
                  )

                  return (
                    <div
                      key={selection.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
                    >
                      <div className="w-full sm:flex-1 min-w-0">
                        <NiqabColorDropdown
                          selectionId={selection.id}
                          currentColorCode={selection.colorCode}
                          availableColors={rowAvailableColors}
                          getDisplayColorName={getDisplayColorName}
                          onSelectColor={changeJellabaColor}
                        />
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                        <select
                          value={selection.size}
                          onChange={(e) => changeJellabaSize(selection.id, e.target.value)}
                          aria-label={locale === 'ar' ? 'المقاس' : 'Size'}
                          className="h-10 flex-1 sm:flex-initial sm:w-20 rounded-xl border px-2.5 text-xs font-bold cursor-pointer"
                          style={{
                            borderColor: 'var(--border)',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {sizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div
                            className="flex items-center h-10 border rounded-xl overflow-hidden"
                            style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
                          >
                            <button
                              type="button"
                              onClick={() => updateJellabaQuantity(selection.id, -1)}
                              className="w-8 h-full flex items-center justify-center transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--accent)] cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span
                              className="px-2 h-full flex items-center justify-center text-xs sm:text-sm font-bold border-x min-w-[2rem] tabular-nums"
                              style={{ borderColor: 'var(--border)' }}
                            >
                              {selection.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateJellabaQuantity(selection.id, 1)}
                              className="w-8 h-full flex items-center justify-center transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--accent)] cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {selectedJellabas.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeJellabaColor(selection.id)}
                              className="w-9 h-10 flex items-center justify-center rounded-xl border text-red-500 hover:bg-red-500/10 flex-shrink-0 transition-colors cursor-pointer"
                              style={{
                                borderColor: 'rgba(239,68,68,0.25)',
                                background: 'var(--card-bg)',
                              }}
                              aria-label="Remove color"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {availableJellabaColors.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddJellabaColor}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer hover:bg-[var(--accent-light)]"
                    style={{
                      borderColor: 'var(--accent)',
                      color: 'var(--accent)',
                      background: 'var(--card-bg)',
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {locale === 'ar'
                      ? 'إضافة لون آخر'
                      : locale === 'fr'
                        ? 'Ajouter une couleur'
                        : 'Add another color'}
                  </button>
                )}

                <div
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border tabular-nums"
                  style={{
                    background: 'var(--accent-light)',
                    borderColor: 'var(--accent-ring)',
                  }}
                >
                  <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'ar'
                      ? `الجلابات المختارة (${selectedJellabaQuantity})`
                      : locale === 'fr'
                        ? `Total djellabas (${selectedJellabaQuantity})`
                        : `Selected djellabas (${selectedJellabaQuantity})`}
                  </span>
                  <span className="text-sm sm:text-base font-bold" style={{ color: 'var(--accent)' }}>
                    {formatPrice(jellabasTotal, locale)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Niqab Add-on or Standalone Builder */}
          {((product.canAddNiqab && !product.isNiqab) || product.isNiqab) &&
            niqabColors.length > 0 && (
              <div
                className="rounded-xl border p-4 space-y-3 transition-colors"
                style={{
                  borderColor: includeNiqab ? 'var(--accent)' : 'var(--border)',
                  background: includeNiqab ? 'var(--accent-light)' : 'var(--bg-subtle)',
                }}
              >
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  {!product.isNiqab && (
                    <input
                      type="checkbox"
                      checked={includeNiqab}
                      onChange={(e) =>
                        e.target.checked ? handleEnableNiqab() : handleDisableNiqab()
                      }
                      className="mt-1 w-4 h-4 rounded cursor-pointer flex-shrink-0"
                      style={{ accentColor: 'var(--accent)' }}
                    />
                  )}
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm block" style={{ color: 'var(--text-primary)' }}>
                      {product.isNiqab
                        ? locale === 'ar'
                          ? 'اختاري الألوان والكميات'
                          : locale === 'fr'
                            ? 'Choisissez les couleurs et quantités'
                            : 'Choose colors and quantities'
                        : locale === 'ar'
                          ? 'أضيفي نقاباً متناسقاً'
                          : locale === 'fr'
                            ? 'Ajouter un niqab assorti'
                            : 'Add a matching niqab'}
                    </span>
                    <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>
                      {locale === 'ar'
                        ? 'نقاب متناسق مع جلابتك (+20 د.م)'
                        : locale === 'fr'
                          ? 'Niqab assorti à votre djellaba (+20 DH)'
                          : 'Matching niqab for your djellaba (+20 DH)'}
                    </span>
                  </div>
                </label>

                {(product.isNiqab || includeNiqab) && niqabSelections.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    {niqabSelections.map((selection, index) => {
                      const rowAvailableColors = niqabColors.filter(
                        (color) =>
                          !niqabSelections.some(
                            (other) => other.id !== selection.id && other.colorCode === color.code
                          )
                      )

                      return (
                        <div
                          key={selection.id}
                          className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3"
                        >
                          <div className="flex-1 min-w-[140px]">
                            <NiqabColorDropdown
                              selectionId={selection.id}
                              currentColorCode={selection.colorCode}
                              availableColors={rowAvailableColors}
                              getDisplayColorName={getDisplayColorName}
                              onSelectColor={changeNiqabColor}
                            />
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div
                              className="flex items-center h-10 border rounded-xl overflow-hidden"
                              style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
                            >
                              <button
                                type="button"
                                onClick={() => updateNiqabQuantity(selection.id, -1)}
                                className="w-8 h-full flex items-center justify-center transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--accent)] cursor-pointer"
                                aria-label="Decrease niqab quantity"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span
                                className="px-2 h-full flex items-center justify-center text-xs sm:text-sm font-bold border-x min-w-[2rem] tabular-nums"
                                style={{ borderColor: 'var(--border)' }}
                              >
                                {selection.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateNiqabQuantity(selection.id, 1)}
                                className="w-8 h-full flex items-center justify-center transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--accent)] cursor-pointer"
                                aria-label="Increase niqab quantity"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {(index > 0 || niqabSelections.length > 1) && (
                              <button
                                type="button"
                                onClick={() => removeNiqabColor(selection.id)}
                                className="w-9 h-10 flex items-center justify-center rounded-xl border text-red-500 hover:bg-red-500/10 flex-shrink-0 transition-colors cursor-pointer"
                                style={{
                                  borderColor: 'rgba(239,68,68,0.25)',
                                  background: 'var(--card-bg)',
                                }}
                                aria-label="Remove niqab color"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {availableNiqabColors.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAddNiqabColor}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                        style={{
                          borderColor: 'var(--accent)',
                          color: 'var(--accent)',
                          background: 'var(--card-bg)',
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        {locale === 'ar'
                          ? 'إضافة لون آخر'
                          : locale === 'fr'
                            ? 'Ajouter une autre couleur'
                            : 'Add another color'}
                      </button>
                    )}

                    <div
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border tabular-nums"
                      style={{
                        background: 'var(--card-bg)',
                        borderColor: 'var(--accent-ring)',
                      }}
                    >
                      <span
                        className="text-xs sm:text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {locale === 'ar'
                          ? `مجموع النقابات (${selectedNiqabQuantity})`
                          : locale === 'fr'
                            ? `Total niqabs (${selectedNiqabQuantity})`
                            : `Total niqabs (${selectedNiqabQuantity})`}
                      </span>
                      <span
                        className="text-sm sm:text-base font-bold"
                        style={{ color: 'var(--accent)' }}
                      >
                        +{formatPrice(niqabTotal, locale)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

          {product.isNiqab && (
            <div
              className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold"
              style={{
                background: 'var(--accent-light)',
                borderColor: 'var(--accent-ring)',
                color: 'var(--accent)',
              }}
            >
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              <span>
                {locale === 'ar'
                  ? 'الحد الأدنى للطلب: 5 نقابات'
                  : locale === 'fr'
                    ? 'Quantité minimale : 5 niqabs'
                    : 'Minimum order: 5 niqabs'}
              </span>
            </div>
          )}

          {/* Total + Add To Cart */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            {finalPrice > 0 && (
              <div className="flex items-center justify-between text-sm tabular-nums">
                <span className="font-medium" style={{ color: 'var(--text-muted)' }}>
                  {locale === 'ar' ? 'المجموع' : locale === 'fr' ? 'Total' : 'Subtotal'}
                </span>
                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatPrice(finalPrice, locale)}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={
                (!product.isNiqab && (selectedJellabas.length === 0 || !hasStock)) ||
                (product.isNiqab && selectedNiqabQuantity < 5)
              }
              className="btn btn-primary btn-round flex h-12 w-full items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              {addedFeedback ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>
                    {locale === 'ar'
                      ? 'تمت الإضافة إلى السلة'
                      : locale === 'fr'
                        ? 'Ajouté au panier'
                        : 'Added to cart'}
                  </span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>{t('addToCart')}</span>
                </>
              )}
            </button>

            {/* Trust Micro-Row */}
            <div
              className="flex items-center justify-center gap-5 pt-1 text-[11px] font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-[var(--accent)]" />
                {locale === 'ar'
                  ? 'الدفع عند الاستلام'
                  : locale === 'fr'
                    ? 'Paiement à la livraison'
                    : 'Cash on delivery'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[var(--accent)]" />
                {locale === 'ar'
                  ? 'توصيل لجميع المدن'
                  : locale === 'fr'
                    ? 'Livraison nationale'
                    : 'Nationwide shipping'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} locale={locale} />
    </>
  )
}

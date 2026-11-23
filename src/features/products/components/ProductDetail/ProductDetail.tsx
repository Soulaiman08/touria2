'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  ShoppingBag,
  ShieldAlert,
  Plus,
  Minus,
  Trash2,
  Check,
  Truck,
  Banknote,
  Ruler,
  Share2,
  ShieldCheck,
  Info,
} from 'lucide-react'

import { useCartStore } from '@/store/cart.store'
import { formatPrice } from '@/lib/utils'
import { getDefaultCategoryConfig, getCategoryUnitLabels } from '@/lib/category-config'
import type { Product } from '@/types/product'
import { CustomSelect } from '@/components/shared/CustomSelect'
import { ProductGallery } from './ProductGallery'
import { ProductReviews } from './ProductReviews'
import { SizeGuideModal } from './SizeGuideModal'

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

function safeId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function ProductDetail({ product, locale }: ProductDetailProps) {
  const t = useTranslations('products')
  const cartStore = useCartStore()
  const isRTL = locale === 'ar'

  const categoryConfig = product.category?.config ?? getDefaultCategoryConfig(product.category)
  const unitLabels = getCategoryUnitLabels(categoryConfig, locale)
  const effectiveMinQty = Math.max(1, categoryConfig.minOrderQuantity || (product.isNiqab ? 5 : 1))
  const effectiveMaxQty = categoryConfig.maxOrderQuantity ?? null

  const sizes = Array.from(
    new Set(product.variants?.map((variant) => variant.size) || [])
  )

  const NON_APPAREL_SIZES = new Set([
    'standard',
    'one size',
    'free size',
    'unique',
    'n/a',
    'null',
    'undefined',
  ])
  const hasMultipleOrNamedSizes =
    sizes.length > 1 ||
    (sizes.length === 1 && !NON_APPAREL_SIZES.has(sizes[0].trim().toLowerCase()))

  const showSizesUI =
    categoryConfig.sizingMode !== 'bundle_no_size' &&
    categoryConfig.sizingMode !== 'standard' &&
    hasMultipleOrNamedSizes

  const showSizeGuideButton =
    showSizesUI && categoryConfig.sizeGuideProfile !== 'none'

  const careNote = (
    locale === 'ar'
      ? categoryConfig.careNoteAr
      : locale === 'fr'
        ? categoryConfig.careNoteFr
        : categoryConfig.careNoteEn
  ).trim()

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
              priceModifier: Number(variant.priceModifier || 0),
            },
          ])
      ).values()
    )
  }, [product.isNiqab, product.niqabProduct, product.variants])

  const [includeNiqab, setIncludeNiqab] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const [customNote, setCustomNote] = useState('')

  const [niqabSelections, setNiqabSelections] = useState<NiqabSelection[]>(() =>
    product.isNiqab && niqabColors[0]
      ? [
          {
            id: safeId(),
            colorCode: niqabColors[0].code,
            colorNameAr: niqabColors[0].nameAr,
            colorNameFr: niqabColors[0].nameFr,
            colorNameEn: niqabColors[0].nameEn,
            variantId: niqabColors[0].variantId,
            quantity: effectiveMinQty,
          },
        ]
      : []
  )

  const [selectedJellabas, setSelectedJellabas] = useState<JellabaSelection[]>(() => {
    if (product.isNiqab || colors.length === 0) return []
    const initialQty =
      effectiveMaxQty !== null ? Math.min(effectiveMinQty, effectiveMaxQty) : effectiveMinQty
    return [
      {
        id: safeId(),
        colorCode: colors[0].code,
        colorNameAr: colors[0].nameAr,
        colorNameFr: colors[0].nameFr,
        colorNameEn: colors[0].nameEn,
        size: sizes[0] || '',
        quantity: Math.max(1, initialQty),
      },
    ]
  })

  const [activeImage, setActiveImage] = useState(product.mainImage)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const handleCopyProductLink = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : ''
      if (!url) return
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const input = document.createElement('input')
        input.value = url
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }
      setCopiedLink(true)
      window.setTimeout(() => setCopiedLink(false), 1800)
    } catch {
      // Clipboard blocked cleanly ignored
    }
  }

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

  const basePriceVal = Number(product.salePrice ?? product.basePrice)

  const niqabAddonBasePrice = product.niqabProduct
    ? Number(product.niqabProduct.salePrice ?? product.niqabProduct.basePrice ?? 0)
    : 0

  const getNiqabSelectionUnitPrice = (selection: NiqabSelection) => {
    const colorEntry = niqabColors.find(
      (c) => (selection.variantId && c.variantId === selection.variantId) || c.code === selection.colorCode
    )
    const modifier = Number(colorEntry?.priceModifier || 0)
    return (product.isNiqab ? basePriceVal : niqabAddonBasePrice) + modifier
  }

  const selectedNiqabQuantity = niqabSelections.reduce((sum, item) => sum + item.quantity, 0)
  const niqabTotal = niqabSelections.reduce(
    (sum, item) => sum + item.quantity * getNiqabSelectionUnitPrice(item),
    0
  )

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
    ? niqabTotal
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
        id: safeId(),
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
    if (product.isNiqab && effectiveMaxQty !== null && selectedNiqabQuantity >= effectiveMaxQty) {
      return
    }
    setNiqabSelections((current) => [
      ...current,
      {
        id: safeId(),
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
    setNiqabSelections((current) => {
      const totalBefore = current.reduce((sum, entry) => sum + entry.quantity, 0)
      return current.map((item) => {
        if (item.id !== id) return item
        const nextQty = Math.max(1, item.quantity + amount)
        if (product.isNiqab && amount > 0 && effectiveMaxQty !== null) {
          const allowedMaxForRow = Math.max(item.quantity, item.quantity + (effectiveMaxQty - totalBefore))
          return { ...item, quantity: Math.min(nextQty, allowedMaxForRow) }
        }
        return { ...item, quantity: nextQty }
      })
    })
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
    if (effectiveMaxQty !== null && selectedJellabaQuantity >= effectiveMaxQty) return
    setSelectedJellabas((current) => [
      ...current,
      {
        id: safeId(),
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
    setSelectedJellabas((current) => {
      const totalBefore = current.reduce((sum, entry) => sum + entry.quantity, 0)
      return current.map((item) => {
        if (item.id !== id) return item
        const nextQty = Math.max(1, item.quantity + amount)
        if (amount > 0 && effectiveMaxQty !== null) {
          const allowedMaxForRow = Math.max(item.quantity, item.quantity + (effectiveMaxQty - totalBefore))
          return { ...item, quantity: Math.min(nextQty, allowedMaxForRow) }
        }
        return { ...item, quantity: nextQty }
      })
    })
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
      if (selectedNiqabQuantity < effectiveMinQty) return
      if (effectiveMaxQty !== null && selectedNiqabQuantity > effectiveMaxQty) return
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
          minOrderQuantity: effectiveMinQty,
          maxOrderQuantity: effectiveMaxQty,
        })
      })
      triggerFeedback()
      return
    }

    if (selectedJellabas.length === 0) return
    if (selectedJellabaQuantity < effectiveMinQty) return
    if (effectiveMaxQty !== null && selectedJellabaQuantity > effectiveMaxQty) return

    const trimmedNote = categoryConfig.allowCustomNote ? customNote.trim() : ''

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
        minOrderQuantity: effectiveMinQty,
        maxOrderQuantity: effectiveMaxQty,
        customNote: trimmedNote || undefined,
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
                unitPrice: getNiqabSelectionUnitPrice(item),
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

  const discountPercent =
    product.salePrice && Number(product.basePrice) > Number(product.salePrice)
      ? Math.round(
          ((Number(product.basePrice) - Number(product.salePrice)) / Number(product.basePrice)) * 100
        )
      : 0

  return (
    <>
      <div
        className="product-detail-grid grid grid-cols-1 gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:gap-5 lg:gap-7 xl:gap-9"
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
        <div className="product-purchase-panel min-w-0 w-full">
          {/* Header */}
          <div className="product-title-block space-y-1.5 pb-2.5">
            {product.category && (
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.14em] block"
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
              className="text-xl min-[400px]:text-2xl lg:text-[1.75rem] font-bold leading-tight text-balance"
              style={{
                color: 'var(--text-primary)',
                fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
              }}
            >
              {productName}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs min-w-0">
                <span className="tabular-nums break-all sm:break-normal" style={{ color: 'var(--text-muted)' }}>
                  {t('sku')}:{' '}
                  <span dir="ltr" className="inline-block font-mono">
                    {product.sku}
                  </span>
                </span>
                <span aria-hidden="true" style={{ color: 'var(--border)' }}>·</span>
                {hasStock ? (
                  <span
                    className="inline-flex items-center gap-1 font-semibold whitespace-nowrap"
                    style={{ color: 'var(--success)' }}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {locale === 'ar' ? 'متوفر' : locale === 'fr' ? 'En stock' : 'In stock'}
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 font-semibold whitespace-nowrap"
                    style={{ color: 'var(--error)' }}
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {t('outOfStock')}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopyProductLink}
                aria-label={
                  locale === 'ar'
                    ? 'نسخ رابط المنتج'
                    : locale === 'fr'
                      ? 'Copier le lien du produit'
                      : 'Copy product link'
                }
                className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] sm:text-xs font-semibold transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer whitespace-nowrap"
                style={{
                  borderColor: copiedLink ? 'var(--success)' : 'var(--border)',
                  background: copiedLink ? 'var(--success-bg)' : 'var(--bg-subtle)',
                  color: copiedLink ? 'var(--success)' : 'var(--text-secondary)',
                }}
              >
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5 text-[var(--accent)]" />}
                <span>
                  {copiedLink
                    ? locale === 'ar'
                      ? 'تم النسخ'
                      : locale === 'fr'
                        ? 'Lien copié'
                        : 'Link copied'
                    : locale === 'ar'
                      ? 'مشاركة'
                      : locale === 'fr'
                        ? 'Partager'
                        : 'Share'}
                </span>
              </button>
            </div>
          </div>

          {/* Architectural Price Strip (unboxed, clean hierarchy) */}
          <div className="product-price-row flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
            <div className="flex flex-wrap items-baseline gap-2.5 tabular-nums">
              {product.salePrice ? (
                <>
                  <span
                    className="text-2xl lg:text-[1.75rem] font-bold tracking-tight"
                    style={{ color: 'var(--accent)' }}
                  >
                    {formatPrice(basePriceVal, locale)}
                  </span>
                  <span
                    className="text-xs sm:text-sm line-through"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {formatPrice(Number(product.basePrice), locale)}
                  </span>
                  {discountPercent > 0 && (
                    <span
                      dir="ltr"
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums"
                      style={{
                        background: 'var(--accent-light)',
                        color: 'var(--accent)',
                      }}
                    >
                      -{discountPercent}%
                    </span>
                  )}
                </>
              ) : (
                <span
                  className="text-2xl lg:text-[1.75rem] font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatPrice(basePriceVal, locale)}
                </span>
              )}

              {(product.isNiqab || effectiveMinQty > 1) && (
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {locale === 'ar'
                    ? `للـ${unitLabels.singular} الواحد`
                    : locale === 'fr'
                      ? `par ${unitLabels.singular}`
                      : `per ${unitLabels.singular}`}
                </span>
              )}
            </div>

            <span className="text-[11px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
              {locale === 'ar'
                ? 'الدفع عند الاستلام'
                : locale === 'fr'
                  ? 'Paiement à la livraison'
                  : 'Cash on delivery'}
            </span>
          </div>

          {/* Description */}
          <p className="text-[13px] sm:text-sm leading-relaxed break-words" style={{ color: 'var(--text-muted)' }}>
            {productDesc}
          </p>

          {/* Care / Material Editorial Note from Category Config */}
          {careNote && (
            <div
              className="flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed"
              style={{
                background: 'var(--bg-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
              <span>{careNote}</span>
            </div>
          )}

          {/* Jellaba / Apparel / Accessory Variant Builder */}
          {!product.isNiqab && colors.length > 0 && (
            <div
              className="rounded-xl border p-3 sm:p-3.5 space-y-2.5"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-subtle)',
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2.5">
                <div className="min-w-[170px] flex-1">
                  <span className="font-bold text-sm block" style={{ color: 'var(--text-primary)' }}>
                    {showSizesUI
                      ? locale === 'ar'
                        ? 'اختاري الألوان والمقاسات'
                        : locale === 'fr'
                          ? 'Choisissez les couleurs et tailles'
                          : 'Choose colors and sizes'
                      : locale === 'ar'
                        ? 'اختاري الألوان والكميات'
                        : locale === 'fr'
                          ? 'Choisissez les couleurs et quantités'
                          : 'Choose colors and quantities'}
                  </span>
                  <span className="text-xs block mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {showSizesUI
                      ? locale === 'ar'
                        ? 'أضيفي قطعاً بألوان ومقاسات مختلفة في طلب واحد'
                        : locale === 'fr'
                          ? 'Ajoutez des articles en différentes couleurs et tailles'
                          : 'Add items in different colors and sizes'
                      : locale === 'ar'
                        ? 'أضيفي قطعاً بألوان مختلفة في طلب واحد'
                        : locale === 'fr'
                          ? 'Ajoutez des articles en différentes couleurs'
                          : 'Add items in different colors'}
                  </span>
                </div>

                {showSizeGuideButton && (
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer whitespace-nowrap"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Ruler className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                    <span>
                      {locale === 'ar'
                        ? 'دليل المقاسات'
                        : locale === 'fr'
                          ? 'Guide des tailles'
                          : 'Size guide'}
                    </span>
                  </button>
                )}
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
                      className="flex flex-col xl:flex-row xl:items-center gap-2 xl:gap-2.5"
                    >
                      <div className="w-full xl:flex-1 min-w-0">
                        <CustomSelect
                          value={selection.colorCode}
                          onChange={(val) => changeJellabaColor(selection.id, val)}
                          options={rowAvailableColors.map((c) => ({
                            value: c.code,
                            label: getDisplayColorName(c),
                            swatch: c.code,
                          }))}
                          ariaLabel={locale === 'ar' ? 'اللون' : locale === 'fr' ? 'Couleur' : 'Color'}
                          size="sm"
                          variant="card"
                        />
                      </div>

                      <div className="flex items-center justify-between xl:justify-end gap-2 w-full xl:w-auto flex-shrink-0">
                        {showSizesUI && (
                          <div className="flex-1 min-w-0 xl:flex-initial xl:w-28">
                            <CustomSelect
                              value={selection.size}
                              onChange={(val) => changeJellabaSize(selection.id, val)}
                              options={sizes.map((size) => ({ value: size, label: size }))}
                              ariaLabel={locale === 'ar' ? 'المقاس' : locale === 'fr' ? 'Taille' : 'Size'}
                              size="sm"
                              variant="card"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div
                            className="flex items-center h-10 border rounded-xl overflow-hidden"
                            style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
                          >
                            <button
                              type="button"
                              onClick={() => updateJellabaQuantity(selection.id, -1)}
                              className="w-8 sm:w-9 h-full flex items-center justify-center transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--accent)] cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span
                              className="px-1.5 sm:px-2 h-full flex items-center justify-center text-xs sm:text-sm font-bold border-x min-w-[1.75rem] sm:min-w-[2rem] tabular-nums"
                              style={{ borderColor: 'var(--border)' }}
                            >
                              {selection.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateJellabaQuantity(selection.id, 1)}
                              disabled={effectiveMaxQty !== null && selectedJellabaQuantity >= effectiveMaxQty}
                              className="w-8 sm:w-9 h-full flex items-center justify-center transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--accent)] cursor-pointer disabled:opacity-40"
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

                {categoryConfig.colorMode !== 'single' &&
                  availableJellabaColors.length > 0 &&
                  (effectiveMaxQty === null || selectedJellabaQuantity < effectiveMaxQty) && (
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
                  className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border tabular-nums"
                  style={{
                    background: 'var(--accent-light)',
                    borderColor: 'var(--accent-ring)',
                  }}
                >
                  <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'ar'
                      ? `الكمية المختارة (${selectedJellabaQuantity} ${selectedJellabaQuantity === 1 ? unitLabels.singular : unitLabels.plural})`
                      : locale === 'fr'
                        ? `Sélection (${selectedJellabaQuantity} ${selectedJellabaQuantity === 1 ? unitLabels.singular : unitLabels.plural})`
                        : `Selected (${selectedJellabaQuantity} ${selectedJellabaQuantity === 1 ? unitLabels.singular : unitLabels.plural})`}
                  </span>
                  <span className="text-sm sm:text-base font-bold" style={{ color: 'var(--accent)' }}>
                    {formatPrice(jellabasTotal, locale)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Optional Custom Tailoring Note */}
          {!product.isNiqab && categoryConfig.allowCustomNote && colors.length > 0 && (
            <div className="space-y-1.5">
              <label
                htmlFor="product-custom-note"
                className="block text-xs font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                {locale === 'ar'
                  ? 'ملاحظة خاصة بالتفصيل أو الطول (اختياري)'
                  : locale === 'fr'
                    ? 'Note de coupe ou longueur (optionnel)'
                    : 'Custom length or tailoring note (optional)'}
              </label>
              <input
                id="product-custom-note"
                type="text"
                maxLength={140}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder={
                  locale === 'ar'
                    ? 'مثال: الطول 142 سم أو أكمام أضيق...'
                    : locale === 'fr'
                      ? 'Ex : Longueur 142 cm ou manches ajustées...'
                      : 'e.g. Length 142 cm or fitted sleeves...'
                }
                className="w-full h-10 px-3.5 rounded-xl border text-xs sm:text-sm transition-colors focus:outline-none focus:border-[var(--accent)]"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          )}

          {/* Niqab Add-on or Standalone Builder */}
          {((product.canAddNiqab && categoryConfig.allowMatchingNiqab && !product.isNiqab) || product.isNiqab) &&
            niqabColors.length > 0 && (
              <div
                className="rounded-xl border p-3 sm:p-4 space-y-2.5 sm:space-y-3 transition-colors"
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
                      {product.isNiqab
                        ? locale === 'ar'
                          ? 'اختاري الألوان والكميات المناسبة لك'
                          : locale === 'fr'
                            ? 'Sélectionnez vos couleurs et quantités'
                            : 'Select your preferred colors and quantities'
                        : locale === 'ar'
                          ? `نقاب متناسق مع قطعتك (+${formatPrice(niqabAddonBasePrice, locale)})`
                          : locale === 'fr'
                            ? `Niqab assorti à votre tenue (+${formatPrice(niqabAddonBasePrice, locale)})`
                            : `Matching niqab for your outfit (+${formatPrice(niqabAddonBasePrice, locale)})`}
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
                          className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:gap-2.5"
                        >
                          <div className="w-full min-[400px]:w-auto min-[400px]:flex-1 min-w-0">
                            <CustomSelect
                              value={selection.colorCode}
                              onChange={(val) => changeNiqabColor(selection.id, val)}
                              options={rowAvailableColors.map((c) => ({
                                value: c.code,
                                label: getDisplayColorName(c),
                                swatch: c.code,
                              }))}
                              ariaLabel={locale === 'ar' ? 'لون النقاب' : locale === 'fr' ? 'Couleur du niqab' : 'Niqab color'}
                              size="sm"
                              variant="card"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-1.5 w-full min-[400px]:w-auto flex-shrink-0">
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
                                disabled={product.isNiqab && effectiveMaxQty !== null && selectedNiqabQuantity >= effectiveMaxQty}
                                className="w-8 h-full flex items-center justify-center transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--accent)] cursor-pointer disabled:opacity-40"
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

                    {(!product.isNiqab || categoryConfig.colorMode !== 'single') &&
                      availableNiqabColors.length > 0 &&
                      (!product.isNiqab || effectiveMaxQty === null || selectedNiqabQuantity < effectiveMaxQty) && (
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
                      className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border tabular-nums"
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
                        className="inline-flex items-baseline gap-0.5 text-sm sm:text-base font-bold"
                        style={{ color: 'var(--accent)' }}
                      >
                        <span dir="ltr">+</span>
                        <span>{formatPrice(niqabTotal, locale)}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

          {(effectiveMinQty > 1 || effectiveMaxQty !== null) && (
            <div
              className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold"
              style={{
                background: 'var(--accent-light)',
                borderColor: 'var(--accent-ring)',
                color: 'var(--accent)',
              }}
            >
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              <span className="tabular-nums">
                {effectiveMinQty > 1 && effectiveMaxQty !== null
                  ? locale === 'ar'
                    ? `الحد الأدنى للطلب: ${effectiveMinQty} ${unitLabels.plural} · الحد الأقصى: ${effectiveMaxQty}`
                    : locale === 'fr'
                      ? `Commande min : ${effectiveMinQty} ${unitLabels.plural} · Max : ${effectiveMaxQty}`
                      : `Min order: ${effectiveMinQty} ${unitLabels.plural} · Max: ${effectiveMaxQty}`
                  : effectiveMinQty > 1
                    ? locale === 'ar'
                      ? `الحد الأدنى للطلب: ${effectiveMinQty} ${unitLabels.plural}`
                      : locale === 'fr'
                        ? `Quantité minimale : ${effectiveMinQty} ${unitLabels.plural}`
                        : `Minimum order: ${effectiveMinQty} ${unitLabels.plural}`
                    : locale === 'ar'
                      ? `الحد الأقصى للطلب: ${effectiveMaxQty} ${unitLabels.plural}`
                      : locale === 'fr'
                        ? `Quantité maximale : ${effectiveMaxQty} ${unitLabels.plural}`
                        : `Maximum order: ${effectiveMaxQty} ${unitLabels.plural}`}
              </span>
            </div>
          )}

          {/* Total + Add To Cart */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            {finalPrice > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm tabular-nums">
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
                (!product.isNiqab &&
                  (selectedJellabas.length === 0 ||
                    !hasStock ||
                    selectedJellabaQuantity < effectiveMinQty ||
                    (effectiveMaxQty !== null && selectedJellabaQuantity > effectiveMaxQty))) ||
                (product.isNiqab &&
                  (selectedNiqabQuantity < effectiveMinQty ||
                    (effectiveMaxQty !== null && selectedNiqabQuantity > effectiveMaxQty)))
              }
              className="btn btn-primary rounded-xl flex h-12 w-full items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
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
              className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5 gap-y-1.5 pt-1 text-[11px] font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Banknote className="w-3.5 h-3.5 text-[var(--accent)]" />
                {locale === 'ar'
                  ? 'الدفع عند الاستلام'
                  : locale === 'fr'
                    ? 'Paiement à la livraison'
                    : 'Cash on delivery'}
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Truck className="w-3.5 h-3.5 text-[var(--accent)]" />
                {locale === 'ar'
                  ? 'توصيل لجميع المدن'
                  : locale === 'fr'
                    ? 'Livraison nationale'
                    : 'Nationwide shipping'}
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                {locale === 'ar'
                  ? 'خياطة مغربية متقنة'
                  : locale === 'fr'
                    ? 'Finition artisanale'
                    : 'Artisanal finish'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        locale={locale}
        profile={categoryConfig.sizeGuideProfile}
      />

      <ProductReviews productId={product.id} locale={locale} />
    </>
  )
}

'use client'

import {
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react'

import Image from 'next/image'

import { useTranslations } from 'next-intl'

import {
  ShoppingBag,
  Info,
  ShieldAlert,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  Check,
} from 'lucide-react'

import { useCartStore } from '@/store/cart.store'

import { formatPrice } from '@/lib/utils'

import type { Product } from '@/types/product'

// ==========================================
// PROPS
// ==========================================

interface ProductDetailProps {
  product: Product
  locale: string
}

// ==========================================
// NIQAB SELECTION
// ==========================================

interface NiqabSelection {
  id: string

  colorCode: string

  colorNameAr: string
  colorNameFr: string
  colorNameEn: string

  variantId?: string

  quantity: number
}

// ==========================================
// CONSTANTS
// ==========================================

const NIQAB_PRICE = 20

// ==========================================
// CUSTOM COLOR DROPDOWN COMPONENT
// ==========================================

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
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-5 sm:px-6 flex items-center justify-between gap-4 rounded-xl border text-sm sm:text-base font-bold transition-all bg-white dark:bg-[#1f1008] text-foreground outline-none focus:outline-none"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="flex items-center gap-4 min-w-0 truncate">
          <span
            className="w-5 h-5 rounded-full border-2 flex-shrink-0 shadow-sm"
            style={{ background: selectedColor.code, borderColor: 'var(--border)' }}
          />
          <span className="truncate">{selectedLabel}</span>
        </span>
        <ChevronDown
          className={`h-4.5 w-4.5 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#C4622D]' : ''
          }`}
        />
      </button>

      {/* Floating Options Menu */}
      {isOpen && (
        <div
          className="absolute z-50 top-[calc(100%+6px)] start-0 end-0 w-full max-h-64 overflow-y-auto rounded-2xl border bg-white dark:bg-[#1a0c06] shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
          style={{ borderColor: 'var(--border)', padding: '10px' }}
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
                className={`w-full flex items-center justify-between gap-4 rounded-xl text-sm font-bold transition-all mb-1 last:mb-0 ${
                  isSelected
                    ? 'bg-[#C4622D]/10 text-[#C4622D]'
                    : 'text-foreground hover:bg-[rgba(196,98,45,0.08)] hover:text-[#C4622D]'
                }`}
                style={{ padding: '12px 20px' }}
              >
                <span className="flex items-center gap-3 min-w-0 truncate">
                  <span
                    className="w-5 h-5 rounded-full border-2 flex-shrink-0 shadow-sm"
                    style={{ background: color.code, borderColor: 'var(--border)' }}
                  />
                  <span className="truncate">{label}</span>
                </span>
                {isSelected && <Check className="h-4 w-4 text-[#C4622D] flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ==========================================
// COMPONENT
// ==========================================

export function ProductDetail({
  product,
  locale,
}: ProductDetailProps) {
  const t =
    useTranslations('products')

  const cartStore =
    useCartStore()

  const isRTL =
    locale === 'ar'

  // ==========================================
  // PRODUCT SIZES
  // ==========================================

  const sizes = Array.from(
    new Set(
      product.variants?.map(
        (variant) =>
          variant.size,
      ) || [],
    ),
  )

  // ==========================================
  // PRODUCT COLORS
  // ==========================================

  const colors = Array.from(
    new Map(
      product.variants?.map(
        (variant) => [
          variant.colorCode,
          {
            code:
              variant.colorCode,

            nameAr:
              variant.colorNameAr,

            nameFr:
              variant.colorNameFr,

            nameEn:
              variant.colorNameEn,
          },
        ],
      ) || [],
    ).values(),
  )

  // ==========================================
  // NIQAB COLORS
  // ==========================================
  //
  // IMPORTANT:
  //
  // هذه الألوان لا تأتي من قائمة ثابتة.
  //
  // تأتي فقط من:
  //
  // product.niqabProduct?.variants
  //
  // أي الألوان التي أضافها المدير.
  //

  const niqabColors =
    useMemo(() => {
      const variants =
        product
          .niqabProduct
          ?.variants || []

      return Array.from(
        new Map(
          variants
            .filter(
              (variant) =>
                variant.isActive,
            )
            .map(
              (variant) => [
                variant.colorCode,
                {
                  code:
                    variant.colorCode,

                  nameAr:
                    variant.colorNameAr,

                  nameFr:
                    variant.colorNameFr,

                  nameEn:
                    variant.colorNameEn,

                  variantId:
                    variant.id,
                },
              ],
            ),
        ).values(),
      )
    }, [
      product.niqabProduct,
    ])

  // ==========================================
  // STATES
  // ==========================================

  const [
    selectedSize,
    setSelectedSize,
  ] = useState<string>(
    sizes[0] ||
    'Standard',
  )

  const [
    selectedColor,
    setSelectedColor,
  ] = useState<
    (typeof colors)[number] | null
  >(
    colors[0] ||
    null,
  )

  const [
    quantity,
    setQuantity,
  ] = useState(
    product.isNiqab ? 5 : 1,
  )

  const [
    includeNiqab,
    setIncludeNiqab,
  ] = useState(false)

  const [
    niqabSelections,
    setNiqabSelections,
  ] = useState<
    NiqabSelection[]
  >([])

  const [
    activeImage,
    setActiveImage,
  ] = useState(
    product.mainImage,
  )

  // ==========================================
  // CURRENT PRODUCT VARIANT
  // ==========================================

  const currentVariant =
    product.variants?.find(
      (variant) =>
        variant.size ===
        selectedSize &&
        (
          !selectedColor ||
          variant.colorCode ===
          selectedColor.code
        ),
    )

  const hasStock =
    currentVariant
      ? currentVariant.stockQuantity >
      0
      : true

  // ==========================================
  // PRODUCT PRICE
  // ==========================================

  const basePriceVal =
    Number(
      product.salePrice ||
      product.basePrice,
    )

  // ==========================================
  // NIQAB TOTAL QUANTITY
  // ==========================================

  const selectedNiqabQuantity =
    niqabSelections.reduce(
      (sum, item) =>
        sum + item.quantity,
      0,
    )

  // ==========================================
  // NIQAB TOTAL PRICE
  // ==========================================

  const niqabTotal =
    selectedNiqabQuantity *
    NIQAB_PRICE

  // ==========================================
  // FINAL PRICE
  // ==========================================

  const finalPrice =
    basePriceVal +
    niqabTotal

  // ==========================================
  // USED NIQAB COLORS
  // ==========================================

  const usedNiqabColors =
    new Set(
      niqabSelections.map(
        (item) =>
          item.colorCode,
      ),
    )

  // ==========================================
  // AVAILABLE NIQAB COLORS
  // ==========================================

  const availableNiqabColors =
    niqabColors.filter(
      (color) =>
        !usedNiqabColors.has(
          color.code,
        ),
    )

  // ==========================================
  // COLOR NAME DISPLAY HELPER
  // ==========================================

  const getDisplayColorName = (
    color: { code: string; nameAr: string; nameFr: string; nameEn: string },
  ): string => {
    const name =
      locale === 'ar'
        ? color.nameAr
        : locale === 'fr'
          ? color.nameFr
          : color.nameEn

    if (
      name &&
      name !== 'لون' &&
      name.toLowerCase() !== 'color' &&
      name.toLowerCase() !== 'couleur'
    ) {
      return name
    }

    const code = color.code.trim().toLowerCase()

    if (code === '#000000' || code === '#000' || code === 'black') {
      return locale === 'ar' ? 'أسود' : locale === 'fr' ? 'Noir' : 'Black'
    }
    if (code === '#964b00' || code === '#6b4226' || code === '#8b4513' || code === '#5c4033') {
      return locale === 'ar' ? 'بني' : locale === 'fr' ? 'Marron' : 'Brown'
    }
    if (code === '#f5f5dc' || code === '#e8dcc8' || code === '#f2e4ce' || code === '#fff8dc') {
      return locale === 'ar' ? 'بيج' : locale === 'fr' ? 'Beige' : 'Beige'
    }
    if (code === '#c4622d') {
      return locale === 'ar' ? 'تيراكوتا' : locale === 'fr' ? 'Terracotta' : 'Terracotta'
    }

    return name || color.code
  }

  // ==========================================
  // ENABLE NIQAB
  // ==========================================

  const handleEnableNiqab =
    () => {
      if (
        niqabColors.length ===
        0
      ) {
        return
      }

      setIncludeNiqab(
        true,
      )

      if (
        niqabSelections.length >
        0
      ) {
        return
      }

      // Prioritize Black if available in DB niqabColors
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

      if (!defaultColor) {
        return
      }

      setNiqabSelections([
        {
          id:
            crypto.randomUUID(),

          colorCode:
            defaultColor.code,

          colorNameAr:
            defaultColor.nameAr,

          colorNameFr:
            defaultColor.nameFr,

          colorNameEn:
            defaultColor.nameEn,

          variantId:
            defaultColor.variantId,

          quantity: 1,
        },
      ])
    }

  // ==========================================
  // DISABLE NIQAB
  // ==========================================

  const handleDisableNiqab =
    () => {
      setIncludeNiqab(
        false,
      )

      setNiqabSelections(
        [],
      )
    }

  // ==========================================
  // ADD NIQAB COLOR
  // ==========================================

  const handleAddNiqabColor =
    () => {
      const nextColor =
        availableNiqabColors[0]

      if (!nextColor) {
        return
      }

      setNiqabSelections(
        (current) => [
          ...current,

          {
            id:
              crypto.randomUUID(),

            colorCode:
              nextColor.code,

            colorNameAr:
              nextColor.nameAr,

            colorNameFr:
              nextColor.nameFr,

            colorNameEn:
              nextColor.nameEn,

            variantId:
              nextColor.variantId,

            quantity: 1,
          },
        ],
      )
    }

  // ==========================================
  // UPDATE NIQAB QUANTITY
  // ==========================================

  const updateNiqabQuantity =
    (
      id: string,
      amount: number,
    ) => {
      setNiqabSelections(
        (current) =>
          current.map(
            (item) =>
              item.id === id
                ? {
                  ...item,

                  quantity:
                    Math.max(
                      1,
                      item.quantity +
                      amount,
                    ),
                }
                : item,
          ),
      )
    }

  // ==========================================
  // REMOVE NIQAB COLOR
  // ==========================================

  const removeNiqabColor =
    (id: string) => {
      setNiqabSelections(
        (current) => {
          const next = current.filter(
            (item) =>
              item.id !== id,
          )
          if (next.length === 0) {
            setIncludeNiqab(false)
          }
          return next
        },
      )
    }

  // ==========================================
  // CHANGE NIQAB COLOR
  // ==========================================

  const changeNiqabColor =
    (
      id: string,
      colorCode: string,
    ) => {
      const color =
        niqabColors.find(
          (item) =>
            item.code ===
            colorCode,
        )

      if (!color) {
        return
      }

      // لا نسمح بتكرار اللون
      const alreadyUsed =
        niqabSelections.some(
          (item) =>
            item.id !== id &&
            item.colorCode ===
            colorCode,
        )

      if (
        alreadyUsed
      ) {
        return
      }

      setNiqabSelections(
        (current) =>
          current.map(
            (item) =>
              item.id === id
                ? {
                  ...item,

                  colorCode:
                    color.code,

                  colorNameAr:
                    color.nameAr,

                  colorNameFr:
                    color.nameFr,

                  colorNameEn:
                    color.nameEn,

                  variantId:
                    color.variantId,
                }
                : item,
          ),
      )
    }

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart =
    () => {
      const colorNameAr =
        selectedColor?.nameAr ||
        ''

      const colorNameFr =
        selectedColor?.nameFr ||
        ''

      const colorNameEn =
        selectedColor?.nameEn ||
        ''

      const colorCode =
        selectedColor?.code ||
        ''

      cartStore.addItem({
        productId:
          product.id,

        variantId:
          currentVariant?.id,

        slug:
          product.slug,

        nameAr:
          product.nameAr,

        nameFr:
          product.nameFr,

        nameEn:
          product.nameEn,

        mainImage:
          product.mainImage,

        size:
          selectedSize,

        colorCode,

        colorNameAr,

        colorNameFr,

        colorNameEn,

        quantity,

        unitPrice:
          basePriceVal,

        isNiqab:
          product.isNiqab,

        // ========================================
        // MULTIPLE NIQABS
        // ========================================

        niqabItems:
          includeNiqab &&
            niqabSelections.length >
            0
            ? niqabSelections.map(
              (item) => ({
                productId:
                  product
                    .niqabProduct
                    ?.id ||
                  'niqab',

                variantId:
                  item.variantId,

                nameAr:
                  product
                    .niqabProduct
                    ?.nameAr ||
                  'نقاب',

                nameFr:
                  product
                    .niqabProduct
                    ?.nameFr ||
                  'Niqab',

                nameEn:
                  product
                    .niqabProduct
                    ?.nameEn ||
                  'Niqab',

                mainImage:
                  product
                    .niqabProduct
                    ?.mainImage ||
                  '/images/brand/logo-icon.png',

                colorCode:
                  item.colorCode,

                colorNameAr:
                  item.colorNameAr,

                colorNameFr:
                  item.colorNameFr,

                colorNameEn:
                  item.colorNameEn,

                quantity:
                  item.quantity,

                // 20 DH لكل نقاب
                unitPrice:
                  NIQAB_PRICE,
              }),
            )
            : undefined,
      })
    }

  // ==========================================
  // PRODUCT DISPLAY NAME
  // ==========================================

  const productName =
    locale === 'ar'
      ? product.nameAr
      : locale === 'fr'
        ? product.nameFr
        : product.nameEn

  // ==========================================
  // PRODUCT DESCRIPTION
  // ==========================================

  const productDesc =
    locale === 'ar'
      ? product.descriptionAr
      : locale === 'fr'
        ? product.descriptionFr
        : product.descriptionEn

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      className="product-detail-grid grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-8 xl:gap-10"
      dir={
        isRTL
          ? 'rtl'
          : 'ltr'
      }
    >
      {/* ========================================
          GALLERY
      ======================================== */}

      <div className="product-gallery-panel space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div
          className="product-main-image relative aspect-[4/5] overflow-hidden"
          style={{
            borderColor:
              'var(--border)',
          }}
        >
          <Image
            src={
              activeImage
            }
            alt={
              productName
            }
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {product.images &&
          product.images
            .length > 1 && (
            <div
              className="product-thumbnails flex gap-3 overflow-x-auto pb-1"
              dir="ltr"
            >
              {product.images.map(
                (
                  img,
                  idx,
                ) => (
                  <button
                    key={
                      idx
                    }
                    type="button"
                    onClick={() =>
                      setActiveImage(
                        img,
                      )
                    }
                    className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border transition-all sm:h-20 sm:w-20 ${activeImage ===
                        img
                        ? 'scale-95 border-2 border-[#C4622D]'
                        : 'hover:border-[#C4622D]/60'
                      }`}
                    style={{
                      borderColor:
                        activeImage ===
                          img
                          ? '#C4622D'
                          : 'var(--border)',
                    }}
                  >
                    <Image
                      src={
                        img
                      }
                      alt={`${productName} thumbnail ${idx +
                        1
                        }`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ),
              )}
            </div>
          )}
      </div>

      {/* ========================================
          PRODUCT INFO
      ======================================== */}

      <div className="product-purchase-panel space-y-6">
        {/* ======================================
            HEADER
        ====================================== */}

        <div
          className="product-title-block space-y-3"
          style={{
            borderColor:
              'var(--border)',
          }}
        >
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b8965a]">
              {locale ===
                'ar'
                ? product
                  .category
                  .nameAr
                : locale ===
                  'fr'
                  ? product
                    .category
                    .nameFr
                  : product
                    .category
                    .nameEn}
            </span>
          )}

          <h1
            className="text-2xl font-extrabold sm:text-3xl"
            style={{
              color:
                'var(--foreground)',
            }}
          >
            {
              productName
            }
          </h1>

          <p
            className="text-xs"
            style={{
              color:
                'var(--muted-foreground)',
            }}
          >
            {t('sku')}:{' '}
            {
              product.sku
            }
          </p>
        </div>

        {/* ======================================
            PRICE
        ====================================== */}

        <div className="product-price-row flex items-baseline gap-3">
          {product.salePrice ? (
            <>
              <span className="text-xl font-bold text-[#C4622D] sm:text-2xl">
                {formatPrice(
                  finalPrice,
                  locale,
                )}
              </span>

              <span
                className="text-sm line-through"
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              >
                {formatPrice(
                  Number(
                    product.basePrice,
                  ) +
                  niqabTotal,
                  locale,
                )}
              </span>
            </>
          ) : (
            <span
              className="text-xl font-bold sm:text-2xl"
              style={{
                color:
                  'var(--foreground)',
              }}
            >
              {formatPrice(
                finalPrice,
                locale,
              )}
            </span>
          )}
        </div>

        {/* ======================================
            DESCRIPTION
        ====================================== */}

        <p
          className="product-description text-sm leading-relaxed"
          style={{
            color:
              'var(--muted-foreground)',
          }}
        >
          {
            productDesc
          }
        </p>

        {/* ======================================
            PRODUCT COLOR
        ====================================== */}

        {colors.length >
          0 && (
            <div className="product-option-group space-y-3">
              <label
                className="block text-xs font-bold uppercase tracking-wider"
                style={{
                  color:
                    'var(--foreground)',
                }}
              >
                {
                  t(
                    'colors.select',
                  )
                }
              </label>

              <div className="flex flex-wrap gap-2">
                {colors.map(
                  (color) => {
                    const colorLabel =
                      locale ===
                        'ar'
                        ? color.nameAr
                        : locale ===
                          'fr'
                          ? color.nameFr
                          : color.nameEn

                    const isSelected =
                      selectedColor?.code ===
                      color.code

                    return (
                      <button
                        key={
                          color.code
                        }
                        type="button"
                        onClick={() =>
                          setSelectedColor(
                            color,
                          )
                        }
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${isSelected
                            ? 'border-[#C4622D] bg-[rgba(196,98,45,0.05)] text-[#C4622D]'
                            : 'hover:border-[#C4622D]/60'
                          }`}
                        style={{
                          borderColor:
                            isSelected
                              ? '#C4622D'
                              : 'var(--border)',

                          color:
                            isSelected
                              ? '#C4622D'
                              : 'var(--muted-foreground)',
                        }}
                      >
                        <span
                          className="inline-block h-3.5 w-3.5 rounded-full"
                          style={{
                            background:
                              color.code,
                          }}
                        />

                        {
                          colorLabel
                        }
                      </button>
                    )
                  },
                )}
              </div>
            </div>
          )}

        {/* ======================================
            SIZE
        ====================================== */}

        {sizes.length >
          0 && (
            <div className="product-option-group space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label
                  className="block font-bold uppercase tracking-wider"
                  style={{
                    color:
                      'var(--foreground)',
                  }}
                >
                  {
                    t(
                      'sizes.select',
                    )
                  }
                </label>

                <button
                  type="button"
                  className="flex items-center gap-1 font-semibold text-[#b8965a] hover:underline"
                >
                  <Info className="h-3.5 w-3.5" />

                  {
                    t(
                      'sizes.guide',
                    )
                  }
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {sizes.map(
                  (size) => {
                    const isSelected =
                      selectedSize ===
                      size

                    return (
                      <button
                        key={
                          size
                        }
                        type="button"
                        onClick={() =>
                          setSelectedSize(
                            size,
                          )
                        }
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xs font-bold transition-all ${isSelected
                            ? 'border-[#C4622D] bg-[rgba(196,98,45,0.05)] text-[#C4622D]'
                            : 'hover:border-[#C4622D]/60'
                          }`}
                        style={{
                          borderColor:
                            isSelected
                              ? '#C4622D'
                              : 'var(--border)',

                          color:
                            isSelected
                              ? '#C4622D'
                              : 'var(--muted-foreground)',
                        }}
                      >
                        {
                          size
                        }
                      </button>
                    )
                  },
                )}
              </div>
            </div>
          )}

        {/* ======================================
            NIQAB ADD-ON
        ====================================== */}

        {product.canAddNiqab && !product.isNiqab && niqabColors.length > 0 && (
          <div
            className={`product-addon p-4 sm:p-5 rounded-2xl border-2 transition-all ${
              includeNiqab ? 'border-[#C4622D] bg-[rgba(196,98,45,0.025)] shadow-sm' : 'border-dashed hover:border-[#C4622D]/50'
            }`}
            style={{ borderColor: includeNiqab ? '#C4622D' : 'var(--border)' }}
          >
            <label className="flex items-start gap-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeNiqab}
                onChange={(e) =>
                  e.target.checked
                    ? handleEnableNiqab()
                    : handleDisableNiqab()
                }
                className="mt-1 accent-[#C4622D] w-4.5 h-4.5 rounded cursor-pointer flex-shrink-0"
              />
              <div className="space-y-1">
                <span className="font-extrabold text-sm sm:text-base block" style={{ color: 'var(--foreground)' }}>
                  {locale === 'ar'
                    ? 'أضيفي نقاباً متناسقاً'
                    : locale === 'fr'
                    ? 'Ajouter un niqab assorti'
                    : 'Add a matching niqab'}
                </span>
                <span className="text-xs font-medium block leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {locale === 'ar'
                    ? 'اختاري نقاباً يتناسق مع جلابتك (+20 د.م)'
                    : locale === 'fr'
                    ? 'Choisissez un niqab assorti à votre djellaba (+20 DH)'
                    : 'Choose a matching niqab for your djellaba (+20 DH)'}
                </span>
              </div>
            </label>

            {/* ==================================
                NIQAB ROWS
            ================================== */}

            {includeNiqab && niqabSelections.length > 0 && (
              <div className="mt-5 flex flex-col gap-5 sm:gap-6">
                {niqabSelections.map((selection, index) => {
                  const currentLabel = getDisplayColorName({
                    code: selection.colorCode,
                    nameAr: selection.colorNameAr,
                    nameFr: selection.colorNameFr,
                    nameEn: selection.colorNameEn,
                  })

                  const rowAvailableColors = niqabColors.filter(
                    (color) =>
                      !niqabSelections.some(
                        (other) =>
                          other.id !== selection.id &&
                          other.colorCode === color.code,
                      ),
                  )

                  return (
                    <div
                      key={selection.id}
                      className="flex items-center gap-4"
                    >
                      {/* Color Dropdown */}
                      <NiqabColorDropdown
                        selectionId={selection.id}
                        currentColorCode={selection.colorCode}
                        availableColors={rowAvailableColors}
                        getDisplayColorName={getDisplayColorName}
                        onSelectColor={changeNiqabColor}
                      />

                      {/* Quantity Controls + Delete */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                          className="flex items-center h-11 border rounded-xl overflow-hidden bg-white dark:bg-black/50 shadow-xs"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <button
                            type="button"
                            onClick={() => updateNiqabQuantity(selection.id, -1)}
                            className="w-10 h-full flex items-center justify-center transition-colors hover:bg-[#C4622D]/10 hover:text-[#C4622D] font-bold text-base"
                            aria-label="Decrease niqab quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span
                            className="px-3 h-full flex items-center justify-center text-sm font-extrabold border-x min-w-[2.5rem]"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            {selection.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateNiqabQuantity(selection.id, 1)}
                            className="w-10 h-full flex items-center justify-center transition-colors hover:bg-[#C4622D]/10 hover:text-[#C4622D] font-bold text-base"
                            aria-label="Increase niqab quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {(index > 0 || niqabSelections.length > 1) && (
                          <button
                            type="button"
                            onClick={() => removeNiqabColor(selection.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border text-red-500 hover:bg-red-500/10 flex-shrink-0 transition-colors bg-white dark:bg-black/30"
                            style={{ borderColor: 'rgba(239,68,68,0.25)' }}
                            aria-label="Remove niqab color"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* ==================================
                    ADD ANOTHER COLOR
                ================================== */}

                {availableNiqabColors.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddNiqabColor}
                    className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-dashed px-4 py-3.5 text-xs sm:text-sm font-bold text-[#C4622D] bg-[#C4622D]/[0.04] hover:bg-[#C4622D]/10 transition-colors text-center shadow-xs"
                    style={{ borderColor: '#C4622D' }}
                  >
                    <Plus className="h-4 w-4" />
                    {locale === 'ar'
                      ? 'إضافة لون آخر'
                      : locale === 'fr'
                      ? 'Ajouter une autre couleur'
                      : 'Add another color'}
                  </button>
                )}

                {/* NIQAB SUMMARY */}
                <div
                  className="flex items-center justify-between p-4.5 sm:p-5 rounded-2xl border shadow-xs"
                  style={{
                    background: 'rgba(196,98,45,0.06)',
                    borderColor: 'rgba(196,98,45,0.2)',
                  }}
                >
                  <span className="text-xs sm:text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                    {locale === 'ar'
                      ? `مجموع النقابات: ${selectedNiqabQuantity}`
                      : locale === 'fr'
                      ? `Total niqabs : ${selectedNiqabQuantity}`
                      : `Total niqabs: ${selectedNiqabQuantity}`}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-[#C4622D]">
                    +{formatPrice(niqabTotal, locale)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================
            STANDALONE NIQAB MINIMUM QUANTITY NOTICE
        ====================================== */}

        {product.isNiqab && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 text-xs font-bold text-amber-700 dark:text-amber-400">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span>
              {locale === 'ar'
                ? '⚠️ الحد الأدنى للطلب: 5 نقابات'
                : locale === 'fr'
                ? '⚠️ Quantité minimale : 5 niqabs'
                : '⚠️ Minimum order: 5 niqabs'}
            </span>
          </div>
        )}

        {/* ======================================
            STOCK
        ====================================== */}

        <div className="product-stock flex items-center gap-2 text-xs font-medium">
          {hasStock ? (
            <span className="flex items-center gap-1 text-green-600">
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-green-600" />

              {locale ===
                'ar'
                ? 'متوفر في المخزون'
                : locale ===
                  'fr'
                  ? 'En stock'
                  : 'In stock'}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-600">
              <ShieldAlert className="h-3.5 w-3.5" />

              {
                t(
                  'outOfStock',
                )
              }
            </span>
          )}
        </div>

        {/* ======================================
            PRODUCT QUANTITY + CART
        ====================================== */}

        <div className="product-actions flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          {hasStock && (
            <div
              className="flex h-12 items-center justify-between overflow-hidden rounded-xl border sm:justify-start"
              style={{
                borderColor:
                  'var(--border)',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    Math.max(
                      product.isNiqab ? 5 : 1,
                      quantity -
                      1,
                    ),
                  )
                }
                className="flex h-full items-center justify-center px-4 font-bold transition-colors hover:bg-[rgba(196,98,45,0.08)] hover:text-[#C4622D]"
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              >
                -
              </button>

              <span
                className="flex items-center justify-center px-4 text-sm font-semibold"
                style={{
                  color:
                    'var(--foreground)',
                }}
              >
                {
                  quantity
                }
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    quantity +
                    1,
                  )
                }
                className="flex h-full items-center justify-center px-4 font-bold transition-colors hover:bg-[rgba(196,98,45,0.08)] hover:text-[#C4622D]"
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              >
                +
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={
              handleAddToCart
            }
            disabled={
              !hasStock
            }
            className="btn btn-primary btn-round flex h-10 w-full items-center justify-center gap-2 text-sm sm:h-12 sm:flex-1"
          >
            <ShoppingBag className="h-4 w-4" />

            {
              t(
                'addToCart',
              )
            }
          </button>
        </div>
      </div>
    </div>
  )
}
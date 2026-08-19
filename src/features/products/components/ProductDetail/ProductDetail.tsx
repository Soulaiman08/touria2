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
import { ProductGallery } from './ProductGallery'

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

interface JellabaSelection {
  id: string
  colorCode: string
  colorNameAr: string
  colorNameFr: string
  colorNameEn: string
  size: string
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
        className="w-full h-9 sm:h-12 px-2 sm:px-3 flex items-center justify-between gap-2 rounded-xl border text-xs sm:text-sm font-bold transition-all outline-none focus:outline-none"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
      >
          <span className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
          <span
            className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0"
            style={{ background: selectedColor.code, borderColor: 'var(--border)' }}
          />
          <span className="truncate">{selectedLabel}</span>
        </span>
        <ChevronDown
          className={`h-4.5 w-4.5 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#C4622D]' : ''
            }`}
        />
      </button>

      {/* Floating Options Menu */}
      {isOpen && (
        <div
          className="absolute z-50 top-[calc(100%+4px)] start-0 sm:end-0 sm:w-full overflow-y-auto border"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.75rem', width: 'clamp(200px, 60vw, 100%)' }}
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
                className={`w-full flex items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm font-bold transition-all px-3 py-1.5 ${isSelected
                  ? 'bg-[#C4622D]/10 text-[#C4622D]'
                  : 'text-foreground hover:bg-[rgba(196,98,45,0.08)] hover:text-[#C4622D]'
                  }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0"
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
    (() => {
      const map = new Map<string, { code: string; nameAr: string; nameFr: string; nameEn: string }>()
      for (const variant of product.variants || []) {
        const existing = map.get(variant.colorCode)
        const realAr = variant.colorNameAr && variant.colorNameAr !== 'لون' ? variant.colorNameAr : ''
        const realFr = variant.colorNameFr && variant.colorNameFr.toLowerCase() !== 'couleur' ? variant.colorNameFr : ''
        const realEn = variant.colorNameEn && variant.colorNameEn.toLowerCase() !== 'color' ? variant.colorNameEn : ''
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
    })(),
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
      const variants = product.isNiqab
        ? product.variants || []
        : product.niqabProduct?.variants || []

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
    product.isNiqab,
    product.niqabProduct,
    product.variants,
    ])

  // ==========================================
  // STATES
  // ==========================================

  const [includeNiqab, setIncludeNiqab] = useState(false)

  const [
    niqabSelections,
    setNiqabSelections,
  ] = useState<
    NiqabSelection[]
  >(() => product.isNiqab && niqabColors[0] ? [{
    id: crypto.randomUUID(),
    colorCode: niqabColors[0].code,
    colorNameAr: niqabColors[0].nameAr,
    colorNameFr: niqabColors[0].nameFr,
    colorNameEn: niqabColors[0].nameEn,
    variantId: niqabColors[0].variantId,
    quantity: 5,
  }] : [])

  const [selectedJellabas, setSelectedJellabas] = useState<JellabaSelection[]>(() => {
    if (product.isNiqab || colors.length === 0) return []
    return [{
      id: crypto.randomUUID(),
      colorCode: colors[0].code,
      colorNameAr: colors[0].nameAr,
      colorNameFr: colors[0].nameFr,
      colorNameEn: colors[0].nameEn,
      size: sizes[0] || '',
      quantity: 1,
    }]
  })

  const [activeImage, setActiveImage] = useState(product.mainImage)

  // ==========================================
  // CURRENT PRODUCT VARIANT
  // ==========================================

  const currentVariant = product.variants?.find(variant => {
    if (product.isNiqab) return true
    if (selectedJellabas.length > 0) {
      const first = selectedJellabas[0]
      return variant.colorCode === first.colorCode && variant.size === first.size
    }
    return false
  })

  const hasStock = product.isNiqab
    ? (currentVariant ? currentVariant.stockQuantity > 0 : true)
    : selectedJellabas.every(sel => {
        const v = product.variants?.find(variant => variant.colorCode === sel.colorCode && variant.size === sel.size)
        return v ? v.stockQuantity > 0 : true
      })

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
  // JELLABA TOTAL PRICE (quantity × unit price)
  // ==========================================

  const jellabasTotal = selectedJellabas.reduce((sum, item) => {
    const variant = product.variants?.find(v => v.colorCode === item.colorCode && v.size === item.size)
    return sum + item.quantity * (basePriceVal + Number(variant?.priceModifier || 0))
  }, 0)

  const selectedJellabaQuantity = selectedJellabas.reduce((sum, item) => sum + item.quantity, 0)

  const usedJellabaColors = new Set(selectedJellabas.map(item => item.colorCode))

  const availableJellabaColors = colors.filter(color => !usedJellabaColors.has(color.code))

  // ==========================================
  // FINAL PRICE
  // ==========================================

  const finalPrice = product.isNiqab
    ? basePriceVal
    : jellabasTotal + niqabTotal

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
    if (code === '#964b00' || code === '#6b4226' || code === '#8b4513' || code === '#5c4033') {
      return locale === 'ar' ? 'بني' : locale === 'fr' ? 'Marron' : 'Brown'
    }
    if (code === '#f5f5dc' || code === '#e8dcc8' || code === '#f2e4ce' || code === '#fff8dc') {
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
    const oliveCodes = ['#808000', '#556b2f', '#6b8e23', '#8fbc8f', '#9acd32', '#ada528', '#a8a463', '#baa649']
    if (oliveCodes.includes(code)) {
      return locale === 'ar' ? 'زيتي' : locale === 'fr' ? 'Olive' : 'Olive'
    }
    const seaBlueCodes = ['#20b2aa', '#008080', '#5f9ea0', '#00b4cc', '#00ced1', '#40e0d0', '#48d1cc', '#66cdaa']
    if (seaBlueCodes.includes(code)) {
      return locale === 'ar' ? 'أزرق بحر' : locale === 'fr' ? 'Bleu mer' : 'Sea Blue'
    }
    const greenCodes = ['#008000', '#228b22', '#32cd32', '#28a745', '#198754', '#3cb371', '#2e8b57', '#006400', '#00ff00', '#7cfc00', '#00fa9a']
    if (greenCodes.includes(code)) {
      return locale === 'ar' ? 'أخضر' : locale === 'fr' ? 'Vert' : 'Green'
    }
    const redCodes = ['#ff0000', '#dc3545', '#e63946', '#ff6b6b', '#c0392b', '#e74c3c', '#8b0000', '#ff4500', '#ff5252', '#b22222', '#cd5c5c', '#f44336']
    if (redCodes.includes(code)) {
      return locale === 'ar' ? 'أحمر' : locale === 'fr' ? 'Rouge' : 'Red'
    }
    const blueCodes = ['#0000ff', '#007bff', '#1e90ff', '#4169e6', '#4682b4', '#0000cd', '#0066cc', '#0d6efd', '#0a58ca', '#00008b', '#191970']
    if (blueCodes.includes(code)) {
      return locale === 'ar' ? 'أزرق' : locale === 'fr' ? 'Bleu' : 'Blue'
    }
    const beigeCodes = ['#f5f5dc', '#e8dcc8', '#fff8dc', '#f5f0e1', '#e6dcc8', '#fdf6ec', '#f8f0e3', '#d2b48c', '#deb887', '#f4a440', '#d2691e']
    if (beigeCodes.includes(code)) {
      return locale === 'ar' ? 'بيج' : locale === 'fr' ? 'Beige' : 'Beige'
    }
    const creamCodes = ['#fffdd0', '#ffffe0', '#fffacd', '#fffff0', '#feffcc', '#ffffe3']
    if (creamCodes.includes(code)) {
      return locale === 'ar' ? 'أصفر فاتح' : locale === 'fr' ? 'Crème' : 'Cream'
    }
    const purpleCodes = ['#800080', '#9370db', '#9932cc', '#ba55d3', '#dda0dd', '#ee82ee', '#8a2be2']
    if (purpleCodes.includes(code)) {
      return locale === 'ar' ? 'أرجواني' : locale === 'fr' ? 'Violet' : 'Purple'
    }
    const grayCodes = ['#808080', '#a9a9a9', '#708090', '#778899', '#c0c0c0', '#b0b0b0', '#d3d3d3', '#dcdcdc', '#2f4f4f', '#696969']
    if (grayCodes.includes(code)) {
      return locale === 'ar' ? 'رمادي' : locale === 'fr' ? 'Gris' : 'Gray'
    }
    const navyCodes = ['#000080', '#00008b', '#003366', '#003399', '#000084']
    if (navyCodes.includes(code)) {
      return locale === 'ar' ? 'أزرق داكن' : locale === 'fr' ? 'Bleu marine' : 'Navy'
    }
    const brownCodes = ['#a52a2a', '#8b4513', '#5c4033', '#964b00', '#654321', '#6b4226', '#cd853f', '#d2691e', '#a0522d']
    if (brownCodes.includes(code)) {
      return locale === 'ar' ? 'بني' : locale === 'fr' ? 'Marron' : 'Brown'
    }

    const en = color.nameEn && color.nameEn.toLowerCase().trim() !== 'color' ? color.nameEn : null
    const fr = color.nameFr && color.nameFr.toLowerCase().trim() !== 'couleur' ? color.nameFr : null
    const ar = color.nameAr && color.nameAr.trim() !== 'لون' ? color.nameAr : null
    return locale === 'ar' ? (ar || en || fr || color.code)
      : locale === 'fr' ? (fr || en || ar || color.code)
      : (en || fr || ar || color.code)
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
  // ADD JELLABA COLOR
  // ==========================================

  const handleAddJellabaColor = () => {
    const nextColor = availableJellabaColors[0]
    if (!nextColor) return
    setSelectedJellabas(current => [
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

  // ==========================================
  // UPDATE JELLABA QUANTITY
  // ==========================================

  const updateJellabaQuantity = (id: string, amount: number) => {
    setSelectedJellabas(current =>
      current.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      )
    )
  }

  // ==========================================
  // REMOVE JELLABA COLOR
  // ==========================================

  const removeJellabaColor = (id: string) => {
    setSelectedJellabas(current => current.filter(item => item.id !== id))
  }

  // ==========================================
  // CHANGE JELLABA COLOR
  // ==========================================

  const changeJellabaColor = (id: string, colorCode: string) => {
    const color = colors.find(c => c.code === colorCode)
    if (!color) return
    const alreadyUsed = selectedJellabas.some(item => item.id !== id && item.colorCode === colorCode)
    if (alreadyUsed) return
    setSelectedJellabas(current =>
      current.map(item =>
        item.id === id
          ? { ...item, colorCode: color.code, colorNameAr: color.nameAr, colorNameFr: color.nameFr, colorNameEn: color.nameEn }
          : item
      )
    )
  }

  // ==========================================
  // CHANGE JELLABA SIZE
  // ==========================================

  const changeJellabaSize = (id: string, size: string) => {
    setSelectedJellabas(current =>
      current.map(item =>
        item.id === id ? { ...item, size } : item
      )
    )
  }

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart =
    () => {
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
        return
      }

      if (selectedJellabas.length === 0) return

      selectedJellabas.forEach((selection) => {
        const variant = product.variants?.find(
          v => v.colorCode === selection.colorCode && v.size === selection.size
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

      <ProductGallery
        images={product.images || []}
        mainImage={product.mainImage}
        productName={productName}
        activeImage={activeImage}
        onSelectImage={setActiveImage}
        locale={locale}
      />

      {/* ========================================
          PRODUCT INFO
      ======================================== */}

      <div className="product-purchase-panel space-y-5">
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
            PRICE + QUANTITY
        ====================================== */}

        <div className="product-price-row">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
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
            {product.isNiqab && (
              <span
                className="whitespace-nowrap text-xs font-semibold sm:text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {locale === 'ar'
                  ? 'لنقاب الواحد'
                  : locale === 'fr'
                    ? 'pour un niqab'
                    : 'for one niqab'}
              </span>
            )}
            </div>
          </div>
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
            JELLABA SELECTIONS (multi-row like niqab)
        ====================================== */}

        {!product.isNiqab && colors.length > 0 && (
          <div className="product-addon p-3.5 sm:p-4 rounded-2xl border-2 border-dashed transition-all hover:border-[#C4622D]/50" style={{ borderColor: 'var(--border)' }}>
            <div className="space-y-0.5">
              <span className="font-extrabold text-sm sm:text-base block" style={{ color: 'var(--foreground)' }}>
                {locale === 'ar' ? 'اختاري الألوان والمقاسات' : locale === 'fr' ? 'Choisissez les couleurs et tailles' : 'Choose colors and sizes'}
              </span>
              <span className="text-xs font-medium block leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {locale === 'ar' ? 'أضيفي جلابات بألوان ومقاسات مختلفة' : locale === 'fr' ? 'Ajoutez des djellabas en différentes couleurs et tailles' : 'Add djellabas in different colors and sizes'}
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:gap-4">
              {selectedJellabas.map((selection) => {
                const rowAvailableColors = colors.filter(
                  color => !selectedJellabas.some(other => other.id !== selection.id && other.colorCode === color.code)
                )

                return (
                  <div key={selection.id} className="flex items-center gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <NiqabColorDropdown
                        selectionId={selection.id}
                        currentColorCode={selection.colorCode}
                        availableColors={rowAvailableColors}
                        getDisplayColorName={getDisplayColorName}
                        onSelectColor={changeJellabaColor}
                      />
                    </div>

                    <select
                      value={selection.size}
                      onChange={e => changeJellabaSize(selection.id, e.target.value)}
                      className="h-9 flex-shrink-0 w-16 sm:w-20 rounded-lg border px-2 text-xs font-bold bg-transparent"
                      style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
                    >
                      {sizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <div
                        className="flex items-center h-8 sm:h-9 border rounded-lg overflow-hidden shadow-xs"
                        style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                      >
                        <button type="button" onClick={() => updateJellabaQuantity(selection.id, -1)} className="w-6 sm:w-8 h-full flex items-center justify-center transition-colors hover:bg-[#C4622D]/10 hover:text-[#C4622D] font-bold text-xs sm:text-sm" aria-label="Decrease quantity">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-1.5 sm:px-2 h-full flex items-center justify-center text-xs sm:text-sm font-extrabold border-x min-w-[1.25rem] sm:min-w-[2rem]" style={{ borderColor: 'var(--border)' }}>
                          {selection.quantity}
                        </span>
                        <button type="button" onClick={() => updateJellabaQuantity(selection.id, 1)} className="w-6 sm:w-8 h-full flex items-center justify-center transition-colors hover:bg-[#C4622D]/10 hover:text-[#C4622D] font-bold text-xs sm:text-sm" aria-label="Increase quantity">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {selectedJellabas.length > 1 && (
                        <button type="button" onClick={() => removeJellabaColor(selection.id)} className="w-7 sm:w-9 h-7 sm:h-9 flex items-center justify-center rounded-lg border text-red-500 hover:bg-red-500/10 flex-shrink-0 transition-colors" style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'var(--card)' }} aria-label="Remove color">
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* ==================================
                  ADD ANOTHER COLOR
              ================================== */}

              {availableJellabaColors.length > 0 && (
                <button type="button" onClick={handleAddJellabaColor} className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-dashed px-4 py-3.5 text-xs sm:text-sm font-bold text-[#C4622D] bg-[#C4622D]/[0.04] hover:bg-[#C4622D]/10 transition-colors text-center shadow-xs" style={{ borderColor: '#C4622D' }}>
                  <Plus className="h-4 w-4" />
                  {locale === 'ar' ? 'إضافة جلابة' : locale === 'fr' ? 'Ajouter une djellaba' : 'Add a djellaba'}
                </button>
              )}

              {/* JELLABA TOTAL */}
              <div
                className="flex items-center justify-between p-3 sm:p-4 rounded-2xl border shadow-xs"
                style={{
                  background: 'rgba(196,98,45,0.06)',
                  borderColor: 'rgba(196,98,45,0.2)',
                }}
              >
                <span className="text-xs sm:text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                  {locale === 'ar'
                    ? `مجموع تمن الجلابات: ${selectedJellabaQuantity}`
                    : locale === 'fr'
                      ? `Total djellabas : ${selectedJellabaQuantity}`
                      : `Total djellabas: ${selectedJellabaQuantity}`}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-[#C4622D]">
                  {formatPrice(jellabasTotal, locale)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================
            NIQAB ADD-ON
        ====================================== */}

        {((product.canAddNiqab && !product.isNiqab) || product.isNiqab) && niqabColors.length > 0 && (
          <div
            className={`product-addon p-3.5 sm:p-4 rounded-2xl border-2 transition-all ${includeNiqab ? 'border-[#C4622D] bg-[rgba(196,98,45,0.025)] shadow-sm' : 'border-dashed hover:border-[#C4622D]/50'
              }`}
            style={{ borderColor: includeNiqab ? '#C4622D' : 'var(--border)' }}
          >
            <label className="flex items-start gap-3 cursor-pointer select-none">
              {!product.isNiqab && <>
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
              </>}
              <div className="space-y-0.5">
                <span className="font-extrabold text-sm sm:text-base block" style={{ color: 'var(--foreground)' }}>
                  {product.isNiqab
                    ? locale === 'ar' ? 'اختاري الألوان والكميات' : locale === 'fr' ? 'Choisissez les couleurs et les quantités' : 'Choose colors and quantities'
                    : locale === 'ar'
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

            {(product.isNiqab || includeNiqab) && niqabSelections.length > 0 && (
            <div className="mt-3 flex flex-col gap-3 sm:gap-4">
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
                          className="flex items-center h-9 border rounded-lg overflow-hidden shadow-xs"
                          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                        >
                          <button
                            type="button"
                            onClick={() => updateNiqabQuantity(selection.id, -1)}
                            className="w-8 h-full flex items-center justify-center transition-colors hover:bg-[#C4622D]/10 hover:text-[#C4622D] font-bold text-sm"
                            aria-label="Decrease niqab quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span
                            className="px-2 h-full flex items-center justify-center text-sm font-extrabold border-x min-w-[2rem]"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            {selection.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateNiqabQuantity(selection.id, 1)}
                            className="w-8 h-full flex items-center justify-center transition-colors hover:bg-[#C4622D]/10 hover:text-[#C4622D] font-bold text-sm"
                            aria-label="Increase niqab quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {(index > 0 || niqabSelections.length > 1) && (
                          <button
                            type="button"
                            onClick={() => removeNiqabColor(selection.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border text-red-500 hover:bg-red-500/10 flex-shrink-0 transition-colors"
                            style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'var(--card)' }}
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
                  className="flex items-center justify-between p-3 sm:p-4 rounded-2xl border shadow-xs"
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
            ADD TO CART
        ====================================== */}

        <div className="product-actions">
          <button
            type="button"
            onClick={
              handleAddToCart
            }
            disabled={
              (!product.isNiqab && (selectedJellabas.length === 0 || !hasStock)) ||
              (product.isNiqab && selectedNiqabQuantity < 5)
            }
            className="btn btn-primary btn-round flex h-12 w-full items-center justify-center gap-2 text-sm"
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

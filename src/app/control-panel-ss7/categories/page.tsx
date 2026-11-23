'use client'

import React, { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  ArrowUpDown,
  Search,
  Loader2,
  Ruler,
  ShoppingBag,
  BookOpen,
  Languages,
  ChevronDown,
  Palette,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { useAdminI18n } from '@/components/admin/providers/AdminI18nContext'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { ImageUploader } from '@/components/admin/ui/ImageUploader'
import { getColorNames } from '@/lib/color-names'
import {
  getDefaultCategoryConfig,
  getSuggestedConfigForMode,
  LETTER_PRESET_SIZES,
  NUMERIC_PRESET_SIZES,
  STANDARD_PRESET_SIZES,
  type CategoryCardAspectRatio,
  type CategoryColorMode,
  type CategoryConfig,
  type CategorySizingMode,
  type SizeGuideProfile,
} from '@/lib/category-config'

interface CategoryItem {
  id: string
  slug: string
  name: string
  nameAr?: string
  nameFr?: string
  nameEn?: string
  descriptionAr?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  image: string | null
  sortOrder: number
  isActive: boolean
  parentId?: string | null
  productsCount?: number
  config?: CategoryConfig
}

type LangTab = 'ar' | 'fr' | 'en'
type ConfigTab = 'basics' | 'sizing' | 'rules' | 'display' | 'review'

const PRESET_COLORS = [
  '#000000',
  '#3B2316',
  '#6B1D2F',
  '#C4622D',
  '#C88B12',
  '#0F5132',
  '#1B2A4A',
  '#F2E4CE',
]

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function resolveCategorySlug(slug: string, nameFr: string, nameEn: string): string {
  return slug.trim() || slugify(nameFr || nameEn) || `cat-${Date.now()}`
}

function CategoryContent({ initialSearch }: { initialSearch: string }) {
  const { tr, locale, dir } = useAdminI18n()
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeModalTab, setActiveModalTab] = useState<ConfigTab>('basics')
  const [activeLangTab, setActiveLangTab] = useState<LangTab>('ar')
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const [applyToExistingProducts, setApplyToExistingProducts] = useState(false)

  const [customSizeInput, setCustomSizeInput] = useState('')
  const [pickerColor, setPickerColor] = useState('#000000')

  const [formData, setFormData] = useState({
    nameAr: '',
    nameFr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionFr: '',
    descriptionEn: '',
    slug: '',
    parentId: '',
    image: '',
    sortOrder: '0',
    isActive: true,
  })

  const [configData, setConfigData] = useState<CategoryConfig>(() =>
    getDefaultCategoryConfig()
  )

  const { success, error } = useToast()

  useEffect(() => {
    let active = true
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/categories', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (active && Array.isArray(data.items)) {
          setCategories(data.items)
        }
      } catch (err) {
        console.error('Error loading categories:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadCategories()
    return () => {
      active = false
    }
  }, [refreshTick])

  const getDisplayName = (cat: CategoryItem) => {
    if (locale === 'ar') return cat.nameAr || cat.name || cat.nameFr || cat.nameEn || cat.slug
    return cat.nameEn || cat.nameFr || cat.name || cat.nameAr || cat.slug
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setApplyToExistingProducts(false)
    setActiveModalTab('basics')
    setActiveLangTab(locale === 'ar' ? 'ar' : 'en')
    setCustomSizeInput('')
    setFormData({
      nameAr: '',
      nameFr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionFr: '',
      descriptionEn: '',
      slug: '',
      parentId: '',
      image: '',
      sortOrder: String(categories.length + 1),
      isActive: true,
    })
    setConfigData(getDefaultCategoryConfig())
    setIsModalOpen(true)
  }

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat)
    setApplyToExistingProducts(false)
    setActiveModalTab('basics')
    setActiveLangTab(locale === 'ar' ? 'ar' : 'en')
    setCustomSizeInput('')
    setFormData({
      nameAr: cat.nameAr || cat.name || '',
      nameFr: cat.nameFr || cat.name || '',
      nameEn: cat.nameEn || cat.name || '',
      descriptionAr: cat.descriptionAr || '',
      descriptionFr: cat.descriptionFr || '',
      descriptionEn: cat.descriptionEn || '',
      slug: cat.slug,
      parentId: cat.parentId || '',
      image: cat.image || '',
      sortOrder: String(cat.sortOrder || 0),
      isActive: cat.isActive,
    })
    setConfigData(cat.config ?? getDefaultCategoryConfig(cat))
    setIsModalOpen(true)
  }

  const handleSizingModeChange = (mode: CategorySizingMode) => {
    const suggested = getSuggestedConfigForMode(mode, configData)
    setConfigData((prev) => ({
      ...prev,
      ...suggested,
    }))
  }

  const toggleDefaultSize = (sz: string) => {
    setConfigData((prev) => {
      const exists = prev.defaultSizes.includes(sz)
      return {
        ...prev,
        defaultSizes: exists
          ? prev.defaultSizes.filter((s) => s !== sz)
          : [...prev.defaultSizes, sz],
      }
    })
  }

  const addCustomDefaultSize = () => {
    const trimmed = customSizeInput.trim()
    if (!trimmed) return
    setConfigData((prev) => ({
      ...prev,
      defaultSizes: prev.defaultSizes.includes(trimmed)
        ? prev.defaultSizes
        : [...prev.defaultSizes, trimmed],
    }))
    setCustomSizeInput('')
  }

  const handleColorModeChange = (mode: CategoryColorMode) => {
    setConfigData((prev) => {
      if (mode === 'single') {
        const primary = prev.defaultColors[0] || '#000000'
        return {
          ...prev,
          colorMode: 'single',
          defaultColors: [primary],
        }
      }
      return {
        ...prev,
        colorMode: 'multi',
      }
    })
  }

  const toggleDefaultColor = (hex: string) => {
    const norm = (hex.startsWith('#') ? hex : `#${hex}`).toUpperCase()
    setConfigData((prev) => {
      if (prev.colorMode === 'single') {
        return {
          ...prev,
          defaultColors: [norm],
        }
      }
      const exists = prev.defaultColors.includes(norm)
      const next = exists
        ? prev.defaultColors.filter((c) => c !== norm)
        : [...prev.defaultColors, norm]
      return {
        ...prev,
        defaultColors: next.length > 0 ? next : [norm],
      }
    })
  }

  const addCustomDefaultColor = (hex: string) => {
    const norm = (hex.startsWith('#') ? hex : `#${hex}`).toUpperCase()
    if (!/^#[0-9A-F]{3,8}$/.test(norm)) {
      error(tr(`كود لون غير صالح: ${hex}`, `Invalid hex color: ${hex}`))
      return
    }
    setConfigData((prev) => {
      if (prev.colorMode === 'single') {
        return {
          ...prev,
          defaultColors: [norm],
        }
      }
      return {
        ...prev,
        defaultColors: prev.defaultColors.includes(norm)
          ? prev.defaultColors
          : [...prev.defaultColors, norm],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingCategory && activeModalTab !== 'review') {
      const nextIdx = modalTabs.findIndex((t) => t.key === activeModalTab) + 1
      if (nextIdx > 0 && nextIdx < modalTabs.length) {
        setActiveModalTab(modalTabs[nextIdx].key)
      }
      return
    }

    const primaryName =
      formData.nameFr.trim() || formData.nameAr.trim() || formData.nameEn.trim()
    if (!primaryName) {
      setActiveModalTab('basics')
      error(
        tr(
          'يرجى إدخال اسم التصنيف بلغة واحدة على الأقل',
          'Please enter a category name in at least one language'
        )
      )
      return
    }

    setSubmitting(true)

    try {
      const parsedSortOrder = Number.parseInt(formData.sortOrder, 10)
      const resolvedSlug = resolveCategorySlug(
        formData.slug,
        formData.nameFr,
        formData.nameEn
      )

      const payload = {
        nameAr: formData.nameAr.trim() || primaryName,
        nameFr: formData.nameFr.trim() || primaryName,
        nameEn: formData.nameEn.trim() || primaryName,
        descriptionAr: formData.descriptionAr.trim() || null,
        descriptionFr: formData.descriptionFr.trim() || null,
        descriptionEn: formData.descriptionEn.trim() || null,
        slug: resolvedSlug,
        parentId: formData.parentId || null,
        image: formData.image || null,
        sortOrder: Number.isFinite(parsedSortOrder) ? parsedSortOrder : 0,
        isActive: formData.isActive,
        config: configData,
        ...(editingCategory ? { applyToExistingProducts } : {}),
      }

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const responseData = (await res.json().catch(() => ({}))) as {
        error?: string
        syncedProductsCount?: number
      }

      if (!res.ok) {
        throw new Error(responseData.error || tr('فشل حفظ التصنيف', 'Failed to save category'))
      }

      const syncedCount = Number(responseData?.syncedProductsCount || 0)
      success(
        editingCategory
          ? syncedCount > 0
            ? tr(
                `تم تحديث التصنيف ومزامنة ${syncedCount} منتج(ات) بنجاح`,
                `Category updated & ${syncedCount} product(s) synced successfully`
              )
            : tr('تم تحديث التصنيف وقواعده بنجاح', 'Category & rules updated successfully')
          : tr('تم إنشاء التصنيف وقواعده بنجاح', 'Category & rules created successfully')
      )
      setIsModalOpen(false)
      setRefreshTick((t) => t + 1)
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : tr('فشل الإجراء', 'Action failed'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || tr('فشل حذف التصنيف', 'Failed to delete category'))
      }

      success(tr('تم حذف التصنيف بنجاح', 'Category deleted successfully'))
      setDeleteTarget(null)
      setRefreshTick((t) => t + 1)
    } catch (err: unknown) {
      error(
        err instanceof Error ? err.message : tr('خطأ أثناء حذف التصنيف', 'Error deleting category')
      )
    } finally {
      setSubmitting(false)
    }
  }

  const q = search.trim().toLowerCase()
  const filteredCategories = categories.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.nameAr || '').toLowerCase().includes(q) ||
      (c.nameFr || '').toLowerCase().includes(q) ||
      (c.nameEn || '').toLowerCase().includes(q) ||
      (c.slug || '').toLowerCase().includes(q)
  )

  const getSizingSummary = (cat: CategoryItem) => {
    const cfg = cat.config ?? getDefaultCategoryConfig(cat)
    const sizeText =
      cfg.sizingMode === 'bundle_no_size'
        ? tr('بدون مقاس', 'No Size')
        : cfg.sizingMode === 'standard'
          ? tr('موحد', 'One Size')
          : cfg.sizingMode === 'numeric'
            ? tr('رقمي', 'Numeric')
            : tr('حرفي', 'Letter')
    const qtyText =
      cfg.maxOrderQuantity !== null
        ? `${tr('الحد', 'Qty')} ${cfg.minOrderQuantity}–${cfg.maxOrderQuantity}`
        : `${tr('الأدنى', 'Min')} ${cfg.minOrderQuantity}`
    return `${sizeText} · ${cfg.cardAspectRatio} · ${qtyText}`
  }

  const presetChipsForMode =
    configData.sizingMode === 'numeric'
      ? NUMERIC_PRESET_SIZES
      : configData.sizingMode === 'standard'
        ? STANDARD_PRESET_SIZES
        : LETTER_PRESET_SIZES

  const modalTabs: Array<{ key: ConfigTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { key: 'basics', label: tr('البيانات واللغات', 'Basics'), icon: Languages },
    { key: 'sizing', label: tr('المقاسات والصور', 'Sizing & Images'), icon: Ruler },
    { key: 'rules', label: tr('قواعد البيع', 'Selling Rules'), icon: ShoppingBag },
    { key: 'display', label: tr('العرض والتسمية', 'Display & Copy'), icon: BookOpen },
    { key: 'review', label: tr('مراجعة التصنيف', 'Review'), icon: ClipboardCheck },
  ]

  const parentCandidates = categories.filter((c) => c.id !== editingCategory?.id)
  const hasAnyName = Boolean(
    formData.nameAr.trim() || formData.nameFr.trim() || formData.nameEn.trim()
  )
  const currentTabIndex = modalTabs.findIndex((t) => t.key === activeModalTab)
  const canGoPrev = currentTabIndex > 0
  const canGoNext = currentTabIndex >= 0 && currentTabIndex < modalTabs.length - 1
  const isRTL = dir === 'rtl'
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft
  const NextIcon = isRTL ? ChevronLeft : ChevronRight

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/12 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {tr('إدارة التصنيفات', 'Category Management')}
            </h1>
            <p className="text-xs sm:text-[13px] text-zinc-400 mt-0.5">
              {tr(
                'إعداد أقسام المتجر وقواعد المقاسات والصور والكميات لكل نوع منتج',
                'Configure store sections, sizing modes, image framing, and merchandising rules'
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{tr('إضافة تصنيف', 'Add Category')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 max-w-md w-full">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr('ابحث عن تصنيف...', 'Search categories...')}
            className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 rounded-xl ps-10 pe-10 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label={tr('مسح البحث', 'Clear search')}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-full py-14 text-center text-zinc-400">
            <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-amber-400" />
            <p className="text-xs">{tr('جاري تحميل التصنيفات...', 'Loading categories...')}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full py-14 px-4 text-center bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
            <p className="text-sm font-semibold text-zinc-300">
              {tr('لا توجد تصنيفات متاحة حالياً.', 'No categories found.')}
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="h-9 px-4 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {tr('إنشاء أول تصنيف', 'Create First Category')}
            </button>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const parentCat = cat.parentId
              ? categories.find((p) => p.id === cat.parentId)
              : undefined
            return (
              <div
                key={cat.id}
                className="bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700/80 overflow-hidden shrink-0">
                      <Image
                        src={cat.image || '/images/brand/logo-full.png'}
                        alt={getDisplayName(cat)}
                        fill
                        sizes="160px"
                        quality={92}
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        title={tr('تعديل التصنيف والقواعد', 'Edit Category & Rules')}
                        aria-label={tr('تعديل التصنيف', 'Edit Category')}
                        className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cat)}
                        title={tr('حذف التصنيف', 'Delete Category')}
                        aria-label={tr('حذف التصنيف', 'Delete Category')}
                        className="h-9 w-9 rounded-lg bg-rose-500/12 border border-rose-500/25 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-white truncate">
                    {getDisplayName(cat)}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5 truncate" dir="ltr">
                    /{cat.slug}
                  </p>
                  {parentCat && (
                    <p className="text-[11px] text-amber-400/90 mt-1 truncate">
                      {tr('يتبع:', 'Sub of:')} {getDisplayName(parentCat)}
                    </p>
                  )}

                  <div className="flex items-center gap-2.5 mt-3.5 text-xs flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 font-semibold tabular-nums">
                      {cat.productsCount || 0} {tr('منتج', 'Products')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-zinc-400 tabular-nums font-mono">
                      <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />#{cat.sortOrder}
                    </span>
                  </div>

                  {/* Behavior Engine Quiet Typographic Summary */}
                  <p className="text-[11px] text-zinc-400 mt-3 pt-2.5 border-t border-zinc-800/70 tabular-nums truncate">
                    {getSizingSummary(cat)}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{tr('الحالة', 'Status')}</span>
                  {cat.isActive ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {tr('نشط', 'Active')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                      <XCircle className="w-3.5 h-3.5" />
                      {tr('مخفي', 'Hidden')}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Category & Behavior Engine Modal */}
      {isModalOpen && (
        <div
          dir={dir}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-3xl max-h-[94dvh] sm:max-h-[90dvh] flex flex-col bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-white truncate">
                  {editingCategory
                    ? tr('تعديل التصنيف وقواعده', 'Edit Category & Rules')
                    : tr('إنشاء تصنيف جديد', 'Create Category & Rules')}
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                  {tr(
                    'إعدادات هذا التصنيف تُطبّق تلقائياً على نماذج المنتجات وصفحات المتجر',
                    'Rules configured here automate product creation & storefront display'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label={tr('إغلاق', 'Close')}
                className="w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5-Tab Bar */}
            <div className="px-3 sm:px-6 pt-2.5 sm:pt-3 border-b border-zinc-800 bg-[#0b0b0e] flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
              {modalTabs.map((tab) => {
                const Icon = tab.icon
                const active = activeModalTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveModalTab(tab.key)}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 text-xs font-bold border-b-2 -mb-px whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'border-amber-500 text-amber-400'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto admin-scroll p-4 sm:p-6 space-y-5">
                {/* ── TAB 1: BASICS & LANGUAGES ── */}
                {activeModalTab === 'basics' && (
                  <>
                    {/* 3-Language Sub-Tabs */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-zinc-300">
                          {tr('الاسم والوصف حسب اللغة', 'Name & Description')}
                        </span>
                        <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
                          {(['ar', 'fr', 'en'] as LangTab[]).map((tab) => {
                            const label =
                              tab === 'ar' ? 'العربية' : tab === 'fr' ? 'Français' : 'English'
                            return (
                              <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveLangTab(tab)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  activeLangTab === tab
                                    ? 'bg-amber-500 text-zinc-950'
                                    : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                              >
                                {label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {activeLangTab === 'ar' && (
                        <div className="space-y-3" dir="rtl">
                          <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                              {tr('اسم التصنيف (بالعربية)', 'Name (Arabic)')}
                            </label>
                            <input
                              type="text"
                              value={formData.nameAr}
                              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                              placeholder="عباءات مطرزة"
                              className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                              {tr('وصف قصير (بالعربية)', 'Description (Arabic)')}
                            </label>
                            <input
                              type="text"
                              value={formData.descriptionAr}
                              onChange={(e) =>
                                setFormData({ ...formData, descriptionAr: e.target.value })
                              }
                              placeholder="وصف قصير للتصنيف..."
                              className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {activeLangTab === 'fr' && (
                        <div className="space-y-3" dir="ltr">
                          <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                              Nom (Français)
                            </label>
                            <input
                              type="text"
                              value={formData.nameFr}
                              onChange={(e) => {
                                const val = e.target.value
                                setFormData((prev) => ({
                                  ...prev,
                                  nameFr: val,
                                  slug: !editingCategory && !prev.slug ? slugify(val) : prev.slug,
                                }))
                              }}
                              placeholder="Abayas brodées"
                              className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                              Description (Français)
                            </label>
                            <input
                              type="text"
                              value={formData.descriptionFr}
                              onChange={(e) =>
                                setFormData({ ...formData, descriptionFr: e.target.value })
                              }
                              placeholder="Description FR..."
                              className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {activeLangTab === 'en' && (
                        <div className="space-y-3" dir="ltr">
                          <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                              Name (English)
                            </label>
                            <input
                              type="text"
                              value={formData.nameEn}
                              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                              placeholder="Embroidered Abayas"
                              className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                              Description (English)
                            </label>
                            <input
                              type="text"
                              value={formData.descriptionEn}
                              onChange={(e) =>
                                setFormData({ ...formData, descriptionEn: e.target.value })
                              }
                              placeholder="Description EN..."
                              className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Slug, Sort Order & Parent Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          {tr('الرابط المختصر Slug', 'Slug')}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="abayas"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-xs font-mono text-zinc-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          {tr('التصنيف الأب (اختياري)', 'Parent Category')}
                        </label>
                        <div className="relative">
                          <select
                            value={formData.parentId}
                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                            className="appearance-none w-full h-11 bg-[#111115] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl ps-3.5 pe-9 text-xs text-zinc-100 outline-none cursor-pointer"
                          >
                            <option value="">{tr('تصنيف رئيسي مستقل', 'Top-level category')}</option>
                            {parentCandidates.map((cand) => (
                              <option key={cand.id} value={cand.id}>
                                {getDisplayName(cand)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-zinc-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          {tr('ترتيب العرض', 'Sort Order')}
                        </label>
                        <input
                          type="number"
                          dir="ltr"
                          value={formData.sortOrder}
                          onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm font-mono tabular-nums text-zinc-100 outline-none"
                        />
                      </div>
                    </div>

                    {/* Active */}
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-zinc-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <span>{tr('تصنيف مفعل وظاهر في المتجر', 'Active Category')}</span>
                    </label>
                  </>
                )}

                {/* ── TAB 2: SIZING & VISUAL FRAMING ── */}
                {activeModalTab === 'sizing' && (
                  <div className="space-y-5">
                    {/* Sizing Mode Selector */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold text-zinc-200">
                        {tr('نظام المقاسات للتصنيف', 'Category Sizing Mode')}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(
                          [
                            {
                              value: 'letter',
                              title: tr('مقاسات حرفية (XS – XXXL)', 'Letter Sizes (XS – XXXL)'),
                              desc: tr('للجلابيات والملابس الجاهزة', 'Ideal for Djellabas & apparel'),
                            },
                            {
                              value: 'numeric',
                              title: tr('مقاسات طولية رقمية (50 – 60)', 'Numeric Sizes (50 – 60)'),
                              desc: tr('مثالي للعباءات والقفاطين', 'Ideal for Abayas & Kaftans'),
                            },
                            {
                              value: 'standard',
                              title: tr('مقاس موحّد (One Size)', 'One Size / Standard'),
                              desc: tr('للقفازات، الشالات، الإكسسوارات', 'Gloves, scarves & accessories'),
                            },
                            {
                              value: 'bundle_no_size',
                              title: tr('حزمة ألوان بدون مقاس', 'No-Size Color Bundle'),
                              desc: tr('مثل النقاب (ألوان + كمية فقط)', 'Like Niqabs (color + qty only)'),
                            },
                          ] as Array<{ value: CategorySizingMode; title: string; desc: string }>
                        ).map((opt) => {
                          const selected = configData.sizingMode === opt.value
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSizingModeChange(opt.value)}
                              className={`text-start p-3.5 rounded-xl border transition-colors cursor-pointer ${
                                selected
                                  ? 'border-amber-500 bg-amber-500/12 text-white'
                                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                              }`}
                            >
                              <div className="text-xs font-extrabold">{opt.title}</div>
                              <div className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Default Sizes Chips */}
                    {configData.sizingMode !== 'bundle_no_size' && (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-zinc-200">
                            {tr(
                              'المقاسات الافتراضية المقترحة عند إضافة منتج جديد',
                              'Default Suggested Sizes for New Products'
                            )}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {presetChipsForMode.map((sz) => {
                            const active = configData.defaultSizes.includes(sz)
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => toggleDefaultSize(sz)}
                                className={`h-8 px-3 rounded-lg border text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                                  active
                                    ? 'bg-amber-500 text-zinc-950 border-amber-500'
                                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                                }`}
                              >
                                {sz}
                              </button>
                            )
                          })}
                          {configData.defaultSizes
                            .filter((sz) => !presetChipsForMode.includes(sz))
                            .map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => toggleDefaultSize(sz)}
                                className="h-8 px-3 rounded-lg border border-amber-500 bg-amber-500/20 text-amber-300 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>{sz}</span>
                                <X className="w-3 h-3" />
                              </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customSizeInput}
                            onChange={(e) => setCustomSizeInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addCustomDefaultSize()
                              }
                            }}
                            placeholder={tr('إضافة مقاس مخصص...', 'Add custom size...')}
                            className="flex-1 min-w-0 h-9 bg-[#0b0b0e] border border-zinc-800 focus:border-amber-500/70 rounded-xl px-3 text-xs text-zinc-100 outline-none"
                          />
                          <button
                            type="button"
                            onClick={addCustomDefaultSize}
                            className="h-9 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold cursor-pointer"
                          >
                            {tr('إضافة', 'Add')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Size Guide Profile (grouped with Sizing) */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-zinc-200">
                        {tr('ملف دليل المقاسات المرتبط', 'Linked Size Guide Profile')}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {(
                          [
                            {
                              value: 'djellaba',
                              title: tr('دليل الجلابة (XS–XXXL)', 'Djellaba Chart'),
                              desc: tr('صدر، طول كلي، كتف', 'Chest, length, shoulder'),
                            },
                            {
                              value: 'abaya',
                              title: tr('دليل العباءات (50–60)', 'Abaya Length Chart'),
                              desc: tr('الطول بالسنتيمتر للقامة', 'Length by wearer height'),
                            },
                            {
                              value: 'none',
                              title: tr('إخفاء الدليل', 'Hide Size Guide'),
                              desc: tr('للقفازات والنقابات', 'For gloves & niqabs'),
                            },
                          ] as Array<{ value: SizeGuideProfile; title: string; desc: string }>
                        ).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setConfigData((prev) => ({ ...prev, sizeGuideProfile: opt.value }))
                            }
                            className={`text-start p-3 rounded-xl border transition-colors cursor-pointer ${
                              configData.sizeGuideProfile === opt.value
                                ? 'border-amber-500 bg-amber-500/12 text-white'
                                : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                            }`}
                          >
                            <div className="text-xs font-extrabold">{opt.title}</div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Cover Image + Card Aspect Ratio (All Image Settings Unified Here) */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-200 mb-2">
                          {tr('صورة التصنيف', 'Category Cover Image')}
                        </label>
                        <ImageUploader
                          multiple={false}
                          images={formData.image ? [formData.image] : []}
                          mainImage={formData.image}
                          onChange={(imgs) => setFormData({ ...formData, image: imgs[0] || '' })}
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="block text-xs font-bold text-zinc-200">
                          {tr('نسبة أبعاد صور بطاقات المتجر', 'Product Card Image Aspect Ratio')}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(
                            [
                              {
                                value: '3:4',
                                title: tr('طولي 3:4', 'Portrait 3:4'),
                                desc: tr('لجلابيات وعباءات القامة الكاملة', 'Full-length garments'),
                              },
                              {
                                value: '1:1',
                                title: tr('مربع 1:1', 'Square 1:1'),
                                desc: tr('للقفازات، النقابات، والإكسسوارات', 'Gloves, niqabs & small items'),
                              },
                            ] as Array<{ value: CategoryCardAspectRatio; title: string; desc: string }>
                          ).map((opt) => {
                            const selected = configData.cardAspectRatio === opt.value
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() =>
                                  setConfigData((prev) => ({
                                    ...prev,
                                    cardAspectRatio: opt.value,
                                  }))
                                }
                                className={`text-start p-3 rounded-xl border transition-colors cursor-pointer ${
                                  selected
                                    ? 'border-amber-500 bg-amber-500/12 text-white'
                                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                                }`}
                              >
                                <div className="text-xs font-extrabold tabular-nums">{opt.title}</div>
                                <div className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: SELLING RULES ── */}
                {activeModalTab === 'rules' && (
                  <div className="space-y-5">
                    {/* Min & Max Order Quantity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          {tr('الحد الأدنى للطلب (للمنتج)', 'Minimum Order Quantity')}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          dir="ltr"
                          value={configData.minOrderQuantity}
                          onChange={(e) => {
                            const val = Math.max(1, Number.parseInt(e.target.value || '1', 10) || 1)
                            setConfigData((prev) => ({
                              ...prev,
                              minOrderQuantity: Math.min(99, val),
                            }))
                          }}
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm font-mono tabular-nums text-zinc-100 outline-none"
                        />
                        <p className="text-[11px] text-zinc-500 mt-1">
                          {tr('مثال: 5 للنقاب، 1 للجلابيات والعباءات', 'e.g. 5 for Niqabs, 1 for garments')}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          {tr('الحد الأقصى للطلب (اختياري)', 'Maximum Order Quantity (Optional)')}
                        </label>
                        <input
                          type="number"
                          min={configData.minOrderQuantity}
                          max={999}
                          dir="ltr"
                          value={configData.maxOrderQuantity ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value.trim()
                            if (!raw) {
                              setConfigData((prev) => ({ ...prev, maxOrderQuantity: null }))
                              return
                            }
                            const val = Number.parseInt(raw, 10)
                            if (Number.isFinite(val)) {
                              setConfigData((prev) => ({
                                ...prev,
                                maxOrderQuantity: Math.max(prev.minOrderQuantity, Math.min(999, val)),
                              }))
                            }
                          }}
                          placeholder={tr('غير محدود', 'Unlimited')}
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm font-mono tabular-nums text-zinc-100 outline-none"
                        />
                      </div>
                    </div>

                    {/* Matching Niqab Companion Rule (Dynamic price note - never hardcoded 20 DH) */}
                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configData.allowMatchingNiqab}
                        onChange={(e) =>
                          setConfigData((prev) => ({
                            ...prev,
                            allowMatchingNiqab: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 mt-0.5 accent-amber-500 rounded shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-zinc-100">
                          {tr(
                            'السماح افتراضياً بإضافة نقاب متناسق لمنتجات هذا التصنيف',
                            'Allow matching Niqab companion add-on by default'
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {tr(
                            'يُحسب السعر تلقائياً حسب سعر منتج النقاب الفعلي في المتجر، ويُفعّل للجلابيات والعباءات فقط',
                            'Price is pulled dynamically from your live Niqab catalog price; enabled for garments'
                          )}
                        </div>
                      </div>
                    </label>

                    {/* Allow Custom Tailoring / Sizing Note (grouped logically with Selling Rules) */}
                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configData.allowCustomNote}
                        onChange={(e) =>
                          setConfigData((prev) => ({ ...prev, allowCustomNote: e.target.checked }))
                        }
                        className="w-4 h-4 mt-0.5 accent-amber-500 rounded shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-zinc-100">
                          {tr(
                            'تفعيل خانة ملاحظة القياس / التفصيل الاختيارية عند الطلب',
                            'Enable optional custom sizing / tailoring note on order'
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {tr(
                            'تتيح للعميلة كتابة طلب تعديل الطول أو التفصيل الخاص قبل الإضافة للسلة',
                            'Lets customers request length or sleeve tailoring notes before adding to cart'
                          )}
                        </div>
                      </div>
                    </label>

                    {/* Color Mode */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-zinc-200">
                        {tr('سياسة الألوان في التصنيف', 'Category Color Policy')}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(
                          [
                            {
                              value: 'multi',
                              title: tr('ألوان متعددة', 'Multiple Colors'),
                              desc: tr('العميل يختار بين عدة ألوان', 'Customer chooses from swatches'),
                            },
                            {
                              value: 'single',
                              title: tr('لون موحد غالباً', 'Single / Fixed Color'),
                              desc: tr('تحديد لون افتراضي واحد فقط للتصنيف', 'Single default color selected'),
                            },
                          ] as Array<{ value: CategoryColorMode; title: string; desc: string }>
                        ).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleColorModeChange(opt.value)}
                            className={`text-start p-3 rounded-xl border transition-colors cursor-pointer ${
                              configData.colorMode === opt.value
                                ? 'border-amber-500 bg-amber-500/12 text-white'
                                : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                            }`}
                          >
                            <div className="text-xs font-extrabold">{opt.title}</div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Default Colors Picker (Strictly honors Multi vs Single mode) */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                            <Palette className="w-4 h-4 text-amber-400" />
                            {configData.colorMode === 'single'
                              ? tr('اللون الافتراضي الموحد للتصنيف', 'Single Default Color')
                              : tr('الألوان الافتراضية المقترحة للتصنيف', 'Default Suggested Colors')}
                          </span>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {configData.colorMode === 'single'
                              ? tr('يُختار لون واحد فقط في هذا الوضع', 'Only one color can be active in Single Color mode')
                              : tr('يمكن تحديد عدة ألوان مقترحة للمنتجات الجديدة', 'Select multiple suggested colors for new products')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={pickerColor}
                            onChange={(e) => setPickerColor(e.target.value.toUpperCase())}
                            aria-label={tr('اختيار لون', 'Pick color')}
                            className="w-8 h-8 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => addCustomDefaultColor(pickerColor)}
                            className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
                          >
                            {configData.colorMode === 'single'
                              ? tr('تحديد', 'Set')
                              : `+ ${tr('إضافة', 'Add')}`}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map((hex) => {
                          const active = configData.defaultColors.includes(hex.toUpperCase())
                          const info = getColorNames(hex)
                          return (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => toggleDefaultColor(hex)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                                active
                                  ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                                  : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white/60 shrink-0"
                                style={{ backgroundColor: hex }}
                              />
                              <span>{locale === 'ar' ? info.ar : info.en}</span>
                            </button>
                          )
                        })}

                        {configData.defaultColors
                          .filter((hex) => !PRESET_COLORS.includes(hex.toUpperCase()))
                          .map((hex) => {
                            const info = getColorNames(hex)
                            return (
                              <button
                                key={hex}
                                type="button"
                                onClick={() => toggleDefaultColor(hex)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500 bg-amber-500/15 text-amber-300 text-[11px] font-semibold cursor-pointer"
                              >
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-white/60 shrink-0"
                                  style={{ backgroundColor: hex }}
                                />
                                <span>{locale === 'ar' ? info.ar : info.en}</span>
                                <span className="font-mono text-[10px] opacity-80">{hex}</span>
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 4: STOREFRONT DISPLAY & COPY ── */}
                {activeModalTab === 'display' && (
                  <div className="space-y-5">
                    {/* Unit Noun (Singular & Plural in 3 languages) */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
                      <div>
                        <div className="text-xs font-bold text-zinc-200">
                          {tr('تسمية القطعة ديناميكياً في المتجر', 'Dynamic Unit Naming in Storefront')}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {tr(
                            'تُستخدم تلقائياً مثل: «العباءات المختارة (2)» أو «قفازات بألوان مختلفة»',
                            'Used dynamically e.g. "Selected abayas (2)" instead of generic text'
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-2" dir="rtl">
                          <div className="text-[11px] font-bold text-amber-400">العربية</div>
                          <input
                            type="text"
                            value={configData.unitNounAr}
                            onChange={(e) =>
                              setConfigData((prev) => ({ ...prev, unitNounAr: e.target.value }))
                            }
                            placeholder="المفرد (مثلاً: عباءة)"
                            className="w-full h-9 bg-[#0b0b0e] border border-zinc-700/80 rounded-lg px-3 text-xs text-zinc-100 outline-none"
                          />
                          <input
                            type="text"
                            value={configData.unitPluralAr}
                            onChange={(e) =>
                              setConfigData((prev) => ({ ...prev, unitPluralAr: e.target.value }))
                            }
                            placeholder="الجمع (مثلاً: عباءات)"
                            className="w-full h-9 bg-[#0b0b0e] border border-zinc-700/80 rounded-lg px-3 text-xs text-zinc-100 outline-none"
                          />
                        </div>

                        <div className="space-y-2" dir="ltr">
                          <div className="text-[11px] font-bold text-amber-400">Français</div>
                          <input
                            type="text"
                            value={configData.unitNounFr}
                            onChange={(e) =>
                              setConfigData((prev) => ({ ...prev, unitNounFr: e.target.value }))
                            }
                            placeholder="Singulier (ex: abaya)"
                            className="w-full h-9 bg-[#0b0b0e] border border-zinc-700/80 rounded-lg px-3 text-xs text-zinc-100 outline-none"
                          />
                          <input
                            type="text"
                            value={configData.unitPluralFr}
                            onChange={(e) =>
                              setConfigData((prev) => ({ ...prev, unitPluralFr: e.target.value }))
                            }
                            placeholder="Pluriel (ex: abayas)"
                            className="w-full h-9 bg-[#0b0b0e] border border-zinc-700/80 rounded-lg px-3 text-xs text-zinc-100 outline-none"
                          />
                        </div>

                        <div className="space-y-2" dir="ltr">
                          <div className="text-[11px] font-bold text-amber-400">English</div>
                          <input
                            type="text"
                            value={configData.unitNounEn}
                            onChange={(e) =>
                              setConfigData((prev) => ({ ...prev, unitNounEn: e.target.value }))
                            }
                            placeholder="Singular (e.g. abaya)"
                            className="w-full h-9 bg-[#0b0b0e] border border-zinc-700/80 rounded-lg px-3 text-xs text-zinc-100 outline-none"
                          />
                          <input
                            type="text"
                            value={configData.unitPluralEn}
                            onChange={(e) =>
                              setConfigData((prev) => ({ ...prev, unitPluralEn: e.target.value }))
                            }
                            placeholder="Plural (e.g. abayas)"
                            className="w-full h-9 bg-[#0b0b0e] border border-zinc-700/80 rounded-lg px-3 text-xs text-zinc-100 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Care / Material Note */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
                      <div className="text-xs font-bold text-zinc-200">
                        {tr('ملاحظة العناية بالخامة أو الاستخدام (اختياري)', 'Care & Material Note (Optional)')}
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        <input
                          type="text"
                          dir="rtl"
                          value={configData.careNoteAr}
                          onChange={(e) =>
                            setConfigData((prev) => ({ ...prev, careNoteAr: e.target.value }))
                          }
                          placeholder="بالعربية: مثلاً غسيل يدوي بماء بارد للحفاظ على التطريز"
                          className="w-full h-9 bg-[#0b0b0e] border border-zinc-700/80 rounded-lg px-3 text-xs text-zinc-100 outline-none"
                        />
                        <input
                          type="text"
                          dir="ltr"
                          value={configData.careNoteFr}
                          onChange={(e) =>
                            setConfigData((prev) => ({ ...prev, careNoteFr: e.target.value }))
                          }
                          placeholder="Français : ex. Lavage délicat à la main recommandé"
                          className="w-full h-9 bg-[#0b0b0e] border border-zinc-700/80 rounded-lg px-3 text-xs text-zinc-100 outline-none"
                        />
                        <input
                          type="text"
                          dir="ltr"
                          value={configData.careNoteEn}
                          onChange={(e) =>
                            setConfigData((prev) => ({ ...prev, careNoteEn: e.target.value }))
                          }
                          placeholder="English: e.g. Gentle hand wash recommended to preserve embroidery"
                          className="w-full h-9 bg-[#0b0b0e] border border-zinc-700/80 rounded-lg px-3 text-xs text-zinc-100 outline-none"
                        />
                      </div>
                    </div>

                    {/* Visibility Placements */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-2.5">
                      <div className="text-xs font-bold text-zinc-200 mb-1">
                        {tr('مواضع ظهور التصنيف في المتجر', 'Storefront Visibility Placements')}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="inline-flex items-center gap-2 text-xs text-zinc-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={configData.showInHomeTabs}
                            onChange={(e) =>
                              setConfigData((prev) => ({
                                ...prev,
                                showInHomeTabs: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 accent-amber-500 rounded"
                          />
                          <span>{tr('تبويبات الصفحة الرئيسية', 'Home Tabs')}</span>
                        </label>

                        <label className="inline-flex items-center gap-2 text-xs text-zinc-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={configData.showSizeFilter}
                            onChange={(e) =>
                              setConfigData((prev) => ({
                                ...prev,
                                showSizeFilter: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 accent-amber-500 rounded"
                          />
                          <span>{tr('فلتر المقاسات بالكتالوج', 'Catalog Size Filter')}</span>
                        </label>

                        <label className="inline-flex items-center gap-2 text-xs text-zinc-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={configData.showInFooter}
                            onChange={(e) =>
                              setConfigData((prev) => ({
                                ...prev,
                                showInFooter: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 accent-amber-500 rounded"
                          />
                          <span>{tr('روابط التذييل السريعة', 'Footer Quick Links')}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 5: CATEGORY REVIEW ── */}
                {activeModalTab === 'review' && (
                  <div className="space-y-4">
                    {!hasAnyName && (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs">
                        <span className="font-bold text-amber-300">
                          {tr(
                            'يرجى إدخال اسم التصنيف بلغة واحدة على الأقل قبل الاعتماد',
                            'Please enter a category name in at least one language before saving'
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveModalTab('basics')}
                          className="h-8 px-3 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs cursor-pointer"
                        >
                          {tr('إدخال الاسم الآن', 'Enter Name')}
                        </button>
                      </div>
                    )}

                    {/* Section 1: Basics & Languages */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                        <span className="text-xs font-extrabold text-white">
                          {tr('1. البيانات واللغات', '1. Basics & Languages')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveModalTab('basics')}
                          className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                        >
                          {tr('تعديل', 'Edit')}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[11px]">العربية</span>
                          <span className="font-semibold text-zinc-100">
                            {formData.nameAr.trim() || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[11px]">Français</span>
                          <span className="font-semibold text-zinc-100">
                            {formData.nameFr.trim() || formData.nameAr.trim() || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[11px]">English</span>
                          <span className="font-semibold text-zinc-100">
                            {formData.nameEn.trim() || formData.nameFr.trim() || formData.nameAr.trim() || '—'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400 pt-1 tabular-nums">
                        <span>
                          {tr('الرابط:', 'Slug:')}{' '}
                          <span className="font-mono text-zinc-200" dir="ltr">
                            /{formData.slug.trim() || slugify(formData.nameFr || formData.nameEn) || 'auto'}
                          </span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {tr('الترتيب:', 'Order:')}{' '}
                          <span className="font-mono text-zinc-200">#{formData.sortOrder || 0}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {tr('الحالة:', 'Status:')}{' '}
                          <span className={formData.isActive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {formData.isActive ? tr('مفعل', 'Active') : tr('مخفي', 'Hidden')}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Section 2: Sizing & Images */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                        <span className="text-xs font-extrabold text-white">
                          {tr('2. المقاسات والصور', '2. Sizing & Images')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveModalTab('sizing')}
                          className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                        >
                          {tr('تعديل', 'Edit')}
                        </button>
                      </div>
                      <div className="flex flex-col min-[420px]:flex-row items-start min-[420px]:items-center gap-3 sm:gap-4">
                        <div
                          className="relative w-14 shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900"
                          style={{
                            aspectRatio: configData.cardAspectRatio === '1:1' ? '1 / 1' : '3 / 4',
                          }}
                        >
                          <Image
                            src={formData.image || '/images/brand/logo-full.png'}
                            alt={formData.nameAr || formData.nameEn || 'Category'}
                            fill
                            sizes="80px"
                            referrerPolicy="no-referrer"
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-1 text-xs min-w-0">
                          <div>
                            <span className="text-zinc-400">{tr('نظام المقاسات:', 'Sizing:')} </span>
                            <span className="font-bold text-zinc-100">
                              {configData.sizingMode === 'bundle_no_size'
                                ? tr('حزمة ألوان بدون مقاس', 'No-Size Color Bundle')
                                : configData.sizingMode === 'standard'
                                  ? tr('مقاس موحّد', 'One Size')
                                  : configData.sizingMode === 'numeric'
                                    ? tr('مقاسات طولية رقمية (50–60)', 'Numeric (50–60)')
                                    : tr('مقاسات حرفية (XS–XXXL)', 'Letter (XS–XXXL)')}
                            </span>
                          </div>
                          {configData.sizingMode !== 'bundle_no_size' && (
                            <div className="tabular-nums">
                              <span className="text-zinc-400">{tr('المقاسات الافتراضية:', 'Default Sizes:')} </span>
                              <span className="font-semibold text-amber-300">
                                {configData.defaultSizes.join(' · ') || '—'}
                              </span>
                            </div>
                          )}
                          <div className="tabular-nums">
                            <span className="text-zinc-400">{tr('دليل المقاسات:', 'Size Guide:')} </span>
                            <span className="font-semibold text-zinc-200">
                              {configData.sizeGuideProfile === 'djellaba'
                                ? tr('دليل الجلابة', 'Djellaba Chart')
                                : configData.sizeGuideProfile === 'abaya'
                                  ? tr('دليل العباءات', 'Abaya Chart')
                                  : tr('مخفي', 'Hidden')}
                            </span>
                            <span className="text-zinc-600 mx-2">·</span>
                            <span className="text-zinc-400">{tr('نسبة البطاقة:', 'Card Frame:')} </span>
                            <span className="font-mono font-semibold text-zinc-200">
                              {configData.cardAspectRatio}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Selling Rules */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                        <span className="text-xs font-extrabold text-white">
                          {tr('3. قواعد البيع والألوان', '3. Selling Rules & Colors')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveModalTab('rules')}
                          className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                        >
                          {tr('تعديل', 'Edit')}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs tabular-nums">
                        <div>
                          <span className="text-zinc-400">{tr('الكمية المسموحة:', 'Order Qty:')} </span>
                          <span className="font-bold text-zinc-100">
                            {tr('الأدنى', 'Min')} {configData.minOrderQuantity}
                            {configData.maxOrderQuantity !== null
                              ? ` · ${tr('الأقصى', 'Max')} ${configData.maxOrderQuantity}`
                              : ` · ${tr('بدون حد أقصى', 'No max limit')}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400">{tr('إضافة نقاب متناسق:', 'Matching Niqab:')} </span>
                          <span className="font-bold text-zinc-100">
                            {configData.allowMatchingNiqab ? tr('مفعل', 'Enabled') : tr('معطل', 'Disabled')}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400">{tr('ملاحظة التفصيل:', 'Tailoring Note:')} </span>
                          <span className="font-bold text-zinc-100">
                            {configData.allowCustomNote ? tr('مفعلة للعميلة', 'Enabled') : tr('معطلة', 'Disabled')}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400">{tr('سياسة الألوان:', 'Color Policy:')} </span>
                          <span className="font-bold text-amber-300">
                            {configData.colorMode === 'single'
                              ? tr('لون موحد غالباً', 'Single Color')
                              : tr('ألوان متعددة', 'Multiple Colors')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {configData.defaultColors.map((hex) => {
                          const info = getColorNames(hex)
                          return (
                            <span
                              key={hex}
                              className="inline-flex items-center gap-1.5 text-[11px] text-zinc-200 font-semibold"
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white/60 inline-block"
                                style={{ backgroundColor: hex }}
                              />
                              <span>{locale === 'ar' ? info.ar : info.en}</span>
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    {/* Section 4: Display & Copy */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                        <span className="text-xs font-extrabold text-white">
                          {tr('4. العرض والتسمية', '4. Display & Copy')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveModalTab('display')}
                          className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                        >
                          {tr('تعديل', 'Edit')}
                        </button>
                      </div>
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-zinc-400">{tr('مسمى الوحدة:', 'Unit Labels:')} </span>
                          <span className="font-semibold text-zinc-100">
                            {configData.unitNounAr} / {configData.unitPluralAr} · {configData.unitNounFr} · {configData.unitNounEn}
                          </span>
                        </div>
                        <div className="text-zinc-400">
                          {tr('أماكن الظهور:', 'Visible In:')}{' '}
                          <span className="text-zinc-200 font-medium">
                            {[
                              configData.showInHomeTabs ? tr('تبويبات الرئيسية', 'Home Tabs') : null,
                              configData.showSizeFilter ? tr('فلتر المقاسات', 'Size Filter') : null,
                              configData.showInFooter ? tr('التذييل', 'Footer') : null,
                            ]
                              .filter(Boolean)
                              .join(' · ') || tr('غير ظاهر في القوائم السريعة', 'Hidden from quick placements')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Optional Bulk Sync to Existing Products */}
                    {editingCategory && (editingCategory.productsCount ?? 0) > 0 && (
                      <label className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/35 bg-amber-500/8 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applyToExistingProducts}
                          onChange={(e) => setApplyToExistingProducts(e.target.checked)}
                          className="w-4 h-4 mt-0.5 accent-amber-500 rounded shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="text-xs font-extrabold text-amber-300 tabular-nums">
                            {tr(
                              `مزامنة المقاسات والألوان الافتراضية على جميع المنتجات الحالية (${editingCategory.productsCount})`,
                              `Sync default sizes, colors & rules to all existing products (${editingCategory.productsCount})`
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed">
                            {tr(
                              'عند التفعيل، سيتم تحديث مقاسات وألوان المنتجات المرتبطة بهذا التصنيف لتطابق الإعدادات الحالية مع الحفاظ على إجمالي المخزون لكل منتج.',
                              'When enabled, all existing products in this category will adopt the default sizes, colors, and matching-niqab policy while preserving each product stock total.'
                            )}
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer (Create wizard flow -> Submit in Review tab; Edit -> Save anytime) */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-zinc-800 bg-zinc-950/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-3 sm:px-4 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {tr('إلغاء', 'Cancel')}
                </button>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {canGoPrev && (
                    <button
                      type="button"
                      onClick={() => setActiveModalTab(modalTabs[currentTabIndex - 1].key)}
                      className="h-10 px-3 sm:px-4 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PrevIcon className="w-4 h-4" />
                      <span>{tr('السابق', 'Previous')}</span>
                    </button>
                  )}

                  {!editingCategory ? (
                    canGoNext ? (
                      <button
                        type="button"
                        onClick={() => setActiveModalTab(modalTabs[currentTabIndex + 1].key)}
                        className="h-10 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs inline-flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        <span>{tr('التالي', 'Next')}</span>
                        <NextIcon className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting || !hasAnyName}
                        className="h-10 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {submitting
                          ? tr('جاري الإنشاء...', 'Creating...')
                          : tr('إنشاء التصنيف والقواعد', 'Create Category & Rules')}
                      </button>
                    )
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting || !hasAnyName}
                      className="h-10 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting
                        ? tr('جاري الحفظ...', 'Saving...')
                        : tr('حفظ التعديلات والقواعد', 'Update Category & Rules')}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={tr('حذف التصنيف', 'Delete Category')}
        message={tr(
          `هل أنت متأكد من حذف التصنيف "${deleteTarget ? getDisplayName(deleteTarget) : ''}"؟`,
          `Are you sure you want to delete category "${deleteTarget ? getDisplayName(deleteTarget) : ''}"?`
        )}
        confirmText={tr('حذف التصنيف', 'Delete Category')}
        variant="danger"
        isLoading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function CategoriesWithSearchParams() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  return <CategoryContent key={initialSearch} initialSearch={initialSearch} />
}

export default function AdminCategoriesPage() {
  return (
    <ToastProvider>
      <AdminLayout>
        <Suspense fallback={null}>
          <CategoriesWithSearchParams />
        </Suspense>
      </AdminLayout>
    </ToastProvider>
  )
}

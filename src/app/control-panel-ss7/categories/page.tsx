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
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { useAdminI18n } from '@/components/admin/providers/AdminI18nContext'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { ImageUploader } from '@/components/admin/ui/ImageUploader'

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
  productsCount?: number
}

type LangTab = 'ar' | 'fr' | 'en'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function CategoryContent({ initialSearch }: { initialSearch: string }) {
  const { tr, locale, dir } = useAdminI18n()
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeLangTab, setActiveLangTab] = useState<LangTab>('ar')
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  const [formData, setFormData] = useState({
    nameAr: '',
    nameFr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionFr: '',
    descriptionEn: '',
    slug: '',
    image: '',
    sortOrder: '0',
    isActive: true,
  })

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
    setActiveLangTab(locale === 'ar' ? 'ar' : 'en')
    setFormData({
      nameAr: '',
      nameFr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionFr: '',
      descriptionEn: '',
      slug: '',
      image: '',
      sortOrder: String(categories.length + 1),
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat)
    setActiveLangTab(locale === 'ar' ? 'ar' : 'en')
    setFormData({
      nameAr: cat.nameAr || cat.name || '',
      nameFr: cat.nameFr || cat.name || '',
      nameEn: cat.nameEn || cat.name || '',
      descriptionAr: cat.descriptionAr || '',
      descriptionFr: cat.descriptionFr || '',
      descriptionEn: cat.descriptionEn || '',
      slug: cat.slug,
      image: cat.image || '',
      sortOrder: String(cat.sortOrder || 0),
      isActive: cat.isActive,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const primaryName =
      formData.nameFr.trim() || formData.nameAr.trim() || formData.nameEn.trim()
    if (!primaryName) {
      error(tr('يرجى إدخال اسم التصنيف بلغة واحدة على الأقل', 'Please enter a category name in at least one language'))
      return
    }

    setSubmitting(true)

    try {
      const parsedSortOrder = Number.parseInt(formData.sortOrder, 10)
      const resolvedSlug =
        formData.slug.trim() ||
        slugify(formData.nameFr || formData.nameEn) ||
        `cat-${Date.now()}`

      const payload = {
        nameAr: formData.nameAr.trim() || primaryName,
        nameFr: formData.nameFr.trim() || primaryName,
        nameEn: formData.nameEn.trim() || primaryName,
        descriptionAr: formData.descriptionAr.trim() || null,
        descriptionFr: formData.descriptionFr.trim() || null,
        descriptionEn: formData.descriptionEn.trim() || null,
        slug: resolvedSlug,
        image: formData.image || null,
        sortOrder: Number.isFinite(parsedSortOrder) ? parsedSortOrder : 0,
        isActive: formData.isActive,
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

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || tr('فشل حفظ التصنيف', 'Failed to save category'))
      }

      success(
        editingCategory
          ? tr('تم تحديث التصنيف بنجاح', 'Category updated successfully')
          : tr('تم إنشاء التصنيف بنجاح', 'Category created successfully')
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
      error(err instanceof Error ? err.message : tr('خطأ أثناء حذف التصنيف', 'Error deleting category'))
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
                'تنظيم أقسام المتجر، ترتيب العرض، والصور المصغرة',
                'Organize store product categories, sort order, and thumbnail images'
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
          filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between gap-5 transition-colors"
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
                      title={tr('تعديل التصنيف', 'Edit Category')}
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

                <div className="flex items-center gap-2.5 mt-4 text-xs flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 font-semibold tabular-nums">
                    {cat.productsCount || 0} {tr('منتج', 'Products')}
                  </span>
                  <span className="inline-flex items-center gap-1 text-zinc-400 tabular-nums font-mono">
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />#{cat.sortOrder}
                  </span>
                </div>
              </div>

              <div className="pt-3.5 border-t border-zinc-800 flex items-center justify-between text-xs">
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
          ))
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div
          dir={dir}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-xl max-h-[90dvh] flex flex-col bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
              <h2 className="text-base sm:text-lg font-black text-white">
                {editingCategory
                  ? tr('تعديل التصنيف', 'Edit Category')
                  : tr('إنشاء تصنيف جديد', 'Create Category')}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label={tr('إغلاق', 'Close')}
                className="w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto admin-scroll p-5 sm:p-6 space-y-5">
                {/* 3-Language Tabs */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-4">
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
                          placeholder="جلابة وعبايات"
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
                          placeholder="Djellaba & Abayas"
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
                          placeholder="Djellabas & Abayas"
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

                {/* Slug & Sort Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      {tr('الرابط المختصر Slug', 'Slug')}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="djellaba-abayas"
                      className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-xs font-mono text-zinc-100 outline-none"
                    />
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
                      className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm font-mono text-zinc-100 outline-none"
                    />
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2">
                    {tr('صورة التصنيف', 'Category Image')}
                  </label>
                  <ImageUploader
                    multiple={false}
                    images={formData.image ? [formData.image] : []}
                    mainImage={formData.image}
                    onChange={(imgs) => setFormData({ ...formData, image: imgs[0] || '' })}
                  />
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
              </div>

              <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-zinc-800 bg-zinc-950/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {tr('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? tr('جاري الحفظ...', 'Saving...')
                    : editingCategory
                      ? tr('حفظ التعديلات', 'Update Category')
                      : tr('إنشاء التصنيف', 'Create Category')}
                </button>
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

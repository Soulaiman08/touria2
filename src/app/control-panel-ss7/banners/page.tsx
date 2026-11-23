'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Link as LinkIcon,
  ArrowUpDown,
  Loader2,
  Globe,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { useAdminI18n } from '@/components/admin/providers/AdminI18nContext'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { ImageUploader } from '@/components/admin/ui/ImageUploader'

type BannerLangTab = 'ar' | 'fr' | 'en'

interface BannerItem {
  id: string
  title: string
  subtitle?: string | null
  buttonText?: string | null
  buttonUrl?: string | null
  imageUrl: string
  sortOrder: number
  isActive: boolean
  titleAr?: string
  titleFr?: string
  titleEn?: string
  subtitleAr?: string | null
  subtitleFr?: string | null
  subtitleEn?: string | null
  buttonTextAr?: string | null
  buttonTextFr?: string | null
  buttonTextEn?: string | null
}

function BannersContent() {
  const { tr, dir, locale } = useAdminI18n()
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BannerItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [langTab, setLangTab] = useState<BannerLangTab>('ar')

  const [formData, setFormData] = useState({
    titleAr: '',
    titleFr: '',
    titleEn: '',
    subtitleAr: '',
    subtitleFr: '',
    subtitleEn: '',
    buttonTextAr: 'تسوقي الآن',
    buttonTextFr: 'Découvrir',
    buttonTextEn: 'Shop Now',
    buttonUrl: '/products',
    imageUrl: '',
    sortOrder: '1',
    isActive: true,
  })

  const [refreshTick, setRefreshTick] = useState(0)
  const { success, error } = useToast()

  useEffect(() => {
    let active = true
    async function loadBanners() {
      try {
        const res = await fetch('/api/admin/banners', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (active && Array.isArray(data.items)) {
          setBanners(data.items)
        }
      } catch (err) {
        console.error('Error fetching banners:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadBanners()
    return () => {
      active = false
    }
  }, [refreshTick])

  const openCreateModal = () => {
    setEditingBanner(null)
    setLangTab(locale === 'en' ? 'en' : 'ar')
    setFormData({
      titleAr: '',
      titleFr: '',
      titleEn: '',
      subtitleAr: '',
      subtitleFr: '',
      subtitleEn: '',
      buttonTextAr: 'تسوقي الآن',
      buttonTextFr: 'Découvrir',
      buttonTextEn: 'Shop Now',
      buttonUrl: '/products',
      imageUrl: '',
      sortOrder: String(banners.length + 1),
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner)
    setLangTab(locale === 'en' ? 'en' : 'ar')
    setFormData({
      titleAr: banner.titleAr || banner.title || '',
      titleFr: banner.titleFr || '',
      titleEn: banner.titleEn || '',
      subtitleAr: banner.subtitleAr ?? banner.subtitle ?? '',
      subtitleFr: banner.subtitleFr || '',
      subtitleEn: banner.subtitleEn || '',
      buttonTextAr: banner.buttonTextAr ?? banner.buttonText ?? '',
      buttonTextFr: banner.buttonTextFr || '',
      buttonTextEn: banner.buttonTextEn || '',
      buttonUrl: banner.buttonUrl || '',
      imageUrl: banner.imageUrl,
      sortOrder: String(banner.sortOrder || 0),
      isActive: banner.isActive,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const primaryTitle =
      formData.titleAr.trim() || formData.titleEn.trim() || formData.titleFr.trim()
    if (!primaryTitle) {
      error(tr('العنوان الرئيسي للبانر مطلوب في لغة واحدة على الأقل', 'Banner title is required in at least one language'))
      return
    }
    if (!formData.imageUrl.trim()) {
      error(tr('صورة البانر مطلوبة', 'Banner image is required'))
      return
    }
    setSubmitting(true)

    try {
      const parsedSortOrder = Number.parseInt(formData.sortOrder, 10)
      const payload = {
        title: primaryTitle,
        subtitle:
          formData.subtitleAr.trim() ||
          formData.subtitleEn.trim() ||
          formData.subtitleFr.trim() ||
          null,
        buttonText:
          formData.buttonTextAr.trim() ||
          formData.buttonTextEn.trim() ||
          formData.buttonTextFr.trim() ||
          null,
        titleAr: formData.titleAr.trim(),
        titleFr: formData.titleFr.trim(),
        titleEn: formData.titleEn.trim(),
        subtitleAr: formData.subtitleAr.trim() || null,
        subtitleFr: formData.subtitleFr.trim() || null,
        subtitleEn: formData.subtitleEn.trim() || null,
        buttonTextAr: formData.buttonTextAr.trim() || null,
        buttonTextFr: formData.buttonTextFr.trim() || null,
        buttonTextEn: formData.buttonTextEn.trim() || null,
        buttonUrl: formData.buttonUrl.trim() || null,
        imageUrl: formData.imageUrl.trim(),
        sortOrder: Number.isFinite(parsedSortOrder) ? parsedSortOrder : 0,
        isActive: formData.isActive,
      }

      const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : '/api/admin/banners'
      const method = editingBanner ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || tr('فشل حفظ البانر', 'Failed to save banner'))
      }

      success(
        editingBanner
          ? tr('تم تحديث البانر بنجاح', 'Banner updated successfully')
          : tr('تم إنشاء البانر بنجاح', 'Banner created successfully')
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
      const res = await fetch(`/api/admin/banners/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || tr('فشل حذف البانر', 'Failed to delete banner'))
      }

      success(tr('تم حذف البانر بنجاح', 'Banner deleted successfully'))
      setDeleteTarget(null)
      setRefreshTick((t) => t + 1)
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : tr('خطأ أثناء حذف البانر', 'Error deleting banner'))
    } finally {
      setSubmitting(false)
    }
  }

  const displayBannerTitle = (ban: BannerItem) =>
    locale === 'en'
      ? ban.titleEn || ban.titleFr || ban.titleAr || ban.title
      : ban.titleAr || ban.titleFr || ban.titleEn || ban.title

  const displayBannerSubtitle = (ban: BannerItem) =>
    locale === 'en'
      ? ban.subtitleEn || ban.subtitleFr || ban.subtitleAr || ban.subtitle
      : ban.subtitleAr || ban.subtitleFr || ban.subtitleEn || ban.subtitle

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-amber-500/12 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {tr('البانرات والشرائح الرئيسية', 'Banners & Hero Slides')}
            </h1>
            <p className="text-xs sm:text-[13px] text-zinc-400 mt-0.5">
              {tr(
                'إدارة صور العروض الترويجية والعناوين متعددة اللغات وأزرار التوجيه',
                'Manage storefront promo banners, multilingual copy, and CTA buttons'
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
          <span>{tr('إضافة بانر جديد', 'Add New Banner')}</span>
        </button>
      </div>

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-14 text-center text-zinc-400">
            <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-amber-400" />
            <p className="text-xs">{tr('جاري تحميل البانرات...', 'Loading banners...')}</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full py-14 px-4 text-center bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
            <p className="text-sm font-semibold text-zinc-300">
              {tr('لا توجد بانرات مضافة حالياً.', 'No active banners found.')}
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="h-9 px-4 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {tr('إضافة أول بانر', 'Add First Banner')}
            </button>
          </div>
        ) : (
          banners.map((ban) => (
            <div
              key={ban.id}
              className="bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl flex flex-col overflow-hidden transition-colors"
            >
              {/* Banner Image Preview */}
              <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                <Image
                  src={ban.imageUrl || '/images/brand/logo-full.png'}
                  alt={displayBannerTitle(ban)}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={92}
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/50 to-transparent p-5 flex flex-col justify-end">
                  <h3 className="text-base font-black text-white leading-snug line-clamp-2">
                    {displayBannerTitle(ban)}
                  </h3>
                  {displayBannerSubtitle(ban) && (
                    <p className="text-xs text-zinc-300 mt-1 line-clamp-2">
                      {displayBannerSubtitle(ban)}
                    </p>
                  )}
                </div>

                <div className="absolute top-3 end-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(ban)}
                    title={tr('تعديل البانر', 'Edit Banner')}
                    aria-label={tr('تعديل البانر', 'Edit Banner')}
                    className="h-9 w-9 rounded-xl bg-zinc-900/85 backdrop-blur-md border border-zinc-700/80 text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(ban)}
                    title={tr('حذف البانر', 'Delete Banner')}
                    aria-label={tr('حذف البانر', 'Delete Banner')}
                    className="h-9 w-9 rounded-xl bg-zinc-900/85 backdrop-blur-md border border-rose-500/35 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details Footer */}
              <div className="p-4 sm:p-5 flex flex-col gap-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <LinkIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate text-zinc-200 font-semibold">
                      {(locale === 'en'
                        ? ban.buttonTextEn || ban.buttonTextFr || ban.buttonTextAr
                        : ban.buttonTextAr || ban.buttonTextFr || ban.buttonTextEn) ||
                        ban.buttonText ||
                        tr('بدون زر', 'No Button')}
                    </span>
                    {ban.buttonUrl && (
                      <span className="font-mono text-[11px] text-zinc-500 truncate max-w-[160px]" dir="ltr">
                        ({ban.buttonUrl})
                      </span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-zinc-300 font-mono shrink-0 tabular-nums">
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />#{ban.sortOrder}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span>{ban.titleAr ? 'AR' : '—'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ban.titleFr ? 'FR' : '—'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ban.titleEn ? 'EN' : '—'}</span>
                  </div>
                  {ban.isActive ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {tr('منشور', 'Published')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                      <XCircle className="w-3.5 h-3.5" />
                      {tr('مخفي', 'Hidden')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Banner Modal */}
      {isModalOpen && (
        <div
          dir={dir}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-xl max-h-[94dvh] sm:max-h-[90dvh] flex flex-col bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
              <h2 className="text-base sm:text-lg font-black text-white">
                {editingBanner
                  ? tr('تعديل البانر', 'Edit Banner')
                  : tr('إنشاء بانر جديد', 'Create Banner')}
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
              <div className="flex-1 overflow-y-auto admin-scroll p-4 sm:p-6 space-y-5">
                {/* Language Switcher for Banner Copy */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      {tr('نصوص البانر حسب اللغة', 'Banner Copy by Language')}
                    </span>

                    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
                      {(
                        [
                          { id: 'ar', label: 'العربية' },
                          { id: 'fr', label: 'Français' },
                          { id: 'en', label: 'English' },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setLangTab(tab.id)}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                            langTab === tab.id
                              ? 'bg-amber-500 text-zinc-950'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {langTab === 'ar' && (
                    <div className="space-y-3.5" dir="rtl">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          {tr('العنوان الرئيسي (بالعربية)', 'Main Title (Arabic)')}
                        </label>
                        <input
                          type="text"
                          value={formData.titleAr}
                          onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                          placeholder="تشكيلة ثريا المغربي الجديدة"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          {tr('العنوان الفرعي (بالعربية)', 'Subtitle (Arabic)')}
                        </label>
                        <input
                          type="text"
                          value={formData.subtitleAr}
                          onChange={(e) => setFormData({ ...formData, subtitleAr: e.target.value })}
                          placeholder="جلابيات مغربية فاخرة مصنوعة يدوياً"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          {tr('نص الزر (بالعربية)', 'Button Text (Arabic)')}
                        </label>
                        <input
                          type="text"
                          value={formData.buttonTextAr}
                          onChange={(e) => setFormData({ ...formData, buttonTextAr: e.target.value })}
                          placeholder="تسوقي الآن"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {langTab === 'fr' && (
                    <div className="space-y-3.5" dir="ltr">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Titre principal (Français)
                        </label>
                        <input
                          type="text"
                          value={formData.titleFr}
                          onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                          placeholder="Nouvelle Collection Thuraya"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Sous-titre (Français)
                        </label>
                        <input
                          type="text"
                          value={formData.subtitleFr}
                          onChange={(e) => setFormData({ ...formData, subtitleFr: e.target.value })}
                          placeholder="Djellabas marocaines de luxe confectionnées à la main"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Texte du bouton (Français)
                        </label>
                        <input
                          type="text"
                          value={formData.buttonTextFr}
                          onChange={(e) => setFormData({ ...formData, buttonTextFr: e.target.value })}
                          placeholder="Découvrir"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {langTab === 'en' && (
                    <div className="space-y-3.5" dir="ltr">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Main Title (English)
                        </label>
                        <input
                          type="text"
                          value={formData.titleEn}
                          onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                          placeholder="New Thuraya Collection"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Subtitle (English)
                        </label>
                        <input
                          type="text"
                          value={formData.subtitleEn}
                          onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                          placeholder="Handcrafted luxury Moroccan djellabas with heritage detail"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                          Button Text (English)
                        </label>
                        <input
                          type="text"
                          value={formData.buttonTextEn}
                          onChange={(e) => setFormData({ ...formData, buttonTextEn: e.target.value })}
                          placeholder="Shop Now"
                          className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm text-zinc-100 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      {tr('رابط التوجيه', 'Button Target URL')}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formData.buttonUrl}
                      onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                      placeholder="/products"
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
                      className="w-full h-11 bg-[#0b0b0e] border border-zinc-700/80 focus:border-amber-500/70 rounded-xl px-3.5 text-sm font-mono text-zinc-100 outline-none tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2">
                    {tr('صورة البانر', 'Banner Image')} *
                  </label>
                  <ImageUploader
                    multiple={false}
                    aspectRatio="video"
                    images={formData.imageUrl ? [formData.imageUrl] : []}
                    mainImage={formData.imageUrl}
                    onChange={(imgs) => setFormData({ ...formData, imageUrl: imgs[0] || '' })}
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-bold text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>{tr('شريحة مفعّلة', 'Active Slide')}</span>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-zinc-800 bg-zinc-950/60 shrink-0">
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
                    : editingBanner
                      ? tr('حفظ التعديلات', 'Update Banner')
                      : tr('إنشاء البانر', 'Create Banner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={tr('حذف البانر', 'Delete Banner')}
        message={tr(
          `هل أنت متأكد من حذف البانر "${deleteTarget?.title || ''}"؟`,
          `Are you sure you want to delete banner "${deleteTarget?.title || ''}"?`
        )}
        confirmText={tr('حذف البانر', 'Delete Banner')}
        variant="danger"
        isLoading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default function AdminBannersPage() {
  return (
    <ToastProvider>
      <AdminLayout>
        <BannersContent />
      </AdminLayout>
    </ToastProvider>
  )
}

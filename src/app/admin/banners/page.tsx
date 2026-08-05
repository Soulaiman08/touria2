'use client'

import React, { useCallback, useEffect, useState } from 'react'
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
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { ThemeProvider } from '@/components/admin/providers/ThemeContext'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { ImageUploader } from '@/components/admin/ui/ImageUploader'

interface BannerItem {
  id: string
  title: string
  subtitle?: string | null
  buttonText?: string | null
  buttonUrl?: string | null
  imageUrl: string
  sortOrder: number
  isActive: boolean
}

function BannersContent() {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BannerItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: 'تسوق الآن',
    buttonUrl: '/products',
    imageUrl: '',
    sortOrder: '1',
    isActive: true,
  })

  const { success, error } = useToast()

  const fetchBanners = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/banners')
      const data = await res.json()
      if (data.items) {
        setBanners(data.items)
      }
    } catch (err) {
      console.error('Error fetching banners:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  const openCreateModal = () => {
    setEditingBanner(null)
    setFormData({
      title: '',
      subtitle: '',
      buttonText: 'تسوق الآن',
      buttonUrl: '/products',
      imageUrl: '',
      sortOrder: String(banners.length + 1),
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      buttonText: banner.buttonText || '',
      buttonUrl: banner.buttonUrl || '',
      imageUrl: banner.imageUrl,
      sortOrder: String(banner.sortOrder || 0),
      isActive: banner.isActive,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        buttonText: formData.buttonText || null,
        buttonUrl: formData.buttonUrl || null,
        imageUrl: formData.imageUrl || '/images/brand/logo-full.png',
        sortOrder: parseInt(formData.sortOrder, 10),
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
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save banner')
      }

      success(editingBanner ? 'Banner updated' : 'Banner created')
      setIsModalOpen(false)
      fetchBanners()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed'
      error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/banners/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete banner')

      success('Banner deleted successfully')
      setDeleteTarget(null)
      fetchBanners()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting banner'
      error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-amber-400" /> Banners & Hero Slides
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Manage storefront hero banners, promo slides, titles, and CTA buttons</p>
        </div>

        <button
          onClick={openCreateModal}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-zinc-500">
            <span className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-500">No active banners found.</div>
        ) : (
          banners.map((ban) => (
            <div
              key={ban.id}
              className="rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-zinc-700 transition-all"
            >
              {/* Banner Image Preview */}
              <div className="relative h-48 bg-zinc-950 overflow-hidden">
                <img
                  src={ban.imageUrl || '/images/brand/logo-full.png'}
                  alt={ban.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent p-4 flex flex-col justify-end">
                  <h3 className="text-lg font-extrabold text-white leading-tight">{ban.title}</h3>
                  {ban.subtitle && <p className="text-xs text-zinc-300 mt-1 line-clamp-1">{ban.subtitle}</p>}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(ban)}
                    className="p-2 rounded-xl bg-zinc-900/80 backdrop-blur-md hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 transition-colors border border-zinc-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(ban)}
                    className="p-2 rounded-xl bg-zinc-900/80 backdrop-blur-md hover:bg-rose-600 text-rose-400 hover:text-white transition-colors border border-zinc-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details Footer */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-amber-400" /> {ban.buttonText || 'No Button'} ({ban.buttonUrl || '/'})
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-zinc-300">
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" /> Sort #{ban.sortOrder}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Status</span>
                  {ban.isActive ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold uppercase text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-400 font-bold uppercase text-[10px]">
                      <XCircle className="w-3.5 h-3.5" /> Hidden
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">
              {editingBanner ? 'Edit Banner' : 'Create Banner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Banner Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="تشكيلة الجلابة المغربية 2026"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="أحدث التصاميم الراقية والمطرزة يدوياً..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="تسوق الآن"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Button URL</label>
                  <input
                    type="text"
                    value={formData.buttonUrl}
                    onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                    placeholder="/products"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Hero Image</label>
                <ImageUploader
                  multiple={false}
                  images={formData.imageUrl ? [formData.imageUrl] : []}
                  mainImage={formData.imageUrl}
                  onChange={(imgs) => setFormData({ ...formData, imageUrl: imgs[0] || '' })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="banActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="banActive" className="text-xs font-semibold text-zinc-300 cursor-pointer">
                  Publish Banner
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400"
                >
                  {submitting ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Banner"
        message={`Are you sure you want to delete banner "${deleteTarget?.title}"?`}
        confirmText="Delete Banner"
        variant="danger"
        isLoading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}

export default function AdminBannersPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminLayout>
          <BannersContent />
        </AdminLayout>
      </ToastProvider>
    </ThemeProvider>
  )
}

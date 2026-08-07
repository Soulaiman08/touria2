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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid rgba(63,63,70,0.6)', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon style={{ width: 22, height: 22 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              Banners & Hero Slides
            </h1>
            <p style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>
              Manage storefront hero banners, promo slides, titles, and CTA buttons
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 12,
            background: 'linear-gradient(90deg, #f59e0b, #d97706)',
            color: '#09090b',
            fontWeight: 900,
            fontSize: 12,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(245,158,11,0.25)',
          }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Grid of Banners */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', color: '#71717a' }}>
            <span style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid #fbbf24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 8 }} />
            <p style={{ fontSize: 12 }}>Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', fontSize: 12, color: '#3f3f46' }}>No active banners found.</div>
        ) : (
          banners.map((ban) => (
            <div
              key={ban.id}
              style={{
                background: 'rgb(24,24,27)',
                border: '1px solid rgba(63,63,70,0.6)',
                borderRadius: 20,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Banner Image Preview */}
              <div style={{ position: 'relative', height: 200, background: 'rgb(9,9,11)', overflow: 'hidden' }}>
                <img
                  src={ban.imageUrl || '/images/brand/logo-full.png'}
                  alt={ban.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,9,11,0.95), rgba(9,9,11,0.3), transparent)', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{ban.title}</h3>
                  {ban.subtitle && <p style={{ fontSize: 12, color: '#d4d4d8', marginTop: 4 }}>{ban.subtitle}</p>}
                </div>

                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => openEditModal(ban)}
                    style={{ padding: 8, borderRadius: 10, background: 'rgba(24,24,27,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(63,63,70,0.8)', color: '#d4d4d8', cursor: 'pointer' }}
                    className="hover:bg-amber-500 hover:text-zinc-950 transition-all"
                  >
                    <Edit2 style={{ width: 14, height: 14 }} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(ban)}
                    style={{ padding: 8, borderRadius: 10, background: 'rgba(24,24,27,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer' }}
                    className="hover:bg-rose-600 hover:text-white transition-all"
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>

              {/* Details Footer */}
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#a1a1aa' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LinkIcon style={{ width: 14, height: 14, color: '#fbbf24' }} /> {ban.buttonText || 'No Button'} ({ban.buttonUrl || '/'})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#d4d4d8' }}>
                    <ArrowUpDown style={{ width: 14, height: 14, color: '#fbbf24' }} /> Sort #{ban.sortOrder}
                  </span>
                </div>

                <div style={{ paddingTop: 12, borderTop: '1px solid rgba(63,63,70,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#71717a' }}>Status</span>
                  {ban.isActive ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#34d399', fontWeight: 800, textTransform: 'uppercase', fontSize: 10 }}>
                      <CheckCircle2 style={{ width: 14, height: 14 }} /> Published
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#f87171', fontWeight: 800, textTransform: 'uppercase', fontSize: 10 }}>
                      <XCircle style={{ width: 14, height: 14 }} /> Hidden
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 540, background: 'rgb(24,24,27)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 24, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.6)', color: '#f4f4f5' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: 24, right: 24, padding: 8, borderRadius: 10, background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}
            >
              <X style={{ width: 20, height: 20 }} />
            </button>

            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 24 }}>
              {editingBanner ? 'Edit Banner' : 'Create Banner'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Banner Main Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="تشكيلة الجلابة المغربية 2026"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="أناقة فاخرة وتطريز مغربي أصيل"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="تسوق الآن"
                    style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Button Target URL</label>
                  <input
                    type="text"
                    value={formData.buttonUrl}
                    onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                    placeholder="/products"
                    style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 8 }}>Banner Image</label>
                <ImageUploader
                  multiple={false}
                  images={formData.imageUrl ? [formData.imageUrl] : []}
                  mainImage={formData.imageUrl}
                  onChange={(imgs) => setFormData({ ...formData, imageUrl: imgs[0] || '' })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="banActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: '#f59e0b' }}
                />
                <label htmlFor="banActive" style={{ fontSize: 12, fontWeight: 700, color: '#d4d4d8', cursor: 'pointer' }}>
                  Active Slide
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingTop: 20, borderTop: '1px solid rgba(63,63,70,0.8)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: 12, background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: '#a1a1aa', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(90deg, #f59e0b, #d97706)', color: '#09090b', fontWeight: 900, fontSize: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(245,158,11,0.2)', opacity: submitting ? 0.6 : 1 }}
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
    </div>
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

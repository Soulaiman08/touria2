'use client'

import React, { useCallback, useEffect, useState } from 'react'
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
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { ThemeProvider } from '@/components/admin/providers/ThemeContext'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { ImageUploader } from '@/components/admin/ui/ImageUploader'

interface CategoryItem {
  id: string
  slug: string
  name: string
  nameAr?: string
  nameFr?: string
  nameEn?: string
  image: string | null
  sortOrder: number
  isActive: boolean
  productsCount?: number
}

function CategoryContent() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    nameAr: '',
    nameFr: '',
    nameEn: '',
    slug: '',
    image: '',
    sortOrder: '0',
    isActive: true,
  })

  const { success, error } = useToast()

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.items) {
        setCategories(data.items)
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({
      nameAr: '',
      nameFr: '',
      nameEn: '',
      slug: '',
      image: '',
      sortOrder: String(categories.length + 1),
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat)
    setFormData({
      nameAr: cat.nameAr || cat.name || '',
      nameFr: cat.nameFr || cat.name || '',
      nameEn: cat.nameEn || cat.name || '',
      slug: cat.slug,
      image: cat.image || '',
      sortOrder: String(cat.sortOrder || 0),
      isActive: cat.isActive,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        nameAr: formData.nameAr || formData.nameFr,
        nameFr: formData.nameFr,
        nameEn: formData.nameEn || formData.nameFr,
        slug: formData.slug,
        image: formData.image || null,
        sortOrder: parseInt(formData.sortOrder, 10),
        isActive: formData.isActive,
      }

      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save category')
      }

      success(editingCategory ? 'Category updated' : 'Category created')
      setIsModalOpen(false)
      fetchCategories()
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
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete category')

      success('Category deleted successfully')
      setDeleteTarget(null)
      fetchCategories()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting category'
      error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredCategories = categories.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', paddingBottom: 16, borderBottom: '1px solid rgba(63,63,70,0.6)', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderTree style={{ width: 22, height: 22 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              Category Management
            </h1>
            <p style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>
              Organize store product categories, sort order, and thumbnail images
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
          <span>Add Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={{
        background: 'rgb(24,24,27)',
        border: '1px solid rgba(63,63,70,0.6)',
        borderRadius: 16,
        padding: '16px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        maxWidth: 400,
      }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 14, top: 12, width: 16, height: 16, color: '#71717a' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            style={{
              width: '100%',
              background: 'rgb(9,9,11)',
              border: '1px solid rgba(63,63,70,0.8)',
              borderRadius: 12,
              padding: '10px 14px 10px 40px',
              fontSize: 12,
              color: '#f4f4f5',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Grid of Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', color: '#71717a' }}>
            <span style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid #fbbf24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 8 }} />
            <p style={{ fontSize: 12 }}>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', fontSize: 12, color: '#3f3f46' }}>
            No categories found.
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div
              key={cat.id}
              style={{
                background: 'rgb(24,24,27)',
                border: '1px solid rgba(63,63,70,0.6)',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#27272a', border: '1px solid rgba(63,63,70,0.8)', overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={cat.image || '/images/brand/logo-full.png'}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => openEditModal(cat)}
                      style={{ padding: 8, borderRadius: 10, background: 'rgba(63,63,70,0.6)', border: 'none', color: '#d4d4d8', cursor: 'pointer' }}
                      className="hover:bg-amber-500 hover:text-zinc-950 transition-all"
                      title="Edit Category"
                    >
                      <Edit2 style={{ width: 15, height: 15 }} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      style={{ padding: 8, borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', cursor: 'pointer' }}
                      className="hover:bg-rose-600 hover:text-white transition-all"
                      title="Delete Category"
                    >
                      <Trash2 style={{ width: 15, height: 15 }} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{cat.name}</h3>
                <p style={{ fontSize: 12, color: '#71717a', fontFamily: 'monospace', marginTop: 2 }}>slug: /{cat.slug}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, fontSize: 12 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(63,63,70,0.4)', color: '#d4d4d8', border: '1px solid rgba(63,63,70,0.6)', fontWeight: 600 }}>
                    {cat.productsCount || 0} Products
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#a1a1aa' }}>
                    <ArrowUpDown style={{ width: 13, height: 13, color: '#fbbf24' }} /> Sort: #{cat.sortOrder}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(63,63,70,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#71717a' }}>Status</span>
                {cat.isActive ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#34d399', fontWeight: 800, textTransform: 'uppercase', fontSize: 10 }}>
                    <CheckCircle2 style={{ width: 14, height: 14 }} /> Active
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#f87171', fontWeight: 800, textTransform: 'uppercase', fontSize: 10 }}>
                    <XCircle style={{ width: 14, height: 14 }} /> Hidden
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 520, background: 'rgb(24,24,27)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 24, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.6)', color: '#f4f4f5' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: 24, right: 24, padding: 8, borderRadius: 10, background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}
            >
              <X style={{ width: 20, height: 20 }} />
            </button>

            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 24 }}>
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Name (French/Primary)</label>
                <input
                  type="text"
                  required
                  value={formData.nameFr}
                  onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                  placeholder="Djellaba & Abayas"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Name (Arabic)</label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="جلابة وعبايات"
                    style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="djellaba-abayas"
                    style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none', fontFamily: 'monospace' }}
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 8 }}>Category Image</label>
                <ImageUploader
                  multiple={false}
                  images={formData.image ? [formData.image] : []}
                  mainImage={formData.image}
                  onChange={(imgs) => setFormData({ ...formData, image: imgs[0] || '' })}
                />
              </div>

              <div style={{ display: 'flex', itemsCenter: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="catActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: '#f59e0b' }}
                />
                <label htmlFor="catActive" style={{ fontSize: 12, fontWeight: 700, color: '#d4d4d8', cursor: 'pointer' }}>
                  Active Category
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
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"?`}
        confirmText="Delete Category"
        variant="danger"
        isLoading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default function AdminCategoriesPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminLayout>
          <CategoryContent />
        </AdminLayout>
      </ToastProvider>
    </ThemeProvider>
  )
}

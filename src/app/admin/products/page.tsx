'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { ThemeProvider } from '@/components/admin/providers/ThemeContext'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { ImageUploader } from '@/components/admin/ui/ImageUploader'
import { formatPrice } from '@/lib/utils'

interface ProductItem {
  id: string
  sku: string
  slug: string
  name: string
  nameAr?: string
  nameFr?: string
  nameEn?: string
  descriptionAr?: string
  descriptionFr?: string
  descriptionEn?: string
  basePrice: number
  salePrice: number | null
  stock: number
  categoryId: string
  category?: { id: string; nameAr?: string; nameFr?: string; slug: string }
  mainImage: string
  images: string[]
  colors: { code: string; nameAr?: string; nameFr?: string; nameEn?: string }[]
  sizes: string[]
  isFeatured: boolean
  isActive: boolean
}

interface CategoryOption {
  id: string
  name: string
}

function ProductContent() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form Fields
  const [formData, setFormData] = useState({
    nameAr: '',
    nameFr: '',
    nameEn: '',
    descriptionFr: '',
    sku: '',
    basePrice: '',
    salePrice: '',
    stock: '20',
    categoryId: '',
    mainImage: '',
    images: [] as string[],
    colors: '#C4622D, #F2E4CE, #000000',
    sizes: 'S, M, L, XL',
    isFeatured: false,
    isActive: true,
  })

  const { success, error } = useToast()

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.items) {
        setCategories(data.items)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      params.set('page', String(page))
      params.set('limit', '8')

      const res = await fetch(`/api/admin/products?${params.toString()}`)
      const data = await res.json()

      if (data.items) {
        setProducts(data.items)
        setTotalPages(data.totalPages || 1)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, page])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData({
      nameAr: '',
      nameFr: '',
      nameEn: '',
      descriptionFr: '',
      sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      basePrice: '',
      salePrice: '',
      stock: '20',
      categoryId: categories[0]?.id || '',
      mainImage: '',
      images: [],
      colors: '#C4622D, #F2E4CE, #000000',
      sizes: 'S, M, L, XL',
      isFeatured: false,
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product)
    setFormData({
      nameAr: product.nameAr || product.name || '',
      nameFr: product.nameFr || product.name || '',
      nameEn: product.nameEn || product.name || '',
      descriptionFr: product.descriptionFr || product.descriptionAr || '',
      sku: product.sku,
      basePrice: String(product.basePrice),
      salePrice: product.salePrice ? String(product.salePrice) : '',
      stock: String(product.stock),
      categoryId: product.categoryId,
      mainImage: product.mainImage,
      images: product.images,
      colors: product.colors.map((c) => c.code).join(', '),
      sizes: product.sizes.join(', '),
      isFeatured: product.isFeatured,
      isActive: product.isActive,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const colorsArr = formData.colors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
        .map((code) => ({ code, nameAr: 'لون', nameFr: 'Couleur', nameEn: 'Color' }))

      const sizesArr = formData.sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const payload = {
        nameAr: formData.nameAr || formData.nameFr,
        nameFr: formData.nameFr,
        nameEn: formData.nameEn || formData.nameFr,
        descriptionFr: formData.descriptionFr,
        sku: formData.sku,
        basePrice: parseFloat(formData.basePrice),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        stock: parseInt(formData.stock, 10),
        categoryId: formData.categoryId,
        mainImage: formData.mainImage || formData.images[0] || '/images/brand/logo-full.png',
        images: formData.images.length > 0 ? formData.images : [formData.mainImage || '/images/brand/logo-full.png'],
        colors: colorsArr,
        sizes: sizesArr,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      }

      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save product')
      }

      success(editingProduct ? 'Product updated successfully' : 'Product created successfully')
      setIsModalOpen(false)
      fetchProducts()
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
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete product')

      success('Product deleted successfully')
      setDeleteTarget(null)
      fetchProducts()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting product'
      error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" /> Product Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Manage catalog, pricing, stock levels, variants, and visibility</p>
        </div>

        <button
          onClick={openCreateModal}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name or SKU..."
            className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Filter className="w-4 h-4 text-amber-400" /> Filter Category:
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setPage(1)
            }}
            className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-4">Product</th>
                <th className="py-4 px-4">SKU</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <span className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading products catalog...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
                          <img src={prod.mainImage || '/images/brand/logo-full.png'} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{prod.name}</div>
                          {prod.isFeatured && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold mt-0.5">
                              <Star className="w-3 h-3 fill-current" /> Featured Item
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-mono">{prod.sku}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px]">
                        {prod.category?.nameFr || prod.category?.nameAr || 'Category'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-amber-400">{formatPrice(prod.salePrice || prod.basePrice, 'fr')}</div>
                      {prod.salePrice && (
                        <div className="text-[11px] text-zinc-500 line-through">{formatPrice(prod.basePrice, 'fr')}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          prod.stock > 10 ? 'text-emerald-400' : prod.stock > 0 ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {prod.stock > 0 ? `${prod.stock} units` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {prod.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase">
                          <XCircle className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-2 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(prod)}
                          className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-600 hover:text-white text-rose-400 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-400">Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-300 disabled:opacity-40 hover:bg-zinc-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-300 disabled:opacity-40 hover:bg-zinc-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Names */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Name (Arabic)</label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="جلابة مغربية"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Name (French/Primary)</label>
                  <input
                    type="text"
                    required
                    value={formData.nameFr}
                    onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                    placeholder="Djellaba Royale"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Royal Djellaba"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Pricing, SKU, Stock, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Base Price (DH)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="599"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Sale Price (DH)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    placeholder="499 (Optional)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.descriptionFr}
                  onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                  placeholder="Detailed product specification and description..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Colors & Sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Colors (Comma separated hex codes)</label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="#C4622D, #F2E4CE, #000000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Sizes (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S, M, L, XL, Standard"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Image Upload Manager */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Product Images (Drag & Drop or Click)</label>
                <ImageUploader
                  images={formData.images}
                  mainImage={formData.mainImage}
                  onChange={(updatedImages, updatedMain) => {
                    setFormData({
                      ...formData,
                      images: updatedImages,
                      mainImage: updatedMain,
                    })
                  }}
                />
              </div>

              {/* Switches */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>Published / Active</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        variant="danger"
        isLoading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}

export default function AdminProductsPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminLayout>
          <ProductContent />
        </AdminLayout>
      </ToastProvider>
    </ThemeProvider>
  )
}

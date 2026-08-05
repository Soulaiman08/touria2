'use client'

import React, { useEffect, useState } from 'react'
import {
  Settings,
  Store,
  Truck,
  PhoneCall,
  Share2,
  Save,
  Globe,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { ThemeProvider } from '@/components/admin/providers/ThemeContext'
import { ImageUploader } from '@/components/admin/ui/ImageUploader'

type TabType = 'general' | 'shipping' | 'contact' | 'social' | 'seo'

function SettingsContent() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('general')

  const [settings, setSettings] = useState({
    storeName: '',
    logo: '',
    currency: 'MAD',
    shippingCost: '35',
    contactEmail: '',
    contactPhone: '',
    address: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    whatsapp: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  })

  const { success, error } = useToast()

  useEffect(() => {
    let isMounted = true
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        const data = await res.json()
        if (isMounted && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }))
        }
      } catch (err) {
        console.error('Error fetching settings:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadSettings()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!res.ok) throw new Error('Failed to save settings')

      success('Store settings saved successfully!')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving settings'
      error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-500">
        <span className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p>Loading store settings...</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" /> Store Settings
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Configure brand identity, shipping rates, contact details, social channels, and SEO metadata</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="self-start sm:self-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 overflow-x-auto pb-2">
        {[
          { id: 'general', label: 'Store Information', icon: Store },
          { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
          { id: 'contact', label: 'Contact Details', icon: PhoneCall },
          { id: 'social', label: 'Social Media', icon: Share2 },
          { id: 'seo', label: 'SEO Metadata', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Form Containers */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-2xl space-y-6">
        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white mb-4">General Brand Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  placeholder="Thuraya Al-Maghribi"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Default Currency Code</label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  placeholder="MAD / DH"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Store Brand Logo</label>
              <ImageUploader
                multiple={false}
                images={settings.logo ? [settings.logo] : []}
                mainImage={settings.logo}
                onChange={(imgs) => setSettings({ ...settings, logo: imgs[0] || '' })}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Shipping */}
        {activeTab === 'shipping' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white mb-4">Shipping Rates & Policies</h2>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Flat Shipping Fee (MAD)</label>
              <input
                type="number"
                value={settings.shippingCost}
                onChange={(e) => setSettings({ ...settings, shippingCost: e.target.value })}
                placeholder="35"
                className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-zinc-500 mt-1">Default nationwide delivery charge added at checkout.</p>
            </div>
          </div>
        )}

        {/* Tab 3: Contact */}
        {activeTab === 'contact' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white mb-4">Official Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Support Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  placeholder="contact@thuraya.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  placeholder="+212 6 12 34 56 78"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Physical Address / Headquarters</label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Casablanca, Morocco"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Social */}
        {activeTab === 'social' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white mb-4">Social Media Connections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Instagram URL</label>
                <input
                  type="text"
                  value={settings.instagram}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  placeholder="https://instagram.com/thuraya.ma"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Facebook Page</label>
                <input
                  type="text"
                  value={settings.facebook}
                  onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                  placeholder="https://facebook.com/thuraya.ma"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">TikTok Handle</label>
                <input
                  type="text"
                  value={settings.tiktok}
                  onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@thuraya.ma"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">WhatsApp Contact Number</label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  placeholder="+212612345678"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white mb-4">Search Engine Optimization (SEO)</h2>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Meta Title</label>
              <input
                type="text"
                value={settings.seoTitle}
                onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                placeholder="الثريا المغربي – أزياء وتصاميم مغربية تقليدية وفاخرة"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Meta Description</label>
              <textarea
                rows={3}
                value={settings.seoDescription}
                onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                placeholder="تصفحي أرقى تشكيلات الجلابة المغربية والنقاب..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Meta Keywords</label>
              <input
                type="text"
                value={settings.seoKeywords}
                onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
                placeholder="جلابة مغربية, نقاب, أزياء مغربية, ثريا المغربي"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}
      </form>
    </>
  )
}

export default function AdminSettingsPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminLayout>
          <SettingsContent />
        </AdminLayout>
      </ToastProvider>
    </ThemeProvider>
  )
}

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
    youtube: '',
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
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#71717a' }}>
        <span style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #fbbf24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p style={{ fontSize: 14, fontWeight: 500 }}>Loading store settings...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid rgba(63,63,70,0.6)', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings style={{ width: 22, height: 22 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              Store Settings
            </h1>
            <p style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>
              Configure brand identity, shipping rates, contact details, social channels, and SEO metadata
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 22px',
            borderRadius: 12,
            background: 'linear-gradient(90deg, #f59e0b, #d97706)',
            color: '#09090b',
            fontWeight: 900,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(245,158,11,0.25)',
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Save style={{ width: 16, height: 16 }} />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(63,63,70,0.6)', overflowX: 'auto', paddingBottom: 12 }}>
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                border: 'none',
                background: isActive ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'rgb(24,24,27)',
                color: isActive ? '#09090b' : '#a1a1aa',
                boxShadow: isActive ? '0 4px 16px rgba(245,158,11,0.2)' : 'none',
              }}
            >
              <Icon style={{ width: 15, height: 15 }} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Form Card */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'rgb(24,24,27)',
          border: '1px solid rgba(63,63,70,0.6)',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>General Brand Settings</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  placeholder="Thuraya Al-Maghribi"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Default Currency Code</label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  placeholder="MAD / DH"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 8 }}>Store Brand Logo</label>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Shipping Rates & Policies</h2>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Flat Shipping Fee (MAD)</label>
              <input
                type="number"
                value={settings.shippingCost}
                onChange={(e) => setSettings({ ...settings, shippingCost: e.target.value })}
                placeholder="35"
                style={{ width: '100%', maxWidth: 360, background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
              />
              <p style={{ fontSize: 11, color: '#71717a', marginTop: 4 }}>Default nationwide delivery charge added at checkout.</p>
            </div>
          </div>
        )}

        {/* Tab 3: Contact */}
        {activeTab === 'contact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Official Contact Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Support Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  placeholder="contact@thuraya.com"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Phone Number</label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  placeholder="+212 6 12 34 56 78"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Physical Address / Headquarters</label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Casablanca, Morocco"
                style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none', resize: 'none' }}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Social */}
        {activeTab === 'social' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Social Media Connections</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Instagram URL</label>
                <input
                  type="text"
                  value={settings.instagram}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  placeholder="https://instagram.com/thuraya.ma"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Facebook Page</label>
                <input
                  type="text"
                  value={settings.facebook}
                  onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                  placeholder="https://facebook.com/thuraya.ma"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>TikTok Handle</label>
                <input
                  type="text"
                  value={settings.tiktok}
                  onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@thuraya.ma"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>YouTube Channel</label>
                <input
                  type="text"
                  value={settings.youtube}
                  onChange={(e) => setSettings({ ...settings, youtube: e.target.value })}
                  placeholder="https://youtube.com/@thuraya.almaghribi"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>WhatsApp Contact Number</label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  placeholder="+212612345678"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: SEO */}
        {activeTab === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Search Engine Optimization (SEO)</h2>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Meta Title</label>
              <input
                type="text"
                value={settings.seoTitle}
                onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                placeholder="الثريا المغربي – أزياء وتصاميم مغربية تقليدية وفاخرة"
                style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Meta Description</label>
              <textarea
                rows={3}
                value={settings.seoDescription}
                onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                placeholder="تصفحي أرقى تشكيلات الجلابة المغربية والنقاب..."
                style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none', resize: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Meta Keywords</label>
              <input
                type="text"
                value={settings.seoKeywords}
                onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
                placeholder="جلابة مغربية, نقاب, أزياء مغربية, ثريا المغربي"
                style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
              />
            </div>
          </div>
        )}
      </form>
    </div>
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

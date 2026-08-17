'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Settings,
  Store,
  Truck,
  PhoneCall,
  Share2,
  Save,
  Globe,
  ChevronDown,
  Trash2,
  Plus,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { ThemeProvider } from '@/components/admin/providers/ThemeContext'
import { ImageUploader } from '@/components/admin/ui/ImageUploader'
import { MOROCCAN_REGIONS } from '@/config/moroccan-regions'
import { MOROCCAN_CITIES, DEFAULT_SHIPPING_PRICE, getCitiesByRegion } from '@/config/moroccan-cities'

// ─── Shared Admin Input Style ──────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgb(9,9,11)',
  border: '1px solid rgba(63,63,70,0.8)',
  borderRadius: 12,
  padding: '10px 14px',
  fontSize: 12,
  color: '#f4f4f5',
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none' as const,
  cursor: 'pointer',
  paddingRight: 36,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#d4d4d8',
  marginBottom: 6,
}

// ─── City shipping row type ────────────────────────────────────────────────
interface CityShippingRow {
  cityValue: string
  cityAr: string
  cityFr: string
  cityEn: string
  regionId: string
  regionAr: string
  regionFr: string
  regionEn: string
  price: number | null        // null = using default
  effectivePrice: number
}

// ─── ShippingTab Component ─────────────────────────────────────────────────
function ShippingTab() {
  const { success, error } = useToast()

  // Default price
  const [defaultPrice, setDefaultPrice] = useState<number>(DEFAULT_SHIPPING_PRICE)
  const [defaultPriceInput, setDefaultPriceInput] = useState<string>(String(DEFAULT_SHIPPING_PRICE))
  const [savingDefault, setSavingDefault] = useState(false)

  // Per-city configurator
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cityPriceInput, setCityPriceInput] = useState('')
  const [savingCity, setSavingCity] = useState(false)

  // Configured cities list
  const [configuredCities, setConfiguredCities] = useState<CityShippingRow[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [deletingCity, setDeletingCity] = useState<string | null>(null)

  const availableCities = selectedRegion ? getCitiesByRegion(selectedRegion) : []

  const loadShipping = useCallback(async () => {
    setLoadingList(true)
    try {
      const res = await fetch('/api/admin/shipping')
      if (res.ok) {
        const data = await res.json() as { defaultPrice: number; cities: CityShippingRow[] }
        setDefaultPrice(data.defaultPrice)
        setDefaultPriceInput(String(data.defaultPrice))
        // Only show cities that have a custom price, deduplicating by cityValue
        const seen = new Set<string>()
        const customList: CityShippingRow[] = []
        for (const c of data.cities) {
          const normKey = c.cityValue.toLowerCase()
          if (c.price !== null && !seen.has(normKey)) {
            seen.add(normKey)
            customList.push(c)
          }
        }
        setConfiguredCities(customList)
      }
    } catch {
      error('Failed to load shipping configuration')
    } finally {
      setLoadingList(false)
    }
  }, [error])

  useEffect(() => {
    loadShipping()
  }, [loadShipping])

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value)
    setSelectedCity('')
    setCityPriceInput('')
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedCity(val)
    // Pre-fill with existing configured price if any, else default
    const existing = configuredCities.find((c) => c.cityValue.toLowerCase() === val.toLowerCase())
    setCityPriceInput(String(existing?.price ?? defaultPrice))
  }

  const handleSaveDefault = async () => {
    const price = Number(defaultPriceInput)
    if (isNaN(price) || price < 0) { error('Invalid price'); return }
    setSavingDefault(true)
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'default', price }),
      })
      if (res.ok) {
        setDefaultPrice(price)
        success('Default shipping price saved!')
        await loadShipping()
      } else {
        error('Failed to save default price')
      }
    } catch {
      error('Failed to save default price')
    } finally {
      setSavingDefault(false)
    }
  }

  const handleSaveCity = async () => {
    if (!selectedCity) { error('Please select a city'); return }
    const price = Number(cityPriceInput)
    if (isNaN(price) || price < 0) { error('Invalid price'); return }
    setSavingCity(true)
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'city', cityValue: selectedCity, price }),
      })
      if (res.ok) {
        success('City shipping price saved!')
        setSelectedRegion('')
        setSelectedCity('')
        setCityPriceInput('')
        await loadShipping()
      } else {
        error('Failed to save city price')
      }
    } catch {
      error('Failed to save city price')
    } finally {
      setSavingCity(false)
    }
  }

  const handleDeleteCity = async (cityValue: string) => {
    setDeletingCity(cityValue)
    try {
      const res = await fetch(`/api/admin/shipping?city=${encodeURIComponent(cityValue)}`, { method: 'DELETE' })
      if (res.ok) {
        success('Custom price removed — city will use default')
        await loadShipping()
      } else {
        error('Failed to remove custom price')
      }
    } catch {
      error('Failed to remove custom price')
    } finally {
      setDeletingCity(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0 }}>Shipping &amp; Delivery Rates</h2>

      {/* ── Default Price ─────────────────────────────────────────────── */}
      <div style={{ background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.6)', borderRadius: 16, padding: '20px 22px' }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Truck style={{ width: 15, height: 15 }} />
          Default Shipping Price
        </h3>
        <p style={{ fontSize: 11, color: '#71717a', marginBottom: 12 }}>
          Applied to all cities without a custom price configured below.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160, maxWidth: 280 }}>
            <label style={labelStyle}>Price (MAD)</label>
            <input
              type="number"
              value={defaultPriceInput}
              onChange={(e) => setDefaultPriceInput(e.target.value)}
              placeholder={String(DEFAULT_SHIPPING_PRICE)}
              min={0}
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 14, fontWeight: 700 }}
            />
          </div>
          <button
            onClick={handleSaveDefault}
            disabled={savingDefault}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(90deg, #f59e0b, #d97706)',
              color: '#09090b', fontWeight: 900, fontSize: 12,
              opacity: savingDefault ? 0.6 : 1,
            }}
          >
            <Save style={{ width: 13, height: 13 }} />
            {savingDefault ? 'Saving...' : 'Save Default'}
          </button>
        </div>
      </div>

      {/* ── Per-City Configurator ─────────────────────────────────────── */}
      <div style={{ background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.6)', borderRadius: 16, padding: '20px 22px' }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus style={{ width: 15, height: 15 }} />
          Set Custom Price for a City
        </h3>
        <p style={{ fontSize: 11, color: '#71717a', marginBottom: 16 }}>
          Select a region, then a city, then set its custom delivery price.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {/* Region */}
          <div>
            <label style={labelStyle}>Region</label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedRegion}
                onChange={handleRegionChange}
                style={selectStyle}
              >
                <option value="">— Select Region —</option>
                {MOROCCAN_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.ar} / {r.en}</option>
                ))}
              </select>
              <ChevronDown style={{ width: 14, height: 14, position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', color: '#71717a', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* City */}
          <div>
            <label style={labelStyle}>City</label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedRegion}
                style={{ ...selectStyle, opacity: !selectedRegion ? 0.4 : 1 }}
              >
                <option value="">— Select City —</option>
                {availableCities.map((c) => (
                  <option key={c.value} value={c.value}>{c.ar} / {c.en}</option>
                ))}
              </select>
              <ChevronDown style={{ width: 14, height: 14, position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', color: '#71717a', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Price */}
          <div>
            <label style={labelStyle}>Shipping Price (MAD)</label>
            <input
              type="number"
              value={cityPriceInput}
              onChange={(e) => setCityPriceInput(e.target.value)}
              placeholder={String(defaultPrice)}
              min={0}
              disabled={!selectedCity}
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 13, fontWeight: 700, opacity: !selectedCity ? 0.4 : 1 }}
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleSaveCity}
            disabled={savingCity || !selectedCity}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: selectedCity ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'rgba(63,63,70,0.5)',
              color: selectedCity ? '#09090b' : '#71717a', fontWeight: 900, fontSize: 12,
              opacity: savingCity ? 0.6 : 1,
            }}
          >
            <Save style={{ width: 13, height: 13 }} />
            {savingCity ? 'Saving...' : 'Save City Price'}
          </button>
        </div>
      </div>

      {/* ── Configured Cities Table ────────────────────────────────────── */}
      <div style={{ background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.6)', borderRadius: 16, padding: '20px 22px' }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24', margin: '0 0 14px' }}>
          Custom City Prices ({configuredCities.length})
        </h3>
        {loadingList ? (
          <p style={{ fontSize: 12, color: '#71717a' }}>Loading...</p>
        ) : configuredCities.length === 0 ? (
          <p style={{ fontSize: 12, color: '#71717a' }}>
            No custom prices set yet — all cities use the default ({defaultPrice} MAD).
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(63,63,70,0.6)' }}>
                    {['Region', 'City', 'Price', ''].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#71717a', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {configuredCities.map((row) => (
                    <tr key={row.cityValue} style={{ borderBottom: '1px solid rgba(63,63,70,0.3)' }}>
                      <td style={{ padding: '10px 12px', color: '#a1a1aa', whiteSpace: 'nowrap' }}>{row.regionAr}<br /><span style={{ fontSize: 10, color: '#71717a' }}>{row.regionEn}</span></td>
                      <td style={{ padding: '10px 12px', color: '#f4f4f5', fontWeight: 700, whiteSpace: 'nowrap' }}>{row.cityAr}<br /><span style={{ fontSize: 10, color: '#71717a', fontWeight: 400 }}>{row.cityEn}</span></td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', color: '#fbbf24', fontWeight: 900, fontFamily: 'monospace' }}>
                          {row.price} MAD
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button
                          onClick={() => handleDeleteCity(row.cityValue)}
                          disabled={deletingCity === row.cityValue}
                          title="Reset to default"
                          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <Trash2 style={{ width: 11, height: 11 }} />
                          {deletingCity === row.cityValue ? '...' : 'Reset'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards (hidden on sm screens and up) */}
            <div className="flex flex-col gap-2.5 sm:!hidden">
              {configuredCities.map((row) => (
                <div key={row.cityValue} style={{ background: 'rgb(24,24,27)', border: '1px solid rgba(63,63,70,0.6)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#f4f4f5', margin: '0 0 2px' }}>{row.cityAr} <span style={{ fontSize: 11, color: '#71717a', fontWeight: 400 }}>({row.cityEn})</span></p>
                    <p style={{ fontSize: 11, color: '#71717a', margin: 0 }}>{row.regionAr}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', color: '#fbbf24', fontWeight: 900, fontFamily: 'monospace', fontSize: 12 }}>{row.price} MAD</span>
                    <button
                      onClick={() => handleDeleteCity(row.cityValue)}
                      disabled={deletingCity === row.cityValue}
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}



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
          <ShippingTab />
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

'use client'

import React, { useEffect, useMemo, useState } from 'react'
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
  Search,
  Info,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { useAdminI18n } from '@/components/admin/providers/AdminI18nContext'
import { ImageUploader } from '@/components/admin/ui/ImageUploader'
import { MOROCCAN_REGIONS } from '@/config/moroccan-regions'
import { DEFAULT_SHIPPING_PRICE, getCitiesByRegion } from '@/config/moroccan-cities'

interface CityShippingRow {
  cityValue: string
  cityAr: string
  cityFr: string
  cityEn: string
  regionId: string
  regionAr: string
  regionFr: string
  regionEn: string
  price: number | null
  effectivePrice: number
}

const inputCls =
  'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-colors'

const selectCls =
  'w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-xl ps-4 pe-10 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed'

const labelCls = 'block text-xs font-bold text-zinc-300 mb-1.5'

function ShippingTab() {
  const { success, error } = useToast()
  const { tr, locale } = useAdminI18n()

  const [defaultPrice, setDefaultPrice] = useState<number>(DEFAULT_SHIPPING_PRICE)
  const [defaultPriceInput, setDefaultPriceInput] = useState<string>(String(DEFAULT_SHIPPING_PRICE))
  const [savingDefault, setSavingDefault] = useState(false)

  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cityPriceInput, setCityPriceInput] = useState('')
  const [savingCity, setSavingCity] = useState(false)

  const [configuredCities, setConfiguredCities] = useState<CityShippingRow[]>([])
  const [cityFilter, setCityFilter] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [deletingCity, setDeletingCity] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)

  const availableCities = selectedRegion ? getCitiesByRegion(selectedRegion) : []

  useEffect(() => {
    let active = true
    async function loadShipping() {
      try {
        const res = await fetch('/api/admin/shipping')
        if (!res.ok) return
        const data = (await res.json()) as { defaultPrice: number; cities: CityShippingRow[] }
        if (!active) return
        setDefaultPrice(data.defaultPrice)
        setDefaultPriceInput(String(data.defaultPrice))
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
      } catch {
        if (active) error(tr('تعذر تحميل إعدادات الشحن', 'Failed to load shipping configuration'))
      } finally {
        if (active) setLoadingList(false)
      }
    }
    loadShipping()
    return () => {
      active = false
    }
  }, [error, refreshTick, tr])

  const filteredConfiguredCities = useMemo(() => {
    const q = cityFilter.trim().toLowerCase()
    if (!q) return configuredCities
    return configuredCities.filter(
      (c) =>
        c.cityAr.toLowerCase().includes(q) ||
        c.cityEn.toLowerCase().includes(q) ||
        c.cityFr.toLowerCase().includes(q) ||
        c.regionAr.toLowerCase().includes(q) ||
        c.regionEn.toLowerCase().includes(q)
    )
  }, [configuredCities, cityFilter])

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value)
    setSelectedCity('')
    setCityPriceInput('')
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedCity(val)
    const existing = configuredCities.find((c) => c.cityValue.toLowerCase() === val.toLowerCase())
    setCityPriceInput(String(existing?.price ?? defaultPrice))
  }

  const handleSaveDefault = async () => {
    const price = Number(defaultPriceInput)
    if (isNaN(price) || price < 0) {
      error(tr('السعر غير صالح', 'Invalid price'))
      return
    }
    setSavingDefault(true)
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'default', price }),
      })
      if (res.ok) {
        setDefaultPrice(price)
        success(tr('تم حفظ سعر الشحن الافتراضي!', 'Default shipping price saved!'))
        setRefreshTick((t) => t + 1)
      } else {
        error(tr('فشل حفظ السعر الافتراضي', 'Failed to save default price'))
      }
    } catch {
      error(tr('فشل حفظ السعر الافتراضي', 'Failed to save default price'))
    } finally {
      setSavingDefault(false)
    }
  }

  const handleSaveCity = async () => {
    if (!selectedCity) {
      error(tr('يرجى اختيار المدينة أولاً', 'Please select a city'))
      return
    }
    const price = Number(cityPriceInput)
    if (isNaN(price) || price < 0) {
      error(tr('السعر غير صالح', 'Invalid price'))
      return
    }
    setSavingCity(true)
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'city', cityValue: selectedCity, price }),
      })
      if (res.ok) {
        success(tr('تم حفظ سعر التوصيل للمدينة!', 'City shipping price saved!'))
        setSelectedRegion('')
        setSelectedCity('')
        setCityPriceInput('')
        setRefreshTick((t) => t + 1)
      } else {
        error(tr('فشل حفظ سعر المدينة', 'Failed to save city price'))
      }
    } catch {
      error(tr('فشل حفظ سعر المدينة', 'Failed to save city price'))
    } finally {
      setSavingCity(false)
    }
  }

  const handleDeleteCity = async (cityValue: string) => {
    setDeletingCity(cityValue)
    try {
      const res = await fetch(`/api/admin/shipping?city=${encodeURIComponent(cityValue)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        success(tr('تمت إعادة السعر إلى الافتراضي', 'Custom price removed — city will use default'))
        setRefreshTick((t) => t + 1)
      } else {
        error(tr('تعذر إزالة السعر المخصص', 'Failed to remove custom price'))
      }
    } catch {
      error(tr('تعذر إزالة السعر المخصص', 'Failed to remove custom price'))
    } finally {
      setDeletingCity(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-black text-white">
          {tr('أسعار الشحن والتوصيل', 'Shipping & Delivery Rates')}
        </h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {tr(
              'يُحفظ كل قسم عبر زر الحفظ الخاص به أدناه',
              'Each section below saves immediately via its own button'
            )}
          </span>
        </span>
      </div>

      {/* Default Price */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>{tr('سعر الشحن الافتراضي', 'Default Shipping Price')}</span>
          </h3>
          <p className="text-xs text-zinc-400">
            {tr(
              'يُطبّق تلقائياً على جميع المدن التي لا تملك سعراً مخصصاً أدناه.',
              'Applied to all cities without a custom price configured below.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:flex-1 sm:min-w-[180px] sm:max-w-xs">
            <label className={labelCls}>{tr('السعر (د.م / MAD)', 'Price (MAD)')}</label>
            <input
              type="number"
              dir="ltr"
              value={defaultPriceInput}
              onChange={(e) => setDefaultPriceInput(e.target.value)}
              placeholder={String(DEFAULT_SHIPPING_PRICE)}
              min={0}
              className={`${inputCls} font-mono font-bold tabular-nums`}
            />
          </div>
          <button
            type="button"
            onClick={handleSaveDefault}
            disabled={savingDefault}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs sm:text-sm transition-all disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savingDefault ? tr('جاري الحفظ...', 'Saving...') : tr('حفظ الافتراضي', 'Save Default')}</span>
          </button>
        </div>
      </div>

      {/* Per-City Configurator */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>{tr('تحديد سعر مخصص لمدينة', 'Set Custom Price for a City')}</span>
          </h3>
          <p className="text-xs text-zinc-400">
            {tr(
              'اختر الجهة ثم المدينة ثم أدخل تعرفة التوصيل المخصصة.',
              'Select a region, then a city, then set its custom delivery price.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Region */}
          <div>
            <label className={labelCls}>{tr('الجهة', 'Region')}</label>
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={handleRegionChange}
                className={selectCls}
              >
                <option value="" className="bg-[#111115] text-zinc-400">
                  {tr('— اختر الجهة —', '— Select Region —')}
                </option>
                {MOROCCAN_REGIONS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#111115] text-zinc-100">
                    {locale === 'ar' ? `${r.ar} (${r.en})` : `${r.en} — ${r.ar}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* City */}
          <div>
            <label className={labelCls}>{tr('المدينة', 'City')}</label>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedRegion}
                className={selectCls}
              >
                <option value="" className="bg-[#111115] text-zinc-400">
                  {tr('— اختر المدينة —', '— Select City —')}
                </option>
                {availableCities.map((c) => (
                  <option key={c.value} value={c.value} className="bg-[#111115] text-zinc-100">
                    {locale === 'ar' ? `${c.ar} (${c.en})` : `${c.en} — ${c.ar}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className={labelCls}>{tr('سعر التوصيل (MAD)', 'Shipping Price (MAD)')}</label>
            <input
              type="number"
              dir="ltr"
              value={cityPriceInput}
              onChange={(e) => setCityPriceInput(e.target.value)}
              placeholder={String(defaultPrice)}
              min={0}
              disabled={!selectedCity}
              className={`${inputCls} font-mono font-bold tabular-nums disabled:opacity-45`}
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleSaveCity}
            disabled={savingCity || !selectedCity}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs sm:text-sm transition-all disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savingCity ? tr('جاري الحفظ...', 'Saving...') : tr('حفظ سعر المدينة', 'Save City Price')}</span>
          </button>
        </div>
      </div>

      {/* Configured Cities Table */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-extrabold text-amber-400">
            {tr(
              `المدن ذات الأسعار المخصصة (${configuredCities.length})`,
              `Custom City Prices (${configuredCities.length})`
            )}
          </h3>
          {configuredCities.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder={tr('تصفية المدن...', 'Filter cities...')}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl ps-9 pe-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/60"
              />
            </div>
          )}
        </div>

        {loadingList ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-zinc-900/70 animate-pulse" />
            ))}
          </div>
        ) : configuredCities.length === 0 ? (
          <p className="text-xs text-zinc-400 py-4">
            {tr(
              `لا توجد أسعار مخصصة حالياً — جميع المدن تستخدم السعر الافتراضي (${defaultPrice} MAD).`,
              `No custom prices set yet — all cities use the default (${defaultPrice} MAD).`
            )}
          </p>
        ) : filteredConfiguredCities.length === 0 ? (
          <p className="text-xs text-zinc-400 py-4">
            {tr('لا توجد مدينة مطابقة للبحث.', 'No cities match your filter.')}
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto admin-scroll">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-bold">
                    <th className="py-2.5 px-3 text-start whitespace-nowrap">{tr('الجهة', 'Region')}</th>
                    <th className="py-2.5 px-3 text-start whitespace-nowrap">{tr('المدينة', 'City')}</th>
                    <th className="py-2.5 px-3 text-start whitespace-nowrap">{tr('السعر', 'Price')}</th>
                    <th className="py-2.5 px-3 text-end whitespace-nowrap">{tr('إجراء', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredConfiguredCities.map((row) => (
                    <tr key={row.cityValue} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 px-3 text-zinc-300">
                        <div className="font-semibold">{locale === 'ar' ? row.regionAr : row.regionEn}</div>
                        <div className="text-[10px] text-zinc-500">
                          {locale === 'ar' ? row.regionEn : row.regionAr}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-white">
                        <div className="font-bold">{locale === 'ar' ? row.cityAr : row.cityEn}</div>
                        <div className="text-[10px] text-zinc-500">
                          {locale === 'ar' ? row.cityEn : row.cityAr}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono font-black leading-none tabular-nums">
                          {row.price} MAD
                        </span>
                      </td>
                      <td className="py-3 px-3 text-end whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteCity(row.cityValue)}
                          disabled={deletingCity === row.cityValue}
                          title={tr('إعادة للسعر الافتراضي', 'Reset to default')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 font-bold text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>
                            {deletingCity === row.cityValue ? '...' : tr('إعادة تعيين', 'Reset')}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-2.5 sm:hidden">
              {filteredConfiguredCities.map((row) => (
                <div
                  key={row.cityValue}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-zinc-100 truncate">
                      {locale === 'ar' ? row.cityAr : row.cityEn}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {locale === 'ar' ? row.regionAr : row.regionEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono font-black text-xs tabular-nums whitespace-nowrap">
                      {row.price} MAD
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCity(row.cityValue)}
                      disabled={deletingCity === row.cityValue}
                      aria-label={tr('إعادة للسعر الافتراضي', 'Reset to default')}
                      className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
  const { tr, dir } = useAdminI18n()
  const { success, error } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
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

  const updateField = (key: keyof typeof settings, value: string) => {
    setDirty(true)
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || tr('فشل حفظ الإعدادات', 'Failed to save settings'))
      }

      setDirty(false)
      success(tr('تم حفظ إعدادات المتجر بنجاح!', 'Store settings saved successfully!'))
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : tr('حدث خطأ أثناء الحفظ', 'Error saving settings')
      error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="h-14 rounded-2xl bg-zinc-900/70 border border-zinc-800 animate-pulse" />
        <div className="h-12 rounded-2xl bg-zinc-900/70 border border-zinc-800 animate-pulse" />
        <div className="h-72 rounded-2xl bg-zinc-900/70 border border-zinc-800 animate-pulse" />
      </div>
    )
  }

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'general', label: tr('معلومات المتجر', 'Store Information'), icon: Store },
    { id: 'shipping', label: tr('الشحن والتوصيل', 'Shipping & Delivery'), icon: Truck },
    { id: 'contact', label: tr('بيانات التواصل', 'Contact Details'), icon: PhoneCall },
    { id: 'social', label: tr('التواصل الاجتماعي', 'Social Media'), icon: Share2 },
    { id: 'seo', label: tr('تحسين محركات البحث (SEO)', 'SEO Metadata'), icon: Globe },
  ]

  return (
    <div dir={dir} className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {tr('إعدادات المتجر', 'Store Settings')}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {tr(
                'إدارة الهوية، أسعار التوصيل، معلومات التواصل، الروابط الاجتماعية وبيانات SEO',
                'Configure brand identity, shipping rates, contact details, social channels, and SEO metadata'
              )}
            </p>
          </div>
        </div>

        {activeTab !== 'shipping' && (
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>
              {saving
                ? tr('جاري الحفظ...', 'Saving...')
                : dirty
                  ? tr('حفظ التغييرات *', 'Save Changes *')
                  : tr('حفظ كل الإعدادات', 'Save All Settings')}
            </span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto admin-scroll pb-2 border-b border-zinc-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Shipping Tab rendered outside general settings form to avoid Enter mismatch */}
      {activeTab === 'shipping' ? (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-7 shadow-xl">
          <ShippingTab />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-7 shadow-xl space-y-6"
        >
          {/* Tab 1: General */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <h2 className="text-base sm:text-lg font-black text-white">
                {tr('الإعدادات العامة للعلامة التجارية', 'General Brand Settings')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>{tr('اسم المتجر', 'Store Name')}</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => updateField('storeName', e.target.value)}
                    placeholder={tr('ثريا المغربي', 'Thuraya Al-Maghribi')}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>{tr('رمز العملة الافتراضي', 'Default Currency Code')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settings.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    placeholder="MAD / DH"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>{tr('شعار المتجر (Logo)', 'Store Brand Logo')}</label>
                <ImageUploader
                  multiple={false}
                  images={settings.logo ? [settings.logo] : []}
                  mainImage={settings.logo}
                  onChange={(imgs) => updateField('logo', imgs[0] || '')}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Contact */}
          {activeTab === 'contact' && (
            <div className="space-y-5">
              <h2 className="text-base sm:text-lg font-black text-white">
                {tr('معلومات الاتصال الرسمية', 'Official Contact Information')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>{tr('البريد الإلكتروني للدعم', 'Support Email')}</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={settings.contactEmail}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    placeholder="contact@thuraya.com"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>{tr('رقم الهاتف', 'Phone Number')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settings.contactPhone}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    placeholder="+212 6 12 34 56 78"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>{tr('العنوان / المقر الرئيسي', 'Physical Address / Headquarters')}</label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder={tr('الدار البيضاء، المغرب', 'Casablanca, Morocco')}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          )}

          {/* Tab 4: Social */}
          {activeTab === 'social' && (
            <div className="space-y-5">
              <h2 className="text-base sm:text-lg font-black text-white">
                {tr('حسابات التواصل الاجتماعي', 'Social Media Connections')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>{tr('رابط إنستغرام (Instagram)', 'Instagram URL')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settings.instagram}
                    onChange={(e) => updateField('instagram', e.target.value)}
                    placeholder="https://instagram.com/thuraya.ma"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>{tr('صفحة فيسبوك (Facebook)', 'Facebook Page')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settings.facebook}
                    onChange={(e) => updateField('facebook', e.target.value)}
                    placeholder="https://facebook.com/thuraya.ma"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>{tr('حساب تيك توك (TikTok)', 'TikTok Handle')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settings.tiktok}
                    onChange={(e) => updateField('tiktok', e.target.value)}
                    placeholder="https://tiktok.com/@thuraya.ma"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>{tr('قناة يوتيوب (YouTube)', 'YouTube Channel')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settings.youtube}
                    onChange={(e) => updateField('youtube', e.target.value)}
                    placeholder="https://youtube.com/@thuraya.almaghribi"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>{tr('رقم واتساب للتواصل', 'WhatsApp Contact Number')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settings.whatsapp}
                    onChange={(e) => updateField('whatsapp', e.target.value)}
                    placeholder="+212612345678"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: SEO */}
          {activeTab === 'seo' && (() => {
            const titleLen = settings.seoTitle.trim().length
            const descLen = settings.seoDescription.trim().length
            const titleOk = titleLen >= 30 && titleLen <= 60
            const descOk = descLen >= 120 && descLen <= 160
            const previewTitle =
              settings.seoTitle.trim() || tr('ثريا المغربي – جلابات ونقابات مغربية أصيلة', 'Thuraya Al-Maghribi – Moroccan Djellabas & Niqabs')
            const previewDesc =
              settings.seoDescription.trim() ||
              tr(
                'متجر ثريا المغربي للجلابيات والنقابات المغربية المصنوعة يدوياً بأجود الأقمشة وتطريز أصيل. تسوقي الآن مع توصيل سريع والدفع عند الاستلام.',
                'Handcrafted Moroccan djellabas and niqabs with cash on delivery across Morocco.'
              )

            return (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {tr('تحسين محركات البحث (SEO)', 'Search Engine Optimization (SEO)')}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      {tr(
                        'ترتبط هذه الحقول مباشرة بعنوان ووصف الصفحة الرئيسية العربية والكلمات المفتاحية',
                        'Directly powers your Arabic/default homepage title, description & keywords'
                      )}
                    </span>
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-bold text-zinc-300">
                      {tr('عنوان الميتا (Meta Title)', 'Meta Title')}
                    </label>
                    <span
                      className={`text-[11px] font-mono tabular-nums ${
                        titleLen === 0
                          ? 'text-zinc-500'
                          : titleOk
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                      }`}
                    >
                      {titleLen}/60 ({tr('المثالي 30–60', 'Ideal 30–60')})
                    </span>
                  </div>
                  <input
                    type="text"
                    value={settings.seoTitle}
                    onChange={(e) => updateField('seoTitle', e.target.value)}
                    placeholder="ثريا المغربي – جلابات ونقابات مغربية أصيلة"
                    className={inputCls}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-bold text-zinc-300">
                      {tr('وصف الميتا (Meta Description)', 'Meta Description')}
                    </label>
                    <span
                      className={`text-[11px] font-mono tabular-nums ${
                        descLen === 0
                          ? 'text-zinc-500'
                          : descOk
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                      }`}
                    >
                      {descLen}/160 ({tr('المثالي 120–160', 'Ideal 120–160')})
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={settings.seoDescription}
                    onChange={(e) => updateField('seoDescription', e.target.value)}
                    placeholder="متجر ثريا المغربي للجلابيات والنقابات المغربية المصنوعة يدوياً بأجود الأقمشة وتطريز أصيل. تسوقي الآن مع توصيل سريع والدفع عند الاستلام."
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div>
                  <label className={labelCls}>{tr('الكلمات المفتاحية (Meta Keywords)', 'Meta Keywords')}</label>
                  <input
                    type="text"
                    value={settings.seoKeywords}
                    onChange={(e) => updateField('seoKeywords', e.target.value)}
                    placeholder="جلابة مغربية, نقاب, أزياء مغربية, ثريا المغربي"
                    className={inputCls}
                  />
                </div>

                {/* Live Search Snippet Preview */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 space-y-1.5">
                  <span className="block text-[11px] font-bold text-zinc-400">
                    {tr('معاينة نتيجة البحث في Google', 'Google Search Snippet Preview')}
                  </span>
                  <div className="text-[11px] text-emerald-400 font-mono truncate" dir="ltr">
                    https://thuraya-almaghribi.vercel.app/ar
                  </div>
                  <div className="text-sm sm:text-base font-bold text-sky-400 truncate">
                    {previewTitle}
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2 m-0">
                    {previewDesc}
                  </p>
                </div>
              </div>
            )
          })()}

          {/* Footer Save CTA inside form for bottom accessibility */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? tr('جاري الحفظ...', 'Saving...')
                  : tr('حفظ الإعدادات', 'Save Settings')}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function AdminSettingsPage() {
  return (
    <ToastProvider>
      <AdminLayout>
        <SettingsContent />
      </AdminLayout>
    </ToastProvider>
  )
}

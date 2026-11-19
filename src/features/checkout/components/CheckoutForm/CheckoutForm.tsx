'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCartStore } from '@/store/cart.store'
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validations/checkout'
import { MOROCCAN_CITIES, DEFAULT_SHIPPING_PRICE, getCitiesByRegion } from '@/config/moroccan-cities'
import { MOROCCAN_REGIONS } from '@/config/moroccan-regions'
import { formatPrice } from '@/lib/utils'
import { computeCartSubtotal, aggregateNiqabs } from '@/lib/cart-math'
import { CustomSelect } from '@/components/shared/CustomSelect'
import { ShieldCheck, MapPin, User, ShoppingBag, Loader2, Truck } from 'lucide-react'

interface CheckoutFormProps {
  locale: string
}

export function CheckoutForm({ locale }: CheckoutFormProps) {
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [shippingPrice, setShippingPrice] = useState<number | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)

  const t = useTranslations('checkout')
  const cartT = useTranslations('cart')
  const router = useRouter()

  const cartStore = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isRTL = locale === 'ar'

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerPhone2: '',
      customerEmail: '',
      region: '',
      city: '',
      district: '',
      address: '',
      postalCode: '',
      notes: '',
    },
  })

  // Calculations – react to the selected city
  const subtotal = computeCartSubtotal(cartStore.items)
  const shippingCost = selectedCity ? (shippingPrice ?? DEFAULT_SHIPPING_PRICE) : 0
  const total = subtotal + shippingCost

  // Cities available for the currently selected region
  const availableCities = selectedRegion ? getCitiesByRegion(selectedRegion) : MOROCCAN_CITIES

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId)
    setSelectedCity('')
    setShippingPrice(null)
    setValue('region', regionId, { shouldValidate: true })
    setValue('city', '', { shouldValidate: false })
  }

  const handleCityChange = async (val: string) => {
    setSelectedCity(val)
    setValue('city', val, { shouldValidate: true })
    if (!val) {
      setShippingPrice(null)
      return
    }
    setShippingLoading(true)
    try {
      const res = await fetch(`/api/shipping/price?city=${encodeURIComponent(val)}`)
      if (res.ok) {
        const data = await res.json() as { price: number }
        setShippingPrice(data.price)
      } else {
        setShippingPrice(DEFAULT_SHIPPING_PRICE)
      }
    } catch {
      setShippingPrice(DEFAULT_SHIPPING_PRICE)
    } finally {
      setShippingLoading(false)
    }
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    if (cartStore.items.length === 0) {
      setErrorMsg(t('errors.cartEmpty'))
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const orderItems = cartStore.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        niqabItems: item.niqabItems?.map((niqab) => ({
          productId: niqab.productId,
          variantId: niqab.variantId,
          quantity: niqab.quantity,
        })),
      }))

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: data,
          items: orderItems,
          locale,
        }),
      })

      const result = await response.json()

      if (result.success && result.order) {
        cartStore.clearCart()
        router.push(`/${locale}/checkout/success?orderId=${result.order.id}`)
      } else {
        setErrorMsg(result.error || t('errors.failed'))
      }
    } catch {
      setErrorMsg(t('errors.failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartStore.items.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-14 px-4 min-h-[340px]"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-9 text-center flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-ring)] flex items-center justify-center mb-5">
            <ShoppingBag className="w-7 h-7 text-[var(--accent)]" aria-hidden="true" />
          </div>

          <h2 className="text-lg font-extrabold text-[var(--text-primary)] mb-2">
            {cartT('empty')}
          </h2>

          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 max-w-xs">
            {cartT('emptyDesc')}
          </p>

          <button
            type="button"
            onClick={() => router.push(`/${locale}/products`)}
            className="btn btn-primary btn-round px-7 py-3 text-sm font-bold"
          >
            {cartT('startShopping')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Form Details Column (7 Cols) ───────────────────────── */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Card 1: Personal Details */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 sm:p-7">
          <div className="flex items-center gap-3.5 pb-4 mb-5 border-b border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg text-[var(--text-primary)] m-0">
              {t('personal.title')}
            </h2>
          </div>

          <div className="flex flex-col gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                {t('personal.name')} <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                {...register('customerName')}
                placeholder={t('personal.namePlaceholder')}
                className="w-full h-11 px-4 rounded-xl border text-sm font-medium transition-colors outline-none bg-[var(--input-bg)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
                style={{
                  borderColor: errors.customerName ? 'var(--error)' : 'var(--border)',
                }}
              />
              {errors.customerName && (
                <p className="text-xs text-[var(--error)] font-medium mt-1.5">{errors.customerName.message}</p>
              )}
            </div>

            {/* Phones Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {t('personal.phone')} <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  {...register('customerPhone')}
                  placeholder={t('personal.phonePlaceholder')}
                  className={`tabular-nums w-full h-11 px-4 rounded-xl border text-sm font-medium transition-colors outline-none bg-[var(--input-bg)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] ${isRTL ? 'text-right' : 'text-left'}`}
                  style={{
                    borderColor: errors.customerPhone ? 'var(--error)' : 'var(--border)',
                  }}
                />
                {errors.customerPhone && (
                  <p className="text-xs text-[var(--error)] font-medium mt-1.5">{errors.customerPhone.message}</p>
                )}
              </div>

              {/* Secondary Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {t('personal.phone2')}
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  {...register('customerPhone2')}
                  placeholder={t('personal.phone2Placeholder')}
                  className={`tabular-nums w-full h-11 px-4 rounded-xl border text-sm font-medium transition-colors outline-none bg-[var(--input-bg)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] ${isRTL ? 'text-right' : 'text-left'}`}
                  style={{
                    borderColor: errors.customerPhone2 ? 'var(--error)' : 'var(--border)',
                  }}
                />
                {errors.customerPhone2 && (
                  <p className="text-xs text-[var(--error)] font-medium mt-1.5">{errors.customerPhone2.message}</p>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                {t('personal.email')}
              </label>
              <input
                type="email"
                dir="ltr"
                {...register('customerEmail')}
                placeholder={t('personal.emailPlaceholder')}
                className={`w-full h-11 px-4 rounded-xl border text-sm font-medium transition-colors outline-none bg-[var(--input-bg)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] ${isRTL ? 'text-right' : 'text-left'}`}
                style={{
                  borderColor: errors.customerEmail ? 'var(--error)' : 'var(--border)',
                }}
              />
              {errors.customerEmail && (
                <p className="text-xs text-[var(--error)] font-medium mt-1.5">{errors.customerEmail.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Shipping Address */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 sm:p-7">
          <div className="flex items-center gap-3.5 pb-4 mb-5 border-b border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg text-[var(--text-primary)] m-0">
              {t('address.title')}
            </h2>
          </div>

          <div className="flex flex-col gap-5">
            {/* Region & City Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Region Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {t('address.region')} <span className="text-[var(--error)]">*</span>
                </label>
                <CustomSelect
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  options={MOROCCAN_REGIONS.map((r) => ({
                    value: r.id,
                    label: locale === 'ar' ? r.ar : locale === 'fr' ? r.fr : r.en,
                    keywords: `${r.ar} ${r.fr} ${r.en}`,
                  }))}
                  placeholder={t('address.regionPlaceholder')}
                  hasError={Boolean(errors.region)}
                  searchable
                  searchPlaceholder={
                    locale === 'ar'
                      ? 'ابحثي عن الجهة...'
                      : locale === 'fr'
                        ? 'Rechercher une région...'
                        : 'Search region...'
                  }
                  noResultsText={
                    locale === 'ar' ? 'لا توجد نتائج' : locale === 'fr' ? 'Aucun résultat' : 'No results'
                  }
                  ariaLabel={t('address.region')}
                  variant="input"
                />
                {errors.region && (
                  <p className="text-xs text-[var(--error)] font-medium mt-1.5">{errors.region.message}</p>
                )}
              </div>

              {/* City Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {t('address.city')} <span className="text-[var(--error)]">*</span>
                </label>
                <CustomSelect
                  value={selectedCity}
                  onChange={handleCityChange}
                  disabled={!selectedRegion}
                  options={availableCities.map((c) => ({
                    value: c.value,
                    label: locale === 'ar' ? c.ar : locale === 'fr' ? c.fr : c.en,
                    keywords: `${c.ar} ${c.fr} ${c.en}`,
                  }))}
                  placeholder={t('address.cityPlaceholder')}
                  hasError={Boolean(errors.city)}
                  searchable
                  searchPlaceholder={
                    locale === 'ar'
                      ? 'ابحثي عن المدينة...'
                      : locale === 'fr'
                        ? 'Rechercher une ville...'
                        : 'Search city...'
                  }
                  noResultsText={
                    locale === 'ar' ? 'لا توجد نتائج' : locale === 'fr' ? 'Aucun résultat' : 'No results'
                  }
                  ariaLabel={t('address.city')}
                  variant="input"
                />
                {errors.city && (
                  <p className="text-xs text-[var(--error)] font-medium mt-1.5">{errors.city.message}</p>
                )}
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                {t('address.district')}
              </label>
              <input
                type="text"
                {...register('district')}
                placeholder={t('address.districtPlaceholder')}
                className="w-full h-11 px-4 rounded-xl border text-sm font-medium transition-colors outline-none bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
              />
            </div>

            {/* Detailed Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                {t('address.address')} <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                {...register('address')}
                placeholder={t('address.addressPlaceholder')}
                className="w-full h-11 px-4 rounded-xl border text-sm font-medium transition-colors outline-none bg-[var(--input-bg)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
                style={{
                  borderColor: errors.address ? 'var(--error)' : 'var(--border)',
                }}
              />
              {errors.address && (
                <p className="text-xs text-[var(--error)] font-medium mt-1.5">{errors.address.message}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                {t('address.postalCode')}
              </label>
              <input
                type="text"
                dir="ltr"
                {...register('postalCode')}
                placeholder={t('address.postalCodePlaceholder')}
                className={`tabular-nums w-full h-11 px-4 rounded-xl border text-sm font-medium transition-colors outline-none bg-[var(--input-bg)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] ${isRTL ? 'text-right' : 'text-left'}`}
                style={{
                  borderColor: errors.postalCode ? 'var(--error)' : 'var(--border)',
                }}
              />
              {errors.postalCode && (
                <p className="text-xs text-[var(--error)] font-medium mt-1.5">{errors.postalCode.message}</p>
              )}
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                {t('address.notes')}
              </label>
              <textarea
                {...register('notes')}
                placeholder={t('address.notesPlaceholder')}
                rows={3}
                className="w-full p-4 rounded-xl border text-sm font-medium transition-colors outline-none bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] resize-none min-h-[104px] leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Order Summary Column (5 Cols - Sticky) ───────────── */}
      <div className="lg:col-span-5 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 sm:p-7">
          <div className="flex items-center gap-3.5 pb-4 mb-5 border-b border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg text-[var(--text-primary)] m-0">
              {t('order.title')}
            </h2>
          </div>

          {/* Cart Item List — djellabas and niqabs shown as independent items */}
          <div className="divide-y divide-[var(--border)] max-h-[380px] overflow-y-auto pe-1 mb-5">
            {cartStore.items.filter((i) => !i.isNiqab).map((item) => {
              const itemName = locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.nameEn
              const colorLabel = locale === 'ar' ? item.colorNameAr : locale === 'fr' ? item.colorNameFr : item.colorNameEn
              return (
                <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0">
                  <Image
                    src={item.mainImage || '/images/brand/logo-icon.png'}
                    alt={itemName}
                    width={56}
                    height={56}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-cover rounded-xl flex-shrink-0 border border-[var(--border)] bg-[var(--bg-muted)]"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).src = '/images/brand/logo-icon.png'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate leading-snug text-[var(--text-primary)]">
                      {itemName}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs mt-1 text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-[var(--border)]"
                          style={{ backgroundColor: item.colorCode ?? 'transparent' }}
                        />
                        {colorLabel && (
                          <span className="font-semibold text-[var(--text-primary)]">{colorLabel}</span>
                        )}
                      </span>
                      {item.size && !['standard', 'one size', 'n/a', 'undefined', 'null'].includes(item.size.toLowerCase().trim()) && (
                        <>
                          <span className="opacity-60">·</span>
                          <span>
                            {cartT('size')}: <span className="font-semibold text-[var(--text-primary)]">{item.size}</span>
                          </span>
                        </>
                      )}
                      <span className="opacity-60">·</span>
                      <span className="tabular-nums">
                        {cartT('quantity')}: <span className="font-semibold text-[var(--text-primary)]">{item.quantity}</span>
                      </span>
                    </div>
                  </div>
                  <span className="tabular-nums font-extrabold text-sm text-[var(--accent)] whitespace-nowrap self-center">
                    {formatPrice(item.unitPrice * item.quantity, locale)}
                  </span>
                </div>
              )
            })}

            {/* Niqab add-ons — aggregated and shown once each */}
            {aggregateNiqabs(cartStore.items).map((n) => {
              const niqabName = locale === 'ar' ? n.nameAr : locale === 'fr' ? n.nameFr : n.nameEn
              const colorLabel = locale === 'ar' ? n.colorNameAr : locale === 'fr' ? n.colorNameFr : n.colorNameEn
              return (
                <div key={`niqab-${n.productId}-${n.variantId ?? ''}`} className="flex items-start gap-3 py-3 first:pt-0">
                  <Image
                    src={n.mainImage || '/images/brand/logo-icon.png'}
                    alt={niqabName}
                    width={56}
                    height={56}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-cover rounded-xl flex-shrink-0 border border-[var(--border)] bg-[var(--bg-muted)]"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).src = '/images/brand/logo-icon.png'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate leading-snug text-[var(--text-primary)]">
                      {niqabName}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs mt-1 text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-[var(--border)]"
                          style={{ backgroundColor: n.colorCode ?? 'transparent' }}
                        />
                        {colorLabel && (
                          <span className="font-semibold text-[var(--text-primary)]">{colorLabel}</span>
                        )}
                      </span>
                      {n.quantity > 1 && (
                        <>
                          <span className="opacity-60">·</span>
                          <span className="tabular-nums">
                            × <span className="font-semibold text-[var(--text-primary)]">{n.quantity}</span>
                          </span>
                          <span className="opacity-60">·</span>
                          <span className="tabular-nums opacity-75 text-[11px]">{formatPrice(n.unitPrice, locale)}/each</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="tabular-nums font-extrabold text-sm text-[var(--accent)] whitespace-nowrap self-center">
                    {formatPrice(n.unitPrice * n.quantity, locale)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* ── Order Pricing Sub-Box ───────────────────────────── */}
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex flex-col gap-3 mb-5">
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-[var(--text-muted)]">
              <span>{cartT('subtotal')}</span>
              <span className="tabular-nums font-bold text-[var(--text-primary)]">
                {formatPrice(subtotal, locale)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                {cartT('shipping')}
              </span>
              <span className="tabular-nums font-bold text-end text-[var(--text-primary)]">
                {shippingLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin inline" />
                ) : selectedCity ? (
                  formatPrice(shippingCost, locale)
                ) : (
                  t('address.cityPlaceholder')
                )}
              </span>
            </div>

            <div className="border-t border-[var(--border)] pt-3 flex justify-between items-center font-bold text-sm sm:text-base text-[var(--text-primary)]">
              <span>{cartT('total')}</span>
              <span className="tabular-nums text-xl sm:text-2xl font-extrabold text-[var(--accent)]">
                {formatPrice(total, locale)}
              </span>
            </div>
          </div>

          {/* ── COD Notice ────────────────────── */}
          <div className="p-4 rounded-xl border border-[var(--accent-ring)] bg-[var(--accent-light)] flex gap-3 items-center mb-5">
            <ShieldCheck className="w-5 h-5 text-[var(--accent)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs sm:text-sm mb-0.5 text-[var(--text-primary)]">
                {t('payment.cod')}
              </h4>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                {t('payment.codDesc')}
              </p>
            </div>
          </div>

          {/* Error Message Banner */}
          {errorMsg && (
            <p className="text-xs text-[var(--error)] text-center font-semibold bg-[var(--error-bg)] border border-[var(--error-border)] py-3 px-4 rounded-xl mb-4">
              {errorMsg}
            </p>
          )}

          {/* Place Order CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 mb-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('order.placing')}</span>
              </>
            ) : (
              <span>{t('order.place')}</span>
            )}
          </button>

          <p className="text-xs text-center leading-relaxed px-2 text-[var(--text-muted)]">
            {t('order.terms')}
          </p>
        </div>
      </div>
    </form>
  )
}

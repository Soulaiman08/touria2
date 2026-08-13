'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCartStore } from '@/store/cart.store'
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validations/checkout'
import { MOROCCAN_CITIES, getShippingCost, getCitiesByRegion } from '@/config/moroccan-cities'
import { MOROCCAN_REGIONS } from '@/config/moroccan-regions'
import { formatPrice } from '@/lib/utils'
import { ShieldCheck, MapPin, User, ChevronDown, ShoppingBag, Loader2, Truck } from 'lucide-react'

interface CheckoutFormProps {
  locale: string
}

export function CheckoutForm({ locale }: CheckoutFormProps) {
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

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
  const subtotal = cartStore.subtotal
  const shippingCost = selectedCity ? getShippingCost(selectedCity) : 0
  const total = subtotal + shippingCost

  // Cities available for the currently selected region
  const availableCities = selectedRegion ? getCitiesByRegion(selectedRegion) : MOROCCAN_CITIES

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value
    setSelectedRegion(regionId)
    // Reset city when region changes
    setSelectedCity('')
    setValue('region', regionId, { shouldValidate: true })
    setValue('city', '', { shouldValidate: false })
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedCity(val)
    setValue('city', val, { shouldValidate: true })
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
        unitPrice: item.unitPrice,
        productSnapshot: {
          nameAr: item.nameAr,
          nameFr: item.nameFr,
          nameEn: item.nameEn,
          mainImage: item.mainImage,
          size: item.size,
          colorCode: item.colorCode,
          colorNameAr: item.colorNameAr,
          colorNameFr: item.colorNameFr,
          colorNameEn: item.colorNameEn,
          sku: item.slug,
        },
      }))

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: data,
          items: orderItems,
          subtotal,
          shippingCost,
          total,
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
      <div className="text-center py-10 my-4 sm:py-20 sm:my-8 max-w-md mx-auto p-5 sm:p-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-[#C4622D]/10 text-[#C4622D] flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-bold text-xl sm:text-2xl mb-3 text-[var(--foreground)]">
          {cartT('empty')}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-6">{cartT('emptyDesc')}</p>
        <button
          onClick={() => router.push(`/${locale}/products`)}
          className="btn btn-primary btn-round px-5 py-2.5 text-sm"
        >
          {cartT('startShopping')}
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-10"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Form Details Column (7 Cols) ───────────────────────── */}
      <div className="lg:col-span-7">
        {/* Card 1: Personal Details */}
        <div
          className="surface-card form-card mb-6 lg:mb-8"
          style={{
            borderColor: 'var(--border)',
          }}
        >
          {/* Card Title Header */}
          <div
            className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b"
            style={{ borderColor: 'var(--border)', marginBottom: '20px' }}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#C4622D]/10 text-[#C4622D] flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg sm:text-xl text-[var(--foreground)]">
              {t('personal.title')}
            </h2>
          </div>

          {/* Form Fields */}
          <div>
            {/* Full Name */}
            <div style={{ marginBottom: '28px' }}>
              <label
                className="block text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--foreground)', marginBottom: '10px', display: 'block' }}
              >
                {t('personal.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('customerName')}
                placeholder={t('personal.namePlaceholder')}
                className="w-full h-12 px-4.5 rounded-xl border text-sm font-medium transition-all outline-none focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15"
                style={{
                  background: 'var(--input)',
                  color: 'var(--foreground)',
                  borderColor: errors.customerName ? '#ef4444' : 'var(--border)',
                }}
              />
              {errors.customerName && (
                <p className="text-xs text-red-500 font-medium mt-2">{errors.customerName.message}</p>
              )}
            </div>

            {/* Phones Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7" style={{ marginBottom: '28px' }}>
              {/* Primary Phone */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--foreground)', marginBottom: '10px', display: 'block' }}
                >
                  {t('personal.phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  {...register('customerPhone')}
                  placeholder={t('personal.phonePlaceholder')}
                  className="w-full h-12 px-4.5 rounded-xl border text-sm font-medium transition-all outline-none focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15 text-start"
                  style={{
                    background: 'var(--input)',
                    color: 'var(--foreground)',
                    borderColor: errors.customerPhone ? '#ef4444' : 'var(--border)',
                  }}
                />
                {errors.customerPhone && (
                  <p className="text-xs text-red-500 font-medium mt-2">{errors.customerPhone.message}</p>
                )}
              </div>

              {/* Secondary Phone */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--foreground)', marginBottom: '10px', display: 'block' }}
                >
                  {t('personal.phone2')}
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  {...register('customerPhone2')}
                  placeholder={t('personal.phone2Placeholder')}
                  className="w-full h-12 px-4.5 rounded-xl border text-sm font-medium transition-all outline-none focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15 text-start"
                  style={{
                    background: 'var(--input)',
                    color: 'var(--foreground)',
                    borderColor: errors.customerPhone2 ? '#ef4444' : 'var(--border)',
                  }}
                />
                {errors.customerPhone2 && (
                  <p className="text-xs text-red-500 font-medium mt-2">{errors.customerPhone2.message}</p>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--foreground)', marginBottom: '10px', display: 'block' }}
              >
                {t('personal.email')}
              </label>
              <input
                type="email"
                dir="ltr"
                {...register('customerEmail')}
                placeholder={t('personal.emailPlaceholder')}
                className="w-full h-12 px-4.5 rounded-xl border text-sm font-medium transition-all outline-none focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15 text-start"
                style={{
                  background: 'var(--input)',
                  color: 'var(--foreground)',
                  borderColor: errors.customerEmail ? '#ef4444' : 'var(--border)',
                }}
              />
              {errors.customerEmail && (
                <p className="text-xs text-red-500 font-medium mt-2">{errors.customerEmail.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Shipping Address */}
        <div
          className="surface-card form-card"
          style={{
            borderColor: 'var(--border)',
          }}
        >
          {/* Card Title Header */}
          <div
            className="flex items-center gap-4 pb-6 border-b"
            style={{ borderColor: 'var(--border)', marginBottom: '32px' }}
          >
            <div className="w-11 h-11 rounded-2xl bg-[#C4622D]/10 text-[#C4622D] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-xl text-[var(--foreground)]">
              {t('address.title')}
            </h2>
          </div>

          {/* Form Fields */}
          <div>
            {/* Region & City Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7" style={{ marginBottom: '28px' }}>
              {/* Region Dropdown */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--foreground)', marginBottom: '10px', display: 'block' }}
                >
                  {t('address.region')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedRegion}
                    onChange={handleRegionChange}
                    className="w-full h-12 px-4.5 pe-11 rounded-xl border text-sm font-medium appearance-none transition-all outline-none focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15 cursor-pointer"
                    style={{
                      background: 'var(--input)',
                      color: 'var(--foreground)',
                      borderColor: errors.region ? '#ef4444' : 'var(--border)',
                    }}
                  >
                    <option value="">{t('address.regionPlaceholder')}</option>
                    {MOROCCAN_REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {locale === 'ar' ? r.ar : locale === 'fr' ? r.fr : r.en}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute inset-y-0 end-4 my-auto pointer-events-none text-[var(--text-muted)] opacity-70" />
                </div>
                {errors.region && (
                  <p className="text-xs text-red-500 font-medium mt-2">{errors.region.message}</p>
                )}
              </div>

              {/* City Dropdown */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--foreground)', marginBottom: '10px', display: 'block' }}
                >
                  {t('address.city')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCity}
                    onChange={handleCityChange}
                    disabled={!selectedRegion}
                    className="w-full h-12 px-4.5 pe-11 rounded-xl border text-sm font-medium appearance-none transition-all outline-none focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'var(--input)',
                      color: 'var(--foreground)',
                      borderColor: errors.city ? '#ef4444' : 'var(--border)',
                    }}
                  >
                    <option value="">{t('address.cityPlaceholder')}</option>
                    {availableCities.map((c) => (
                      <option key={c.value} value={c.value}>
                        {locale === 'ar' ? c.ar : locale === 'fr' ? c.fr : c.en}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute inset-y-0 end-4 my-auto pointer-events-none text-[var(--text-muted)] opacity-70" />
                </div>
                {errors.city && (
                  <p className="text-xs text-red-500 font-medium mt-2">{errors.city.message}</p>
                )}
              </div>
            </div>

            {/* District */}
            <div style={{ marginBottom: '28px' }}>
              <label
                className="block text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--foreground)', marginBottom: '10px', display: 'block' }}
              >
                {t('address.district')}
              </label>
              <input
                type="text"
                {...register('district')}
                placeholder={t('address.districtPlaceholder')}
                className="w-full h-12 px-4.5 rounded-xl border text-sm font-medium transition-all outline-none focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15"
                style={{
                  background: 'var(--input)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)',
                }}
              />
            </div>

            {/* Detailed Address */}
            <div style={{ marginBottom: '28px' }}>
              <label
                className="block text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--foreground)', marginBottom: '10px', display: 'block' }}
              >
                {t('address.address')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('address')}
                placeholder={t('address.addressPlaceholder')}
                className="w-full h-12 px-4.5 rounded-xl border text-sm font-medium transition-all outline-none focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15"
                style={{
                  background: 'var(--input)',
                  color: 'var(--foreground)',
                  borderColor: errors.address ? '#ef4444' : 'var(--border)',
                }}
              />
              {errors.address && (
                <p className="text-xs text-red-500 font-medium mt-2">{errors.address.message}</p>
              )}
            </div>

            {/* Postal Code */}
            <div style={{ marginBottom: '28px' }}>
              <label
                className="block text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--foreground)', marginBottom: '10px', display: 'block' }}
              >
                {t('address.postalCode')}
              </label>
              <input
                type="text"
                dir="ltr"
                {...register('postalCode')}
                placeholder={t('address.postalCodePlaceholder')}
                className="w-full h-12 px-4.5 rounded-xl border text-sm font-medium transition-all outline-none focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15 text-start"
                style={{
                  background: 'var(--input)',
                  color: 'var(--foreground)',
                  borderColor: errors.postalCode ? '#ef4444' : 'var(--border)',
                }}
              />
              {errors.postalCode && (
                <p className="text-xs text-red-500 font-medium mt-2">{errors.postalCode.message}</p>
              )}
            </div>

            {/* Delivery Notes */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--foreground)', marginBottom: '10px', display: 'block' }}
              >
                {t('address.notes')}
              </label>
              <textarea
                {...register('notes')}
                placeholder={t('address.notesPlaceholder')}
                rows={3}
                className="w-full p-4.5 rounded-xl border text-sm font-medium transition-all outline-none focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15 resize-none min-h-[115px] leading-relaxed"
                style={{
                  background: 'var(--input)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Order Summary Column (5 Cols - Sticky) ───────────── */}
      <div className="lg:col-span-5 lg:sticky lg:top-24">
        <div
          className="surface-card form-card"
          style={{
            borderColor: 'var(--border)',
          }}
        >
          {/* Card Title Header */}
          <div
            className="flex items-center gap-4 pb-6 border-b"
            style={{ borderColor: 'var(--border)', marginBottom: '32px' }}
          >
            <div className="w-11 h-11 rounded-2xl bg-[#C4622D]/10 text-[#C4622D] flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-xl text-[var(--foreground)]">
              {t('order.title')}
            </h2>
          </div>

          {/* Cart Item List */}
          <div
            className="divide-y max-h-[380px] overflow-y-auto pe-1"
            style={{ borderColor: 'var(--border)', marginBottom: '32px' }}
          >
            {cartStore.items.map((item) => {
              const niqabTotal =
                item.niqabItems?.reduce(
                  (sum, n) =>
                    sum + n.unitPrice * n.quantity,
                  0,
                ) || 0
              const lineTotal =
                item.unitPrice * item.quantity + niqabTotal

              return (
                <div key={item.id} className="py-4 flex items-center gap-4 text-xs first:pt-0 last:pb-0">
                  <Image
                    src={item.mainImage}
                    alt={item.nameAr}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-2xl flex-shrink-0 border"
                    style={{ borderColor: 'var(--border)' }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate mb-1" style={{ color: 'var(--foreground)' }}>
                      {locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.nameEn}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {cartT('size')}: <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{item.size}</span> | {cartT('quantity')}: <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{item.quantity}</span>
                    </p>
                    {item.niqabItems && item.niqabItems.length > 0 && (
                      <div className="mt-1 text-[11px] text-[#b8965a]">
                        {item.niqabItems.map((n, i) => {
                          const cName = locale === 'ar' ? n.colorNameAr : locale === 'fr' ? n.colorNameFr : n.colorNameEn
                          return <div key={i}>+ {cName} × {n.quantity} ({formatPrice(n.unitPrice * n.quantity, locale)})</div>
                        })}
                      </div>
                    )}
                  </div>

                  <span className="font-extrabold text-sm text-[#C4622D] whitespace-nowrap">
                    {formatPrice(lineTotal, locale)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* ── Order Pricing Sub-Box (Spacious Sub-Box) ───────────── */}
          <div
            className="p-5.5 rounded-2xl flex flex-col gap-3.5"
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              marginBottom: '32px',
            }}
          >
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
              <span>{cartT('subtotal')}</span>
              <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                {formatPrice(subtotal, locale)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#C4622D] flex-shrink-0" />
                {cartT('shipping')}
              </span>
              <span className="font-bold text-end" style={{ color: 'var(--foreground)' }}>
                {selectedCity ? formatPrice(shippingCost, locale) : t('address.cityPlaceholder')}
              </span>
            </div>

            <div
              className="border-t pt-3.5 flex justify-between items-center font-bold text-sm sm:text-base mt-0.5"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <span>{cartT('total')}</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#C4622D]">
                {formatPrice(total, locale)}
              </span>
            </div>
          </div>

          {/* ── COD Sub-Box (Spacious Sub-Box) ────────────────────── */}
          <div
            className="p-5 rounded-2xl border flex gap-3.5 items-center"
            style={{
              borderColor: 'rgba(184,150,90,0.3)',
              background: 'rgba(184,150,90,0.06)',
              marginBottom: '32px',
            }}
          >
            <ShieldCheck className="w-6 h-6 text-[#C4622D] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs sm:text-sm mb-0.5" style={{ color: 'var(--foreground)' }}>
                {t('payment.cod')}
              </h4>
              <p className="text-xs leading-relaxed opacity-90" style={{ color: 'var(--muted-foreground)' }}>
                {t('payment.codDesc')}
              </p>
            </div>
          </div>

          {/* Error Message Banner */}
          {errorMsg && (
            <p className="text-xs text-red-500 text-center font-semibold bg-red-500/10 border border-red-500/20 py-3.5 px-4 rounded-xl mb-6">
              {errorMsg}
            </p>
          )}

          {/* Place Order CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary py-4.5 rounded-2xl font-bold text-base shadow-lg shadow-[#C4622D]/20 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mb-4"
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

          <p className="text-xs text-center leading-relaxed px-2" style={{ color: 'var(--muted-foreground)' }}>
            {t('order.terms')}
          </p>
        </div>
      </div>
    </form>
  )
}

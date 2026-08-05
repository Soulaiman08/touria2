'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCartStore } from '@/store/cart.store'
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validations/checkout'
import { MOROCCAN_CITIES, getShippingCost } from '@/config/moroccan-cities'
import { formatPrice } from '@/lib/utils'
import { ShieldCheck, MapPin, User } from 'lucide-react'

interface CheckoutFormProps {
  locale: string
}

export function CheckoutForm({ locale }: CheckoutFormProps) {
  const t = useTranslations('checkout')
  const cartT = useTranslations('cart')
  const router = useRouter()

  const cartStore = useCartStore()
  const [selectedCityVal, setSelectedCityVal] = useState<string>('')
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
      city: '',
      district: '',
      address: '',
      postalCode: '',
      notes: '',
    },
  })

  // Calculations
  const subtotal = cartStore.subtotal
  const shippingCost = selectedCityVal ? getShippingCost(selectedCityVal) : 0
  const total = subtotal + shippingCost

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedCityVal(val)
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
          sku: item.slug, // fallback to slug as sku snapshot
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
      <div className="text-center py-16 space-y-4">
        <div className="text-4xl">🛒</div>
        <h2 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
          {cartT('empty')}
        </h2>
        <p style={{ color: 'var(--muted-foreground)' }}>{cartT('emptyDesc')}</p>
        <button
          onClick={() => router.push(`/${locale}/products`)}
          className="btn btn-primary btn-round"
        >
          {cartT('startShopping')}
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Form Details Column ───────────────────────────────── */}
      <div className="lg:col-span-7 space-y-6">
        {/* Personal Details */}
        <div className="p-6 rounded-2xl border space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <h2 className="font-bold text-lg flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <User className="w-5 h-5 text-[#C4622D]" />
            {t('personal.title')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--foreground)' }}>
                {t('personal.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('customerName')}
                placeholder={t('personal.namePlaceholder')}
                className="w-full h-11 px-3.5 rounded-xl border text-sm focus:border-[#C4622D] focus:ring-1 focus:ring-[#C4622D] outline-none"
                style={{ background: 'var(--input)', borderColor: errors.customerName ? 'red' : 'var(--border)', color: 'var(--foreground)' }}
              />
              {errors.customerName && (
                <p className="text-xs text-red-500">{errors.customerName.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--foreground)' }}>
                {t('personal.phone')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  {...register('customerPhone')}
                  placeholder={t('personal.phonePlaceholder')}
                  className="w-full h-11 px-3.5 rounded-xl border text-sm outline-none"
                  style={{ background: 'var(--input)', borderColor: errors.customerPhone ? 'red' : 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              {errors.customerPhone && (
                <p className="text-xs text-red-500">{errors.customerPhone.message}</p>
              )}
            </div>

            {/* Secondary Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--foreground)' }}>
                {t('personal.phone2')}
              </label>
              <input
                type="tel"
                {...register('customerPhone2')}
                placeholder={t('personal.phone2Placeholder')}
                className="w-full h-11 px-3.5 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--input)', borderColor: errors.customerPhone2 ? 'red' : 'var(--border)', color: 'var(--foreground)' }}
              />
              {errors.customerPhone2 && (
                <p className="text-xs text-red-500">{errors.customerPhone2.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--foreground)' }}>
                {t('personal.email')}
              </label>
              <input
                type="email"
                {...register('customerEmail')}
                placeholder={t('personal.emailPlaceholder')}
                className="w-full h-11 px-3.5 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--input)', borderColor: errors.customerEmail ? 'red' : 'var(--border)', color: 'var(--foreground)' }}
              />
              {errors.customerEmail && (
                <p className="text-xs text-red-500">{errors.customerEmail.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="p-6 rounded-2xl border space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <h2 className="font-bold text-lg flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <MapPin className="w-5 h-5 text-[#C4622D]" />
            {t('address.title')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--foreground)' }}>
                {t('address.city')} <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCityVal}
                onChange={handleCityChange}
                className="w-full h-11 px-3.5 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--input)', borderColor: errors.city ? 'red' : 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="">{t('address.cityPlaceholder')}</option>
                {MOROCCAN_CITIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {locale === 'ar' ? c.ar : locale === 'fr' ? c.fr : c.en}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city.message}</p>
              )}
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--foreground)' }}>
                {t('address.district')}
              </label>
              <input
                type="text"
                {...register('district')}
                placeholder={t('address.districtPlaceholder')}
                className="w-full h-11 px-3.5 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            {/* Detailed Address */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--foreground)' }}>
                {t('address.address')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('address')}
                placeholder={t('address.addressPlaceholder')}
                className="w-full h-11 px-3.5 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--input)', borderColor: errors.address ? 'red' : 'var(--border)', color: 'var(--foreground)' }}
              />
              {errors.address && (
                <p className="text-xs text-red-500">{errors.address.message}</p>
              )}
            </div>

            {/* Postal Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--foreground)' }}>
                {t('address.postalCode')}
              </label>
              <input
                type="text"
                {...register('postalCode')}
                placeholder={t('address.postalCodePlaceholder')}
                className="w-full h-11 px-3.5 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--input)', borderColor: errors.postalCode ? 'red' : 'var(--border)', color: 'var(--foreground)' }}
              />
              {errors.postalCode && (
                <p className="text-xs text-red-500">{errors.postalCode.message}</p>
              )}
            </div>

            {/* Delivery Notes */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--foreground)' }}>
                {t('address.notes')}
              </label>
              <textarea
                {...register('notes')}
                placeholder={t('address.notesPlaceholder')}
                rows={3}
                className="w-full p-3.5 rounded-xl border text-sm outline-none resize-none"
                style={{ background: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Order Summary & Place Column ──────────────────────── */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 rounded-2xl border space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <h2 className="font-bold text-lg border-b pb-3" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            {t('order.title')}
          </h2>

          {/* Cart Item Snapshot */}
          <div className="divide-y max-h-60 overflow-y-auto pr-2" style={{ borderColor: 'var(--border)' }}>
            {cartStore.items.map((item) => (
              <div key={item.id} className="py-3 flex gap-3 text-xs">
                <div className="relative w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                  <Image src={item.mainImage} alt={item.nameAr} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                    {locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.nameEn}
                  </p>
                  <p className="mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {cartT('size')}: {item.size} | {cartT('quantity')}: {item.quantity}
                  </p>
                </div>
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                  {formatPrice(
                    (item.unitPrice + (item.niqabItem?.unitPrice ?? 0)) * item.quantity,
                    locale,
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Order pricing totals */}
          <div className="space-y-2 border-t pt-4 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            <div className="flex justify-between">
              <span>{cartT('subtotal')}</span>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {formatPrice(subtotal, locale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{cartT('shipping')}</span>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {selectedCityVal ? formatPrice(shippingCost, locale) : t('address.cityPlaceholder')}
              </span>
            </div>
          </div>

          <div className="border-t pt-3 flex justify-between font-bold text-base" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <span>{cartT('total')}</span>
            <span className="text-xl text-[#C4622D]">{formatPrice(total, locale)}</span>
          </div>

          {/* Payment Method COD */}
          <div className="p-4 rounded-xl border flex gap-3" style={{ borderColor: '#b8965a', background: 'rgba(184,150,90,0.05)' }}>
            <ShieldCheck className="w-6 h-6 text-[#C4622D] flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{t('payment.cod')}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{t('payment.codDesc')}</p>
            </div>
          </div>

          {/* Submit Button */}
          {errorMsg && (
            <p className="text-xs text-red-500 text-center font-medium bg-red-50 dark:bg-red-950/20 py-2.5 rounded-lg border border-red-200">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary btn-round py-3.5"
          >
            {isSubmitting ? t('order.placing') : t('order.place')}
          </button>

          <p className="text-[10px] text-center" style={{ color: 'var(--muted-foreground)' }}>
            {t('order.terms')}
          </p>
        </div>
      </div>
    </form>
  )
}

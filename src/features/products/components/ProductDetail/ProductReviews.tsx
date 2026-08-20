'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Loader2,
  Star,
  MessageSquarePlus,
  UserRound,
  CheckCircle2,
  LogIn,
} from 'lucide-react'

interface ProductReviewsProps {
  productId: string
  locale: string
}

interface ReviewItem {
  id: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
  customer: { id: string; name: string; avatarUrl: string | null }
}

const RATING_LABELS: Record<number, [string, string, string]> = {
  1: ['سيئ جداً', 'Très mauvais', 'Very poor'],
  2: ['سيئ', 'Mauvais', 'Poor'],
  3: ['مقبول', 'Moyen', 'Average'],
  4: ['جيد', 'Bien', 'Good'],
  5: ['ممتاز', 'Excellent', 'Excellent'],
}

function StarRow({
  value,
  onChange,
  size = 18,
  hoverValue,
  onHover,
  onLeave,
}: {
  value: number
  onChange?: (v: number) => void
  size?: number
  hoverValue?: number
  onHover?: (v: number) => void
  onLeave?: () => void
}) {
  const displayValue = hoverValue && hoverValue > 0 ? hoverValue : value

  return (
    <div className="flex items-center gap-1.5" dir="ltr" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map((n) => {
        const isFilled = n <= displayValue
        return (
          <button
            key={n}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => onHover?.(n)}
            className={`transition-transform duration-150 ${
              onChange ? 'cursor-pointer hover:scale-125' : 'cursor-default'
            }`}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            <Star
              style={{ width: size, height: size }}
              className={`transition-colors duration-150 ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-stone-300 dark:text-stone-600'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

export function ProductReviews({ productId, locale }: ProductReviewsProps) {
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [average, setAverage] = useState<number | null>(null)
  const [count, setCount] = useState(0)

  const [authState, setAuthState] = useState<'loading' | 'guest' | 'user'>('loading')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const isRTL = locale === 'ar'

  const t = (key: string): string => {
    const map: Record<string, [string, string, string]> = {
      badge: ['تقييمات وآراء العملاء', 'Avis des clients', 'Customer Reviews'],
      title: ['تجارب زبنائنا الكرام', 'Expériences de nos clients', 'Customer Experiences'],
      noReviews: ['لا توجد تقييمات بعد — كن أول من يشارك تجربته مع هذا المنتج.', 'Aucun avis pour le moment — Soyez le premier à évaluer ce produit.', 'No reviews yet — Be the first to review this product.'],
      summaryReviews: ['بناءً على {count} تقييم موثق', 'basé sur {count} avis vérifiés', 'based on {count} verified reviews'],
      signInPrompt: ['سجّل الدخول بحسابك لتتمكن من إضافة تقييمك', 'Connectez-vous pour laisser votre avis', 'Sign in to your account to leave a review'],
      signInBtn: ['تسجيل الدخول', 'Se connecter', 'Sign in'],
      addReviewBtn: ['إضافة تقييم جديد', 'Ajouter un avis', 'Write a review'],
      cancelBtn: ['إلغاء', 'Annuler', 'Cancel'],
      yourRating: ['تقييمك للمنتج', 'Votre note', 'Your rating'],
      yourComment: ['رأيك وتجربتك بالتفصيل', 'Votre commentaire', 'Your comment'],
      commentPlaceholder: ['شاركينا رأيك حول جودة القماش، الخياطة والمقاس...', 'Partagez votre expérience avec ce produit...', 'Share your experience with quality, fabric, and fit...'],
      submit: ['نشر التقييم', 'Publier l\'avis', 'Submit Review'],
      thanksTitle: ['شكراً جزيلاً لتقييمك!', 'Merci pour votre avis !', 'Thank you for your review!'],
      thanksDesc: ['تقييمك يساعدنا ويفيد الزبناء الآخرين.', 'Votre avis aide les autres clients.', 'Your review helps other customers make great choices.'],
      update: ['تعديل التقييم', 'Modifier', 'Edit'],
      verifiedBuyer: ['مشتري موثق', 'Acheteur vérifié', 'Verified Buyer'],
      loading: ['جاري التحميل...', 'Chargement...', 'Loading...'],
      failed: ['تعذر إرسال التقييم', 'Échec de l\'envoi', 'Failed to submit review'],
    }
    const entry = map[key]
    if (!entry) return key
    return locale === 'ar' ? entry[0] : locale === 'fr' ? entry[1] : entry[2]
  }

  const loadReviews = () => {
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((data) => {
        setReviews(data.reviews)
        setAverage(data.averageRating)
        setCount(data.count)
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  useEffect(() => {
    let isMounted = true
    fetch('/api/customer/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('guest'))))
      .then((data) => {
        if (isMounted) {
          setAuthState('user')
          const mine = reviews.find((r) => r.customer.id === data.user.id)
          if (mine) {
            setRating(mine.rating)
            setComment(mine.comment)
            setSubmitted(true)
          }
        }
      })
      .catch(() => { if (isMounted) setAuthState('guest') })
    return () => { isMounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating < 1) return
    setSubmitting(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      setSubmitted(true)
      setShowForm(false)
      loadReviews()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error && err.message !== 'failed' ? err.message : t('failed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div
        className="mt-12 rounded-3xl border p-8 text-center"
        style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Loader2 className="animate-spin mx-auto" style={{ width: 24, height: 24, color: '#C4622D' }} />
        <p className="mt-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{t('loading')}</p>
      </div>
    )
  }

  const activeRatingDisplay = hoverRating > 0 ? hoverRating : rating

  return (
    <section className="mt-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Main Hero Card (Identical to FAQ Page Hero Card) ───────── */}
      <div
        style={{
          borderRadius: 24,
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          marginBottom: reviews.length > 0 ? 20 : 0,
        }}
      >
        {/* Top Header Section with Gradient & Centered Icon */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(196,98,45,0.06) 0%, rgba(184,150,90,0.04) 100%)',
            padding: '32px 24px 28px',
            textAlign: 'center',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Circular Star Icon */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              border: '1px solid var(--accent-ring)',
            }}
          >
            <Star style={{ width: 28, height: 28, color: 'var(--accent)', fill: 'var(--accent)' }} />
          </div>

          {/* Badge Pill */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2.5"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-ring)',
            }}
          >
            <span>✦</span>
            <span>{t('badge')}</span>
            <span>✦</span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 1.85rem)',
              fontWeight: 900,
              color: 'var(--foreground)',
              margin: '0 0 8px',
              fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
            }}
          >
            {t('title')}
          </h2>

          {/* Subtitle / Description / Rating Summary */}
          {count === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0, maxWidth: 500, marginInline: 'auto' }}>
              {t('noReviews')}
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 mt-2">
              <div className="flex items-center gap-2">
                <StarRow value={Math.round(average ?? 5)} size={18} />
                <span className="text-base font-black" style={{ color: 'var(--foreground)' }}>
                  {average !== null ? average.toFixed(1) : '5.0'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted-foreground)', margin: 0 }}>
                {t('summaryReviews').replace('{count}', count.toString())}
              </p>
            </div>
          )}
        </div>

        {/* ── Sub-area: Action Bar or Form (Same as FAQ Category Filter Bar) ── */}
        {authState === 'loading' ? null : authState === 'guest' ? (
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 12,
              background: 'var(--bg-subtle)',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)' }}>
              {t('signInPrompt')}
            </span>
            <Link
              href={`/${locale}/login`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                background: '#C4622D',
                color: '#fff',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(196,98,45,0.25)',
                transition: 'all 0.2s',
              }}
            >
              <LogIn style={{ width: 14, height: 14 }} />
              <span>{t('signInBtn')}</span>
            </Link>
          </div>
        ) : submitted && !showForm ? (
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 12,
              background: 'var(--bg-subtle)',
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs sm:text-sm font-bold text-green-700 dark:text-green-400">
                {t('thanksTitle')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="text-xs font-bold underline cursor-pointer"
              style={{ color: '#C4622D' }}
            >
              {t('update')}
            </button>
          </div>
        ) : !showForm && count > 0 ? (
          <div
            style={{
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => setShowForm(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                background: '#C4622D',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(196,98,45,0.25)',
              }}
            >
              <MessageSquarePlus style={{ width: 14, height: 14 }} />
              <span>{t('addReviewBtn')}</span>
            </button>
          </div>
        ) : (
          /* Inline Form Area */
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '20px 24px',
              background: 'var(--bg-subtle)',
              borderTop: '1px solid var(--border)',
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-xs font-bold" style={{ color: 'var(--foreground)' }}>
                {t('yourRating')}
              </label>
              <div className="flex items-center gap-3">
                <StarRow
                  value={rating}
                  hoverValue={hoverRating}
                  onChange={setRating}
                  onHover={setHoverRating}
                  onLeave={() => setHoverRating(0)}
                  size={24}
                />
                {activeRatingDisplay > 0 && (
                  <span
                    className="rounded-full px-3 py-0.5 text-xs font-bold"
                    style={{
                      background: 'var(--accent-light)',
                      color: '#C4622D',
                      border: '1px solid var(--accent-ring)',
                    }}
                  >
                    {RATING_LABELS[activeRatingDisplay][locale === 'ar' ? 0 : locale === 'fr' ? 1 : 2]}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: 'var(--foreground)' }}>
                {t('yourComment')}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder={t('commentPlaceholder')}
                className="w-full rounded-xl border p-3 text-sm outline-none transition-all focus:border-[#C4622D]"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            {errorMsg && <p className="text-xs font-bold text-red-500">{errorMsg}</p>}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 20px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800,
                  background: '#C4622D',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(196,98,45,0.25)',
                }}
              >
                {submitting ? (
                  <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
                ) : (
                  <MessageSquarePlus style={{ width: 14, height: 14 }} />
                )}
                <span>{t('submit')}</span>
              </button>

              {count > 0 && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '9px 16px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    background: 'transparent',
                    color: 'var(--muted-foreground)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  {t('cancelBtn')}
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* ── Reviews Cards List (Matching FAQ Accordion Cards Style) ─── */}
      {reviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                borderRadius: 16,
                border: '1px solid var(--border)',
                background: 'var(--card)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {review.customer.avatarUrl ? (
                    <Image
                      src={review.customer.avatarUrl}
                      alt={review.customer.name}
                      width={36}
                      height={36}
                      className="rounded-full object-cover border"
                      style={{ borderColor: 'var(--border)', width: 36, height: 36 }}
                    />
                  ) : (
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white font-bold text-xs"
                      style={{ background: 'linear-gradient(135deg, #C4622D 0%, #a34e23 100%)' }}
                    >
                      {review.customer.name ? review.customer.name.charAt(0).toUpperCase() : <UserRound className="w-4 h-4" />}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                        {review.customer.name}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t('verifiedBuyer')}</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-medium block mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {new Date(review.createdAt).toLocaleDateString(
                        locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US',
                        { year: 'numeric', month: 'short', day: 'numeric' }
                      )}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: 'var(--bg-subtle)',
                  }}
                >
                  <StarRow value={review.rating} size={14} />
                </div>
              </div>

              {review.comment && (
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--foreground)', margin: 0 }}>
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
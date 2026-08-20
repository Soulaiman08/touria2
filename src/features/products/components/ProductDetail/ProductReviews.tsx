'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Star, MessageSquarePlus, UserRound } from 'lucide-react'

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

function StarRow({ value, onChange, size = 18 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex items-center gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
          />
        </button>
      ))}
    </div>
  )
}

export function ProductReviews({ productId, locale }: ProductReviewsProps) {
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [average, setAverage] = useState<number | null>(null)
  const [count, setCount] = useState(0)

  const [authState, setAuthState] = useState<'loading' | 'guest' | 'user'>('loading')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const isRTL = locale === 'ar'

  const t = (key: string): string => {
    const map: Record<string, [string, string, string]> = {
      title: ['تقييمات العملاء', 'Avis clients', 'Customer reviews'],
      noReviews: ['لا توجد تقييمات بعد', 'Aucun avis pour le moment', 'No reviews yet'],
      beFirst: ['كن أول من يقيّم هذا المنتج', 'Soyez le premier à évaluer ce produit', 'Be the first to review this product'],
      signInToReview: ['سجّل الدخول لإضافة تقييم', 'Connectez-vous pour laisser un avis', 'Sign in to leave a review'],
      signIn: ['تسجيل الدخول', 'Se connecter', 'Sign in'],
      yourRating: ['تقييمك', 'Votre note', 'Your rating'],
      yourComment: ['تعليقك', 'Votre commentaire', 'Your comment'],
      commentPlaceholder: ['شارك تجربتك مع هذا المنتج...', 'Partagez votre expérience avec ce produit...', 'Share your experience with this product...'],
      submit: ['إرسال التقييم', 'Envoyer l\'avis', 'Submit review'],
      update: ['تحديث التقييم', 'Mettre à jour', 'Update review'],
      thanks: ['شكراً لتقييمك!', 'Merci pour votre avis !', 'Thanks for your review!'],
      failed: ['تعذر إرسال التقييم', 'Échec de l\'envoi de l\'avis', 'Failed to submit review'],
      loading: ['جاري التحميل...', 'Chargement...', 'Loading...'],
      from: ['من', 'de', 'from'],
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
        if (data.reviews.length > 0) {
          const mine = data.reviews.find((r: ReviewItem) => authState === 'user' && false)
          void mine
        }
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
    if (rating < 1) {
      setErrorMsg(t('yourRating'))
      return
    }
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
      setComment('')
      setRating(0)
      loadReviews()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error && err.message !== 'failed' ? err.message : t('failed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="mt-12 rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--border)' }}>
        <Loader2 className="animate-spin mx-auto" style={{ width: 24, height: 24, color: '#C4622D' }} />
        <p className="mt-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{t('loading')}</p>
      </section>
    )
  }

  return (
    <section className="mt-12 rounded-2xl border p-5 sm:p-8" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{t('title')}</h2>
        {count > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold" style={{ color: 'var(--foreground)' }}>
              {average !== null ? average.toFixed(1) : '—'}
            </span>
            <div>
              <StarRow value={Math.round(average ?? 0)} size={16} />
              <p className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {count} {count === 1 ? (locale === 'ar' ? 'تقييم' : locale === 'fr' ? 'avis' : 'review') : (locale === 'ar' ? 'تقييمات' : locale === 'fr' ? 'avis' : 'reviews')}
              </p>
            </div>
          </div>
        )}
      </div>

      {count === 0 && (
        <p className="mb-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {t('noReviews')} — {t('beFirst')}
        </p>
      )}

      <div className="mb-6 space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {review.customer.avatarUrl ? (
                  <Image
                    src={review.customer.avatarUrl}
                    alt={review.customer.name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    style={{ width: 32, height: 32 }}
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: '#C4622D' }}>
                    <UserRound style={{ width: 15, height: 15 }} />
                  </div>
                )}
                <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{review.customer.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <StarRow value={review.rating} size={14} />
                <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                  {new Date(review.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{review.comment}</p>
          </div>
        ))}
      </div>

      {authState === 'loading' ? null : authState === 'guest' ? (
        <div className="rounded-xl border border-dashed p-5 text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>{t('signInToReview')}</p>
          <Link
            href={`/${locale}/login`}
            className="btn btn-primary mt-4 inline-flex h-10 items-center justify-center rounded-xl px-6 text-sm font-bold"
          >
            {t('signIn')}
          </Link>
        </div>
      ) : submitted ? (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center">
          <p className="text-sm font-bold text-green-600">{t('thanks')}</p>
          <button
            type="button"
            onClick={() => { setSubmitted(false); setRating(0); setComment('') }}
            className="mt-2 text-xs font-bold underline"
            style={{ color: '#C4622D' }}
          >
            {t('update')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <div className="mb-3">
            <p className="mb-1.5 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{t('yourRating')}</p>
            <div className="flex items-center gap-2">
              <StarRow value={rating} onChange={setRating} size={26} />
              {rating > 0 && (
                <span className="text-xs font-bold" style={{ color: '#C4622D' }}>
                  {RATING_LABELS[rating][locale === 'ar' ? 0 : locale === 'fr' ? 1 : 2]}
                </span>
              )}
            </div>
          </div>
          <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            {t('yourComment')}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder={t('commentPlaceholder')}
            className="w-full rounded-xl border bg-transparent p-3.5 text-sm outline-none transition-all focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          {errorMsg && <p className="mt-2 text-xs font-semibold text-red-500">{errorMsg}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary mt-3 flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold disabled:opacity-60"
          >
            {submitting ? <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> : <MessageSquarePlus style={{ width: 16, height: 16 }} />}
            {t('submit')}
          </button>
        </form>
      )}
    </section>
  )
}
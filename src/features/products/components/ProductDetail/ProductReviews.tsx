'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Loader2,
  Star,
  MessageSquarePlus,
  UserRound,
  CheckCircle2,
  LogIn,
  Sparkles,
  Edit3,
  X,
  Send,
} from 'lucide-react'
import { useCustomerAuth } from '@/components/providers/CustomerAuthProvider'

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
  customer?: { id: string; name: string; avatarUrl: string | null } | null
}

const RATING_LABELS: Record<number, [string, string, string]> = {
  1: ['سيئ جداً', 'Très décevant', 'Very poor'],
  2: ['أقل من المتوقع', 'Passable', 'Below expectations'],
  3: ['جيد ومقبول', 'Correct', 'Average'],
  4: ['جيد جداً', 'Très bien', 'Very good'],
  5: ['ممتاز وفاخر', 'Excellent & Parfait', 'Excellent & Luxurious'],
}

function StarRow({
  value,
  onChange,
  size = 16,
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
    <div className="flex items-center gap-1" dir="ltr" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map((n) => {
        const isFilled = n <= displayValue
        return (
          <button
            key={n}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => onHover?.(n)}
            className={`p-0.5 transition-transform duration-150 ${
              onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            <Star
              style={{
                width: size,
                height: size,
                color: isFilled ? 'var(--gold)' : 'var(--border-strong)',
                fill: isFilled ? 'var(--gold)' : 'transparent',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}

export function ProductReviews({ productId, locale }: ProductReviewsProps) {
  const { customer, loading: authLoading } = useCustomerAuth()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [average, setAverage] = useState<number | null>(null)
  const [count, setCount] = useState(0)

  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showForm, setShowForm] = useState(false)

  const authState: 'loading' | 'guest' | 'user' = authLoading
    ? 'loading'
    : customer
      ? 'user'
      : 'guest'
  const currentUserId = customer?.id ?? null

  const isRTL = locale === 'ar'
  const isFR = locale === 'fr'

  const t = (key: string): string => {
    const map: Record<string, [string, string, string]> = {
      sectionTitle: ['آراء وتقييمات الزبناء', 'Avis et retours clients', 'Customer Reviews'],
      noReviewsTitle: ['لا توجد تقييمات بعد', 'Aucun avis pour le moment', 'No reviews yet'],
      noReviewsDesc: [
        'كوني أول من يشارك تجربته مع هذه القطعة الفاخرة.',
        'Soyez la première à donner votre avis sur cette création.',
        'Be the first to share your experience with this piece.',
      ],
      basedOnCount: [
        'بناءً على {count} تقييم موثق',
        'Basé sur {count} avis vérifiés',
        'Based on {count} verified reviews',
      ],
      writeReview: ['أضيفي تقييمكِ', 'Donner votre avis', 'Write a Review'],
      editReview: ['تعديل تقييمي', 'Modifier mon avis', 'Edit My Review'],
      signInToReview: ['سجلي الدخول للتقييم', 'Se connecter pour évaluer', 'Sign in to Review'],
      ratingLabel: ['اختاري تقييمك للمنتج:', 'Votre appréciation :', 'Your Rating:'],
      commentLabel: ['رأيك الصادق في الجودة، الخياطة والتطريز:', 'Votre commentaire :', 'Your Review:'],
      commentPlaceholder: [
        'شاركينا رأيك حول جودة القماش، المقاس، الخياطة، وسرعة التوصيل...',
        'Partagez vos impressions sur la coupe, le tissu, les finitions...',
        'Share your thoughts on the fabric quality, stitching, fit, and delivery...',
      ],
      publishReview: ['نشر التقييم', "Publier l'avis", 'Submit Review'],
      cancel: ['إلغاء', 'Annuler', 'Cancel'],
      verifiedBuyer: ['مشتري موثق', 'Acheteur vérifié', 'Verified Buyer'],
      anonymousReviewer: ['زبونة ثريا', 'Client Thuraya', 'Thuraya Customer'],
      loading: ['جاري تحميل التقييمات...', 'Chargement des avis...', 'Loading reviews...'],
      failed: ['تعذر إرسال التقييم، يرجى المحاولة ثانية', "Échec de l'envoi de l'avis", 'Failed to submit review'],
    }
    const entry = map[key]
    if (!entry) return key
    return isRTL ? entry[0] : isFR ? entry[1] : entry[2]
  }

  const fetchReviews = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, {
      cache: 'no-store',
      signal,
    })
    if (!res.ok) throw new Error('failed')
    return res.json() as Promise<{
      reviews?: ReviewItem[]
      averageRating?: number | null
      count?: number
    }>
  }, [productId])

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    fetchReviews(controller.signal)
      .then((data) => {
        if (!isMounted) return
        setReviews(data.reviews || [])
        setAverage(data.averageRating ?? null)
        setCount(data.count || 0)
      })
      .catch((err: unknown) => {
        if (!isMounted || (err instanceof Error && err.name === 'AbortError')) return
        setReviews([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [fetchReviews])

  const openReviewForm = () => {
    const existing = currentUserId
      ? reviews.find((r) => r.customer?.id === currentUserId)
      : undefined
    if (existing) {
      setRating(existing.rating)
      setComment(existing.comment)
    } else {
      setRating(5)
      setComment('')
    }
    setErrorMsg('')
    setShowForm(true)
  }

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
      setShowForm(false)
      const fresh = await fetchReviews()
      setReviews(fresh.reviews || [])
      setAverage(fresh.averageRating ?? null)
      setCount(fresh.count || 0)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error && err.message !== 'failed' ? err.message : t('failed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div
        className="mt-6 sm:mt-8 lg:mt-10 rounded-2xl border p-5 sm:p-6 text-center"
        style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Loader2 className="animate-spin mx-auto w-5 h-5 text-[var(--accent)]" />
        <p className="mt-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          {t('loading')}
        </p>
      </div>
    )
  }

  const activeRatingDisplay = hoverRating > 0 ? hoverRating : rating
  const avgScore = average !== null ? average.toFixed(1) : count > 0 ? '5.0' : null

  return (
    <section className="mt-6 sm:mt-8 lg:mt-10 min-w-0 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div
        className="rounded-2xl border overflow-hidden w-full"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--card-bg)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3.5 sm:px-6 sm:py-4 border-b flex items-center justify-between gap-3 flex-wrap"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-subtle)',
          }}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'var(--accent-light)',
                color: 'var(--accent)',
              }}
            >
              <Star className="w-4 h-4 fill-current" />
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="text-sm sm:text-lg font-bold"
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                  }}
                >
                  {t('sectionTitle')}
                </h2>

                {count > 0 && avgScore && (
                  <span
                    dir="ltr"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums whitespace-nowrap"
                    style={{
                      background: 'var(--accent-light)',
                      color: 'var(--accent)',
                    }}
                  >
                    {avgScore} / 5
                  </span>
                )}
              </div>

              <p className="text-[11px] sm:text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                {count > 0
                  ? t('basedOnCount').replace('{count}', count.toString())
                  : t('noReviewsTitle')}
              </p>
            </div>
          </div>

          {count > 0 && (
            <div className="flex-shrink-0">
              {authState === 'guest' ? (
                <Link
                  href={`/${locale}/login`}
                  className="btn btn-primary btn-sm rounded-xl inline-flex items-center gap-2 px-3.5 sm:px-5 whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('signInToReview')}</span>
                </Link>
              ) : authState === 'user' && !showForm ? (
                <button
                  type="button"
                  onClick={openReviewForm}
                  className="btn btn-primary btn-sm rounded-xl inline-flex items-center gap-2 px-3.5 sm:px-5 whitespace-nowrap cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>{t('writeReview')}</span>
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Review Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 border-b space-y-4"
            style={{
              background: 'var(--bg-subtle)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('ratingLabel')}
              </span>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div
                className="px-3 py-1.5 rounded-xl border flex items-center"
                style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
              >
                <StarRow
                  value={rating}
                  hoverValue={hoverRating}
                  onChange={setRating}
                  onHover={setHoverRating}
                  onLeave={() => setHoverRating(0)}
                  size={20}
                />
              </div>

              {activeRatingDisplay > 0 && (
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                  }}
                >
                  {RATING_LABELS[activeRatingDisplay][isRTL ? 0 : isFR ? 1 : 2]}
                </span>
              )}
            </div>

            <div>
              <label
                className="block text-xs font-bold mb-1.5"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('commentLabel')}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder={t('commentPlaceholder')}
                className="w-full p-3 rounded-xl border text-sm leading-relaxed resize-none outline-none focus:border-[var(--accent)]"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="text-end text-[11px] tabular-nums mt-1" style={{ color: 'var(--text-muted)' }}>
                <span dir="ltr" className="inline-block">
                  {comment.length}/500
                </span>
              </div>
            </div>

            {errorMsg && <p className="text-xs font-bold text-red-500">{errorMsg}</p>}

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="btn btn-primary btn-sm rounded-xl inline-flex items-center gap-2 px-5 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="animate-spin w-3.5 h-3.5" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{t('publishReview')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-outline btn-sm rounded-xl px-4 cursor-pointer"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        )}

        {/* Empty State */}
        {count === 0 && !showForm && (
          <div className="py-7 sm:py-10 px-4 sm:px-6 text-center flex flex-col items-center gap-2.5 sm:gap-3">
            <span
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center"
              style={{
                background: 'var(--accent-light)',
                color: 'var(--gold)',
              }}
            >
              <Sparkles className="w-5 h-5" />
            </span>

            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('noReviewsTitle')}
              </h3>
              <p className="text-xs mt-1 max-w-md" style={{ color: 'var(--text-muted)' }}>
                {t('noReviewsDesc')}
              </p>
            </div>

            {authState === 'guest' ? (
              <Link
                href={`/${locale}/login`}
                className="btn btn-primary btn-sm rounded-xl inline-flex items-center gap-2 px-5 sm:px-6 mt-1 whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('signInToReview')}</span>
              </Link>
            ) : authState === 'user' ? (
              <button
                type="button"
                onClick={openReviewForm}
                className="btn btn-primary btn-sm rounded-xl inline-flex items-center gap-2 px-5 sm:px-6 mt-1 whitespace-nowrap cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>{t('writeReview')}</span>
              </button>
            ) : null}
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className="p-3 sm:p-5 space-y-2.5 sm:space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border p-3.5 sm:p-4 space-y-2.5"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-subtle)',
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {review.customer?.avatarUrl ? (
                      <Image
                        src={review.customer.avatarUrl}
                        alt={review.customer.name || t('anonymousReviewer')}
                        width={96}
                        height={96}
                        quality={95}
                        referrerPolicy="no-referrer"
                        className="rounded-full object-cover border w-[30px] h-[30px] shrink-0"
                        style={{ borderColor: 'var(--border)' }}
                      />
                    ) : (
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-white font-bold text-xs"
                        style={{ background: 'var(--accent)' }}
                      >
                        {review.customer?.name ? (
                          review.customer.name.charAt(0).toUpperCase()
                        ) : (
                          <UserRound className="w-3.5 h-3.5" />
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        {review.customer?.name || t('anonymousReviewer')}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{t('verifiedBuyer')}</span>
                      </span>

                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        •{' '}
                        {new Date(review.createdAt).toLocaleDateString(
                          isRTL ? 'ar-MA' : isFR ? 'fr-FR' : 'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </span>
                    </div>
                  </div>

                  <StarRow value={review.rating} size={13} />
                </div>

                {review.comment && (
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {review.comment}
                  </p>
                )}

                {Boolean(currentUserId && review.customer?.id === currentUserId) && (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setRating(review.rating)
                        setComment(review.comment)
                        setShowForm(true)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors"
                      style={{
                        color: 'var(--accent)',
                        background: 'var(--accent-light)',
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{t('editReview')}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
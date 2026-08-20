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
  Sparkles,
  Edit3,
  X,
  Send,
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
              onChange ? 'cursor-pointer hover:scale-120' : 'cursor-default'
            }`}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            <Star
              style={{ width: size, height: size }}
              className={`transition-colors duration-150 ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-stone-300 dark:text-stone-700 fill-transparent'
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showForm, setShowForm] = useState(false)

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
      verifiedBadge: ['زبناء موثقون 100%', 'Avis 100% vérifiés', '100% Verified Customers'],
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
      publishReview: ['نشر التقييم', 'Publier l\'avis', 'Submit Review'],
      cancel: ['إلغاء', 'Annuler', 'Cancel'],
      reviewSubmitted: ['تم تسجيل تقييمك بنجاح!', 'Votre avis a été enregistré avec succès !', 'Your review has been submitted successfully!'],
      verifiedBuyer: ['مشتري موثق', 'Acheteur vérifié', 'Verified Buyer'],
      loading: ['جاري تحميل التقييمات...', 'Chargement des avis...', 'Loading reviews...'],
      failed: ['تعذر إرسال التقييم، يرجى المحاولة ثانية', 'Échec de l\'envoi de l\'avis', 'Failed to submit review'],
    }
    const entry = map[key]
    if (!entry) return key
    return isRTL ? entry[0] : isFR ? entry[1] : entry[2]
  }

  const loadReviews = () => {
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((data) => {
        setReviews(data.reviews || [])
        setAverage(data.averageRating)
        setCount(data.count || 0)
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
          setCurrentUserId(data.user.id)
          const mine = reviews.find((r) => r.customer.id === data.user.id)
          if (mine) {
            setRating(mine.rating)
            setComment(mine.comment)
            setSubmitted(true)
          }
        }
      })
      .catch(() => {
        if (isMounted) setAuthState('guest')
      })
    return () => {
      isMounted = false
    }
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
        className="mt-8 rounded-2xl border p-6 text-center"
        style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Loader2 className="animate-spin mx-auto w-5 h-5 text-[#C4622D]" />
        <p className="mt-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
          {t('loading')}
        </p>
      </div>
    )
  }

  const activeRatingDisplay = hoverRating > 0 ? hoverRating : rating
  const avgScore = average !== null ? average.toFixed(1) : count > 0 ? '5.0' : null

  return (
    <section className="mt-10" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Main Container Card ────────────────────────────────────── */}
      <div
        style={{
          borderRadius: 'clamp(16px, 2vw, 22px)',
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 4px 20px rgba(61,31,10,0.03)',
          overflow: 'hidden',
        }}
      >
        {/* ── Header & Action Bar ──────────────────────────────────── */}
        <div
          style={{
            padding: 'clamp(14px, 2vw, 20px) clamp(16px, 2.5vw, 24px)',
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(135deg, rgba(196,98,45,0.04) 0%, rgba(184,150,90,0.02) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {/* Title & Score Summary */}
          <div className="flex items-center gap-3 flex-wrap">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--accent-light)',
                border: '1px solid var(--accent-ring)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                flexShrink: 0,
              }}
            >
              <Star className="w-4 h-4 fill-[var(--accent)] text-[var(--accent)]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2
                  style={{
                    fontSize: 'clamp(14px, 1.6vw, 17px)',
                    fontWeight: 800,
                    color: 'var(--foreground)',
                    margin: 0,
                    fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                  }}
                >
                  {t('sectionTitle')}
                </h2>

                {count > 0 && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{
                      background: 'var(--accent-light)',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent-ring)',
                    }}
                  >
                    ★ {avgScore}
                  </span>
                )}
              </div>

              <p
                style={{
                  fontSize: 11.5,
                  color: 'var(--muted-foreground)',
                  margin: '2px 0 0',
                }}
              >
                {count > 0
                  ? t('basedOnCount').replace('{count}', count.toString())
                  : t('noReviewsTitle')}
              </p>
            </div>
          </div>

          {/* Action Trigger Button in Header (Only when reviews exist) */}
          {count > 0 && (
            <div>
              {authState === 'guest' ? (
                <Link
                  href={`/${locale}/login`}
                  className="btn btn-primary btn-round inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  style={{
                    textDecoration: 'none',
                    minHeight: '2.75rem',
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('signInToReview')}</span>
                </Link>
              ) : !showForm ? (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary btn-round inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
                  style={{ minHeight: '2.75rem' }}
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>{t('writeReview')}</span>
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* ── Simplified Inline Review Form ────────────────────────── */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: 'clamp(14px, 2.5vw, 22px)',
              background: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {/* Header: Title + Close */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>
                {t('ratingLabel')}
              </span>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: 4, borderRadius: 999, color: '#a8a29e', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stars + Rating Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <div
                style={{
                  padding: '6px 10px',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
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
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent-ring)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ✦ {RATING_LABELS[activeRatingDisplay][isRTL ? 0 : isFR ? 1 : 2]}
                </span>
              )}
            </div>

            {/* Comment Textarea */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--foreground)', marginBottom: 6 }}
              >
                {t('commentLabel')}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder={t('commentPlaceholder')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ textAlign: 'end', fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>
                {comment.length}/500
              </div>
            </div>

            {errorMsg && <p style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 10 }}>{errorMsg}</p>}

            {/* Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 18px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  background: 'linear-gradient(90deg, #C4622D, #d97b4a)',
                  border: 'none',
                  cursor: submitting || rating === 0 ? 'not-allowed' : 'pointer',
                  opacity: submitting || rating === 0 ? 0.6 : 1,
                }}
              >
                {submitting ? (
                  <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
                ) : (
                  <Send style={{ width: 14, height: 14 }} />
                )}
                <span>{t('publishReview')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--muted-foreground)',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        )}

        {/* ── Zero-Reviews Empty State ─────────────────────────────── */}
        {count === 0 && !showForm && (
          <div
            style={{
              padding: 'clamp(24px, 3.5vw, 36px) clamp(16px, 2.5vw, 24px)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--bg-subtle)',
                border: '1px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold)',
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>

            <div>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'var(--foreground)',
                  margin: '0 0 4px',
                }}
              >
                {t('noReviewsTitle')}
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--muted-foreground)',
                  margin: 0,
                  maxWidth: 420,
                }}
              >
                {t('noReviewsDesc')}
              </p>
            </div>

            {authState === 'guest' ? (
              <Link
                href={`/${locale}/login`}
                className="btn btn-primary btn-round inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 mt-2"
                style={{
                  textDecoration: 'none',
                  minHeight: '2.75rem',
                }}
              >
                <LogIn className="w-4 h-4" />
                <span>{t('signInToReview')}</span>
              </Link>
            ) : authState === 'user' ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="btn btn-primary btn-round inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer mt-2"
                style={{ minHeight: '2.75rem' }}
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>{t('writeReview')}</span>
              </button>
            ) : null}
          </div>
        )}

        {/* ── Reviews Cards List ───────────────────────────────────── */}
        {reviews.length > 0 && (
          <div
            style={{
              padding: 'clamp(12px, 2vw, 18px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  borderRadius: 14,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  transition: 'border-color 0.2s ease',
                }}
              >
                {/* Header: User details & Stars */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {review.customer.avatarUrl ? (
                      <Image
                        src={review.customer.avatarUrl}
                        alt={review.customer.name}
                        width={30}
                        height={30}
                        className="rounded-full object-cover border"
                        style={{ borderColor: 'var(--border)', width: 30, height: 30 }}
                      />
                    ) : (
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-white font-bold text-[11px]"
                        style={{
                          background: 'linear-gradient(135deg, #C4622D 0%, #a34e23 100%)',
                        }}
                      >
                        {review.customer.name ? (
                          review.customer.name.charAt(0).toUpperCase()
                        ) : (
                          <UserRound className="w-3.5 h-3.5" />
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>
                        {review.customer.name}
                      </span>

                      <span
                        className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold"
                        style={{
                          background: 'rgba(34,197,94,0.12)',
                          color: '#16a34a',
                        }}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{t('verifiedBuyer')}</span>
                      </span>

                      <span
                        className="text-[10.5px] font-medium"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        •{' '}
                        {new Date(review.createdAt).toLocaleDateString(
                          isRTL ? 'ar-MA' : isFR ? 'fr-FR' : 'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <StarRow value={review.rating} size={13} />
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p
                    style={{
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      color: 'var(--foreground)',
                      margin: 0,
                    }}
                  >
                    {review.comment}
                  </p>
                )}

                {/* Edit button for current user's review */}
                {currentUserId === review.customer.id && (
                  <div style={{ marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => { setRating(review.rating); setComment(review.comment); setShowForm(true); }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 12px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#C4622D',
                        background: 'rgba(196,98,45,0.08)',
                        border: '1px solid rgba(196,98,45,0.2)',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit3 style={{ width: 12, height: 12 }} />
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
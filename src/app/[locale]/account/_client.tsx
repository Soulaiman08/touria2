'use client'

import { useEffect, useRef, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Camera, Loader2, LogOut, Save, UserRound, Mail, Phone, User, Package } from 'lucide-react'
import { useCustomerAuth } from '@/components/providers/CustomerAuthProvider'
import { BackButton } from '@/components/shared/PageNavigation'

interface AccountPageProps {
  params: Promise<{ locale: string }>
}

interface CustomerUser {
  id: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  createdAt: string
}

export function AccountPageClient({ params }: AccountPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'
  const { logout: authLogout } = useCustomerAuth()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<CustomerUser | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const t = (key: string): string => {
    const map: Record<string, [string, string, string]> = {
      loading: ['جاري التحميل...', 'Chargement...', 'Loading...'],
      signInTitle: ['سجّل الدخول', 'Connectez-vous', 'Sign in'],
      signInDesc: ['سجّل الدخول للاطلاع على ملفك وطلباتك', 'Connectez-vous pour voir votre profil et vos commandes', 'Sign in to view your profile and orders'],
      signIn: ['تسجيل الدخول', 'Se connecter', 'Sign in'],
      createAccount: ['إنشاء حساب', 'Créer un compte', 'Create account'],
      name: ['الاسم الكامل', 'Nom complet', 'Full name'],
      email: ['البريد الإلكتروني', 'E-mail', 'Email'],
      phone: ['رقم الهاتف', 'Téléphone', 'Phone'],
      phonePlaceholder: ['06XXXXXXXX', '06XXXXXXXX', '06XXXXXXXX'],
      save: ['حفظ التغييرات', 'Enregistrer', 'Save changes'],
      saved: ['تم الحفظ بنجاح', 'Enregistré avec succès', 'Saved successfully'],
      saveFailed: ['تعذر حفظ التغييرات', 'Échec de l\'enregistrement', 'Failed to save changes'],
      uploadAvatar: ['تغيير الصورة', 'Changer la photo', 'Change photo'],
      uploadFailed: ['تعذر رفع الصورة', 'Échec du téléchargement', 'Failed to upload image'],
      logout: ['تسجيل الخروج', 'Se déconnecter', 'Log out'],
      back: ['العودة للرئيسية', 'Retour à l\'accueil', 'Back to home'],
      memberSince: ['عضو منذ', 'Membre depuis', 'Member since'],
      myOrders: ['طلباتي', 'Mes commandes', 'My orders'],
    }
    const entry = map[key]
    if (!entry) return key
    return locale === 'ar' ? entry[0] : locale === 'fr' ? entry[1] : entry[2]
  }

  useEffect(() => {
    let isMounted = true
    fetch('/api/customer/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('not-authenticated'))))
      .then((data) => {
        if (!isMounted) return
        setUser(data.user)
        setName(data.user.name)
        setPhone(data.user.phone ?? '')
      })
      .catch(() => {
        if (isMounted) setUser(null)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setUser(data.user)
      setMsg({ type: 'success', text: t('saved') })
    } catch (err: unknown) {
      setMsg({ type: 'error', text: err instanceof Error && err.message !== 'Failed' ? err.message : t('saveFailed') })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMsg(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/customer/avatar', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setUser((prev) => (prev ? { ...prev, avatarUrl: data.url } : prev))
    } catch (err: unknown) {
      setMsg({ type: 'error', text: err instanceof Error && err.message !== 'Failed' ? err.message : t('uploadFailed') })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleLogout = async () => {
    await authLogout()
    router.push(`/${locale}`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="container-brand py-20 text-center flex flex-col items-center gap-4">
        <div className="animate-spin w-10 h-10 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
        <p className="text-sm text-[var(--text-muted)]">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="container-brand page-shell" dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: '35rem' }}>
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-6">
        <BackButton href={`/${locale}`} locale={locale} label={t('back')} />

        {user && (
          <Link
            href={`/${locale}/account/orders`}
            className="group inline-flex items-center gap-2 h-9 sm:h-10 ps-2 pe-3.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]/95 text-xs sm:text-[13px] font-semibold text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 whitespace-nowrap no-underline"
          >
            <span className="flex h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--accent-ring)] bg-[var(--accent-light)] text-[var(--accent)] transition-colors duration-200 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-white">
              <Package className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span>{t('myOrders')}</span>
          </Link>
        )}
      </div>

      {!user ? (
        /* ── Not logged in ── */
        <div className="p-7 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] text-center flex flex-col items-center">
          <div className="w-14 h-16 rounded-t-[999px] rounded-b-xl bg-[var(--accent-light)] border border-[var(--gold-ring)] text-[var(--accent)] flex items-center justify-center mb-4">
            <UserRound className="w-6 h-6" />
          </div>
          <h1
            className="text-xl font-extrabold text-[var(--text-primary)] mb-2"
            style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
          >
            {t('signInTitle')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed mb-6">{t('signInDesc')}</p>
          <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
            <Link href={`/${locale}/login`} className="btn btn-primary w-full justify-center h-11 rounded-xl text-sm font-bold">
              {t('signIn')}
            </Link>
            <Link href={`/${locale}/signup`} className="btn btn-outline w-full justify-center h-11 rounded-xl text-sm font-semibold">
              {t('createAccount')}
            </Link>
          </div>
        </div>
      ) : (
        /* ── Logged in ── */
        <div className="flex flex-col gap-4 pb-8">
          <div className="p-5 sm:p-7 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4 pb-5 mb-6 border-b border-[var(--border)]">
              <div className="relative flex-shrink-0">
                {user.avatarUrl ? (
                  <div className="w-16 h-[72px] rounded-t-[999px] rounded-b-xl overflow-hidden border border-[var(--gold-ring)] bg-[var(--bg-subtle)]">
                    <Image
                      src={user.avatarUrl}
                      alt={user.name}
                      width={64}
                      height={72}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = '/images/brand/logo-icon.png'
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-[72px] rounded-t-[999px] rounded-b-xl bg-[var(--accent-light)] border border-[var(--gold-ring)] text-[var(--accent)] flex items-center justify-center">
                    <UserRound className="w-7 h-7" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -end-1 w-8 h-8 rounded-full bg-[var(--accent)] text-white border-2 border-[var(--card-bg)] flex items-center justify-center cursor-pointer disabled:opacity-60 shadow-xs"
                  aria-label={t('uploadAvatar')}
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatar} />
              </div>

              <div className="min-w-0 flex-1">
                <h1
                  className="text-xl font-extrabold text-[var(--text-primary)] truncate mb-1"
                  style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
                >
                  {user.name}
                </h1>
                <p className="tabular-nums text-xs text-[var(--text-muted)] m-0">
                  {t('memberSince')} {new Date(user.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')}
                </p>
              </div>
            </div>

            {/* Feedback message */}
            {msg && (
              <div
                className="px-4 py-2.5 rounded-xl text-xs font-semibold mb-4 border"
                style={{
                  borderColor: msg.type === 'error' ? 'var(--error-border)' : 'var(--success-border)',
                  background: msg.type === 'error' ? 'var(--error-bg)' : 'var(--success-bg)',
                  color: msg.type === 'error' ? 'var(--error)' : 'var(--success)',
                }}
              >
                {msg.text}
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  {t('name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--text-muted)] opacity-70 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] ps-10 pe-4 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--text-muted)] opacity-70 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    dir="ltr"
                    value={user.email}
                    className={`h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm font-medium text-[var(--text-muted)] opacity-75 cursor-not-allowed outline-none ${
                      isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  {t('phone')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[var(--text-muted)] opacity-70 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('phonePlaceholder')}
                    dir="ltr"
                    className={`tabular-nums h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] transition-colors ${
                      isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary w-full justify-center h-11 rounded-xl mt-2 text-sm font-bold"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{t('save')}</span>
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline w-full justify-center h-11 rounded-xl text-sm font-semibold hover:border-[var(--error)] hover:text-[var(--error)]"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      )}
    </div>
  )
}

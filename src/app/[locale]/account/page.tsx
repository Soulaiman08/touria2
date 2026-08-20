'use client'

import { useEffect, useRef, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Camera, Loader2, LogOut, Package, Save, UserRound } from 'lucide-react'

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

export default function AccountPage({ params }: AccountPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'

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
      title: ['حسابي', 'Mon compte', 'My account'],
      loading: ['جاري التحميل...', 'Chargement...', 'Loading...'],
      signInTitle: ['سجّل الدخول', 'Connectez-vous', 'Sign in'],
      signInDesc: ['سجّل الدخول للاطلاع على ملفك وطلباتك', 'Connectez-vous pour voir votre profil et vos commandes', 'Sign in to view your profile and orders'],
      signIn: ['تسجيل الدخول', 'Se connecter', 'Sign in'],
      createAccount: ['إنشاء حساب', 'Créer un compte', 'Create account'],
      profile: ['الملف الشخصي', 'Profil', 'Profile'],
      name: ['الاسم', 'Nom', 'Name'],
      email: ['البريد الإلكتروني', 'E-mail', 'Email'],
      phone: ['الهاتف', 'Téléphone', 'Phone'],
      phonePlaceholder: ['06XXXXXXXX', '06XXXXXXXX', '06XXXXXXXX'],
      save: ['حفظ التغييرات', 'Enregistrer', 'Save changes'],
      saved: ['تم الحفظ بنجاح', 'Enregistré avec succès', 'Saved successfully'],
      saveFailed: ['تعذر حفظ التغييرات', 'Échec de l\'enregistrement', 'Failed to save changes'],
      uploadAvatar: ['تغيير الصورة', 'Changer la photo', 'Change photo'],
      uploadFailed: ['تعذر رفع الصورة', 'Échec du téléchargement', 'Failed to upload image'],
      myOrders: ['طلباتي', 'Mes commandes', 'My orders'],
      viewOrders: ['عرض الطلبات', 'Voir les commandes', 'View orders'],
      logout: ['تسجيل الخروج', 'Se déconnecter', 'Log out'],
      back: ['العودة للرئيسية', 'Retour à l\'accueil', 'Back to home'],
      memberSince: ['عضو منذ', 'Membre depuis', 'Member since'],
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
      .catch(() => { if (isMounted) setUser(null) })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
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
    await fetch('/api/customer/auth/logout', { method: 'POST' })
    router.push(`/${locale}`)
    router.refresh()
  }

  const inputClass = "h-12 w-full rounded-xl border bg-transparent px-4.5 text-sm font-medium outline-none transition-all focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15"

  if (loading) {
    return (
      <div className="container-brand py-20 text-center space-y-4">
        <div className="animate-spin mx-auto h-10 w-10 rounded-full border-b-2 border-[#C4622D]" />
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="container-brand page-shell" dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: 640 }}>
      <Link
        href={`/${locale}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--muted-foreground)',
          textDecoration: 'none',
          marginBottom: 20,
        }}
      >
        <ArrowLeft style={{ width: 14, height: 14, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
        {t('back')}
      </Link>

      <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{t('title')}</h1>

      {!user ? (
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: '#C4622D', color: '#fff' }}
          >
            <UserRound style={{ width: 28, height: 28 }} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{t('signInTitle')}</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm" style={{ color: 'var(--muted-foreground)' }}>{t('signInDesc')}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/${locale}/login`}
              className="btn btn-primary flex h-11 w-full items-center justify-center rounded-xl px-6 font-bold sm:w-auto"
            >
              {t('signIn')}
            </Link>
            <Link
              href={`/${locale}/signup`}
              className="flex h-11 w-full items-center justify-center rounded-xl border px-6 font-bold transition-colors hover:border-[#C4622D] sm:w-auto"
              style={{ borderColor: 'var(--border)', color: '#C4622D' }}
            >
              {t('createAccount')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={72}
                    height={72}
                    className="rounded-full object-cover"
                    style={{ width: 72, height: 72 }}
                  />
                ) : (
                  <div
                    className="flex h-[72px] w-[72px] items-center justify-center rounded-full"
                    style={{ background: '#C4622D', color: '#fff' }}
                  >
                    <UserRound style={{ width: 30, height: 30 }} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -end-1 flex h-8 w-8 items-center justify-center rounded-full border-2 text-white disabled:opacity-60"
                  style={{ background: '#C4622D', borderColor: 'var(--bg-subtle)' }}
                  aria-label={t('uploadAvatar')}
                >
                  {uploading ? <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} /> : <Camera style={{ width: 14, height: 14 }} />}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatar}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{user.name}</h2>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {t('memberSince')} {new Date(user.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')}
                </p>
              </div>
            </div>

            {msg && (
              <p
                className={`mb-4 rounded-xl border px-4 py-3 text-xs font-semibold ${msg.type === 'error' ? 'border-red-500/20 bg-red-500/10 text-red-500' : 'border-green-500/20 bg-green-500/10 text-green-600'}`}
              >
                {msg.text}
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                  {t('name')}
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                  {t('email')}
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className={inputClass + ' opacity-60'}
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  className={inputClass}
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold shadow-lg shadow-[#C4622D]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 sm:w-auto sm:px-8"
              >
                {saving ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} /> : <Save style={{ width: 18, height: 18 }} />}
                {t('save')}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: '#C4622D', color: '#fff' }}>
                  <Package style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--foreground)' }}>{t('myOrders')}</h3>
                </div>
              </div>
              <Link
                href={`/${locale}/account/orders`}
                className="flex h-10 items-center justify-center rounded-xl px-4 text-sm font-bold transition-colors hover:bg-[#C4622D]/10"
                style={{ color: '#C4622D' }}
              >
                {t('viewOrders')}
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border font-bold transition-colors hover:border-red-500/40 hover:text-red-500"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            <LogOut style={{ width: 18, height: 18 }} />
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  )
}
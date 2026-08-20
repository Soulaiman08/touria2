'use client'

import { useEffect, useRef, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Camera, Loader2, LogOut, Save, UserRound, Mail, Phone, User } from 'lucide-react'
import { useCustomerAuth } from '@/components/providers/CustomerAuthProvider'

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
  const { logout: authLogout, openLoginModal } = useCustomerAuth()

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
    await authLogout()
    router.push(`/${locale}`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="container-brand py-20 text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div className="animate-spin" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: '#C4622D' }} />
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="container-brand page-shell" dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: 520, padding: '0 16px', paddingTop: 24 }}>
      {/* Back link */}
      <Link
        href={`/${locale}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 700,
          color: '#C4622D',
          textDecoration: 'none',
          marginBottom: 24,
          border: '1px solid #C4622D',
          borderRadius: 12,
          transition: 'background 0.2s',
        }}
      >
        <ArrowLeft style={{ width: 16, height: 16, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
        {t('back')}
      </Link>

      {!user ? (
        /* ── Not logged in ── */
        <div style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-subtle)', textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#C4622D',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <UserRound style={{ width: 24, height: 24 }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 8 }}>{t('signInTitle')}</h2>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>{t('signInDesc')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={openLoginModal}
              style={{
                height: 48,
                width: '100%',
                maxWidth: 280,
                borderRadius: 12,
                background: '#C4622D',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {t('signIn')}
            </button>
            <Link
              href={`/${locale}/signup`}
              style={{
                height: 48,
                width: '100%',
                maxWidth: 280,
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: '#C4622D',
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              {t('createAccount')}
            </Link>
          </div>
        </div>
      ) : (
        /* ── Logged in ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>
          {/* ── Profile Card ── */}
          <div style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>

            {/* Avatar + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={64}
                    height={64}
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#C4622D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserRound style={{ width: 28, height: 28 }} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#C4622D',
                    color: '#fff',
                    border: '2px solid var(--bg-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: uploading ? 0.6 : 1,
                  }}
                  aria-label={t('uploadAvatar')}
                >
                  {uploading ? <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} /> : <Camera style={{ width: 12, height: 12 }} />}
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatar} />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>{user.name}</h2>
                <p style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                  {t('memberSince')} {new Date(user.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')}
                </p>
              </div>
            </div>

            {/* Message */}
            {msg && (
              <div
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 16,
                  border: `1px solid ${msg.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                  background: msg.type === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                  color: msg.type === 'error' ? '#ef4444' : '#16a34a',
                }}
              >
                {msg.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 8 }}>
                  {t('name')}
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', top: '50%', left: isRTL ? undefined : 14, right: isRTL ? 14 : undefined, transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--muted-foreground)', opacity: 0.5 }} />
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      height: 48,
                      width: '100%',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      padding: isRTL ? '0 44px 0 16px' : '0 16px 0 44px',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--foreground)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  />
                </div>
              </div>

              {/* Email (disabled) */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 8 }}>
                  {t('email')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', top: '50%', left: isRTL ? undefined : 14, right: isRTL ? 14 : undefined, transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--muted-foreground)', opacity: 0.5 }} />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    style={{
                      height: 48,
                      width: '100%',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      padding: isRTL ? '0 44px 0 16px' : '0 16px 0 44px',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--foreground)',
                      outline: 'none',
                      opacity: 0.6,
                      cursor: 'not-allowed',
                      boxSizing: 'border-box',
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 8 }}>
                  {t('phone')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--muted-foreground)', opacity: 0.5 }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('phonePlaceholder')}
                    dir="ltr"
                    style={{
                      height: 48,
                      width: '100%',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      padding: '0 16px 0 44px',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--foreground)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      textAlign: 'left',
                    }}
                  />
                </div>
              </div>

              {/* Save button */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  height: 48,
                  width: '100%',
                  borderRadius: 12,
                  background: '#C4622D',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: saving ? 0.7 : 1,
                  marginTop: 4,
                  boxShadow: '0 4px 14px rgba(196,98,45,0.25)',
                }}
              >
                {saving ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: 18, height: 18 }} />}
                {t('save')}
              </button>
            </form>
          </div>

          {/* ── Logout button ── */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              height: 48,
              width: '100%',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--muted-foreground)',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
          >
            <LogOut style={{ width: 18, height: 18 }} />
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  )
}

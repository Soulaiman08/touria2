'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Loader2, UserPlus, Mail, LockKeyhole } from 'lucide-react'

interface SignupPageProps {
  params: Promise<{ locale: string }>
}

export default function CustomerSignupPage({ params }: SignupPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const t = (key: string): string => {
    const map: Record<string, [string, string, string]> = {
      title: ['إنشاء حساب', 'Créer un compte', 'Create account'],
      subtitle: ['أنشئ حسابك لتتبع طلباتك بشكل أسرع', 'Créez votre compte pour suivre vos commandes plus rapidement', 'Create your account to track your orders faster'],
      name: ['الاسم الكامل', 'Nom complet', 'Full name'],
      namePlaceholder: ['اسمك الكامل', 'Votre nom complet', 'Your full name'],
      email: ['البريد الإلكتروني', 'E-mail', 'Email'],
      emailPlaceholder: ['you@example.com', 'vous@example.com', 'you@example.com'],
      password: ['كلمة المرور', 'Mot de passe', 'Password'],
      passwordHint: ['8 أحرف على الأقل', '8 caractères minimum', 'At least 8 characters'],
      confirmPassword: ['تأكيد كلمة المرور', 'Confirmer le mot de passe', 'Confirm password'],
      create: ['إنشاء الحساب', 'Créer le compte', 'Create account'],
      hasAccount: ['لديك حساب بالفعل؟', 'Vous avez déjà un compte ?', 'Already have an account?'],
      signIn: ['سجّل الدخول', 'Connectez-vous', 'Sign in'],
      back: ['العودة للرئيسية', 'Retour à l\'accueil', 'Back to home'],
    }
    const entry = map[key]
    if (!entry) return key
    return locale === 'ar' ? entry[0] : locale === 'fr' ? entry[1] : entry[2]
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/customer/auth/signup', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Unable to create account. Please try again.')
      }

      router.push(`/${locale}/account`)
      router.refresh()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "h-12 w-full rounded-xl border bg-transparent px-4.5 text-sm font-medium outline-none transition-all focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15"

  return (
    <div className="container-brand page-shell" dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: 520 }}>
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

      <div className="rounded-2xl border p-6 sm:p-8" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: '#C4622D', color: '#fff' }}
          >
            <UserPlus style={{ width: 24, height: 24 }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{t('title')}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>{t('subtitle')}</p>
        </div>

        {errorMsg && (
          <p className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-xs font-semibold text-red-500">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              {t('name')}
            </label>
            <div className="relative">
              <UserPlus
                className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2"
                style={{ width: 16, height: 16, color: 'var(--muted-foreground)' }}
              />
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className={inputClass}
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', paddingInlineStart: '2.75rem' }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              {t('email')}
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2"
                style={{ width: 16, height: 16, color: 'var(--muted-foreground)' }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className={inputClass}
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', paddingInlineStart: '2.75rem' }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              {t('password')}
            </label>
            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2"
                style={{ width: 16, height: 16, color: 'var(--muted-foreground)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                maxLength={200}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', paddingInlineStart: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute end-3.5 top-1/2 -translate-y-1/2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff style={{ width: 16, height: 16, color: 'var(--muted-foreground)' }} /> : <Eye style={{ width: 16, height: 16, color: 'var(--muted-foreground)' }} />}
              </button>
            </div>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{t('passwordHint')}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              {t('confirmPassword')}
            </label>
            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2"
                style={{ width: 16, height: 16, color: 'var(--muted-foreground)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', paddingInlineStart: '2.75rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold shadow-lg shadow-[#C4622D]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} /> : t('create')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {t('hasAccount')}{' '}
          <Link href={`/${locale}/login`} className="font-semibold" style={{ color: '#C4622D' }}>
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
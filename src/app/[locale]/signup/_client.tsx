'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  User,
  UserCheck,
} from 'lucide-react'
import { useCustomerAuth } from '@/components/providers/CustomerAuthProvider'
import { SilkBackground } from '@/components/shared/SilkBackground'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { BackButton } from '@/components/shared/PageNavigation'
import { useTranslations } from 'next-intl'

interface SignupPageProps {
  params: Promise<{ locale: string }>
}

export function CustomerSignupPageClient({ params }: SignupPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'
  const tAuth = useTranslations('auth')
  const { refreshCustomer, continueAsGuest } = useCustomerAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const homeLabel =
    locale === 'ar' ? 'المتجر' : locale === 'fr' ? 'Boutique' : 'Store'

  const t = (key: string): string => {
    const map: Record<string, [string, string, string]> = {
      subtitle: [
        'أنشئ حسابك لتتبع طلباتك وإدارة ملفك بسهولة.',
        'Créez votre compte pour suivre vos commandes facilement.',
        'Create your account to manage orders and profile easily.',
      ],
      nameLabel: ['الاسم الكامل', 'Nom complet', 'Full name'],
      namePlaceholder: ['اسمك الكامل', 'Votre nom complet', 'Your full name'],
      emailLabel: ['البريد الإلكتروني', 'Email', 'Email'],
      emailPlaceholder: ['you@example.com', 'vous@exemple.com', 'you@example.com'],
      passwordLabel: ['كلمة المرور', 'Mot de passe', 'Password'],
      confirmPasswordLabel: ['تأكيد كلمة المرور', 'Confirmer le mot de passe', 'Confirm password'],
      passwordPlaceholder: ['••••••••••', '••••••••••', '••••••••••'],
      createBtn: ['إنشاء الحساب', 'Créer le compte', 'Create Account'],
      creating: ['جاري إنشاء الحساب...', 'Création...', 'Creating account...'],
      or: ['أو', 'OU', 'OR'],
      signIn: ['تسجيل الدخول', 'Se connecter', 'Sign In'],
      continueAsGuest: ['الدخول كضيف', 'Continuer en invité', 'Continue as Guest'],
      protectedSession: [
        'جلسة محمية · دار ثريا المغربي',
        'Session protégée · Thuraya Al-Maghribi',
        'Protected session · Thuraya Al-Maghribi',
      ],
      passwordMismatch: [
        'كلمتا المرور غير متطابقتين.',
        'Les mots de passe ne correspondent pas.',
        'Passwords do not match.',
      ],
      passwordShort: [
        'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
        'Le mot de passe doit comporter au moins 8 caractères.',
        'Password must be at least 8 characters.',
      ],
      errorGeneric: [
        'تعذر إنشاء الحساب. يرجى المحاولة مجدداً.',
        'Impossible de créer le compte. Veuillez réessayer.',
        'Unable to create account. Please try again.',
      ],
    }
    const entry = map[key]
    if (!entry) return key
    return locale === 'ar' ? entry[0] : locale === 'fr' ? entry[1] : entry[2]
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    if (password.length < 8) {
      setErrorMsg(t('passwordShort'))
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg(t('passwordMismatch'))
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/customer/auth/signup', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || t('errorGeneric'))
      }

      await refreshCustomer()
      router.push(`/${locale}/account`)
      router.refresh()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t('errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative min-h-dvh w-full flex flex-col justify-between px-4 py-3.5 sm:px-6 sm:py-5 overflow-x-hidden"
    >
      <SilkBackground />

      {/* Top Auth Toolbar */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-2.5 max-w-[72.5rem] w-full mx-auto">
        <div className="flex flex-wrap items-center gap-2">
          <BackButton href={`/${locale}`} locale={locale} label={homeLabel} className="!h-10" />

          <nav
            aria-label="Auth mode switcher"
            className="inline-flex items-center gap-1 p-1 h-10 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]/95"
          >
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center justify-center h-8 px-3 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors whitespace-nowrap shrink-0"
            >
              {tAuth('loginAction')}
            </Link>
            <span
              aria-current="page"
              className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-[var(--accent)] text-white text-xs font-bold shadow-sm whitespace-nowrap shrink-0"
            >
              {tAuth('createAccountAction')}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-2 ms-auto">
          <ThemeSwitcher />
          <LanguageSwitcher locale={locale} align={isRTL ? 'start' : 'end'} />
        </div>
      </header>

      {/* Main Centered Signup Card */}
      <main className="relative z-10 w-full my-auto py-3 sm:py-4">
        <div className="w-full max-w-[26.875rem] mx-auto">
          <section className="relative w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]/96 shadow-[var(--shadow-modal)] text-[var(--text-primary)]">
            {/* Subtle Moroccan top brass hairline */}
            <div
              aria-hidden="true"
              className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--gold)]/60 to-transparent"
            />

            <div className="px-5 py-4 sm:px-6 sm:py-5">
              {/* Header */}
              <header className="mb-3.5 text-center flex flex-col items-center">
                <div className="w-12 h-14 rounded-t-[999px] rounded-b-xl border border-[var(--gold-ring)] bg-[var(--bg-subtle)] p-1 mb-2.5 shadow-[var(--shadow-sm)] overflow-hidden">
                  <div className="relative w-full h-full rounded-t-[999px] rounded-b-lg overflow-hidden">
                    <Image
                      src="/images/brand/logo-icon.png"
                      alt="Thuraya Al-Maghribi"
                      fill
                      sizes="48px"
                      priority
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </div>
                </div>

                <h1
                  className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] leading-tight mb-1"
                  style={{
                    fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                    letterSpacing: isRTL ? 'normal' : '0.03em',
                  }}
                >
                  {isRTL ? 'ثريا المغربي' : 'THURAYA'}
                </h1>

                <p className="text-xs text-[var(--text-muted)] max-w-[18.75rem] leading-relaxed m-0">
                  {t('subtitle')}
                </p>
              </header>

              {/* Error Message */}
              {errorMsg && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-3 px-3.5 py-2 rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] flex items-center gap-2.5 text-start"
                >
                  <AlertCircle className="w-4 h-4 text-[var(--error)] flex-shrink-0" aria-hidden="true" />
                  <p className="text-xs font-semibold text-[var(--error)] leading-snug m-0">
                    {errorMsg}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-2.5">
                {/* Full Name */}
                <div className="text-start">
                  <label
                    htmlFor="signup-name"
                    className="block text-xs font-bold text-[var(--text-secondary)] mb-1"
                  >
                    {t('nameLabel')}
                  </label>
                  <div className="relative">
                    <User
                      className="pointer-events-none w-4 h-4 text-[var(--text-muted)] absolute top-1/2 -translate-y-1/2 start-3.5"
                      aria-hidden="true"
                    />
                    <input
                      id="signup-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('namePlaceholder')}
                      className="w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] text-sm ps-10 pe-3.5 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="text-start">
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-bold text-[var(--text-secondary)] mb-1"
                  >
                    {t('emailLabel')}
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none w-4 h-4 text-[var(--text-muted)] absolute top-1/2 -translate-y-1/2 start-3.5"
                      aria-hidden="true"
                    />
                    <input
                      id="signup-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      dir="ltr"
                      className={`w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] transition-colors ${
                        isRTL ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="text-start">
                  <label
                    htmlFor="signup-password"
                    className="block text-xs font-bold text-[var(--text-secondary)] mb-1"
                  >
                    {t('passwordLabel')}
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      className="pointer-events-none w-4 h-4 text-[var(--text-muted)] absolute top-1/2 -translate-y-1/2 start-3.5"
                      aria-hidden="true"
                    />
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      dir="ltr"
                      className={`w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] text-sm px-10 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] transition-colors ${
                        isRTL ? 'text-right' : 'text-left'
                      }`}
                      style={{ letterSpacing: showPassword ? 'normal' : '0.1em' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-0 end-0 w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] bg-transparent border-0 cursor-pointer transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="text-start">
                  <label
                    htmlFor="signup-confirm-password"
                    className="block text-xs font-bold text-[var(--text-secondary)] mb-1"
                  >
                    {t('confirmPasswordLabel')}
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      className="pointer-events-none w-4 h-4 text-[var(--text-muted)] absolute top-1/2 -translate-y-1/2 start-3.5"
                      aria-hidden="true"
                    />
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      dir="ltr"
                      className={`w-full h-10 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] text-sm px-10 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)] transition-colors ${
                        isRTL ? 'text-right' : 'text-left'
                      }`}
                      style={{ letterSpacing: showConfirmPassword ? 'normal' : '0.1em' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-0 end-0 w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] bg-transparent border-0 cursor-pointer transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full h-10 rounded-xl justify-center text-sm font-bold !mt-3.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('creating')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('createBtn')}</span>
                      {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-3.5 text-xs text-[var(--text-muted)]">
                <span className="h-px flex-1 bg-[var(--border)]" />
                <span className="font-medium">{t('or')}</span>
                <span className="h-px flex-1 bg-[var(--border)]" />
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href={`/${locale}/login`}
                  className="h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-ring)] hover:text-[var(--accent)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4 text-[var(--accent)] flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{t('signIn')}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    continueAsGuest()
                    router.push(`/${locale}`)
                  }}
                  className="h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-ring)] hover:text-[var(--accent)] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <UserCheck className="w-4 h-4 text-[var(--gold)] flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{t('continueAsGuest')}</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-center gap-2 px-6 py-2.5 border-t border-[var(--border)] bg-[var(--bg-subtle)] text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--gold)] flex-shrink-0" aria-hidden="true" />
              <span>{t('protectedSession')}</span>
            </footer>
          </section>
        </div>
      </main>

      <div className="h-1 shrink-0" aria-hidden="true" />
    </div>
  )
}

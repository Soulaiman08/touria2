'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react'
import { useCustomerAuth } from '@/components/providers/CustomerAuthProvider'

interface CustomerLoginCardProps {
  locale: string
  isModal?: boolean
  onClose?: () => void
  onSuccess?: () => void
}

export function CustomerLoginCard({
  locale,
  isModal = false,
  onClose,
  onSuccess,
}: CustomerLoginCardProps) {
  const router = useRouter()
  const isRTL = locale === 'ar'
  const { refreshCustomer, continueAsGuest } = useCustomerAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const t = (key: string): string => {
    const map: Record<string, [string, string, string]> = {
      welcomeSubtitle: [
        'سجّل الدخول لمتابعة طلباتك وإدارة حسابك بسهولة.',
        'Connectez-vous pour suivre vos commandes et gérer votre compte.',
        'Sign in to track your orders and manage your account easily.',
      ],
      emailLabel: ['البريد الإلكتروني', 'Email', 'Email'],
      emailPlaceholder: ['you@example.com', 'vous@exemple.com', 'you@example.com'],
      passwordLabel: ['كلمة المرور', 'Mot de passe', 'Password'],
      passwordPlaceholder: ['••••••••••', '••••••••••', '••••••••••'],
      rememberMe: ['تذكرني', 'Se souvenir de moi', 'Remember me'],
      signInBtn: ['تسجيل الدخول', 'Se connecter', 'Sign In'],
      signingIn: ['جاري التحقق...', 'Connexion...', 'Signing in...'],
      or: ['أو', 'OU', 'OR'],
      createAccount: ['إنشاء حساب', 'Créer un compte', 'Create Account'],
      continueAsGuest: ['الدخول كضيف', 'Continuer en invité', 'Continue as Guest'],
      protectedSession: [
        'جلسة محمية · دار ثريا المغربي',
        'Session protégée · Thuraya Al-Maghribi',
        'Protected session · Thuraya Al-Maghribi',
      ],
      errorGeneric: [
        'بيانات الدخول غير صحيحة. يرجى المحاولة مجدداً.',
        'Identifiants incorrects. Veuillez réessayer.',
        'Invalid credentials. Please try again.',
      ],
      errorServer: [
        'خطأ في الخادم. يرجى المحاولة لاحقاً.',
        'Erreur serveur. Veuillez réessayer plus tard.',
        'Internal server error. Please try again later.',
      ],
      closeAria: ['إغلاق', 'Fermer', 'Close'],
    }
    const entry = map[key]
    if (!entry) return key
    return locale === 'ar' ? entry[0] : locale === 'fr' ? entry[1] : entry[2]
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/customer/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 500 || res.status === 503) {
          throw new Error(t('errorServer'))
        }
        throw new Error(data.error || t('errorGeneric'))
      }

      await refreshCustomer()

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/${locale}/account`)
        router.refresh()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('errorGeneric')
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGuestClick = () => {
    continueAsGuest()
    if (onClose) {
      onClose()
    } else {
      router.push(`/${locale}`)
      router.refresh()
    }
  }

  const handleSignupClick = () => {
    if (onClose) {
      onClose()
    }
    router.push(`/${locale}/signup`)
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="w-full max-w-[26.875rem] mx-auto">
      <section className="relative w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]/96 shadow-[var(--shadow-modal)] text-[var(--text-primary)]">
        {/* Subtle Moroccan top brass hairline */}
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--gold)]/60 to-transparent"
        />

        {/* Close button for Modal */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t('closeAria')}
            className="absolute top-3.5 end-3.5 z-20 flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-ring)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ── Card Body ── */}
        <div className="px-5 py-5 sm:px-6 sm:py-5">
          {/* ── Header ── */}
          <header className="mb-4 text-center flex flex-col items-center">
            {/* Moroccan Arch Emblem Frame */}
            <div className="w-14 h-16 rounded-t-[999px] rounded-b-xl border border-[var(--gold-ring)] bg-[var(--bg-subtle)] p-1 mb-2.5 shadow-[var(--shadow-sm)] overflow-hidden">
              <div className="relative w-full h-full rounded-t-[999px] rounded-b-lg overflow-hidden">
                <Image
                  src="/images/brand/logo-icon.png"
                  alt="Thuraya Al-Maghribi"
                  fill
                  sizes="56px"
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
              {t('welcomeSubtitle')}
            </p>
          </header>

          {/* ── Error Message ── */}
          {errorMsg && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-3.5 px-3.5 py-2 rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] flex items-center gap-2.5 text-start"
            >
              <AlertCircle className="w-4 h-4 text-[var(--error)] flex-shrink-0" aria-hidden="true" />
              <p className="text-xs font-semibold text-[var(--error)] leading-snug m-0">
                {errorMsg.includes('Internal') || errorMsg.includes('خادم') || errorMsg.includes('serveur')
                  ? t('errorServer')
                  : t('errorGeneric')}
              </p>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleLogin} className="space-y-3">
            {/* Email */}
            <div className="text-start">
              <label
                htmlFor="customer-email"
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
                  id="customer-email"
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
                htmlFor="customer-password"
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
                  id="customer-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
                />
                <span>{t('rememberMe')}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-10 rounded-xl justify-center text-sm font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('signingIn')}</span>
                </>
              ) : (
                <>
                  <span>{t('signInBtn')}</span>
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-4 text-xs text-[var(--text-muted)]">
            <span className="h-px flex-1 bg-[var(--border)]" />
            <span className="font-medium">{t('or')}</span>
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>

          {/* ── Secondary Actions ── */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleSignupClick}
              className="h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-ring)] hover:text-[var(--accent)] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 text-[var(--accent)] flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{t('createAccount')}</span>
            </button>

            <button
              type="button"
              onClick={handleGuestClick}
              className="h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-ring)] hover:text-[var(--accent)] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4 text-[var(--gold)] flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{t('continueAsGuest')}</span>
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="flex items-center justify-center gap-2 px-6 py-2.5 border-t border-[var(--border)] bg-[var(--bg-subtle)] text-xs text-[var(--text-muted)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--gold)] flex-shrink-0" aria-hidden="true" />
          <span>{t('protectedSession')}</span>
        </footer>
      </section>
    </div>
  )
}

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
        'جلسة محمية · ثريا المغربي',
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
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="dark"
      style={{
        width: '100%',
        maxWidth: '460px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <section
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          borderRadius: '18px',
          border: '1px solid rgba(212, 174, 120, 0.25)',
          backgroundImage: 'linear-gradient(155deg, rgba(34, 23, 16, 0.98) 0%, rgba(20, 13, 9, 0.99) 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
          color: '#FAF6F0',
        }}
      >
        {/* Warm Terracotta & Brass ambient glow */}
        <div
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            height: '220px',
            borderRadius: '50%',
            backgroundColor: 'rgba(184, 84, 40, 0.16)',
            filter: 'blur(80px)',
          }}
          aria-hidden="true"
        />

        {/* Close button for Modal */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t('closeAria')}
            style={{
              position: 'absolute',
              top: '16px',
              [isRTL ? 'left' : 'right']: '16px',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: '1px solid rgba(212, 174, 120, 0.24)',
              backgroundColor: 'rgba(20, 13, 9, 0.72)',
              color: '#E6D5BF',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}

        {/* ── Card Body ── */}
        <div
          style={{
            position: 'relative',
            padding: '28px 24px 24px',
            boxSizing: 'border-box',
          }}
        >
          {/* ── HEADER ── */}
          <header
            style={{
              marginBottom: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Brand Medallion */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '1.5px solid rgba(212, 174, 120, 0.45)',
                background: '#140D09',
                marginBottom: '14px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              }}
            >
              <Image
                src="/images/brand/logo-icon.png"
                alt="Thuraya Al-Maghribi"
                width={60}
                height={60}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Brand name */}
            <h1
              style={{
                fontWeight: 800,
                color: '#FAF6F0',
                fontSize: '1.65rem',
                letterSpacing: isRTL ? 'normal' : '0.03em',
                lineHeight: 1.15,
                marginBottom: '8px',
                textAlign: 'center',
                fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
              }}
            >
              {isRTL ? 'ثريا المغربي' : 'THURAYA'}
            </h1>

            {/* Description */}
            <p
              style={{
                color: '#C7B6A2',
                fontSize: '13.5px',
                lineHeight: '1.6',
                maxWidth: '330px',
                margin: '0 auto',
                textAlign: 'center',
              }}
            >
              {t('welcomeSubtitle')}
            </p>
          </header>

          {/* ── ERROR MESSAGE ── */}
          {errorMsg && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                marginBottom: '20px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(248, 113, 113, 0.38)',
                backgroundColor: 'rgba(127, 29, 29, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              <AlertCircle style={{ width: '18px', height: '18px', color: '#FCA5A5', flexShrink: 0 }} aria-hidden="true" />
              <p
                style={{
                  fontWeight: 600,
                  color: '#FEE2E2',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  margin: 0,
                }}
              >
                {errorMsg.includes('Internal') || errorMsg.includes('خادم') || errorMsg.includes('serveur')
                  ? t('errorServer')
                  : t('errorGeneric')}
              </p>
            </div>
          )}

          {/* ── FORM ── */}
          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <div style={{ marginBottom: '16px', textAlign: isRTL ? 'right' : 'left' }}>
              <label
                htmlFor="customer-email"
                style={{
                  display: 'block',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#E6D5BF',
                  fontSize: '11px',
                  letterSpacing: '0.07em',
                  marginBottom: '8px',
                }}
              >
                {t('emailLabel')}
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <Mail
                  style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    [isRTL ? 'right' : 'left']: '14px',
                    width: '17px',
                    height: '17px',
                    color: '#A68E76',
                  }}
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
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '10px',
                    border: '1px solid rgba(212, 174, 120, 0.22)',
                    backgroundColor: 'rgba(20, 13, 9, 0.85)',
                    color: '#FAF6F0',
                    fontSize: '14px',
                    paddingLeft: isRTL ? '14px' : '44px',
                    paddingRight: isRTL ? '44px' : '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '14px', textAlign: isRTL ? 'right' : 'left' }}>
              <label
                htmlFor="customer-password"
                style={{
                  display: 'block',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#E6D5BF',
                  fontSize: '11px',
                  letterSpacing: '0.07em',
                  marginBottom: '8px',
                }}
              >
                {t('passwordLabel')}
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <LockKeyhole
                  style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    [isRTL ? 'right' : 'left']: '14px',
                    width: '17px',
                    height: '17px',
                    color: '#A68E76',
                  }}
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
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '10px',
                    border: '1px solid rgba(212, 174, 120, 0.22)',
                    backgroundColor: 'rgba(20, 13, 9, 0.85)',
                    color: '#FAF6F0',
                    fontSize: '14px',
                    letterSpacing: showPassword ? 'normal' : '0.12em',
                    paddingLeft: isRTL ? '46px' : '44px',
                    paddingRight: isRTL ? '44px' : '46px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    top: '0',
                    [isRTL ? 'left' : 'right']: '0',
                    width: '46px',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#A68E76',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: '17px', height: '17px' }} />
                  ) : (
                    <Eye style={{ width: '17px', height: '17px' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                color: '#C7B6A2',
                marginBottom: '4px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#D97A4A',
                    cursor: 'pointer',
                  }}
                />
                <span>{t('rememberMe')}</span>
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #B85428 0%, #D97A4A 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '18px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.72 : 1,
                boxShadow: '0 8px 22px rgba(184, 84, 40, 0.28)',
                transition: 'opacity 0.15s, transform 0.15s',
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: '17px',
                      height: '17px',
                      borderRadius: '50%',
                      border: '2px solid rgba(255, 255, 255, 0.35)',
                      borderTopColor: '#FFFFFF',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <span>{t('signingIn')}</span>
                </>
              ) : (
                <>
                  <span>{t('signInBtn')}</span>
                  {isRTL ? (
                    <ArrowLeft style={{ width: '17px', height: '17px' }} />
                  ) : (
                    <ArrowRight style={{ width: '17px', height: '17px' }} />
                  )}
                </>
              )}
            </button>
          </form>

          {/* ── OR Divider ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              color: '#A68E76',
              marginTop: '22px',
              marginBottom: '16px',
              gap: '12px',
            }}
          >
            <span style={{ height: '1px', flex: 1, backgroundColor: 'rgba(212, 174, 120, 0.2)' }} />
            <span style={{ letterSpacing: '0.06em' }}>{t('or')}</span>
            <span style={{ height: '1px', flex: 1, backgroundColor: 'rgba(212, 174, 120, 0.2)' }} />
          </div>

          {/* ── The Two Bottom Action Buttons ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
            }}
          >
            {/* Button 1: Create Account */}
            <button
              type="button"
              onClick={handleSignupClick}
              style={{
                height: '44px',
                borderRadius: '10px',
                border: '1px solid rgba(212, 174, 120, 0.24)',
                backgroundColor: 'rgba(20, 13, 9, 0.65)',
                color: '#FAF6F0',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              <UserPlus style={{ width: '16px', height: '16px', color: '#D4AE78' }} aria-hidden="true" />
              <span>{t('createAccount')}</span>
            </button>

            {/* Button 2: Continue as Guest */}
            <button
              type="button"
              onClick={handleGuestClick}
              style={{
                height: '44px',
                borderRadius: '10px',
                border: '1px solid rgba(212, 174, 120, 0.24)',
                backgroundColor: 'rgba(20, 13, 9, 0.65)',
                color: '#E6D5BF',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              <UserCheck style={{ width: '16px', height: '16px', color: '#C7B6A2' }} aria-hidden="true" />
              <span>{t('continueAsGuest')}</span>
            </button>
          </div>
        </div>
        {/* ── END Card Body ── */}

        {/* ── FOOTER ── */}
        <footer
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid rgba(212, 174, 120, 0.16)',
            fontSize: '12px',
            color: '#A68E76',
            gap: '8px',
            padding: '13px 24px',
            backgroundColor: 'rgba(20, 13, 9, 0.72)',
          }}
        >
          <ShieldCheck style={{ width: '14px', height: '14px', color: '#D4AE78', flexShrink: 0 }} aria-hidden="true" />
          <span>{t('protectedSession')}</span>
        </footer>
      </section>
    </div>
  )
}

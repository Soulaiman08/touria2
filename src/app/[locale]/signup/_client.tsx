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

  const t = (key: string): string => {
    const map: Record<string, [string, string, string]> = {
      title: ['إنشاء حساب جديد', 'Créer un compte', 'Create account'],
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
        'جلسة محمية · ثريا المغربي',
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
    <>
      <SilkBackground />
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="dark no-scrollbar"
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '70px 16px 20px 16px',
          overflowY: 'auto',
          boxSizing: 'border-box',
          zIndex: 1,
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 16px',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="auth-lang-switcher"
            style={{
              '--border': 'rgba(212, 174, 120, 0.25)',
              '--text-secondary': '#E6D5BF',
              '--bg-subtle': 'rgba(20, 13, 9, 0.65)',
              '--card': '#1E140E',
              '--card-bg': '#1E140E',
              '--foreground': '#FAF6F0',
              '--text-primary': '#FAF6F0',
              '--shadow-elevated': '0 10px 32px rgba(0, 0, 0, 0.5)',
            } as React.CSSProperties}
          >
            <LanguageSwitcher locale={locale} align={isRTL ? 'end' : 'start'} />
          </div>

          <Link
            href={`/${locale}/login`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '40px',
              padding: '0 16px',
              borderRadius: '10px',
              border: '1px solid rgba(212, 174, 120, 0.25)',
              backgroundColor: 'rgba(20, 13, 9, 0.65)',
              color: '#FAF6F0',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            <LogIn style={{ width: '16px', height: '16px', color: '#D4AE78' }} aria-hidden="true" />
            <span>{tAuth('loginAction')}</span>
          </Link>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '460px',
            margin: 'auto',
            borderRadius: '18px',
          }}
        >
          {/* Signup Card */}
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
            {/* Ambient glow */}
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
                  marginBottom: '22px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
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
                  {t('subtitle')}
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
                    {errorMsg}
                  </p>
                </div>
              )}

              {/* ── FORM ── */}
              <form onSubmit={handleSignup}>
                {/* Name Field */}
                <div style={{ marginBottom: '14px', textAlign: isRTL ? 'right' : 'left' }}>
                  <label
                    htmlFor="signup-name"
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#E6D5BF',
                      fontSize: '11px',
                      letterSpacing: '0.07em',
                      marginBottom: '7px',
                    }}
                  >
                    {t('nameLabel')}
                  </label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <User
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
                      id="signup-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('namePlaceholder')}
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
                      }}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div style={{ marginBottom: '14px', textAlign: isRTL ? 'right' : 'left' }}>
                  <label
                    htmlFor="signup-email"
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#E6D5BF',
                      fontSize: '11px',
                      letterSpacing: '0.07em',
                      marginBottom: '7px',
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
                      id="signup-email"
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
                      }}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: '14px', textAlign: isRTL ? 'right' : 'left' }}>
                  <label
                    htmlFor="signup-password"
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#E6D5BF',
                      fontSize: '11px',
                      letterSpacing: '0.07em',
                      marginBottom: '7px',
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
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
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

                {/* Confirm Password Field */}
                <div style={{ marginBottom: '18px', textAlign: isRTL ? 'right' : 'left' }}>
                  <label
                    htmlFor="signup-confirm-password"
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#E6D5BF',
                      fontSize: '11px',
                      letterSpacing: '0.07em',
                      marginBottom: '7px',
                    }}
                  >
                    {t('confirmPasswordLabel')}
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
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      style={{
                        width: '100%',
                        height: '46px',
                        borderRadius: '10px',
                        border: '1px solid rgba(212, 174, 120, 0.22)',
                        backgroundColor: 'rgba(20, 13, 9, 0.85)',
                        color: '#FAF6F0',
                        fontSize: '14px',
                        letterSpacing: showConfirmPassword ? 'normal' : '0.12em',
                        paddingLeft: isRTL ? '46px' : '44px',
                        paddingRight: isRTL ? '44px' : '46px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff style={{ width: '17px', height: '17px' }} />
                      ) : (
                        <Eye style={{ width: '17px', height: '17px' }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
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
                    marginTop: '14px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.72 : 1,
                    boxShadow: '0 8px 22px rgba(184, 84, 40, 0.28)',
                    transition: 'opacity 0.15s',
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
                      <span>{t('creating')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('createBtn')}</span>
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
                {/* Button 1: Sign In */}
                <Link
                  href={`/${locale}/login`}
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
                    textDecoration: 'none',
                  }}
                >
                  <LogIn style={{ width: '16px', height: '16px', color: '#D4AE78' }} aria-hidden="true" />
                  <span>{t('signIn')}</span>
                </Link>

                {/* Button 2: Continue as Guest */}
                <button
                  type="button"
                  onClick={() => {
                    continueAsGuest()
                    router.push(`/${locale}`)
                  }}
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
      </div>
    </>
  )
}

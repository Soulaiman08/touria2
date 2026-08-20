'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  Sparkles,
  User,
  UserCheck,
  UserPlus,
} from 'lucide-react'
import { useCustomerAuth } from '@/components/providers/CustomerAuthProvider'

interface SignupPageProps {
  params: Promise<{ locale: string }>
}

export default function CustomerSignupPage({ params }: SignupPageProps) {
  const { locale } = use(params)
  const router = useRouter()
  const isRTL = locale === 'ar'
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
      or: ['OR', 'OU', 'OR'],
      signIn: ['تسجيل الدخول', 'Se connecter', 'Sign In'],
      continueAsGuest: ['الدخول كضيف', 'Continuer en invité', 'Continue as Guest'],
      protectedSession: [
        'Protected session · Authorized personnel only',
        'Session protégée · Thuraya Al Maghribi',
        'Protected session · Thuraya Al Maghribi',
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
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="dark"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: '#140a03',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Background pattern */}
      <div className="pattern-moroccan pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden="true"
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '480px',
          margin: 'auto',
        }}
      >
        {/* Signup Card */}
        <section
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '12px',
            border: '1px solid #4d4b47',
            backgroundImage: 'linear-gradient(145deg, rgba(26, 28, 30, 0.98), rgba(13, 15, 17, 0.98))',
            boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
            color: '#f4f4f5',
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
              backgroundColor: 'rgba(200, 139, 18, 0.12)',
              filter: 'blur(80px)',
            }}
            aria-hidden="true"
          />

          {/* ── Card Body ── */}
          <div
            style={{
              position: 'relative',
              padding: '24px',
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
              {/* Logo icon */}
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(145deg, #ffc51b 0%, #f39a06 100%)',
                  color: '#090909',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 7px 22px rgba(245,158,11,0.34)',
                }}
              >
                <Sparkles style={{ width: '28px', height: '28px', strokeWidth: 2.2 }} />
              </div>

              {/* Brand name */}
              <h1
                style={{
                  fontWeight: 700,
                  color: '#ffffff',
                  fontSize: '1.75rem',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  marginBottom: '12px',
                  textAlign: 'center',
                }}
              >
                THURAYA
              </h1>

              {/* Description */}
              <p
                style={{
                  color: '#b7b7bd',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  maxWidth: '340px',
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
                  marginBottom: '24px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #9b3034',
                  backgroundColor: 'rgba(53, 23, 26, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: '2px solid #ff414b',
                    color: '#ff414b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertCircle style={{ width: '14px', height: '14px', strokeWidth: 3 }} aria-hidden="true" />
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      fontWeight: 700,
                      color: '#f1eef0',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      marginBottom: '2px',
                    }}
                  >
                    {errorMsg}
                  </p>
                </div>
              </div>
            )}

            {/* ── FORM ── */}
            <form onSubmit={handleSignup}>
              {/* Name Field */}
              <div style={{ marginBottom: '16px', textAlign: isRTL ? 'right' : 'left' }}>
                <label
                  htmlFor="signup-name"
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#c6c8cd',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    marginBottom: '8px',
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
                      [isRTL ? 'right' : 'left']: '16px',
                      width: '18px',
                      height: '18px',
                      color: '#8a7d73',
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
                      height: '48px',
                      borderRadius: '8px',
                      border: '1px solid #55483a',
                      backgroundColor: 'rgba(17, 19, 21, 0.85)',
                      color: '#f5f4f2',
                      fontSize: '14px',
                      paddingLeft: isRTL ? '16px' : '46px',
                      paddingRight: isRTL ? '46px' : '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div style={{ marginBottom: '16px', textAlign: isRTL ? 'right' : 'left' }}>
                <label
                  htmlFor="signup-email"
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#c6c8cd',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
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
                      [isRTL ? 'right' : 'left']: '16px',
                      width: '18px',
                      height: '18px',
                      color: '#8a7d73',
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
                      height: '48px',
                      borderRadius: '8px',
                      border: '1px solid #55483a',
                      backgroundColor: 'rgba(17, 19, 21, 0.85)',
                      color: '#f5f4f2',
                      fontSize: '14px',
                      paddingLeft: isRTL ? '16px' : '46px',
                      paddingRight: isRTL ? '46px' : '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '16px', textAlign: isRTL ? 'right' : 'left' }}>
                <label
                  htmlFor="signup-password"
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#c6c8cd',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
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
                      [isRTL ? 'right' : 'left']: '16px',
                      width: '18px',
                      height: '18px',
                      color: '#8a7d73',
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
                      height: '48px',
                      borderRadius: '8px',
                      border: '1px solid #55483a',
                      backgroundColor: 'rgba(17, 19, 21, 0.85)',
                      color: '#f5f4f2',
                      fontSize: '14px',
                      letterSpacing: showPassword ? 'normal' : '0.12em',
                      paddingLeft: isRTL ? '48px' : '46px',
                      paddingRight: isRTL ? '46px' : '48px',
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
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8a7d73',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: '18px', height: '18px' }} />
                    ) : (
                      <Eye style={{ width: '18px', height: '18px' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div style={{ marginBottom: '20px', textAlign: isRTL ? 'right' : 'left' }}>
                <label
                  htmlFor="signup-confirm-password"
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#c6c8cd',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    marginBottom: '8px',
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
                      [isRTL ? 'right' : 'left']: '16px',
                      width: '18px',
                      height: '18px',
                      color: '#8a7d73',
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
                      height: '48px',
                      borderRadius: '8px',
                      border: '1px solid #55483a',
                      backgroundColor: 'rgba(17, 19, 21, 0.85)',
                      color: '#f5f4f2',
                      fontSize: '14px',
                      letterSpacing: showConfirmPassword ? 'normal' : '0.12em',
                      paddingLeft: isRTL ? '48px' : '46px',
                      paddingRight: isRTL ? '46px' : '48px',
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
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8a7d73',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff style={{ width: '18px', height: '18px' }} />
                    ) : (
                      <Eye style={{ width: '18px', height: '18px' }} />
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
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f7a307 0%, #ffb30d 100%)',
                  color: '#080808',
                  fontWeight: 700,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '16px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 10px 22px rgba(245,158,11,0.22)',
                  transition: 'all 0.15s',
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid rgba(8, 8, 8, 0.3)',
                        borderTopColor: '#080808',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    <span>{t('creating')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('createBtn')}</span>
                    {isRTL ? (
                      <ArrowLeft style={{ width: '18px', height: '18px' }} />
                    ) : (
                      <ArrowRight style={{ width: '18px', height: '18px' }} />
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
                color: '#a5a4aa',
                marginTop: '24px',
                marginBottom: '16px',
                gap: '12px',
              }}
            >
              <span style={{ height: '1px', flex: 1, backgroundColor: '#48494b' }} />
              <span style={{ letterSpacing: '0.06em' }}>{t('or')}</span>
              <span style={{ height: '1px', flex: 1, backgroundColor: '#48494b' }} />
            </div>

            {/* ── The Two Bottom Action Buttons ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              {/* Button 1: Sign In */}
              <Link
                href={`/${locale}/login`}
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  border: '1px solid #55575a',
                  backgroundColor: 'rgba(17, 19, 21, 0.6)',
                  color: '#d0d0d5',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                <LogIn style={{ width: '17px', height: '17px', color: '#f39a06' }} aria-hidden="true" />
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
                  height: '48px',
                  borderRadius: '8px',
                  border: '1px solid #55575a',
                  backgroundColor: 'rgba(17, 19, 21, 0.6)',
                  color: '#d0d0d5',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <UserCheck style={{ width: '17px', height: '17px', color: '#9ca3af' }} aria-hidden="true" />
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
              borderTop: '1px solid #26282a',
              fontSize: '12px',
              color: '#8f9097',
              gap: '8px',
              padding: '14px 24px',
              backgroundColor: 'rgba(13, 15, 17, 0.6)',
            }}
          >
            <ShieldCheck style={{ width: '14px', height: '14px', flexShrink: 0 }} aria-hidden="true" />
            <span>{t('protectedSession')}</span>
          </footer>
        </section>
      </div>
    </div>
  )
}
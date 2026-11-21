'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useAdminI18n } from '../providers/AdminI18nContext'
import { AdminLanguageSwitcher } from '../ui/AdminLanguageSwitcher'

export function AdminLoginClient({ devPreviewEnabled = false }: { devPreviewEnabled?: boolean }) {
  const { tr, dir, isRTL, locale } = useAdminI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.error ||
            tr('تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.', 'Unable to sign in. Please try again later.')
        )
      }

      router.push('/control-panel-ss7')
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : tr('تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.', 'Unable to sign in. Please try again later.')
      setErrorMsg(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      dir={dir}
      className="admin-shell dark relative flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-[#140a03] text-[#f4f4f5] px-4 py-6"
      style={{
        fontFamily: isRTL
          ? 'var(--font-arabic), system-ui, sans-serif'
          : 'var(--font-sans), system-ui, sans-serif',
      }}
    >
      {/* Background pattern */}
      <div className="pattern-moroccan pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(0,0,0,0.45)_100%)]"
        aria-hidden="true"
      />

      {/* Login Card */}
      <section className="relative w-full max-w-[460px] overflow-hidden rounded-2xl border border-[#4d4b47] bg-gradient-to-br from-[#1a1c1e]/98 to-[#0d0f11]/98 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-[#c88b12]/10 blur-[80px]"
          aria-hidden="true"
        />

        <div className="relative p-6 sm:p-7">
          {/* Top Language Bar */}
          <div className="flex items-center justify-end mb-4">
            <AdminLanguageSwitcher />
          </div>

          {/* ── HEADER ── */}
          <header className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc51b] to-[#f39a06] text-[#090909] shadow-[0_7px_22px_rgba(245,158,11,0.34)]">
              <Sparkles className="h-7 w-7 stroke-[2.2]" />
            </div>

            <div className="mb-2.5 flex items-center justify-center gap-2.5">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-[#f4f2ed] leading-none">
                {tr('ثريا', 'THURAYA')}
              </h1>
              <span className="rounded-full border border-[#b77807] bg-[#9b6207]/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[#f8ab0c]">
                {tr('الإدارة', 'ADMIN')}
              </span>
            </div>

            <p className="mx-auto max-w-[330px] text-sm leading-relaxed text-[#b7b7bd]">
              {tr(
                'سجّل الدخول للوصول إلى لوحة التحكم وإدارة المنتجات ومتابعة إحصائيات المتجر.',
                'Sign in to access your admin portal, manage products, and view store analytics.'
              )}
            </p>
          </header>

          {/* ── DEV PREVIEW SHORTCUT (Development without DB/JWT only) ── */}
          {devPreviewEnabled && (
            <div className="mb-5 rounded-xl border border-[#b77807]/50 bg-[#9b6207]/15 p-3.5">
              <p className="mb-2.5 text-center text-xs leading-relaxed text-[#f4f2ed]">
                {tr(
                  'وضع المعاينة مفعّل (بدون قاعدة بيانات). افتح لوحة التحكم مباشرة لمعاينة الواجهة:',
                  'Preview mode active (local mock data without database). Open the dashboard directly to inspect the UI:'
                )}
              </p>
              <Link
                href="/control-panel-ss7"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#f7a307] to-[#ffb30d] text-sm font-bold text-[#080808] shadow-[0_8px_18px_rgba(245,158,11,0.22)] transition-opacity hover:opacity-95"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{tr('فتح معاينة لوحة التحكم', 'Open Admin UI Preview')}</span>
              </Link>
            </div>
          )}

          {/* ── ERROR MESSAGE ── */}
          {errorMsg && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 flex items-center gap-3 rounded-xl border border-[#9b3034] bg-[#35171a]/75 p-3.5 text-start"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#ff414b] text-[#ff414b]">
                <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="mb-0.5 text-[13px] font-bold text-[#f1eef0]">
                  {errorMsg.includes('Internal')
                    ? tr('خطأ داخلي في الخادم', 'Internal server error')
                    : tr('تعذر تسجيل الدخول', 'Unable to sign in')}
                </p>
                <p className="text-xs leading-relaxed text-[#c5b8bc]">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* ── FORM ── */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#c6c8cd]"
              >
                {tr('البريد الإلكتروني للمدير', 'Admin Email')}
              </label>
              <div className="group relative">
                <Mail
                  className="pointer-events-none absolute start-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8a7d73] transition-colors group-focus-within:text-[#eda30b]"
                  aria-hidden="true"
                />
                <input
                  id="admin-email"
                  type="email"
                  dir="ltr"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@thuraya.com"
                  className="h-12 w-full rounded-xl border border-[#55483a] bg-[#0b0b0e] ps-11 pe-4 text-sm text-[#f5f4f2] outline-none transition-colors placeholder:text-[#71717a] hover:border-[#775d3a] focus:border-[#e19a0b] focus:ring-2 focus:ring-[#e19a0b]/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#c6c8cd]"
              >
                {tr('كلمة المرور', 'Password')}
              </label>
              <div className="group relative">
                <LockKeyhole
                  className="pointer-events-none absolute start-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8a7d73] transition-colors group-focus-within:text-[#eda30b]"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="h-12 w-full rounded-xl border border-[#55483a] bg-[#0b0b0e] ps-11 pe-12 text-sm tracking-widest text-[#f5f4f2] outline-none transition-colors placeholder:text-[#71717a] hover:border-[#775d3a] focus:border-[#e19a0b] focus:ring-2 focus:ring-[#e19a0b]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-0 top-0 flex h-12 w-12 items-center justify-center rounded-e-xl text-[#948b86] transition-colors hover:text-[#f3a40b] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e19a0b] cursor-pointer"
                  aria-label={
                    showPassword
                      ? tr('إخفاء كلمة المرور', 'Hide password')
                      : tr('إظهار كلمة المرور', 'Show password')
                  }
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#f7a307] to-[#ffb30d] text-[15px] font-bold text-[#080808] shadow-[0_10px_22px_rgba(245,158,11,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(245,158,11,0.32)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-[#080808]/30 border-t-[#080808]" />
                  <span>{tr('جاري التحقق...', 'Authenticating...')}</span>
                </>
              ) : (
                <>
                  <span>{tr('تسجيل الدخول إلى لوحة التحكم', 'Sign In to Dashboard')}</span>
                  <ArrowIcon className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* ── OR Divider ── */}
          <div className="my-5 flex items-center gap-3 text-xs text-[#a5a4aa]">
            <span className="h-px flex-1 bg-[#48494b]" />
            <span>{tr('أو', 'OR')}</span>
            <span className="h-px flex-1 bg-[#48494b]" />
          </div>

          {/* ── Return to Store ── */}
          <button
            type="button"
            onClick={() => router.push(`/${locale}`)}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#55575a] text-sm font-medium text-[#d0d0d5] transition-colors hover:border-[#a77d37] hover:text-[#f0b032] focus:outline-none focus:ring-2 focus:ring-[#e19a0b] cursor-pointer"
          >
            <ShieldCheck className="h-[18px] w-[18px]" aria-hidden="true" />
            <span>{tr('العودة إلى المتجر', 'Return to Store')}</span>
          </button>
        </div>

        {/* ── FOOTER ── */}
        <footer className="relative flex items-center justify-center gap-2 border-t border-[#26282a] px-6 py-4 text-xs text-[#8f9097]">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{tr('جلسة محمية · للمخولين فقط', 'Protected session · Authorized personnel only')}</span>
        </footer>
      </section>
    </div>
  )
}

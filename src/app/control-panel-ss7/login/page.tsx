'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

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
        throw new Error(data.error || 'Unable to sign in. Please try again later.')
      }

      router.push('/control-panel-ss7')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to sign in. Please try again later.'
      setErrorMsg(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      dir="auto"
      className="dark relative flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-[#140a03] text-[#f4f4f5]"
      style={{ padding: '20px 16px' }}
    >
      {/* Background pattern */}
      <div className="pattern-moroccan pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(0,0,0,0.42)_100%)]" aria-hidden="true" />

      {/* Login Card */}
      <section
        className="relative w-full overflow-hidden rounded-xl border border-[#4d4b47] shadow-[0_24px_60px_rgba(0,0,0,0.52)]"
        style={{
          maxWidth: '480px',
          backgroundImage: 'linear-gradient(145deg, rgba(26, 28, 30, 0.98), rgba(13, 15, 17, 0.98))',
        }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-[#c88b12]/10 blur-[80px]"
          aria-hidden="true"
        />

        {/* ── Card Body ── */}
        <div
          className="relative"
          style={{ padding: '24px' }}
        >

          {/* ── HEADER ── */}
          <header style={{ marginBottom: '24px', textAlign: 'center' }}>

            {/* Logo icon */}
            <div
              className="mx-auto flex items-center justify-center rounded-xl shadow-[0_7px_22px_rgba(245,158,11,0.34)]"
              style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(145deg, #ffc51b 0%, #f39a06 100%)',
                color: '#090909',
                marginBottom: '16px',
              }}
            >
              <Sparkles style={{ width: '28px', height: '28px', strokeWidth: 2.2 }} />
            </div>

            {/* Brand name + badge */}
            <div
              className="flex items-center justify-center"
              style={{ gap: '10px', marginBottom: '12px' }}
            >
              <h1
                className="font-display font-semibold text-[#f4f2ed]"
                style={{ fontSize: '1.875rem', letterSpacing: '-0.02em', lineHeight: 1 }}
              >
                THURAYA
              </h1>
              <span
                className="rounded-full border border-[#b77807] bg-[#9b6207]/20 font-display font-semibold text-[#f8ab0c]"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.04em',
                  paddingInline: '8px',
                  paddingBlock: '3px',
                  lineHeight: 1.4,
                }}
              >
                ADMIN
              </span>
            </div>

            {/* Description */}
            <p
              className="mx-auto text-[#b7b7bd]"
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                maxWidth: '320px',
              }}
            >
              Sign in to access your admin portal, manage products, and view store analytics.
            </p>
          </header>

          {/* ── ERROR MESSAGE ── */}
          {errorMsg && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-center gap-3 rounded-xl border border-[#9b3034] bg-[#35171a]/70 text-start"
              style={{
                marginBottom: '24px',
                padding: '14px 16px',
              }}
            >
              <span
                className="flex shrink-0 items-center justify-center rounded-full border-2 border-[#ff414b] text-[#ff414b]"
                style={{ width: '28px', height: '28px' }}
              >
                <AlertCircle style={{ width: '14px', height: '14px', strokeWidth: 3 }} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p
                  className="font-bold text-[#f1eef0]"
                  style={{ fontSize: '13px', lineHeight: '1.4', marginBottom: '2px' }}
                >
                  {errorMsg.includes('Internal') ? 'Internal server error' : 'Unable to sign in'}
                </p>
                <p
                  className="text-[#c5b8bc]"
                  style={{ fontSize: '12px', lineHeight: '1.5' }}
                >
                  Unable to sign in. Please try again later.
                </p>
              </div>
            </div>
          )}

          {/* ── FORM ── */}
          <form onSubmit={handleLogin}>

            {/* Email Field */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="admin-email"
                className="block font-bold uppercase text-[#c6c8cd]"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                Admin Email
              </label>
              <div className="group relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#8a7d73] transition-colors group-focus-within:text-[#eda30b]"
                  style={{ width: '18px', height: '18px', left: '16px' }}
                  aria-hidden="true"
                />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@thuraya.com"
                  className="w-full rounded-lg border border-[#55483a] bg-[#111315]/80 text-[#f5f4f2] outline-none transition-colors placeholder:text-[#8f8f93] hover:border-[#775d3a] focus:border-[#e19a0b] focus:ring-2 focus:ring-[#e19a0b]/20"
                  style={{
                    height: '48px',
                    fontSize: '14px',
                    paddingLeft: '46px',
                    paddingRight: '16px',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="admin-password"
                className="block font-bold uppercase text-[#c6c8cd]"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <div className="group relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#8a7d73] transition-colors group-focus-within:text-[#eda30b]"
                  style={{ width: '18px', height: '18px', left: '16px' }}
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full rounded-lg border border-[#55483a] bg-[#111315]/80 text-[#f5f4f2] outline-none transition-colors placeholder:text-[#8f8f93] hover:border-[#775d3a] focus:border-[#e19a0b] focus:ring-2 focus:ring-[#e19a0b]/20"
                  style={{
                    height: '48px',
                    fontSize: '14px',
                    letterSpacing: '0.12em',
                    paddingLeft: '46px',
                    paddingRight: '52px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-0 flex items-center justify-center text-[#948b86] transition-colors hover:text-[#f3a40b] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e19a0b]"
                  style={{
                    right: '0',
                    width: '48px',
                    height: '48px',
                    borderRadius: '0 8px 8px 0',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff style={{ width: '18px', height: '18px' }} />
                    : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#f7a307] to-[#ffb30d] font-bold text-[#080808] shadow-[0_10px_22px_rgba(245,158,11,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(245,158,11,0.32)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                height: '48px',
                fontSize: '15px',
                gap: '10px',
                marginTop: '24px',
              }}
            >
              {loading ? (
                <>
                  <span
                    className="animate-spin rounded-full border-2 border-[#080808]/30 border-t-[#080808]"
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight
                    className="transition-transform group-hover:translate-x-1"
                    style={{ width: '18px', height: '18px' }}
                  />
                </>
              )}
            </button>
          </form>

          {/* ── OR Divider ── */}
          <div
            className="flex items-center text-xs text-[#a5a4aa]"
            style={{ marginTop: '24px', marginBottom: '16px', gap: '12px' }}
          >
            <span className="h-px flex-1 bg-[#48494b]" />
            <span style={{ letterSpacing: '0.06em' }}>OR</span>
            <span className="h-px flex-1 bg-[#48494b]" />
          </div>

          {/* ── Return to Store ── */}
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex w-full items-center justify-center rounded-lg border border-[#55575a] text-[#d0d0d5] transition-colors hover:border-[#a77d37] hover:text-[#f0b032] focus:outline-none focus:ring-2 focus:ring-[#e19a0b]"
            style={{
              height: '48px',
              fontSize: '14px',
              gap: '10px',
            }}
          >
            <ShieldCheck style={{ width: '18px', height: '18px' }} aria-hidden="true" />
            <span>Return to Store</span>
          </button>

        </div>
        {/* ── END Card Body ── */}

        {/* ── FOOTER ── */}
        <footer
          className="relative flex items-center justify-center border-t border-[#26282a] text-xs text-[#8f9097]"
          style={{
            gap: '8px',
            padding: '16px 24px',
          }}
        >
          <ShieldCheck style={{ width: '14px', height: '14px', flexShrink: 0 }} aria-hidden="true" />
          <span>Protected session · Authorized personnel only</span>
        </footer>
      </section>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@thuraya.com')
  const [password, setPassword] = useState('admin123')
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Invalid login credentials')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setErrorMsg(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="dark min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-amber-500 selection:text-zinc-950 relative overflow-hidden"
      style={{ backgroundColor: '#09090b', color: '#f4f4f5' }}
    >
      {/* Premium Ambient Background Accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Authentication Card */}
      <div
        className="relative w-full max-w-[460px] border rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl transition-all"
        style={{
          backgroundColor: 'rgba(24, 24, 27, 0.95)',
          borderColor: 'rgba(63, 63, 70, 0.8)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Brand Logo & Centered Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold shadow-lg mb-4"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              color: '#09090b',
              boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.3)',
            }}
          >
            <Sparkles className="w-7 h-7 stroke-[2.2]" />
          </div>

          <h1
            className="text-2xl font-bold tracking-tight mb-1.5 flex items-center gap-2"
            style={{ color: '#ffffff' }}
          >
            <span>THURAYA</span>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-widest"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              Admin
            </span>
          </h1>

          <p className="text-sm max-w-xs" style={{ color: '#a1a1aa' }}>
            Sign in to access your admin portal, manage products, and view store analytics.
          </p>
        </div>

        {/* Error Alert Message */}
        {errorMsg && (
          <div
            className="mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-center text-center animate-in fade-in"
            style={{
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              borderColor: 'rgba(244, 63, 94, 0.2)',
              color: '#fda4af',
              borderWidth: '1px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-semibold uppercase tracking-wider block"
              style={{ color: '#d4d4d8' }}
            >
              Admin Email
            </label>
            <div className="relative flex items-center w-full">
              <div
                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                style={{ color: '#a1a1aa' }}
              >
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thuraya.com"
                className="w-full h-[52px] border rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  paddingLeft: '3.25rem',
                  paddingRight: '1rem',
                  backgroundColor: 'rgba(9, 9, 11, 0.85)',
                  borderColor: '#27272a',
                  color: '#ffffff',
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-semibold uppercase tracking-wider block"
              style={{ color: '#d4d4d8' }}
            >
              Password
            </label>
            <div className="relative flex items-center w-full">
              <div
                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                style={{ color: '#a1a1aa' }}
              >
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-[52px] border rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  paddingLeft: '3.25rem',
                  paddingRight: '3.25rem',
                  backgroundColor: 'rgba(9, 9, 11, 0.85)',
                  borderColor: '#27272a',
                  color: '#ffffff',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 inset-y-0 pr-4 flex items-center transition-colors focus:outline-none cursor-pointer"
                style={{ color: '#a1a1aa' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button with top margin */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] mt-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-[0.99]"
            style={{
              backgroundColor: '#f59e0b',
              color: '#09090b',
              boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.3)',
            }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Card Footer */}
        <div
          className="mt-8 pt-6 border-t flex items-center justify-center gap-2 text-center text-xs"
          style={{ borderColor: '#27272a', color: '#71717a' }}
        >
          <ShieldCheck className="w-4 h-4" style={{ color: '#71717a' }} />
          <span>Protected session • Authorized personnel only</span>
        </div>
      </div>
    </div>
  )
}

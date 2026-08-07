'use client'

import React, { useEffect, useState } from 'react'
import {
  User,
  Mail,
  Save,
  KeyRound,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { ThemeProvider } from '@/components/admin/providers/ThemeContext'

/* ─── tiny keyframe spinner injected once ─── */
const spinCSS = `@keyframes spin{to{transform:rotate(360deg)}}`

function ProfileContent() {
  const [loading, setLoading]               = useState(true)
  const [saving, setSaving]                 = useState(false)
  const [name, setName]                     = useState('')
  const [email, setEmail]                   = useState('')
  const [role, setRole]                     = useState('SUPER_ADMIN')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent]       = useState(false)
  const [showNew, setShowNew]               = useState(false)
  const [showConfirm, setShowConfirm]       = useState(false)

  const { success, error } = useToast()

  useEffect(() => {
    let isMounted = true
    async function loadProfile() {
      try {
        const res  = await fetch('/api/admin/auth/me')
        const data = await res.json()
        if (isMounted && data.user) {
          setName(data.user.name  || '')
          setEmail(data.user.email || '')
          setRole(data.user.role  || 'ADMIN')
        }
      } catch (err) {
        console.error('Error fetching admin profile:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadProfile()
    return () => { isMounted = false }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword) {
      if (newPassword.length < 6)          { error('New password must be at least 6 characters'); return }
      if (newPassword !== confirmPassword) { error('Passwords do not match'); return }
      if (!currentPassword)                { error('Current password is required to change password'); return }
    }
    setSaving(true)
    try {
      const res  = await fetch('/api/admin/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          currentPassword: currentPassword || undefined,
          newPassword:     newPassword     || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')
      success('Profile updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : 'Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  /* ── helpers ── */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgb(9,9,11)',
    border: '1px solid rgba(63,63,70,0.8)',
    borderRadius: 12,
    padding: '11px 14px 11px 42px',
    fontSize: 13,
    color: '#f4f4f5',
    outline: 'none',
    boxSizing: 'border-box',
  }
  const inputNoIconStyle: React.CSSProperties = {
    ...inputStyle,
    padding: '11px 42px 11px 14px',  /* icon on right for password toggle */
  }
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#a1a1aa',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  }
  const card: React.CSSProperties = {
    background: 'rgb(24,24,27)',
    border: '1px solid rgba(63,63,70,0.7)',
    borderRadius: 20,
    padding: 28,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  }

  if (loading) return (
    <div style={{ padding: '100px 0', textAlign: 'center', color: '#71717a' }}>
      <style>{spinCSS}</style>
      <span style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid #fbbf24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
      <p style={{ fontSize: 14, fontWeight: 600 }}>Loading profile…</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%', maxWidth: 720 }}>
      <style>{spinCSS}</style>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ padding: 12, borderRadius: 14, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User style={{ width: 22, height: 22 }} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>Admin Profile</h1>
          <p style={{ fontSize: 12, color: '#71717a', fontWeight: 500, marginTop: 3 }}>Manage your account name, email and password</p>
        </div>
      </div>

      {/* ── Avatar Banner Card ── */}
      <div style={{ ...card, background: 'linear-gradient(135deg, rgba(24,24,27,1) 60%, rgba(245,158,11,0.07))', borderColor: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 22 }}>
        {/* Avatar */}
        <div style={{ flexShrink: 0, width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#09090b', fontWeight: 900, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(245,158,11,0.35)' }}>
          {name ? name.charAt(0).toUpperCase() : 'A'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>{name || 'Admin User'}</h2>
          <p style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>{email || '—'}</p>
          <span style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#fbbf24', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <ShieldCheck style={{ width: 13, height: 13 }} />
            {role}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Account Info Card ── */}
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, margin: 0, marginBottom: 20 }}>
            <User style={{ width: 15, height: 15, color: '#fbbf24' }} />
            Account Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {/* Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: 13, top: 12, width: 16, height: 16, color: '#52525b' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  placeholder="Admin Name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 13, top: 12, width: 16, height: 16, color: '#52525b' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="admin@example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Security Card ── */}
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, margin: 0, marginBottom: 6 }}>
            <KeyRound style={{ width: 15, height: 15, color: '#fbbf24' }} />
            Change Password
          </h3>
          <p style={{ fontSize: 12, color: '#52525b', marginBottom: 20, marginTop: 0 }}>Leave blank to keep your current password unchanged</p>

          {/* Current password */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Current Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: 13, top: 12, width: 16, height: 16, color: '#52525b' }} />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputNoIconStyle }}
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)} style={{ position: 'absolute', right: 13, top: 11, background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 0 }}>
                {showCurrent ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {/* New + Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 13, top: 12, width: 16, height: 16, color: '#52525b' }} />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  style={{ ...inputNoIconStyle }}
                />
                <button type="button" onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: 13, top: 11, background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 0 }}>
                  {showNew ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 13, top: 12, width: 16, height: 16, color: '#52525b' }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputNoIconStyle }}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 13, top: 11, background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 0 }}>
                  {showConfirm ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>
          </div>

          {/* Hint */}
          {newPassword && newPassword !== confirmPassword && (
            <p style={{ marginTop: 10, fontSize: 12, color: '#f87171', fontWeight: 600 }}>⚠ Passwords do not match</p>
          )}
          {newPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
            <p style={{ marginTop: 10, fontSize: 12, color: '#34d399', fontWeight: 600 }}>✓ Passwords match</p>
          )}
        </div>

        {/* ── Save Button ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              borderRadius: 14,
              background: saving ? 'rgba(245,158,11,0.4)' : 'linear-gradient(90deg,#f59e0b,#d97706)',
              color: '#09090b',
              fontWeight: 900,
              fontSize: 14,
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 20px rgba(245,158,11,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {saving
              ? <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #09090b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : <Save style={{ width: 16, height: 16 }} />
            }
            <span>{saving ? 'Saving…' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default function AdminProfilePage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminLayout>
          <ProfileContent />
        </AdminLayout>
      </ToastProvider>
    </ThemeProvider>
  )
}

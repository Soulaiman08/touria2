'use client'

import React, { useEffect, useState } from 'react'
import {
  User,
  Mail,
  Save,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { ThemeProvider } from '@/components/admin/providers/ThemeContext'

function ProfileContent() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('SUPER_ADMIN')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const { success, error } = useToast()

  useEffect(() => {
    let isMounted = true
    async function loadProfile() {
      try {
        const res = await fetch('/api/admin/auth/me')
        const data = await res.json()
        if (isMounted && data.user) {
          setName(data.user.name || '')
          setEmail(data.user.email || '')
          setRole(data.user.role || 'ADMIN')
        }
      } catch (err) {
        console.error('Error fetching admin profile:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword) {
      if (newPassword.length < 6) {
        error('New password must be at least 6 characters')
        return
      }
      if (newPassword !== confirmPassword) {
        error('New password and confirmation do not match')
        return
      }
      if (!currentPassword) {
        error('Current password is required to change password')
        return
      }
    }

    setSaving(true)

    try {
      const res = await fetch('/api/admin/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      success('Profile updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating profile'
      error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#71717a' }}>
        <span style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #fbbf24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p style={{ fontSize: 14, fontWeight: 500 }}>Loading profile details...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid rgba(63,63,70,0.6)', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User style={{ width: 22, height: 22 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              Admin Account Profile
            </h1>
            <p style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>
              Manage administrator account name, email, and password security
            </p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div style={{ maxWidth: 640, width: '100%' }}>
        <div style={{
          background: 'rgb(24,24,27)',
          border: '1px solid rgba(63,63,70,0.6)',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 24, borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#09090b', fontWeight: 900, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(245,158,11,0.25)' }}>
              {name ? name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{name || 'Admin User'}</h2>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>
                <ShieldCheck style={{ width: 16, height: 16 }} /> Role: {role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Admin Full Name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: 14, top: 12, width: 16, height: 16, color: '#71717a' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px 10px 40px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 14, top: 12, width: 16, height: 16, color: '#71717a' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px 10px 40px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ paddingTop: 16, borderTop: '1px solid rgba(63,63,70,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <KeyRound style={{ width: 16, height: 16, color: '#fbbf24' }} /> Change Password
              </h3>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#d4d4d8', marginBottom: 6 }}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', background: 'rgb(9,9,11)', border: '1px solid rgba(63,63,70,0.8)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#f4f4f5', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ paddingTop: 16, borderTop: '1px solid rgba(63,63,70,0.5)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 22px',
                  borderRadius: 12,
                  background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                  color: '#09090b',
                  fontWeight: 900,
                  fontSize: 13,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(245,158,11,0.25)',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Save style={{ width: 16, height: 16 }} />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
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

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
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/providers/ToastContext'
import { useAdminI18n } from '@/components/admin/providers/AdminI18nContext'

function ProfileContent() {
  const { tr, dir } = useAdminI18n()
  const { success, error } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('SUPER_ADMIN')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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
        error(tr('يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل', 'New password must be at least 6 characters'))
        return
      }
      if (newPassword !== confirmPassword) {
        error(tr('كلمتا المرور غير متطابقتين', 'Passwords do not match'))
        return
      }
      if (!currentPassword) {
        error(tr('يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور', 'Current password is required to change password'))
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
      if (!res.ok) throw new Error(data.error || tr('فشل تحديث الملف الشخصي', 'Failed to update profile'))
      success(tr('تم تحديث الملف الشخصي بنجاح', 'Profile updated successfully'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : tr('خطأ في تحديث الملف الشخصي', 'Error updating profile'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-3xl space-y-6">
        <div className="h-14 rounded-2xl bg-zinc-900/70 border border-zinc-800 animate-pulse" />
        <div className="h-28 rounded-2xl bg-zinc-900/70 border border-zinc-800 animate-pulse" />
        <div className="h-44 rounded-2xl bg-zinc-900/70 border border-zinc-800 animate-pulse" />
        <div className="h-64 rounded-2xl bg-zinc-900/70 border border-zinc-800 animate-pulse" />
      </div>
    )
  }

  const labelCls = 'block text-xs font-bold text-zinc-300 mb-1.5'
  const textInputCls =
    'w-full bg-zinc-950 border border-zinc-800 rounded-xl ps-11 pe-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-colors'
  const passwordInputCls =
    'w-full bg-zinc-950 border border-zinc-800 rounded-xl ps-11 pe-12 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-colors text-start'

  return (
    <div dir={dir} className="w-full max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-800/80">
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {tr('ملف المدير', 'Admin Profile')}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {tr('تعديل الاسم، البريد الإلكتروني، وكلمة المرور الخاصة بحساب الإدارة', 'Manage your account name, email, and password')}
          </p>
        </div>
      </div>

      {/* Avatar Banner Card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-4 sm:p-6 flex flex-wrap items-center gap-4 sm:gap-5 shadow-xl">
        <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
          {name ? name.charAt(0).toUpperCase() : 'A'}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <h2 className="text-lg sm:text-xl font-black text-white truncate">
            {name || tr('حساب المدير', 'Admin User')}
          </h2>
          <p dir="ltr" className="text-xs text-zinc-400 truncate text-start">
            {email || '—'}
          </p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{role}</span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Info Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-7 space-y-5 shadow-xl">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>{tr('معلومات الحساب', 'Account Information')}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className={labelCls}>{tr('الاسم الكامل', 'Full Name')}</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={tr('اسم المدير', 'Admin Name')}
                  className={textInputCls}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelCls}>{tr('البريد الإلكتروني', 'Email Address')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  dir="ltr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className={`${textInputCls} text-start`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security / Change Password Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-7 space-y-5 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>{tr('تغيير كلمة المرور', 'Change Password')}</span>
            </h3>
            <p className="text-xs text-zinc-400">
              {tr(
                'اترك حقول كلمة المرور فارغة إذا لم ترغب في تغييرها',
                'Leave blank to keep your current password unchanged'
              )}
            </p>
          </div>

          {/* Current password */}
          <div>
            <label className={labelCls}>{tr('كلمة المرور الحالية', 'Current Password')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showCurrent ? 'text' : 'password'}
                dir="ltr"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className={passwordInputCls}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={
                  showCurrent
                    ? tr('إخفاء كلمة المرور الحالية', 'Hide current password')
                    : tr('إظهار كلمة المرور الحالية', 'Show current password')
                }
                className="absolute inset-y-0 end-0 w-11 flex items-center justify-center text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New + Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{tr('كلمة المرور الجديدة', 'New Password')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showNew ? 'text' : 'password'}
                  dir="ltr"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={tr('6 أحرف على الأقل', 'Min 6 characters')}
                  className={passwordInputCls}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={
                    showNew
                      ? tr('إخفاء كلمة المرور الجديدة', 'Hide new password')
                      : tr('إظهار كلمة المرور الجديدة', 'Show new password')
                  }
                  className="absolute inset-y-0 end-0 w-11 flex items-center justify-center text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>{tr('تأكيد كلمة المرور', 'Confirm Password')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  dir="ltr"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={passwordInputCls}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={
                    showConfirm
                      ? tr('إخفاء تأكيد كلمة المرور', 'Hide confirm password')
                      : tr('إظهار تأكيد كلمة المرور', 'Show confirm password')
                  }
                  className="absolute inset-y-0 end-0 w-11 flex items-center justify-center text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Live validation feedback */}
          {newPassword && newPassword.length < 6 && (
            <p className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{tr('كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل', 'Password must be at least 6 characters')}</span>
            </p>
          )}
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{tr('كلمتا المرور غير متطابقتين', 'Passwords do not match')}</span>
            </p>
          )}
          {newPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
            <p className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{tr('كلمتا المرور متطابقتان', 'Passwords match')}</span>
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? tr('جاري الحفظ...', 'Saving...') : tr('حفظ التغييرات', 'Save Changes')}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default function AdminProfilePage() {
  return (
    <ToastProvider>
      <AdminLayout>
        <ProfileContent />
      </AdminLayout>
    </ToastProvider>
  )
}

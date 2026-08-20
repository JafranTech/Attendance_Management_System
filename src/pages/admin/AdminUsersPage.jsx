import { useState } from 'react'
import { useAdminUsers, useAdminResetPassword } from '../../hooks/useAdmin'
import { Users, Search, Shield, KeyRound, Loader2, RefreshCw, X, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ROLE_LABELS = {
  faculty: { label: 'Faculty', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  hod:     { label: 'HOD',     color: 'bg-purple-100 text-purple-700 border-purple-200' },
  admin:   { label: 'Admin',   color: 'bg-amber-100 text-amber-700 border-amber-200' },
}

function ResetPasswordModal({ user, onClose }) {
  const resetPassword = useAdminResetPassword()
  const [newPassword, setNewPassword] = useState('crescent1234')
  const [showPassword, setShowPassword] = useState(false)

  const handleReset = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    try {
      await resetPassword.mutateAsync({ targetUserId: user.id, newPassword })
      toast.success(`Password for ${user.name} reset successfully!`)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to reset password')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <KeyRound className="w-4.5 h-4.5 text-amber-600" size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Reset Password</h2>
                <p className="text-xs text-slate-500">For: <span className="font-semibold text-slate-700">{user.name}</span></p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 border border-slate-200">
            <p className="font-medium text-slate-700 mb-1">Account Details</p>
            <p><span className="text-slate-500">Email:</span> {user.email}</p>
            <p><span className="text-slate-500">Role:</span> {ROLE_LABELS[user.role]?.label}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              After reset, inform the user of their new temporary password so they can log in.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              The user will be able to log in immediately with the new password. There is no email notification sent.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={resetPassword.isPending || newPassword.length < 6}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {resetPassword.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Reset Password</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const { data: users, isLoading, refetch } = useAdminUsers()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [resetTarget, setResetTarget] = useState(null)

  const filtered = (users ?? []).filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const counts = {
    all: users?.length ?? 0,
    faculty: users?.filter(u => u.role === 'faculty').length ?? 0,
    hod: users?.filter(u => u.role === 'hod').length ?? 0,
    admin: users?.filter(u => u.role === 'admin').length ?? 0,
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Faculty &amp; HODs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View all user accounts and reset passwords when needed.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Role Tabs */}
        <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shrink-0">
          {[
            { key: 'all', label: `All (${counts.all})` },
            { key: 'faculty', label: `Faculty (${counts.faculty})` },
            { key: 'hod', label: `HOD (${counts.hod})` },
            { key: 'admin', label: `Admin (${counts.admin})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setRoleFilter(key)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                roleFilter === key
                  ? 'bg-amber-400 text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            <p className="text-sm text-slate-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Department</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((u, i) => {
                  const roleMeta = ROLE_LABELS[u.role] ?? ROLE_LABELS.faculty
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-5 py-3.5 text-xs text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <span className="font-semibold text-slate-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{u.email}</td>
                      <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{u.department || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border', roleMeta.color)}>
                          {u.role === 'admin' && <Shield className="w-3 h-3" />}
                          {roleMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setResetTarget(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Reset password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Modal */}
      {resetTarget && (
        <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />
      )}
    </div>
  )
}

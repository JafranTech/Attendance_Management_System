import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { HodLayout } from '../../components/hod/HodLayout'

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function HodSettings() {
  const { updatePassword } = useAuth()
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({ resolver: zodResolver(passwordSchema) })

  const onPasswordSubmit = async (data) => {
    try {
      setIsSavingPassword(true)
      await updatePassword(data.newPassword)
      toast.success('Password changed successfully!')
      resetPassword()
    } catch (err) {
      toast.error(err.message || 'Failed to change password. Please try again.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <HodLayout backTo="/hod/dashboard" backLabel="Back to Dashboard">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your HOD account preferences and security</p>
        </div>

        {/* Change Password Card */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Change Password</h2>
              <p className="text-xs text-slate-500">Update your HOD console login password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  {...registerPassword('newPassword')}
                  className={`pr-10 ${passwordErrors.newPassword ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-500">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  {...registerPassword('confirmPassword')}
                  className={`pr-10 ${passwordErrors.confirmPassword ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-500">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSavingPassword}>
              {isSavingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </div>

        {/* App Management Card */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-2">App Management</h2>
          <p className="text-sm text-slate-500 mb-4">
            If you are not seeing the latest updates or logo, force the app to refresh its cache.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                  for (let registration of registrations) {
                    registration.unregister()
                  }
                  window.location.href = window.location.pathname + '?t=' + new Date().getTime()
                })
              } else {
                window.location.href = window.location.pathname + '?t=' + new Date().getTime()
              }
            }}
            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            Force Update App
          </Button>
        </div>
      </div>
    </HodLayout>
  )
}

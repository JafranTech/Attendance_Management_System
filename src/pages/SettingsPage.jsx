import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarX, Plus, Trash2, Loader2, Eye, EyeOff, Lock } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useHolidays, useAddHoliday, useDeleteHoliday } from '../hooks/useHolidays'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'

const holidaySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(2, 'Description is required'),
})

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function SettingsPage() {
  const { data: holidays, isLoading } = useHolidays()
  const addHoliday = useAddHoliday()
  const deleteHoliday = useDeleteHoliday()
  const { updatePassword } = useAuth()

  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Holiday form
  const {
    register: registerHoliday,
    handleSubmit: handleHolidaySubmit,
    formState: { errors: holidayErrors },
    reset: resetHoliday,
  } = useForm({ resolver: zodResolver(holidaySchema) })

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({ resolver: zodResolver(passwordSchema) })

  const onHolidaySubmit = async (data) => {
    try {
      await addHoliday.mutateAsync(data)
      toast.success('Holiday added.')
      resetHoliday()
    } catch (err) {
      toast.error(err.message)
    }
  }

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

  const handleDelete = async (holiday) => {
    if (!confirm(`Remove holiday on ${holiday.description}?`)) return
    try {
      await deleteHoliday.mutateAsync(holiday.id)
      toast.success('Holiday removed.')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account, holidays, and app preferences</p>
      </div>

      {/* ── Change Password ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
            <p className="text-xs text-slate-500">Update your login password anytime</p>
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
                aria-label={showNew ? 'Hide password' : 'Show password'}
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
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-xs text-red-500">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSavingPassword}>
            {isSavingPassword
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              : <><Lock className="w-4 h-4 mr-2" />Update Password</>
            }
          </Button>
        </form>
      </div>

      {/* ── Add Holiday Form ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Add Holiday</h2>
        <form onSubmit={handleHolidaySubmit(onHolidaySubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...registerHoliday('date')}
                className={holidayErrors.date ? 'border-red-400' : ''} />
              {holidayErrors.date && <p className="text-xs text-red-500">{holidayErrors.date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Input id="description" placeholder="e.g. Diwali" {...registerHoliday('description')}
                className={holidayErrors.description ? 'border-red-400' : ''} />
              {holidayErrors.description && <p className="text-xs text-red-500">{holidayErrors.description.message}</p>}
            </div>
          </div>
          <Button type="submit" disabled={addHoliday.isPending}>
            {addHoliday.isPending
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</>
              : <><Plus className="w-4 h-4 mr-2" />Add Holiday</>
            }
          </Button>
        </form>
      </div>

      {/* ── Holidays List ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Holidays ({holidays?.length ?? 0})
        </h2>

        {isLoading && <LoadingSpinner />}

        {!isLoading && holidays?.length === 0 && (
          <EmptyState
            icon={CalendarX}
            title="No holidays added"
            description="Add holidays to prevent attendance from being marked on those days."
          />
        )}

        {!isLoading && holidays && holidays.length > 0 && (
          <div className="space-y-2">
            {holidays.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                <div>
                  <p className="text-sm font-medium text-slate-800">{h.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {format(new Date(h.date + 'T00:00:00'), 'EEEE, dd MMMM yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(h)}
                  disabled={deleteHoliday.isPending}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Remove holiday"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── App Management ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mt-6 mb-24 md:mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-2">App Management</h2>
        <p className="text-sm text-slate-500 mb-4">If you are not seeing the latest updates (like the new logo or app name), you can force the app to refresh its cache.</p>
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
          className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          Force Update App
        </Button>
      </div>
    </div>
  )
}

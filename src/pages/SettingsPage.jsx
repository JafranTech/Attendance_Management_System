import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarX, Plus, Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useHolidays, useAddHoliday, useDeleteHoliday } from '../hooks/useHolidays'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(2, 'Description is required'),
})

export default function SettingsPage() {
  const { data: holidays, isLoading } = useHolidays()
  const addHoliday = useAddHoliday()
  const deleteHoliday = useDeleteHoliday()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await addHoliday.mutateAsync(data)
      toast.success('Holiday added.')
      reset()
    } catch (err) {
      toast.error(err.message)
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
        <p className="text-sm text-slate-500 mt-0.5">Manage holidays and non-working days</p>
      </div>

      {/* Add Holiday Form */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Add Holiday</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register('date')}
                className={errors.date ? 'border-red-400' : ''} />
              {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Input id="description" placeholder="e.g. Diwali" {...register('description')}
                className={errors.description ? 'border-red-400' : ''} />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
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

      {/* Holidays List */}
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
                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Remove holiday"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App Management */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mt-6 mb-24 md:mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-2">App Management</h2>
        <p className="text-sm text-slate-500 mb-4">If you are not seeing the latest updates (like the new logo or app name), you can force the app to refresh its cache.</p>
        <Button 
          variant="outline" 
          onClick={() => {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (let registration of registrations) {
                  registration.unregister();
                }
                window.location.href = window.location.pathname + '?t=' + new Date().getTime();
              });
            } else {
              window.location.href = window.location.pathname + '?t=' + new Date().getTime();
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

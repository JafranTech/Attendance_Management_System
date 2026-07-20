import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useEditAttendance } from '../../hooks/useAttendance'
import { Badge } from '../ui/Badge'
import clsx from 'clsx'

const schema = z.object({
  reason: z.string().min(5, 'Please provide a reason (at least 5 characters)'),
})

export function EditAttendanceModal({ isOpen, onClose, attendanceId, detailRow }) {
  const [newStatus, setNewStatus] = useState(detailRow?.status || 'Present')
  const editAttendance = useEditAttendance()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ reason }) => {
    if (newStatus === detailRow.status) {
      toast.error('Please change the status before saving.')
      return
    }
    try {
      await editAttendance.mutateAsync({
        attendanceId,
        studentId: detailRow.students.id,
        oldStatus: detailRow.status,
        newStatus,
        reason,
      })
      toast.success('Attendance updated with audit log.')
      reset()
      onClose()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleClose = () => { reset(); onClose() }

  if (!detailRow) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Attendance">
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-sm font-semibold text-slate-800">{detailRow.students?.name}</p>
          <p className="text-xs text-slate-500">{detailRow.students?.roll_number}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-600 mb-2">Change Status</p>
          <div className="flex gap-3">
            <button
              onClick={() => setNewStatus('Present')}
              className={clsx(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
                newStatus === 'Present'
                  ? 'bg-green-50 border-green-400 text-green-700'
                  : 'border-slate-200 text-slate-400 hover:border-green-200'
              )}
            >
              Present
            </button>
            <button
              onClick={() => setNewStatus('Absent')}
              className={clsx(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
                newStatus === 'Absent'
                  ? 'bg-red-50 border-red-400 text-red-600'
                  : 'border-slate-200 text-slate-400 hover:border-red-200'
              )}
            >
              Absent
            </button>
          </div>
          {newStatus !== detailRow.status && (
            <p className="text-xs text-amber-600 mt-2">
              Changing from <strong>{detailRow.status}</strong> → <strong>{newStatus}</strong>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Reason for Edit *</label>
            <textarea
              {...register('reason')}
              rows={3}
              placeholder="e.g. Student was present but marked incorrectly"
              className={clsx(
                'w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.reason ? 'border-red-400' : 'border-slate-200'
              )}
            />
            {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={editAttendance.isPending}>
              {editAttendance.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                : 'Save Edit'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

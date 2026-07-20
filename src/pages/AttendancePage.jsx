import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { format, isSunday, isAfter, startOfDay, parseISO } from 'date-fns'
import { ClipboardCheck, ChevronRight, Loader2, Users, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCourses } from '../hooks/useCourses'
import { useStudents } from '../hooks/useStudents'
import { useHolidays } from '../hooks/useHolidays'
import { useCheckAttendance, useSaveAttendance } from '../hooks/useAttendance'
import { StudentAttendanceRow } from '../components/attendance/StudentAttendanceRow'
import { Button } from '../components/ui/Button'
import { Label } from '../components/ui/Label'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8]

const selectionSchema = z.object({
  courseId: z.string().min(1, 'Select a course'),
  date: z.string().min(1, 'Select a date'),
  hour: z.string().min(1, 'Select an hour'),
})

const TODAY = format(new Date(), 'yyyy-MM-dd')

export default function AttendancePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('select') // 'select' | 'mark'
  const [selection, setSelection] = useState(null)
  const [statuses, setStatuses] = useState({})

  const { data: courses } = useCourses()
  const { data: holidays } = useHolidays()
  const saveAttendance = useSaveAttendance()

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(selectionSchema),
    defaultValues: { courseId: '', date: TODAY, hour: '1' },
  })

  const watchCourseId = watch('courseId')
  const watchDate = watch('date')
  const watchHour = watch('hour')

  const { data: existingRecord } = useCheckAttendance(
    watchCourseId || null,
    watchDate || null,
    watchHour ? Number(watchHour) : null
  )

  const { data: students, isLoading: studentsLoading } = useStudents(selection?.courseId)

  // Initialize all students as Present when students load
  useEffect(() => {
    if (students && step === 'mark') {
      const initial = {}
      students.forEach((s) => { initial[s.id] = 'Present' })
      setStatuses(initial)
    }
  }, [students, step])

  const validateDate = (date) => {
    if (!date) return null
    const parsed = parseISO(date)
    if (isAfter(startOfDay(parsed), startOfDay(new Date()))) return 'Cannot mark attendance for a future date.'
    if (isSunday(parsed)) return 'Cannot mark attendance on Sunday.'
    const isHoliday = holidays?.some((h) => h.date === date)
    if (isHoliday) return 'This date is a holiday. No attendance can be marked.'
    return null
  }

  const onSelectionSubmit = (data) => {
    const dateError = validateDate(data.date)
    if (dateError) { toast.error(dateError); return }
    if (existingRecord) { toast.error('Attendance for this hour is already marked.'); return }

    const course = courses?.find((c) => c.id === data.courseId)
    setSelection({ ...data, courseName: course?.course_name, hour: Number(data.hour) })
    setStep('mark')
  }

  const handleToggle = (studentId) => {
    setStatuses((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }))
  }

  const handleSave = async () => {
    if (!students || students.length === 0) {
      toast.error('No students enrolled in this course.')
      return
    }
    const studentStatuses = students.map((s) => ({
      studentId: s.id,
      status: statuses[s.id] || 'Present',
    }))
    try {
      await saveAttendance.mutateAsync({
        courseId: selection.courseId,
        date: selection.date,
        hour: selection.hour,
        studentStatuses,
      })
      toast.success('Attendance saved successfully!')
      navigate('/history')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const presentCount = Object.values(statuses).filter((s) => s === 'Present').length
  const absentCount = Object.values(statuses).filter((s) => s === 'Absent').length

  if (step === 'select') {
    return (
      <div className="max-w-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Take Attendance</h1>
          <p className="text-sm text-slate-500 mt-0.5">Select course, date, and hour to begin</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <form onSubmit={handleSubmit(onSelectionSubmit)} className="space-y-5">
            {/* Course */}
            <div className="space-y-1.5">
              <Label htmlFor="courseId">Course *</Label>
              <select
                id="courseId"
                {...register('courseId')}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a course...</option>
                {courses?.map((c) => (
                  <option key={c.id} value={c.id}>{c.course_code} — {c.course_name}</option>
                ))}
              </select>
              {errors.courseId && <p className="text-xs text-red-500">{errors.courseId.message}</p>}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <input
                id="date"
                type="date"
                max={TODAY}
                {...register('date')}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
            </div>

            {/* Hour */}
            <div className="space-y-1.5">
              <Label htmlFor="hour">Hour *</Label>
              <select
                id="hour"
                {...register('hour')}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {HOURS.map((h) => <option key={h} value={h}>Hour {h}</option>)}
              </select>
            </div>

            {/* Already marked warning */}
            {existingRecord && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                ⚠️ Attendance for this course, date, and hour is already marked.
              </div>
            )}

            <Button type="submit" className="w-full">
              Proceed to Mark Attendance
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Mark step
  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{selection.courseName}</h1>
          <p className="text-sm text-slate-500">
            {format(parseISO(selection.date), 'EEEE, dd MMM yyyy')} · Hour {selection.hour}
          </p>
        </div>
        <button
          onClick={() => setStep('select')}
          className="text-xs text-slate-400 hover:text-slate-600 underline mt-1"
        >
          Change
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-center">
          <p className="text-lg font-bold text-green-700">{presentCount}</p>
          <p className="text-xs text-green-600">Present</p>
        </div>
        <div className="flex-1 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-center">
          <p className="text-lg font-bold text-red-600">{absentCount}</p>
          <p className="text-xs text-red-500">Absent</p>
        </div>
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-center">
          <p className="text-lg font-bold text-slate-700">{students?.length ?? 0}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3">Tap a student to toggle Present ↔ Absent</p>

      {/* Student List */}
      {studentsLoading && <LoadingSpinner />}

      {!studentsLoading && (!students || students.length === 0) && (
        <EmptyState
          icon={Users}
          title="No students enrolled"
          description="Add students to this course before marking attendance."
        />
      )}

      {!studentsLoading && students && students.length > 0 && (
        <div className="space-y-2 pb-32">
          {students.map((student) => (
            <StudentAttendanceRow
              key={student.id}
              student={student}
              status={statuses[student.id] || 'Present'}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Sticky Save Button */}
      {students && students.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:left-64 z-30 bg-white/95 backdrop-blur border-t border-slate-100 px-4 py-3 md:px-8">
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={saveAttendance.isPending}
          >
            {saveAttendance.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4 mr-2" />Save Attendance ({students.length} students)</>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

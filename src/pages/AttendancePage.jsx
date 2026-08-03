import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format, isSunday, isAfter, startOfDay, parseISO, getDay } from 'date-fns'
import {
  ClipboardCheck, ChevronRight, Loader2, Users, CheckCircle2,
  List, MousePointerClick, Zap, Calendar, CheckSquare, Pencil,
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useCourses } from '../hooks/useCourses'
import { useStudents } from '../hooks/useStudents'
import { useHolidays } from '../hooks/useHolidays'
import { useTimetable } from '../hooks/useTimetable'
import { useCheckAttendance, useSaveAttendance, useAllStudentPercentages } from '../hooks/useAttendance'
import { StudentAttendanceRow } from '../components/attendance/StudentAttendanceRow'
import { QuickEntryMode } from '../components/attendance/QuickEntryMode'
import { InteractiveMode } from '../components/attendance/InteractiveMode'
import { UnfilledPopup } from '../components/attendance/UnfilledPopup'
import { HolidayPopup } from '../components/attendance/HolidayPopup'
import { Button } from '../components/ui/Button'
import { Label } from '../components/ui/Label'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'

const selectionSchema = z.object({
  courseId: z.string().min(1, 'Select a course'),
  date: z.string().min(1, 'Select a date'),
  hour: z.string().min(1, 'Select an hour'),
  alternateDay: z.string().optional(),
})

const TODAY = format(new Date(), 'yyyy-MM-dd')

export default function AttendancePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialCourseId = searchParams.get('courseId') || ''
  const [step, setStep] = useState('select') // 'select' | 'mark'
  const [selection, setSelection] = useState(null)
  const [statuses, setStatuses] = useState({})

  const [batchFilter, setBatchFilter] = useState('All') // 'All', 'Batch 1', 'Batch 2'
  // viewMode: 'list' | 'quick' | 'interactive'
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('attendanceViewMode') || 'list')
  const [isUnfilledPopupOpen, setIsUnfilledPopupOpen] = useState(false)
  const [isHolidayPopupOpen, setIsHolidayPopupOpen] = useState(false)

  const { data: courses } = useCourses()
  const { data: holidays } = useHolidays()
  const saveAttendance = useSaveAttendance()

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(selectionSchema),
    defaultValues: { courseId: initialCourseId, date: TODAY, hour: '', alternateDay: '1' },
  })

  const watchCourseId = watch('courseId')
  const watchDate = watch('date')
  const watchHour = watch('hour')
  const watchAlternateDay = watch('alternateDay') || '1'
  const isSaturdaySelected = watchDate && getDay(parseISO(watchDate)) === 6

  const { data: timetable } = useTimetable(watchCourseId)

  // Compute available BLOCKS for the selected date (groups contiguous hours)
  const availableBlocks = useMemo(() => {
    if (!timetable || !watchDate) return []
    const parsedDate = parseISO(watchDate)
    let dayOfWeek = getDay(parsedDate)

    if (dayOfWeek === 6) {
      dayOfWeek = Number(watchAlternateDay)
    }

    const dayHours = timetable
      .filter(t => t.day_of_week === dayOfWeek)
      .map(t => t.hour)
      .sort((a, b) => a - b)

    // Group contiguous hours into blocks
    const blocks = []
    let block = null
    dayHours.forEach(h => {
      if (!block) {
        block = { start: h, end: h, hours: [h] }
      } else if (h === block.end + 1) {
        block.end = h
        block.hours.push(h)
      } else {
        blocks.push(block)
        block = { start: h, end: h, hours: [h] }
      }
    })
    if (block) blocks.push(block)
    return blocks // [{ start, end, hours }]
  }, [timetable, watchDate])

  // For backwards compat: flat list of starting hours per block
  const availableHours = availableBlocks.map(b => b.start)

  // Automatically select the first available hour if none is selected
  useEffect(() => {
    if (availableHours.length > 0 && (!watchHour || !availableHours.includes(Number(watchHour)))) {
      setValue('hour', availableHours[0].toString())
    } else if (availableHours.length === 0) {
      setValue('hour', '')
    }
  }, [availableHours, setValue, watchHour])

  // Save viewMode preference
  useEffect(() => {
    localStorage.setItem('attendanceViewMode', viewMode)
  }, [viewMode])

  const { data: existingRecord } = useCheckAttendance(
    watchCourseId || null,
    watchDate || null,
    watchHour ? Number(watchHour) : null
  )

  const { data: students, isLoading: studentsLoading } = useStudents(selection?.courseId)

  // Bulk fetch existing attendance percentages for the selected course
  const { data: attendancePercentages } = useAllStudentPercentages(selection?.courseId)

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
    if (existingRecord?.is_holiday) { toast.error('This hour is already marked as a holiday.'); return }
    if (availableBlocks.length === 0) { toast.error('No classes scheduled for this day.'); return }

    const course = courses?.find((c) => c.id === data.courseId)
    // Find the block for the selected starting hour
    const block = availableBlocks.find(b => b.start === Number(data.hour)) || { start: Number(data.hour), end: Number(data.hour), hours: [Number(data.hour)] }
    setSelection({ ...data, courseName: course?.course_name, hour: Number(data.hour), block, alternateDay: data.alternateDay })
    
    // If the session already exists, preload the existing statuses
    const initialStatuses = {}
    if (existingRecord?.attendance_details) {
      existingRecord.attendance_details.forEach(d => {
        initialStatuses[d.student_id] = d.status
      })
    }
    setStatuses(initialStatuses)
    setStep('mark')
  }

  const handleToggle = (studentId) => {
    setStatuses((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }))
  }

  // Mark visible (current batch) students as Present
  const handlePresentAll = () => {
    if (!visibleStudents || visibleStudents.length === 0) return
    const allPresent = visibleStudents.every(s => statuses[s.id] === 'Present')
    
    setStatuses(prev => {
      const next = { ...prev }
      visibleStudents.forEach((s) => {
        if (allPresent) {
          delete next[s.id] // Clear them if all are present
        } else {
          next[s.id] = 'Present'
        }
      })
      return next
    })
    
    if (allPresent) {
      toast.success('Cleared statuses for current students.', { icon: '🧹' })
    } else {
      toast.success('All current students marked Present!', { icon: '✅' })
    }
  }

  const handleSaveClick = () => {
    if (!students || students.length === 0) return
    // Only check unfilled for the VISIBLE students (current batch)
    const unfilled = visibleStudents.filter(s => !statuses[s.id])

    if (unfilled.length > 0) {
      setIsUnfilledPopupOpen(true)
      return
    }

    handleConfirmSave()
  }

  const handleConfirmSave = async () => {
    // Only save statuses for students in the CURRENT batch view.
    // Students NOT in this batch get NO record (nil) — not absent.
    const studentStatuses = visibleStudents
      .filter(s => statuses[s.id]) // only those actually marked
      .map((s) => ({
        studentId: s.id,
        status: statuses[s.id],
      }))
    try {
      const blockHours = selection.block?.hours || [selection.hour]
      // Save one attendance record per hour in the block, with the same statuses
      for (const h of blockHours) {
        await saveAttendance.mutateAsync({
          courseId: selection.courseId,
          date: selection.date,
          hour: h,
          studentStatuses,
        })
      }
      const label = blockHours.length > 1
        ? `Attendance saved for Hours ${blockHours[0]}–${blockHours[blockHours.length - 1]}!`
        : 'Attendance saved successfully!'
      toast.success(label)
      navigate('/history')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleHolidayConfirm = async (reason) => {
    try {
      setIsHolidayPopupOpen(false)
      await saveAttendance.mutateAsync({
        courseId: selection.courseId,
        date: selection.date,
        hour: selection.hour,
        studentStatuses: [],
        isHoliday: true,
        holidayReason: reason
      })
      toast.success('Session marked as holiday successfully!')
      navigate('/history')
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Batch computations (needed for both stats and step 2 UI)
  const batch1Students = students?.filter(s => s.batch === 'Batch 1') || []
  const batch2Students = students?.filter(s => s.batch === 'Batch 2') || []
  const hasBatches = batch1Students.length > 0 || batch2Students.length > 0
  const batch1Range = batch1Students.length > 0
    ? `${batch1Students[0]?.roll_number} \u2013 ${batch1Students[batch1Students.length - 1]?.roll_number}`
    : null
  const batch2Range = batch2Students.length > 0
    ? `${batch2Students[0]?.roll_number} \u2013 ${batch2Students[batch2Students.length - 1]?.roll_number}`
    : null
  const visibleStudents = !students ? [] :
    batchFilter === 'Batch 1' ? batch1Students :
    batchFilter === 'Batch 2' ? batch2Students :
    students

  // Stats count only the visible (filtered) students
  const presentCount = visibleStudents.filter(s => statuses[s.id] === 'Present').length
  const absentCount = visibleStudents.filter(s => statuses[s.id] === 'Absent').length
  const unfilledCount = visibleStudents.filter(s => !statuses[s.id]).length

  // ── STEP 1: SELECT COURSE ───────────────────────────────────────────────
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

            {/* Alternate Day (Saturday only) */}
            {isSaturdaySelected && (
              <div className="space-y-1.5">
                <Label htmlFor="alternateDay">Alternate Day Timetable (For Saturday) *</Label>
                <select
                  id="alternateDay"
                  {...register('alternateDay')}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 border-amber-200 text-amber-900"
                >
                  <option value="1">Monday Timetable</option>
                  <option value="2">Tuesday Timetable</option>
                  <option value="3">Wednesday Timetable</option>
                  <option value="4">Thursday Timetable</option>
                  <option value="5">Friday Timetable</option>
                </select>
              </div>
            )}

            {/* Hour */}
            <div className="space-y-1.5">
              <Label htmlFor="hour">Hour *</Label>
              {watchCourseId && availableHours.length === 0 ? (
                <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  No classes scheduled for this course on this date.
                </div>
              ) : (
                <select
                  id="hour"
                  {...register('hour')}
                  disabled={!watchCourseId}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  {!watchCourseId && <option value="">Select a course first</option>}
                  {availableBlocks.map((b) => (
                    <option key={b.start} value={b.start}>
                      {b.hours.length > 1
                        ? `Hours ${b.start}–${b.end} (Lab Block, ${b.hours.length} hrs)`
                        : `Hour ${b.start}`
                      }
                    </option>
                  ))}
                </select>
              )}
              {errors.hour && <p className="text-xs text-red-500">{errors.hour.message}</p>}
            </div>

            {/* Already marked warning */}
            {existingRecord && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                ⚠️ Attendance for this course, date, and hour is already marked.
              </div>
            )}

            <Button type="submit" className="w-full" disabled={watchCourseId && availableHours.length === 0}>
              Proceed to Mark Attendance
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // ── STEP 2: MARK ATTENDANCE ──────────────────────────────────────────────
  const isLabBlock = selection?.block && selection.block.hours.length > 1
  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{selection.courseName}</h1>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
            {format(parseISO(selection.date), 'EEEE, dd MMM yyyy')}
            <span className="text-slate-300">·</span>
            {isLabBlock ? (
              <span className="flex items-center gap-1 text-purple-600 font-medium">
                <Pencil className="w-3 h-3" />
                Hours {selection.block.start}–{selection.block.end} ({selection.block.hours.length}-Hr Lab Session)
              </span>
            ) : (
              `Hour ${selection.hour}`
            )}
            {getDay(parseISO(selection.date)) === 6 && (
              <span className="text-amber-600 font-medium ml-1 flex items-center gap-1">
                <span className="text-slate-300">·</span>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][Number(selection.alternateDay) - 1]} Timetable
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setStep('select')}
          className="text-xs text-blue-500 hover:text-blue-700 font-medium mt-1"
        >
          Change
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-5">
        <div className="bg-white border border-slate-100 rounded-xl px-2 sm:px-4 py-3 text-center shadow-sm">
          <p className="text-xl sm:text-2xl font-bold text-green-500">{presentCount}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-slate-500 mt-0.5">Present</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-2 sm:px-4 py-3 text-center shadow-sm">
          <p className="text-xl sm:text-2xl font-bold text-red-500">{absentCount}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-slate-500 mt-0.5">Absent</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-2 sm:px-4 py-3 text-center shadow-sm">
          <p className="text-xl sm:text-2xl font-bold text-amber-500">{unfilledCount}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-slate-500 mt-0.5">Unmarked</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-2 sm:px-4 py-3 text-center shadow-sm">
          <p className="text-xl sm:text-2xl font-bold text-slate-800">{students?.length ?? 0}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-slate-500 mt-0.5">Total</p>
        </div>
      </div>

      {/* LAB BATCH Filter — only shown when lab block AND batches exist */}
      {isLabBlock && hasBatches && (
        <div className="mb-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Pencil className="w-3 h-3" /> Lab Batch
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setBatchFilter('Batch 1')}
              className={clsx(
                'flex flex-col items-center py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all',
                batchFilter === 'Batch 1'
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
              )}
            >
              <span>Batch 1</span>
              {batch1Range && <span className={clsx('text-[10px] font-normal mt-0.5', batchFilter === 'Batch 1' ? 'text-purple-200' : 'text-slate-400')}>{batch1Range}</span>}
            </button>
            <button
              onClick={() => setBatchFilter('Batch 2')}
              className={clsx(
                'flex flex-col items-center py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all',
                batchFilter === 'Batch 2'
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
              )}
            >
              <span>Batch 2</span>
              {batch2Range && <span className={clsx('text-[10px] font-normal mt-0.5', batchFilter === 'Batch 2' ? 'text-purple-200' : 'text-slate-400')}>{batch2Range}</span>}
            </button>
            <button
              onClick={() => setBatchFilter('All')}
              className={clsx(
                'flex flex-col items-center py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all',
                batchFilter === 'All'
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
              )}
            >
              <span>All</span>
              <span className={clsx('text-[10px] font-normal mt-0.5', batchFilter === 'All' ? 'text-purple-200' : 'text-slate-400')}>{students?.length} students</span>
            </button>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      <div className="flex bg-white border border-slate-200 p-1 rounded-xl mb-5 shadow-sm">
        <button
          onClick={() => setViewMode('list')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            viewMode === 'list' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <List className="w-4 h-4" /> <span>List View</span>
        </button>
        <button
          onClick={() => setViewMode('quick')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            viewMode === 'quick' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Zap className="w-4 h-4" /> <span>Quick Entry</span>
        </button>
        <button
          onClick={() => setViewMode('interactive')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            viewMode === 'interactive' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <MousePointerClick className="w-4 h-4" /> <span className="hidden sm:inline">One-by-One</span><span className="sm:hidden">1x1</span>
        </button>
      </div>

      {studentsLoading && <LoadingSpinner />}

      {!studentsLoading && (!students || students.length === 0) && (
        <EmptyState
          icon={Users}
          title="No students enrolled"
          description="Add students to this course before marking attendance."
        />
      )}

      {!studentsLoading && students && students.length > 0 && (
        <div className="pb-32">
          {viewMode === 'quick' && (
            <QuickEntryMode students={visibleStudents} statuses={statuses} setStatuses={setStatuses} />
          )}

          {viewMode === 'interactive' && (
            <InteractiveMode students={visibleStudents} statuses={statuses} setStatuses={setStatuses} />
          )}

          {viewMode === 'list' && (
            <>
              <p className="text-xs text-slate-400 mb-3">Tap a student to toggle Present ↔ Absent</p>
              <div className="space-y-2">
                {visibleStudents.map((student) => (
                  <StudentAttendanceRow
                    key={student.id}
                    student={student}
                    status={statuses[student.id]}
                    onToggle={handleToggle}
                    attendancePercent={attendancePercentages?.[student.id]}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Sticky Save Button Bar */}
      {students && students.length > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 z-30 bg-white/95 backdrop-blur border-t border-slate-100 px-3 py-3 md:px-8 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <div className="flex gap-2 sm:gap-3 max-w-2xl mx-auto">
            {/* Holiday Button */}
            <Button
              variant="outline"
              className="px-3 sm:px-4 shrink-0 text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-800"
              onClick={() => setIsHolidayPopupOpen(true)}
              disabled={saveAttendance.isPending}
            >
              <Calendar className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="text-sm font-semibold">Holiday</span>
            </Button>

            {/* Present All Button */}
            <Button
              variant="outline"
              className="px-3 sm:px-4 shrink-0 text-green-700 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-800"
              onClick={handlePresentAll}
              disabled={saveAttendance.isPending}
            >
              <CheckSquare className="w-4 h-4 mr-1.5" />
              <span className="text-sm font-semibold hidden sm:inline">
                {visibleStudents.length > 0 && visibleStudents.every(s => statuses[s.id] === 'Present') ? 'Clear All' : 'Present All'}
              </span>
              <span className="text-sm font-semibold sm:hidden">
                {visibleStudents.length > 0 && visibleStudents.every(s => statuses[s.id] === 'Present') ? 'Clear' : 'All'}
              </span>
            </Button>

            {/* Save Button */}
            <Button
              className={clsx(
                'flex-1 transition-all duration-300 text-sm sm:text-base',
                unfilledCount > 0 ? 'bg-slate-300 hover:bg-slate-400 text-slate-700' : ''
              )}
              onClick={handleSaveClick}
              disabled={saveAttendance.isPending}
            >
              {saveAttendance.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : unfilledCount > 0 ? (
                <>Save ({unfilledCount} unmarked)</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-1.5 sm:mr-2" />Save ({visibleStudents.length})</>
              )}
            </Button>
          </div>
        </div>
      )}

      <UnfilledPopup
        isOpen={isUnfilledPopupOpen}
        onClose={() => setIsUnfilledPopupOpen(false)}
        unfilledStudents={students?.filter(s => !statuses[s.id]) || []}
      />

      <HolidayPopup
        isOpen={isHolidayPopupOpen}
        onClose={() => setIsHolidayPopupOpen(false)}
        onConfirm={handleHolidayConfirm}
      />
    </div>
  )
}

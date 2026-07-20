import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileSpreadsheet, FileText, Loader2, Download } from 'lucide-react'
import { format, subMonths } from 'date-fns'
import toast from 'react-hot-toast'
import { useCourses } from '../hooks/useCourses'
import { useAuth } from '../hooks/useAuth'
import { getReportData } from '../services/attendanceService'
import { exportAttendanceToExcel } from '../utils/exportExcel'
import { generateAttendancePdf } from '../utils/generatePdf'
import { Button } from '../components/ui/Button'
import { Label } from '../components/ui/Label'

const TODAY = format(new Date(), 'yyyy-MM-dd')
const THREE_MONTHS_AGO = format(subMonths(new Date(), 3), 'yyyy-MM-dd')

const schema = z.object({
  courseId: z.string().min(1, 'Select a course'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

export default function ReportsPage() {
  const { user } = useAuth()
  const { data: courses } = useCourses()
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { courseId: '', startDate: THREE_MONTHS_AGO, endDate: TODAY },
  })

  const getSelectedCourse = (courseId) => courses?.find((c) => c.id === courseId)

  const handleExcel = async () => {
    const { courseId, startDate, endDate } = getValues()
    if (!courseId) { toast.error('Please select a course first.'); return }
    setIsGeneratingExcel(true)
    try {
      const sessions = await getReportData(courseId, startDate, endDate)
      if (!sessions || sessions.length === 0) {
        toast.error('No attendance data found for this period.')
        return
      }
      const course = getSelectedCourse(courseId)
      exportAttendanceToExcel({ course, sessions, facultyName: user?.email, startDate, endDate })
      toast.success('Excel report downloaded!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsGeneratingExcel(false)
    }
  }

  const handlePdf = async () => {
    const { courseId, startDate, endDate } = getValues()
    if (!courseId) { toast.error('Please select a course first.'); return }
    setIsGeneratingPdf(true)
    try {
      const sessions = await getReportData(courseId, startDate, endDate)
      if (!sessions || sessions.length === 0) {
        toast.error('No attendance data found for this period.')
        return
      }
      const course = getSelectedCourse(courseId)
      generateAttendancePdf({ course, sessions, facultyName: user?.email, startDate, endDate })
      toast.success('PDF report downloaded!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Generate Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Download Excel or PDF attendance reports</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-5">
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

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="startDate">From Date *</Label>
            <input
              id="startDate"
              type="date"
              max={TODAY}
              {...register('startDate')}
              className="block w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate">To Date *</Label>
            <input
              id="endDate"
              type="date"
              max={TODAY}
              {...register('endDate')}
              className="block w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleExcel}
            disabled={isGeneratingExcel || isGeneratingPdf}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {isGeneratingExcel
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <FileSpreadsheet className="w-4 h-4" />
            }
            Download Excel
          </button>
          <button
            onClick={handlePdf}
            disabled={isGeneratingPdf || isGeneratingExcel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {isGeneratingPdf
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <FileText className="w-4 h-4" />
            }
            Download PDF
          </button>
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-slate-400 mt-3 text-center">
        Reports are generated client-side and downloaded immediately. No data is sent to external servers.
      </p>
    </div>
  )
}

import { format, parseISO } from 'date-fns'
import { Calendar, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export function SessionCard({ session, onClick }) {
  const details = session.attendance_details || []
  const presentCount = details.filter((d) => d.status === 'Present').length
  const absentCount = details.filter((d) => d.status === 'Absent').length
  const total = details.length
  const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100) : 0

  return (
    <div
      className="bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            {session.courses && (
              <p className="text-xs font-semibold text-blue-600 mb-1">{session.courses.course_code}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(parseISO(session.date), 'dd MMM yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Hour {session.hour}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{presentCount} Present</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-red-500">
            <XCircle className="w-3.5 h-3.5" />
            <span>{absentCount} Absent</span>
          </div>
          <div className="ml-auto">
            <span className={clsx(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              attendanceRate >= 75 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            )}>
              {attendanceRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { format, parseISO } from 'date-fns'
import { Calendar, Clock, CheckCircle2, XCircle, ChevronRight, Users, CloudRain } from 'lucide-react'
import clsx from 'clsx'

export function SessionCard({ session, onClick }) {
  const details = session.attendance_details || []
  const presentCount = details.filter((d) => d.status === 'Present').length
  const absentCount = details.filter((d) => d.status === 'Absent').length
  const total = details.length
  const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100) : 0

  const sessionDate = parseISO(session.date)

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer overflow-hidden group"
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row items-center p-4 sm:p-5 gap-4 sm:gap-6">
        
        {/* Date Section (Prominent) */}
        <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center w-full sm:w-32 bg-slate-50 sm:bg-transparent rounded-lg p-3 sm:p-0 border sm:border-none border-slate-100 shrink-0">
          <div className="text-center">
            <span className="block text-2xl font-bold text-slate-800 leading-none">
              {format(sessionDate, 'dd')}
            </span>
            <span className="block text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">
              {format(sessionDate, 'MMM yyyy')}
            </span>
          </div>
          <div className="text-right sm:text-center mt-0 sm:mt-2">
            <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-lg">
              {format(sessionDate, 'EEEE')}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-16 bg-slate-100"></div>

        {/* Course & Time Details */}
        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {session.courses && (
              <span className="text-sm font-bold text-slate-900 truncate">
                {session.courses.course_code} - {session.courses.course_name}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
              <Clock className="w-3 h-3" /> Hour {session.hour}
            </span>
          </div>
          
          {/* Stats or Holiday Row */}
          {session.is_holiday ? (
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-bold">
                <CloudRain className="w-4 h-4" />
                <span>Holiday</span>
              </div>
              <span className="text-sm text-slate-600 font-medium">
                {session.holiday_reason || 'No reason provided'}
              </span>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors ml-auto hidden sm:block" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{total} Total</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{presentCount} Present</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>{absentCount} Absent</span>
              </div>
              <div className="sm:ml-auto flex items-center gap-3">
                <span className={clsx(
                  'text-sm font-bold px-3 py-1 rounded-lg',
                  attendanceRate >= 75 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                )}>
                  {attendanceRate}%
                </span>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors hidden sm:block" />
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { History, ChevronLeft, Pencil, CheckCircle2, XCircle } from 'lucide-react'
import { useCourses } from '../hooks/useCourses'
import { useAttendanceHistory, useAllHistory, useSessionDetails } from '../hooks/useAttendance'
import { SessionCard } from '../components/attendance/SessionCard'
import { EditAttendanceModal } from '../components/attendance/EditAttendanceModal'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Badge } from '../components/ui/Badge'
import clsx from 'clsx'

export default function HistoryPage() {
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [selectedSession, setSelectedSession] = useState(null)
  const [editRow, setEditRow] = useState(null)

  const { data: courses } = useCourses()
  const { data: allHistory, isLoading } = useAllHistory()
  const { data: sessionDetails, isLoading: detailsLoading } = useSessionDetails(selectedSession?.id)

  const filteredHistory = selectedCourse === 'all'
    ? allHistory
    : allHistory?.filter((s) => s.course_id === selectedCourse)

  if (selectedSession) {
    const details = sessionDetails || []
    const presentCount = details.filter((d) => d.status === 'Present').length
    const absentCount = details.filter((d) => d.status === 'Absent').length

    return (
      <div className="max-w-2xl">
        {/* Header */}
        <button
          onClick={() => setSelectedSession(null)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to History
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-4">
          {selectedSession.courses && (
            <Badge variant="blue" className="mb-2">{selectedSession.courses.course_code}</Badge>
          )}
          <h1 className="text-xl font-bold text-slate-900">
            {format(parseISO(selectedSession.date), 'EEEE, dd MMMM yyyy')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Hour {selectedSession.hour}</p>
          <div className="flex gap-4 mt-3">
            <span className="text-xs text-green-600 font-medium">{presentCount} Present</span>
            <span className="text-xs text-red-500 font-medium">{absentCount} Absent</span>
          </div>
        </div>

        {detailsLoading && <LoadingSpinner />}

        {!detailsLoading && details.length > 0 && (
          <div className="space-y-2">
            {details.map((detail) => (
              <div
                key={detail.id}
                className={clsx(
                  'flex items-center justify-between px-4 py-3 rounded-xl border',
                  detail.status === 'Present'
                    ? 'bg-green-50 border-green-100'
                    : 'bg-red-50 border-red-100'
                )}
              >
                <div className="flex items-center gap-3">
                  {detail.status === 'Present'
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <XCircle className="w-4 h-4 text-red-400" />
                  }
                  <div>
                    <p className="text-sm font-medium text-slate-800">{detail.students?.name}</p>
                    <p className="text-xs text-slate-500">{detail.students?.roll_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditRow(detail)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {editRow && (
          <EditAttendanceModal
            isOpen={!!editRow}
            onClose={() => setEditRow(null)}
            attendanceId={selectedSession.id}
            detailRow={editRow}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Attendance History</h1>
        <p className="text-sm text-slate-500 mt-0.5">View and edit past attendance sessions</p>
      </div>

      {/* Course Filter */}
      {courses && courses.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setSelectedCourse('all')}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              selectedCourse === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            )}
          >
            All Courses
          </button>
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourse(c.id)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                selectedCourse === c.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              )}
            >
              {c.course_code}
            </button>
          ))}
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      {!isLoading && (!filteredHistory || filteredHistory.length === 0) && (
        <EmptyState
          icon={History}
          title="No attendance records yet"
          description="Mark attendance for a course to see it here."
        />
      )}

      {!isLoading && filteredHistory && filteredHistory.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredHistory.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => setSelectedSession(session)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

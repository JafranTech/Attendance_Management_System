import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { History, ChevronLeft, Pencil, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { useCourses } from '../hooks/useCourses'
import { useAttendanceHistory, useAllHistory, useSessionDetails, useDeleteSession } from '../hooks/useAttendance'
import toast from 'react-hot-toast'
import { SessionCard } from '../components/attendance/SessionCard'
import { EditAttendanceModal } from '../components/attendance/EditAttendanceModal'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Badge } from '../components/ui/Badge'
import clsx from 'clsx'

export default function HistoryPage() {
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [searchDate, setSearchDate] = useState('')
  const [searchEndDate, setSearchEndDate] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const [editRow, setEditRow] = useState(null)

  const { data: courses } = useCourses()
  const { data: allHistory, isLoading } = useAllHistory()
  const { data: sessionDetails, isLoading: detailsLoading } = useSessionDetails(selectedSession?.id)
  const deleteSession = useDeleteSession()

  const filteredHistory = useMemo(() => {
    if (!allHistory) return []
    let result = allHistory
    
    if (selectedCourse !== 'all') {
      result = result.filter(s => s.course_id === selectedCourse)
    }
    if (searchDate) {
      result = result.filter(s => s.date >= searchDate)
    }
    if (searchEndDate) {
      result = result.filter(s => s.date <= searchEndDate)
    }
    
    return result
  }, [allHistory, selectedCourse, searchDate, searchEndDate])

  const handleDeleteSession = async () => {
    if (window.confirm('Are you sure you want to delete this entire attendance session? This action cannot be undone.')) {
      try {
        await deleteSession.mutateAsync(selectedSession.id)
        toast.success('Session deleted successfully')
        setSelectedSession(null)
      } catch (err) {
        toast.error(err.message)
      }
    }
  }

  if (selectedSession) {
    const details = sessionDetails || []
    const presentCount = details.filter((d) => d.status === 'Present').length
    const absentCount = details.filter((d) => d.status === 'Absent').length

    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedSession(null)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to History
          </button>
          
          <button
            onClick={handleDeleteSession}
            disabled={deleteSession.isPending}
            className="flex items-center gap-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors font-semibold disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleteSession.isPending ? 'Deleting...' : 'Delete Session'}
          </button>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              {selectedSession.courses && (
                <Badge variant="blue" className="mb-3">{selectedSession.courses.course_code}</Badge>
              )}
              <h1 className="text-2xl font-bold text-slate-900">
                {format(parseISO(selectedSession.date), 'EEEE, dd MMMM yyyy')}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Hour {selectedSession.hour}</p>
            </div>
            <div className="flex gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
              <div className="text-center">
                <span className="block text-lg font-bold text-green-600">{presentCount}</span>
                <span className="text-[10px] uppercase font-bold text-green-700 tracking-wider">Present</span>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div className="text-center">
                <span className="block text-lg font-bold text-red-500">{absentCount}</span>
                <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Absent</span>
              </div>
            </div>
          </div>
        </div>

        {detailsLoading && <LoadingSpinner />}

        {selectedSession.is_holiday && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center mt-4">
            <h3 className="text-lg font-bold text-amber-800 mb-2">Holiday Session</h3>
            <p className="text-amber-700">
              This session was marked as a holiday: <strong className="font-semibold">{selectedSession.holiday_reason}</strong>
            </p>
          </div>
        )}

        {!detailsLoading && !selectedSession.is_holiday && details.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mt-4">
            <div className="divide-y divide-slate-50">
              {details.map((detail) => (
                <div
                  key={detail.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      detail.status === 'Present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                    )}>
                      {detail.status === 'Present' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{detail.students?.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs font-medium text-slate-500">{detail.students?.roll_number}</p>
                        {detail.latest_edit_reason && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-semibold border border-amber-100 truncate max-w-[150px] sm:max-w-[200px]" title={detail.latest_edit_reason}>
                            Edited: {detail.latest_edit_reason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditRow(detail)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              ))}
            </div>
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance History</h1>
          <p className="text-sm text-slate-500 mt-1">View and edit past attendance sessions</p>
        </div>
        
        {/* Date Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white p-2 border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-10 sm:w-auto text-right">From</span>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="flex-1 sm:w-36 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-10 sm:w-auto text-right">To</span>
            <input
              type="date"
              value={searchEndDate}
              min={searchDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
              className="flex-1 sm:w-36 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            />
          </div>
          
          {(searchDate || searchEndDate) && (
            <button 
              onClick={() => { setSearchDate(''); setSearchEndDate('') }}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2 w-full sm:w-auto text-center mt-1 sm:mt-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Course Filter */}
      {courses && courses.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSelectedCourse('all')}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm',
              selectedCourse === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            )}
          >
            All Courses
          </button>
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourse(c.id)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm',
                selectedCourse === c.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
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
          title="No attendance records found"
          description={(searchDate || searchEndDate) ? "No records found for the selected date range." : "Mark attendance for a course to see it here."}
        />
      )}

      {!isLoading && filteredHistory && filteredHistory.length > 0 && (
        <div className="space-y-4">
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

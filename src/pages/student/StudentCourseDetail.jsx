import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, CheckCircle2, XCircle, BookOpen } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useMyStudentRecord, useMyCourseAttendance, useMySubjects } from '../../hooks/useStudentPortal'
import clsx from 'clsx'

const FILTERS = ['All', 'Present', 'Absent']

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function SessionCard({ session }) {
  const isPresent = session.status === 'Present'
  return (
    <div className={clsx(
      'flex items-center justify-between p-4 rounded-2xl border transition-all',
      isPresent
        ? 'bg-emerald-50/60 border-emerald-100'
        : 'bg-red-50/60 border-red-100'
    )}>
      <div className="flex items-center gap-3">
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          isPresent ? 'bg-emerald-100' : 'bg-red-100'
        )}>
          {isPresent
            ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            : <XCircle className="w-5 h-5 text-red-500" />
          }
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-400" />
            <p className="text-sm font-semibold text-slate-800">{formatDate(session.date)}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            <p className="text-xs text-slate-500">Period {session.hour}</p>
          </div>
        </div>
      </div>
      <span className={clsx(
        'text-xs font-bold px-3 py-1.5 rounded-full border',
        isPresent
          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
          : 'bg-red-100 text-red-600 border-red-200'
      )}>
        {session.status}
      </span>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 animate-pulse">
      <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 rounded w-36" />
        <div className="h-3 bg-slate-100 rounded w-20" />
      </div>
      <div className="h-6 w-16 bg-slate-100 rounded-full" />
    </div>
  )
}

export default function StudentCourseDetail() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState('All')

  const { data: studentRecord } = useMyStudentRecord(user?.id)
  const studentId = studentRecord?.id

  const { data: sessions, isLoading } = useMyCourseAttendance(courseId, studentId)
  const { data: subjects } = useMySubjects(studentId)

  // Find subject info for this course
  const subject = subjects?.find(s => s.course_id === courseId)

  // Filter client-side
  const filtered = sessions?.filter(s => {
    if (activeFilter === 'Present') return s.status === 'Present'
    if (activeFilter === 'Absent') return s.status === 'Absent'
    return true
  }) ?? []

  const totalSessions = sessions?.length ?? 0
  const presentCount = sessions?.filter(s => s.status === 'Present').length ?? 0
  const absentCount = totalSessions - presentCount
  const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0
  const barColor = percentage >= 75 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'

  const emptyMessages = {
    All: 'No attendance records yet for this subject.',
    Present: 'No present records found.',
    Absent: 'No absent records — great attendance! 🎉',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium truncate">
                {subject?.course_code ?? '...'}
              </p>
              <h1 className="text-base font-bold text-slate-900 truncate leading-tight">
                {subject?.course_name ?? 'Loading...'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">

        {/* Stats Card */}
        {subject && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Overall Attendance</p>
                  <p className="text-lg font-bold text-slate-900">{percentage}%</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-600">{presentCount}</p>
                    <p className="text-xs text-slate-400">Present</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-500">{absentCount}</p>
                    <p className="text-xs text-slate-400">Absent</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-700">{totalSessions}</p>
                    <p className="text-xs text-slate-400">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={clsx('h-full rounded-full transition-all', barColor)}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            {percentage < 75 && totalSessions > 0 && (
              <p className="text-xs text-amber-600 font-medium mt-2">
                ⚠️ Below 75% — attendance is low.
              </p>
            )}
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={clsx(
                'flex-1 py-2 text-sm font-semibold rounded-xl border transition-all',
                activeFilter === f
                  ? f === 'Present'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : f === 'Absent'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              {f}
              {f !== 'All' && sessions && (
                <span className={clsx(
                  'ml-1 text-xs',
                  activeFilter === f ? 'opacity-80' : 'opacity-50'
                )}>
                  ({f === 'Present' ? presentCount : absentCount})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Session List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              {activeFilter === 'Absent'
                ? <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                : <BookOpen className="w-6 h-6 text-slate-300" />
              }
            </div>
            <p className="text-sm font-semibold text-slate-500">{emptyMessages[activeFilter]}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((session) => (
              <SessionCard key={session.attendance_id} session={session} />
            ))}
          </div>
        )}

        <div className="pb-6" />
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { ChevronRight, BookOpen, LogOut, GraduationCap, AlertTriangle, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useMyStudentRecord, useMySubjects } from '../../hooks/useStudentPortal'
import cresLogo from '../../assets/Logo.jpeg'
import clsx from 'clsx'

function PercentageBadge({ pct }) {
  if (pct >= 75) return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
      {pct}%
    </span>
  )
  if (pct >= 60) return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
      {pct}%
    </span>
  )
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
      {pct}%
    </span>
  )
}

function SubjectCard({ subject, onClick }) {
  const { course_code, course_name, semester, faculty_name, total, present, absent, percentage } = subject
  const isLow = percentage < 75 && total > 0
  const barColor = percentage >= 75 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left bg-white rounded-2xl border shadow-sm p-4 transition-all active:scale-[0.98] hover:shadow-md',
        isLow ? 'border-red-200' : 'border-slate-100'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Subject header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
              {course_code}
            </span>
            {semester && (
              <span className="text-xs text-slate-400 truncate">{semester}</span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 leading-tight truncate">{course_name}</h3>
          {faculty_name && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">by {faculty_name}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <PercentageBadge pct={percentage} />
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all', barColor)}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <p className="text-xs text-slate-500">
            {total === 0
              ? 'No sessions yet'
              : `${present} Present · ${absent} Absent · ${total} Total`
            }
          </p>
          {isLow && total > 0 && (
            <div className="flex items-center gap-1 text-red-500">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs font-medium">Low</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-slate-100 rounded w-20" />
          <div className="h-4 bg-slate-100 rounded w-48" />
          <div className="h-3 bg-slate-100 rounded w-32" />
        </div>
        <div className="h-6 w-12 bg-slate-100 rounded-full" />
      </div>
      <div className="mt-3 h-2 bg-slate-100 rounded-full" />
    </div>
  )
}

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const authUserId = user?.id

  const { data: studentRecord, isLoading: recordLoading } = useMyStudentRecord(authUserId)
  const { data: subjects, isLoading: subjectsLoading } = useMySubjects(studentRecord?.id)

  const isLoading = recordLoading || subjectsLoading
  const studentName = studentRecord?.name ?? user?.user_metadata?.name ?? 'Student'
  const rollNumber = studentRecord?.roll_number ?? user?.user_metadata?.roll_number ?? ''

  const overallPresent = subjects?.reduce((sum, s) => sum + s.present, 0) ?? 0
  const overallTotal = subjects?.reduce((sum, s) => sum + s.total, 0) ?? 0
  const overallPct = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={cresLogo} className="w-8 h-8 object-contain rounded-lg" alt="Crescent" />
            <div>
              <p className="text-xs text-slate-400 font-medium leading-none">IT Department ERP</p>
              <p className="text-sm font-bold text-slate-800 leading-tight">Attendance Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/student/settings')}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Welcome back 👋</p>
              <h1 className="text-xl font-bold mt-0.5 leading-tight">{studentName}</h1>
              {rollNumber && (
                <p className="text-blue-200 text-xs mt-1 font-mono">{rollNumber}</p>
              )}
            </div>
            <div className="bg-white/20 rounded-xl p-2.5">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Overall stats */}
          {overallTotal > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-500/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-xs font-medium">Overall Attendance</span>
                <span className="text-white text-sm font-bold">{overallPct}%</span>
              </div>
              <div className="h-2 bg-blue-500/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${Math.min(overallPct, 100)}%` }}
                />
              </div>
              <p className="text-blue-200 text-xs mt-1.5">{overallPresent} present out of {overallTotal} total classes</p>
            </div>
          )}
        </div>

        {/* Subjects */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              My Subjects
              {subjects && <span className="ml-1.5 text-slate-400 font-normal normal-case">({subjects.length})</span>}
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : subjects?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">No subjects enrolled</p>
              <p className="text-xs text-slate-400 mt-1">Contact your faculty if this is incorrect.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjects?.map(subject => (
                <SubjectCard
                  key={subject.course_id}
                  subject={subject}
                  onClick={() => navigate(`/student/course/${subject.course_id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-300 pb-4">
          B.S. Abdur Rahman Crescent Institute · IT Department
        </p>
      </div>
    </div>
  )
}

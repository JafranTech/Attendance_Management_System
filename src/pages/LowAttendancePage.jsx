import { useState, useMemo } from 'react'
import { AlertTriangle, Filter, Users, TrendingDown } from 'lucide-react'
import { useLowAttendanceStudents } from '../hooks/useDashboard'
import { useCourses } from '../hooks/useCourses'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import clsx from 'clsx'

export default function LowAttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState('all')

  const { data: lowStudents, isLoading } = useLowAttendanceStudents()
  const { data: courses } = useCourses()

  const filteredStudents = useMemo(() => {
    if (!lowStudents) return []
    if (selectedCourse === 'all') return lowStudents
    return lowStudents.filter((s) => s.courseId === selectedCourse)
  }, [lowStudents, selectedCourse])

  // Build unique course options from the low-attendance data
  const courseOptions = useMemo(() => {
    if (!lowStudents) return []
    const seen = new Set()
    return lowStudents
      .filter((s) => {
        if (seen.has(s.courseId)) return false
        seen.add(s.courseId)
        return true
      })
      .map((s) => ({ id: s.courseId, code: s.courseCode, name: s.courseName || s.courseCode }))
  }, [lowStudents])

  const criticalCount = filteredStudents.filter((s) => s.percentage < 50).length
  const warningCount = filteredStudents.filter((s) => s.percentage >= 50).length

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-amber-50 rounded-xl">
            <TrendingDown className="w-5 h-5 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Low Attendance</h1>
        </div>
        <p className="text-sm text-slate-500 ml-12">Students below 75% attendance threshold</p>
      </div>

      {/* Summary Badges */}
      {!isLoading && lowStudents && (
        <div className="flex gap-3 mb-5">
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-semibold text-red-700">{criticalCount} Critical</span>
            <span className="text-xs text-red-500">(&lt;50%)</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm font-semibold text-amber-700">{warningCount} Warning</span>
            <span className="text-xs text-amber-500">(50–74%)</span>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            Filter by Class:
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCourse('all')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                selectedCourse === 'all'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              All Classes ({lowStudents?.length ?? 0})
            </button>
            {courseOptions.map((c) => {
              const count = lowStudents?.filter((s) => s.courseId === c.id).length ?? 0
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourse(c.id)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                    selectedCourse === c.id
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  )}
                >
                  {c.code} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">
        {isLoading && (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && filteredStudents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-slate-700">All Clear!</p>
            <p className="text-sm text-slate-400 mt-1">
              {selectedCourse === 'all'
                ? 'All students are above 75% attendance.'
                : 'No students below 75% in this class.'}
            </p>
          </div>
        )}

        {!isLoading && filteredStudents.length > 0 && (
          <div className="divide-y divide-slate-50">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-slate-50 rounded-t-2xl">
              <span className="col-span-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">#</span>
              <span className="col-span-5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Student</span>
              <span className="col-span-4 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:block">Subject</span>
              <span className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wide text-right">Attendance</span>
            </div>

            {filteredStudents.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors">
                <span className="col-span-1 text-sm text-slate-400 font-medium">{i + 1}</span>

                <div className="col-span-5 sm:col-span-5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className={clsx(
                      'w-4 h-4 flex-shrink-0',
                      s.percentage < 50 ? 'text-red-500' : 'text-amber-500'
                    )} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.rollNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-4 hidden sm:block">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                    {s.courseCode}
                  </span>
                </div>

                <div className="col-span-6 sm:col-span-2 flex justify-end">
                  {/* Percentage bar */}
                  <div className="flex flex-col items-end gap-1 min-w-[72px]">
                    <span className={clsx(
                      'text-sm font-bold px-2.5 py-1 rounded-full',
                      s.percentage < 50 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {s.percentage}%
                    </span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          'h-full rounded-full transition-all',
                          s.percentage < 50 ? 'bg-red-400' : 'bg-amber-400'
                        )}
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredStudents.length > 0 && (
        <p className="text-xs text-slate-400 text-center mt-3">
          Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} below 75% attendance
        </p>
      )}
    </div>
  )
}

import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, User, AlertTriangle, CheckCircle2, GraduationCap } from 'lucide-react'
import { HodLayout } from '../../components/hod/HodLayout'
import { useHodClasses, useHodCoursesByClass, useHodCourseAttendanceSummary } from '../../hooks/useHod'
import { LOW_ATTENDANCE_THRESHOLD } from '../../services/hodService'

export default function HodClassDetail() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { data: allClasses } = useHodClasses()
  const { data: courses, isLoading, isError } = useHodCoursesByClass(classId)

  const currentClass = allClasses?.find((c) => c.id === classId)

  return (
    <HodLayout backTo="/hod/dashboard" backLabel="All Classes">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-3 font-medium">
          <GraduationCap className="w-4 h-4" />
          <button onClick={() => navigate('/hod/dashboard')} className="hover:text-indigo-600 transition-colors">All Classes</button>
          <span>/</span>
          <span className="text-indigo-600 uppercase font-bold tracking-wide">{currentClass?.name || 'Class'}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-wide">
          {currentClass?.name || 'Class Detail'}
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          {courses?.length ?? 0} subject{courses?.length !== 1 ? 's' : ''} found for this class section.
          Click a subject to view attendance.
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-slate-100 animate-pulse shadow-sm" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 text-red-600">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Failed to load subjects. Please refresh.</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && courses?.length === 0 && (
        <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl border-dashed">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-bold text-slate-700">No subjects linked to this class</p>
          <p className="text-sm mt-1 text-slate-500">Faculty need to create courses and link them to this class section.</p>
        </div>
      )}

      {/* Subject Cards */}
      {!isLoading && courses && courses.length > 0 && (
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              onClick={() => navigate(`/hod/course/${course.id}`)}
            />
          ))}
        </div>
      )}
    </HodLayout>
  )
}

function CourseRow({ course, onClick }) {
  const { data: summary, isLoading: summaryLoading } = useHodCourseAttendanceSummary(course.id)
  const overall = summary?.overall
  const enrolledCount = course.course_students?.[0]?.count ?? 0

  const isLow = overall != null && overall < LOW_ATTENDANCE_THRESHOLD
  const hasNoData = overall === null && !summaryLoading

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100/50 hover:-translate-y-0.5"
    >
      <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          isLow ? 'bg-red-50 border border-red-100' : 'bg-indigo-50 border border-indigo-100 group-hover:bg-indigo-100'
        }`}>
          <BookOpen className={`w-6 h-6 ${isLow ? 'text-red-600' : 'text-indigo-600'}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-widest">{course.course_code}</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 group-hover:text-indigo-700 transition-colors">
                {course.course_name}
              </h3>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {course.faculty?.name ?? 'Unknown'}
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <p className="text-xs font-medium text-slate-500">{enrolledCount} enrolled</p>
                {course.semester && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <p className="text-xs font-medium text-slate-500">{course.semester}</p>
                  </>
                )}
              </div>
            </div>

            {/* Attendance Badge */}
            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              {summaryLoading ? (
                <div className="w-16 h-8 rounded-lg bg-slate-100 animate-pulse" />
              ) : hasNoData ? (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">No data</span>
              ) : (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${
                  isLow
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}>
                  {isLow
                    ? <AlertTriangle className="w-3.5 h-3.5" />
                    : <CheckCircle2 className="w-3.5 h-3.5" />
                  }
                  {overall}%
                </div>
              )}
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
          </div>

          {/* Attendance Progress Bar */}
          {!summaryLoading && overall != null && (
            <div className="mt-4">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(overall, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-medium text-slate-500 mt-1.5">
                <span>0%</span>
                <span className={`font-bold ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>
                  {isLow ? `${overall}% — Below ${LOW_ATTENDANCE_THRESHOLD}% threshold` : `${overall}% — Good`}
                </span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

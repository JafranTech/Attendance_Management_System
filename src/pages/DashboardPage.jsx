import { useState } from 'react'
import { format } from 'date-fns'
import { BookOpen, Users, AlertTriangle, TrendingUp, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDashboardStats, useAttendanceTrend, useLowAttendanceStudents, useTodaySchedule } from '../hooks/useDashboard'
import { useCourses } from '../hooks/useCourses'
import { StatsCard } from '../components/dashboard/StatsCard'
import { AttendanceBarChart } from '../components/dashboard/AttendanceBarChart'
import { QuickActions } from '../components/dashboard/QuickActions'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedCourseId, setSelectedCourseId] = useState(null)

  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: trend, isLoading: trendLoading } = useAttendanceTrend(selectedCourseId)
  const { data: lowStudents, isLoading: lowLoading } = useLowAttendanceStudents()
  const { data: todaySchedule, isLoading: scheduleLoading } = useTodaySchedule()
  const { data: courses } = useCourses()

  const facultyName = user?.email?.split('@')[0] ?? 'Faculty'
  const today = format(new Date(), 'EEEE, dd MMMM yyyy')

  const selectedCourseName = selectedCourseId
    ? courses?.find((c) => c.id === selectedCourseId)?.course_name ?? 'Selected Course'
    : null

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Good {getGreeting()}, {facultyName}! 👋
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">{today}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          icon={BookOpen}
          label="Total Courses"
          value={statsLoading ? '…' : stats?.totalCourses}
          subtext="This semester"
          color="blue"
        />
        <StatsCard
          icon={Users}
          label="Total Students"
          value={statsLoading ? '…' : stats?.totalStudents}
          subtext="Across all courses"
          color="purple"
        />
        <StatsCard
          icon={AlertTriangle}
          label="Low Attendance"
          value={lowLoading ? '…' : lowStudents?.length}
          subtext="Below 75% — Click to view"
          color="amber"
          onClick={() => navigate('/low-attendance')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          {/* Chart Header with Subject Filter */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-semibold text-slate-900">
                7-Day Attendance Trend
                {selectedCourseName && (
                  <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {selectedCourseName}
                  </span>
                )}
              </h2>
            </div>

            {/* Subject Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedCourseId ?? ''}
                onChange={(e) => setSelectedCourseId(e.target.value || null)}
                className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-slate-300 transition-colors"
              >
                <option value="">All Subjects</option>
                {courses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course_code} — {c.course_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {trendLoading ? <LoadingSpinner /> : <AttendanceBarChart data={trend} />}
        </div>

        {/* Quick Actions / Today's Classes */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Today's Classes</h2>
          {scheduleLoading ? <LoadingSpinner size="sm" /> : <QuickActions schedule={todaySchedule} />}
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

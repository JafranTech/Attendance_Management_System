import { format } from 'date-fns'
import { BookOpen, Users, AlertTriangle, TrendingUp } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useDashboardStats, useAttendanceTrend, useLowAttendanceStudents, useTodaySchedule } from '../hooks/useDashboard'
import { StatsCard } from '../components/dashboard/StatsCard'
import { AttendanceBarChart } from '../components/dashboard/AttendanceBarChart'
import { LowAttendanceList } from '../components/dashboard/LowAttendanceList'
import { QuickActions } from '../components/dashboard/QuickActions'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: trend, isLoading: trendLoading } = useAttendanceTrend()
  const { data: lowStudents, isLoading: lowLoading } = useLowAttendanceStudents()
  const { data: todaySchedule, isLoading: scheduleLoading } = useTodaySchedule()

  const facultyName = user?.email?.split('@')[0] ?? 'Faculty'
  const today = format(new Date(), 'EEEE, dd MMMM yyyy')

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
          subtext="Below 75%"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">7-Day Attendance Trend</h2>
          </div>
          {trendLoading ? <LoadingSpinner /> : <AttendanceBarChart data={trend} />}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Today's Classes</h2>
          {scheduleLoading ? <LoadingSpinner size="sm" /> : <QuickActions schedule={todaySchedule} />}
        </div>
      </div>

      {/* Low Attendance Students */}
      {(lowStudents?.length > 0 || lowLoading) && (
        <div className="mt-4 bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Students Below 75% Attendance</h2>
            <span className="text-xs text-slate-400">{lowStudents?.length ?? 0} students</span>
          </div>
          {lowLoading ? <LoadingSpinner size="sm" /> : <LowAttendanceList students={lowStudents} />}
        </div>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

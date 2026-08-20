import { useAdminStats } from '../../hooks/useAdmin'
import { Shield, Users, GraduationCap, BookOpen, Loader2, TrendingUp } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 bg-white shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
          {value ?? <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
        </p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const { data: stats, isLoading } = useAdminStats()

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-md shadow-amber-200">
          <Shield className="w-6 h-6 text-slate-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}, {profile?.name?.split(' ')[0] ?? 'Admin'}!</h1>
          <p className="text-sm text-slate-500 mt-0.5">You have full administrative control over the ERP system.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Faculty & HODs"
          value={isLoading ? null : stats?.facultyCount}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={GraduationCap}
          label="Class Sections"
          value={isLoading ? null : stats?.classesCount}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={BookOpen}
          label="Total Students"
          value={isLoading ? null : stats?.studentsCount}
          color="text-violet-600"
          bg="bg-violet-50"
        />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">Admin Responsibilities</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            {[
              'Manage all Faculty and HOD accounts',
              'Reset passwords for faculty, HOD, or students',
              'Create and delete class sections',
              'Import student rosters via Excel on behalf of advisors',
              'Delete students from master rosters',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-900">Security Notice</h3>
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            This panel has elevated privileges. All password reset operations are logged
            server-side. Faculty and students cannot delete or modify master rosters — only
            the Admin can. Protect your credentials.
          </p>
          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="text-xs text-amber-700 font-medium">
              Logged in as: <span className="font-bold">{profile?.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

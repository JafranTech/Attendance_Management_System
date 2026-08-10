import { useNavigate } from 'react-router-dom'
import { Users, BookOpen, ChevronRight, AlertTriangle, Calendar, RefreshCw } from 'lucide-react'
import { HodLayout } from '../../components/hod/HodLayout'
import { useHodClasses } from '../../hooks/useHod'
import { useAuth } from '../../hooks/useAuth'
import cresLogo from '../../assets/Logo.jpeg'

export default function HodDashboard() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { data: classes, isLoading, isError, refetch } = useHodClasses()

  const totalClasses = classes?.length ?? 0
  const totalStudents = classes?.reduce((sum, c) => sum + (c.students?.[0]?.count ?? 0), 0) ?? 0

  return (
    <HodLayout>
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-indigo-600 text-sm font-bold mb-3 uppercase tracking-wider">
          Live Monitoring Console
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Good {getGreeting()}, {profile?.name || 'HOD'}.
        </h1>
        <p className="text-slate-500 mt-2 text-base">
          Monitoring <span className="text-slate-800 font-bold">{totalClasses}</span> class sections
          with <span className="text-slate-800 font-bold">{totalStudents}</span> enrolled students
          in the IT Department.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Class Sections" value={totalClasses} imageSrc={cresLogo} color="indigo" />
        <StatCard label="Total Students" value={totalStudents} icon={Users} color="blue" />
        <StatCard label="Today" value={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} icon={Calendar} color="violet" isText />
      </div>

      {/* Heading */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-900">All Class Sections</h2>
        <p className="text-slate-500 text-sm font-medium">Click a section to view subjects</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-red-50 border border-red-200 rounded-2xl p-5">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-700">Failed to load classes</p>
            <p className="text-sm text-red-500 mt-0.5">There was a problem connecting. This usually resolves on its own.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && classes?.length === 0 && (
        <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl border-dashed">
          <img src={cresLogo} className="w-16 h-16 mx-auto mb-4 object-contain opacity-30 grayscale" alt="" />
          <p className="text-lg font-bold text-slate-700">No classes found</p>
          <p className="text-sm mt-1 text-slate-500">Faculty members need to create class sections first.</p>
        </div>
      )}

      {/* Class Cards Grid */}
      {!isLoading && classes && classes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {classes.map((cls) => {
            const studentCount = cls.students?.[0]?.count ?? 0
            const courseCount = cls.courses?.[0]?.count ?? 0
            return (
              <button
                key={cls.id}
                onClick={() => navigate(`/hod/class/${cls.id}`)}
                className="group relative bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 border border-indigo-100 rounded-xl flex items-center justify-center mb-5 transition-colors">
                  <img src={cresLogo} className="w-6 h-6 object-contain" alt="" />
                </div>

                {/* Class Name */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight uppercase tracking-wide mb-4">
                  {cls.name}
                </h3>

                {/* Stats */}
                <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                    <Users className="w-4 h-4" />
                    <span>{studentCount} students</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                    <BookOpen className="w-4 h-4" />
                    <span>{courseCount} subject{courseCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-500 transition-colors">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </HodLayout>
  )
}

function StatCard({ label, value, icon: Icon, color, isText, imageSrc }) {
  const colorMap = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    violet: 'bg-violet-50 border-violet-100 text-violet-700',
  }
  const iconColorMap = {
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    violet: 'text-violet-600',
  }
  
  return (
    <div className={`border rounded-2xl p-5 flex items-center gap-4 ${colorMap[color]}`}>
      {imageSrc ? (
        <img src={imageSrc} className="w-7 h-7 object-contain rounded flex-shrink-0" alt="" />
      ) : (
        <Icon className={`w-7 h-7 flex-shrink-0 ${iconColorMap[color]}`} />
      )}
      <div>
        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${iconColorMap[color]} opacity-80`}>{label}</p>
        <p className={`font-black leading-none ${isText ? 'text-lg mt-1' : 'text-3xl'}`}>{value}</p>
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

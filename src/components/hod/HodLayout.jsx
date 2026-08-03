import { LogOut, GraduationCap, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export function HodLayout({ children, backTo, backLabel }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out.')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo + title */}
          <button
            onClick={() => navigate('/hod/dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-900 leading-none">IT Department</p>
              <p className="text-xs text-slate-500 leading-none mt-0.5">HOD Monitoring Console</p>
            </div>
          </button>

          {/* Center: Breadcrumb */}
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
            >
              <span className="text-slate-400">←</span>
              {backLabel || 'Back'}
            </button>
          )}

          {/* Right: User + logout */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <div className="text-left">
                <p className="text-xs font-bold text-indigo-900 leading-none">{profile?.name || 'HOD'}</p>
                <p className="text-[10px] text-indigo-600 font-medium leading-none mt-0.5">Head of Department</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-8">
        {children}
      </main>
    </div>
  )
}


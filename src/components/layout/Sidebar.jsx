import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  History,
  FileText,
  Settings,
  LogOut,
  AlertTriangle,
  Users,
} from 'lucide-react'
import Logo from '../../assets/Logo.jpeg'
import { useAuth } from '../../hooks/useAuth'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/classes', icon: Users, label: 'Classes & Roster' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/low-attendance', icon: AlertTriangle, label: 'Low Attendance' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-slate-100 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <img src={Logo} alt="IT ERP" className="w-9 h-9 object-contain rounded-lg shadow-sm" />
        <div>
          <p className="font-bold text-slate-900 text-sm leading-tight truncate">Information Tech</p>
          <p className="text-[11px] text-slate-500 font-medium truncate uppercase tracking-wider mt-0.5">ERP System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-4 h-4 flex-shrink-0', isActive ? 'text-blue-600' : 'text-slate-400')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Sign Out */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-semibold text-slate-900 truncate">{user?.email?.split('@')[0]}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

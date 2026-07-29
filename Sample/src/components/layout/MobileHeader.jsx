import { useState } from 'react'
import { BookCheck, Menu, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, ClipboardCheck, History, FileText, Settings, LogOut,
} from 'lucide-react'
import Logo from '../../assets/Logo.jpeg'
import { useAuth } from '../../hooks/useAuth'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <img src={Logo} alt="IT ERP" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm leading-tight truncate">Information Tech</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">ERP System</span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Slide-down menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] z-30 bg-slate-900/30 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-white border-b border-slate-100 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <nav className="px-3 py-3 space-y-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={clsx('w-4 h-4', isActive ? 'text-blue-600' : 'text-slate-400')} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="px-3 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400 px-3 mb-2 truncate">{user?.email}</p>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

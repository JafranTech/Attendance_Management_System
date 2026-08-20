import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  KeyRound,
  LogOut,
  Shield,
} from 'lucide-react'
import Logo from '../../assets/Logo.jpeg'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin/dashboard',         label: 'Dashboard',         icon: LayoutDashboard },
  { to: '/admin/users',             label: 'Faculty & HODs',     icon: Users },
  { to: '/admin/classes',           label: 'Classes & Roster',   icon: GraduationCap },
  { to: '/admin/student-passwords', label: 'Student Passwords',  icon: KeyRound },
]

export function AdminSidebar() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/login', { replace: true })
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0 shrink-0 shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/60">
        <div className="relative">
          <img src={Logo} alt="Logo" className="w-9 h-9 rounded-xl object-contain ring-2 ring-amber-400/60" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
            <Shield className="w-2.5 h-2.5 text-slate-900" />
          </div>
        </div>
        <div>
          <p className="font-bold text-sm text-white leading-tight">Admin Panel</p>
          <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest">IT Department ERP</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-4.5 h-4.5 shrink-0', isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-white')} size={18} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-slate-700/60 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-slate-900" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{profile?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

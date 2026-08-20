import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Shield, Menu, X, LayoutDashboard, Users, GraduationCap, KeyRound, LogOut } from 'lucide-react'
import Logo from '../../assets/Logo.jpeg'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin/dashboard',         label: 'Dashboard',         icon: LayoutDashboard },
  { to: '/admin/users',             label: 'Faculty & HODs',     icon: Users },
  { to: '/admin/classes',           label: 'Classes & Roster',   icon: GraduationCap },
  { to: '/admin/student-passwords', label: 'Student Passwords',  icon: KeyRound },
]

export function AdminMobileHeader() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img src={Logo} alt="Logo" className="w-7 h-7 rounded-lg object-contain" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
              <Shield className="w-2 h-2 text-slate-900" />
            </div>
          </div>
          <div>
            <p className="font-bold text-xs text-white leading-tight">Admin Panel</p>
            <p className="text-[9px] text-amber-400 uppercase tracking-widest">IT ERP</p>
          </div>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          {/* Drawer */}
          <div className="relative w-64 bg-slate-900 h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
              <p className="text-sm font-bold text-white">Admin Menu</p>
              <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-amber-400 text-slate-900'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    )
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-slate-700 space-y-2">
              <div className="px-3 py-2 rounded-xl bg-slate-800">
                <p className="text-xs font-semibold text-white truncate">{profile?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
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

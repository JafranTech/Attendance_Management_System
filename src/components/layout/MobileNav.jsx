import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, ClipboardCheck, History, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attend' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/low-attendance', icon: AlertTriangle, label: 'Low Attend' },
]

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-5 h-5', isActive ? 'text-blue-600' : 'text-slate-400')} />
                <span className="text-[10px]">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

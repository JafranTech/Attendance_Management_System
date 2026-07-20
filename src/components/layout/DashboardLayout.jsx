import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { MobileNav } from './MobileNav'

export function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <MobileHeader />

        {/* Main Content */}
        <main className="flex-1 px-4 py-4 md:px-8 md:py-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  )
}

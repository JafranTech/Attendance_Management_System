import { AdminSidebar } from './AdminSidebar'
import { AdminMobileHeader } from './AdminMobileHeader'

export function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Desktop Admin Sidebar */}
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <AdminMobileHeader />

        {/* Main Content */}
        <main className="flex-1 px-4 py-5 md:px-8 md:py-7 pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}

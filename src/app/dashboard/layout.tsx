import { createSupabaseContext } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BookOpen, Calendar, History, FileText, LogOut } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data, error } = await createSupabaseContext({ auth: 'user' })

  if (error || !data.userClaims) {
    redirect("/login")
  }

  const email = data.userClaims.email

  return (
    <div className="flex h-screen bg-slate-50 flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">AMS</h1>
          <p className="text-xs text-slate-500 truncate">{email}</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
            <BookOpen className="h-5 w-5" />
            Courses
          </Link>
          <Link href="/dashboard/attendance" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
            <Calendar className="h-5 w-5" />
            Attendance
          </Link>
          <Link href="/dashboard/history" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
            <History className="h-5 w-5" />
            History
          </Link>
          <Link href="/dashboard/reports" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
            <FileText className="h-5 w-5" />
            Reports
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
          <h1 className="text-lg font-bold text-slate-900">AMS</h1>
          <form action="/auth/signout" method="post">
            <button className="text-slate-500">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </header>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-10">
        <Link href="/dashboard" className="flex flex-col items-center text-blue-600">
          <BookOpen className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Courses</span>
        </Link>
        <Link href="/dashboard/attendance" className="flex flex-col items-center text-slate-500">
          <Calendar className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Take</span>
        </Link>
        <Link href="/dashboard/history" className="flex flex-col items-center text-slate-500">
          <History className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">History</span>
        </Link>
        <Link href="/dashboard/reports" className="flex flex-col items-center text-slate-500">
          <FileText className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Reports</span>
        </Link>
      </nav>
    </div>
  )
}

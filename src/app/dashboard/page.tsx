import { createSupabaseContext } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const { data } = await createSupabaseContext({ auth: 'user' })
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back!</h1>
        <p className="text-slate-500 mt-1">Select a course to mark attendance.</p>
      </div>
      
      {/* Placeholder for Courses List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-lg text-slate-900">Data Structures</h3>
          <p className="text-sm text-slate-500 mt-1">CS301 • 3rd Year</p>
          <div className="mt-4">
            <button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 rounded-md font-medium text-sm transition-colors">
              Take Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

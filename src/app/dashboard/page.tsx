import { createSupabaseContext } from "@/lib/supabase/server"
import { AddCourseDialog } from "@/components/AddCourseDialog"
import Link from "next/link"

export default async function DashboardPage() {
  const { data: ctx } = await createSupabaseContext({ auth: 'user' })
  const { supabase, userClaims } = ctx!

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("faculty_id", (userClaims as any)?.sub)
    .order("created_at", { ascending: false })
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back!</h1>
          <p className="text-slate-500 mt-1">Select a course to manage or mark attendance.</p>
        </div>
        <AddCourseDialog />
      </div>
      
      {(!courses || courses.length === 0) ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-slate-900">No courses found</h3>
          <p className="text-sm text-slate-500 mt-1">Create your first course to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-48">
              <div>
                <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{course.course_name}</h3>
                <p className="text-sm text-slate-500 mt-1">{course.course_code} • {course.semester}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Link 
                  href={`/dashboard/courses/${course.id}`}
                  className="flex-1 text-center bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 rounded-md font-medium text-sm transition-colors"
                >
                  Manage
                </Link>
                <Link 
                  href={`/dashboard/attendance?courseId=${course.id}`}
                  className="flex-1 text-center bg-blue-600 text-white hover:bg-blue-700 py-2 rounded-md font-medium text-sm transition-colors"
                >
                  Attendance
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { createSupabaseContext } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AddStudentDialog } from "@/components/AddStudentDialog"
import { ImportExcel } from "@/components/ImportExcel"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  const { data: ctx } = await createSupabaseContext({ auth: 'user' })
  const { supabase, userClaims } = ctx!

  // Fetch course details
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("faculty_id", (userClaims as any)?.sub)
    .single()

  if (!course) {
    notFound()
  }

  // Fetch enrolled students
  const { data: enrolled } = await supabase
    .from("course_students")
    .select(`
      student_id,
      students (
        id,
        roll_number,
        name,
        email
      )
    `)
    .eq("course_id", id)
    
  // Format students array
  const students = enrolled?.map(e => e.students).filter(Boolean) || []
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{course.course_name}</h1>
          <p className="text-slate-500 mt-1">{course.course_code} • {course.semester}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <Tabs defaultValue="students" className="w-full">
          <div className="px-6 pt-4 border-b border-slate-100">
            <TabsList className="bg-transparent h-auto p-0 gap-6">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-3 px-1"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="students" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-3 px-1"
              >
                Students ({students.length})
              </TabsTrigger>
              <TabsTrigger 
                value="timetable" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-3 px-1 text-slate-400"
                disabled
              >
                Timetable (Phase 3)
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6">
            <TabsContent value="overview" className="mt-0 outline-none space-y-4">
              <h3 className="text-lg font-medium">Course Information</h3>
              <div className="grid grid-cols-2 max-w-md gap-4 text-sm">
                <div className="text-slate-500">Course Code</div>
                <div className="font-medium">{course.course_code}</div>
                <div className="text-slate-500">Name</div>
                <div className="font-medium">{course.course_name}</div>
                <div className="text-slate-500">Semester</div>
                <div className="font-medium">{course.semester}</div>
                <div className="text-slate-500">Enrolled Students</div>
                <div className="font-medium">{students.length}</div>
              </div>
            </TabsContent>
            
            <TabsContent value="students" className="mt-0 outline-none">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Enrolled Students</h3>
                <div className="flex gap-2">
                  <ImportExcel courseId={course.id} />
                  <AddStudentDialog courseId={course.id} />
                </div>
              </div>
              
              {students.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                  <h3 className="text-sm font-medium text-slate-900">No students enrolled</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-4">Add students manually or import an Excel file.</p>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">#</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student: any, idx: number) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium text-slate-500">{idx + 1}</TableCell>
                          <TableCell>{student.roll_number}</TableCell>
                          <TableCell>{student.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Calendar, Plus, Upload, ClipboardCheck, Search } from 'lucide-react'
import { useCourse } from '../hooks/useCourses'
import { useStudents } from '../hooks/useStudents'
import { StudentList } from '../components/students/StudentList'
import { AddStudentModal } from '../components/students/AddStudentModal'
import { ImportExcelModal } from '../components/students/ImportExcelModal'
import { TimetableTab } from '../components/courses/TimetableTab'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Badge } from '../components/ui/Badge'
import clsx from 'clsx'

const TABS = ['Students', 'Timetable']

export default function CourseDetailPage() {
  const { id: courseId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Students')
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: course, isLoading: courseLoading, isError: courseError } = useCourse(courseId)
  const { data: students, isLoading: studentsLoading } = useStudents(courseId)

  const filteredStudents = useMemo(() => {
    if (!students) return []
    if (!searchTerm) return students
    const lower = searchTerm.toLowerCase()
    return students.filter(s => s.name.toLowerCase().includes(lower) || s.roll_number.toLowerCase().includes(lower))
  }, [students, searchTerm])

  if (courseLoading) return <LoadingSpinner fullPage />
  if (courseError) return (
    <div className="text-center py-16">
      <p className="text-red-500">Course not found.</p>
      <button onClick={() => navigate('/courses')} className="mt-4 text-sm text-blue-600 underline">Back to Courses</button>
    </div>
  )

  return (
    <div>
      {/* Back + Header */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </button>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <Badge variant="blue" className="mb-2">{course.course_code}</Badge>
            <h1 className="text-2xl font-bold text-slate-900">{course.course_name}</h1>
            {course.semester && (
              <p className="text-sm text-slate-500 mt-1">Semester {course.semester}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
            <Users className="w-4 h-4" />
            <span className="font-medium">{students?.length ?? 0}</span>
            <span>students</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Students' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsAddStudentOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
              <Button onClick={() => navigate(`/attendance?courseId=${courseId}`)} className="bg-green-600 hover:bg-green-700 text-white">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Take Attendance
              </Button>
            </div>
          </div>

          {studentsLoading && <LoadingSpinner />}

          {!studentsLoading && (!students || students.length === 0) && (
            <EmptyState
              icon={Users}
              title="No students enrolled"
              description="Add students manually or import them from an Excel file."
              action={
                <div className="flex gap-3">
                  <Button onClick={() => setIsAddStudentOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />Add Student
                  </Button>
                  <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />Import Excel
                  </Button>
                </div>
              }
            />
          )}

          {!studentsLoading && students && students.length > 0 && (
            <>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-500">No students found matching "{searchTerm}"</p>
                </div>
              ) : (
                <StudentList students={filteredStudents} courseId={courseId} />
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'Timetable' && <TimetableTab courseId={courseId} />}

      {/* Modals */}
      <AddStudentModal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} courseId={courseId} />
      <ImportExcelModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} courseId={courseId} />
    </div>
  )
}

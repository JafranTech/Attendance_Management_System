import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Plus, Upload, ClipboardCheck, Search, AlertTriangle, Layers } from 'lucide-react'
import clsx from 'clsx'
import { useCourse } from '../hooks/useCourses'
import { useStudents } from '../hooks/useStudents'
import { useAllStudentPercentages } from '../hooks/useAttendance'
import { StudentList } from '../components/students/StudentList'
import { AddStudentModal } from '../components/students/AddStudentModal'
import { ImportExcelModal } from '../components/students/ImportExcelModal'
import { AssignBatchesModal } from '../components/students/AssignBatchesModal'
import { TimetableTab } from '../components/courses/TimetableTab'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Badge } from '../components/ui/Badge'

const TABS = ['Students', 'Timetable', 'Low Attendance']

export default function CourseDetailPage() {
  const { id: courseId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Students')
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isAssignBatchesOpen, setIsAssignBatchesOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [batchFilter, setBatchFilter] = useState('All') // 'All', 'Full Class', 'Batch 1', 'Batch 2'

  const { data: course, isLoading: courseLoading, isError: courseError } = useCourse(courseId)
  const { data: students, isLoading: studentsLoading } = useStudents(courseId)
  const { data: percentages, isLoading: percentagesLoading } = useAllStudentPercentages(courseId)

  const { totalCount, noBatchCount, b1Count, b2Count } = useMemo(() => {
    if (!students) return { totalCount: 0, noBatchCount: 0, b1Count: 0, b2Count: 0 }
    let noBatchCount = 0
    let b1Count = 0
    let b2Count = 0
    students.forEach(s => {
      if (!s.batch || s.batch === 'Full Class') noBatchCount++
      else if (s.batch === 'Batch 1') b1Count++
      else if (s.batch === 'Batch 2') b2Count++
    })
    return { totalCount: students.length, noBatchCount, b1Count, b2Count }
  }, [students])

  const filteredStudents = useMemo(() => {
    if (!students) return []
    let list = students

    if (batchFilter !== 'All') {
      list = list.filter(s => {
        if (batchFilter === 'Full Class') return !s.batch || s.batch === 'Full Class'
        return s.batch === batchFilter
      })
    }

    if (!searchTerm) return list
    const lower = searchTerm.toLowerCase()
    return list.filter(s =>
      s.name.toLowerCase().includes(lower) || s.roll_number.toLowerCase().includes(lower)
    )
  }, [students, searchTerm, batchFilter])

  // Students below 75% for Low Attendance tab
  const lowAttendanceStudents = useMemo(() => {
    if (!students || !percentages) return []
    return students
      .filter((s) => {
        const pct = percentages[s.id]
        return pct !== undefined && pct < 75
      })
      .map((s) => ({ ...s, percentage: percentages[s.id] }))
      .sort((a, b) => a.percentage - b.percentage) // lowest first
  }, [students, percentages])

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
        {TABS.map((tab) => {
          const isLowTab = tab === 'Low Attendance'
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                activeTab === tab
                  ? isLowTab
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {isLowTab && <AlertTriangle className="w-3.5 h-3.5" />}
              {tab}
              {isLowTab && !percentagesLoading && lowAttendanceStudents.length > 0 && (
                <span className={clsx(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  activeTab === tab ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-700'
                )}>
                  {lowAttendanceStudents.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'Students' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center flex-wrap gap-3">
              <Button onClick={() => setIsAddStudentOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </Button>
              <Button variant="outline" onClick={() => setIsAssignBatchesOpen(true)} className="text-purple-600 hover:bg-purple-50 hover:border-purple-200">
                <Layers className="w-4 h-4 mr-2" />
                Assign Batches
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
              <Button onClick={() => navigate(`/attendance?courseId=${courseId}`)} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Take Attendance
              </Button>
            </div>
          </div>

          {/* Batch Filters */}
          {!studentsLoading && students && students.length > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button onClick={() => setBatchFilter('All')} className={clsx("px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors", batchFilter === 'All' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>
                All <span className={clsx("ml-1 px-1.5 py-0.5 rounded-full", batchFilter === 'All' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500')}>{totalCount}</span>
              </button>
              <button onClick={() => setBatchFilter('Batch 1')} className={clsx("px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors", batchFilter === 'Batch 1' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>
                Batch 1 <span className={clsx("ml-1 px-1.5 py-0.5 rounded-full", batchFilter === 'Batch 1' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500')}>{b1Count}</span>
              </button>
              <button onClick={() => setBatchFilter('Batch 2')} className={clsx("px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors", batchFilter === 'Batch 2' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>
                Batch 2 <span className={clsx("ml-1 px-1.5 py-0.5 rounded-full", batchFilter === 'Batch 2' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500')}>{b2Count}</span>
              </button>
            </div>
          )}

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
                  <p className="text-slate-500">No students found for this batch/search.</p>
                </div>
              ) : (
                <StudentList students={filteredStudents} courseId={courseId} />
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'Timetable' && <TimetableTab courseId={courseId} />}

      {activeTab === 'Low Attendance' && (
        <div>
          {(percentagesLoading || studentsLoading) && <LoadingSpinner />}

          {!percentagesLoading && !studentsLoading && lowAttendanceStudents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm text-center px-4">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-lg font-semibold text-slate-700">All Clear! 🎉</p>
              <p className="text-sm text-slate-400 mt-1">All students in this course are above 75% attendance.</p>
            </div>
          )}

          {!percentagesLoading && !studentsLoading && lowAttendanceStudents.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">
                    {lowAttendanceStudents.length} student{lowAttendanceStudents.length !== 1 ? 's' : ''} below 75%
                  </span>
                </div>
                <span className="text-xs text-amber-600">Sorted by lowest attendance</span>
              </div>

              <div className="divide-y divide-slate-50">
                {lowAttendanceStudents.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400 font-medium w-5 text-right">{i + 1}</span>
                      <div className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        s.percentage < 50 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.roll_number}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 min-w-[80px]">
                      <span className={clsx(
                        'text-sm font-bold px-2.5 py-1 rounded-full',
                        s.percentage < 50 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {s.percentage}%
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full',
                            s.percentage < 50 ? 'bg-red-400' : 'bg-amber-400'
                          )}
                          style={{ width: `${s.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddStudentModal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} courseId={courseId} />
      <ImportExcelModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} courseId={courseId} />
      <AssignBatchesModal isOpen={isAssignBatchesOpen} onClose={() => setIsAssignBatchesOpen(false)} courseId={courseId} students={students} />
    </div>
  )
}

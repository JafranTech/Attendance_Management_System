import { useNavigate } from 'react-router-dom'
import { Users, BookOpen, Trash2, ChevronRight } from 'lucide-react'
import { Badge } from '../ui/Badge'
import toast from 'react-hot-toast'
import { useDeleteCourse } from '../../hooks/useCourses'

export function CourseCard({ course }) {
  const navigate = useNavigate()
  const deleteCourse = useDeleteCourse()
  const studentCount = course.course_students?.[0]?.count ?? 0

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`Delete "${course.course_name}"? This cannot be undone.`)) return
    try {
      await deleteCourse.mutateAsync(course.id)
      toast.success('Course deleted.')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div
      className="bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <button
            onClick={handleDelete}
            disabled={deleteCourse.isPending}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            aria-label="Delete course"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-3">
          <Badge variant="blue" className="mb-2">{course.course_code}</Badge>
          <h3 className="font-semibold text-slate-900 text-base leading-snug">
            {course.course_name}
          </h3>
          {course.semester && (
            <p className="text-xs text-slate-400 mt-1">Semester {course.semester}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span>{studentCount} students</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </div>
  )
}

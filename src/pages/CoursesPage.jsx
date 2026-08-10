import { useState } from 'react'
import { Plus, BookOpen, AlertTriangle, RefreshCw } from 'lucide-react'
import { useCourses } from '../hooks/useCourses'
import { CourseCard } from '../components/courses/CourseCard'
import { AddCourseModal } from '../components/courses/AddCourseModal'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'

export default function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: courses, isLoading, isError, refetch } = useCourses()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {courses?.length ?? 0} course{courses?.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Content */}
      {isLoading && <LoadingSpinner />}

      {isError && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-red-50 border border-red-200 rounded-xl p-5">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-700 text-sm">Failed to load courses</p>
            <p className="text-xs text-red-500 mt-0.5">There was a problem connecting. This usually resolves on its own.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {!isLoading && !isError && courses?.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Add your first course to start managing student attendance."
          action={
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Course
            </Button>
          }
        />
      )}

      {!isLoading && courses && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      <AddCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

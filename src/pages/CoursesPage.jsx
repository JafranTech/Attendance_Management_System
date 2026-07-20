import { useState } from 'react'
import { Plus, BookOpen } from 'lucide-react'
import { useCourses } from '../hooks/useCourses'
import { CourseCard } from '../components/courses/CourseCard'
import { AddCourseModal } from '../components/courses/AddCourseModal'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'

export default function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: courses, isLoading, isError } = useCourses()

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
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
          Failed to load courses. Please refresh the page.
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

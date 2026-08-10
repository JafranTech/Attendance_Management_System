import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCourses, createCourse, deleteCourse, fetchCourseById } from '../services/coursesService'
import { useAuth } from './useAuth'

const RETRY_DELAY = (attempt) => Math.min(1000 * 2 ** attempt, 8000)

export function useCourses() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['courses', user?.id],
    queryFn: () => fetchCourses(user.id),
    enabled: !!user?.id,
    retry: 2,
    retryDelay: RETRY_DELAY,
    staleTime: 1000 * 60 * 2,
    select: (result) => result.data, // unwrap to array for all consumers
  })
}

export function useCourse(courseId) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseById(courseId),
    enabled: !!courseId && !!user?.id,
    retry: 2,
    retryDelay: RETRY_DELAY,
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (courseData) => createCourse({ ...courseData, facultyId: user.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', user?.id] })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (courseId) => deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', user?.id] })
    },
  })
}

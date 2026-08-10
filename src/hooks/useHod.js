import { useQuery } from '@tanstack/react-query'
import {
  fetchAllClassesForHod,
  fetchCoursesByClassForHod,
  fetchCourseAttendanceSummary,
  fetchDailyAttendanceForHod,
  fetchStudentsWithPercentage,
} from '../services/hodService'
import { useAuth } from './useAuth'

const RETRY_DELAY = (attempt) => Math.min(1000 * 2 ** attempt, 8000) // 2s, 4s, 8s

export function useHodClasses() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['hod', 'classes'],
    queryFn: fetchAllClassesForHod,
    enabled: !!user?.id,           // Don't fire until auth session is confirmed
    retry: 2,
    retryDelay: RETRY_DELAY,
    staleTime: 1000 * 60 * 2, // 2 min
  })
}

export function useHodCoursesByClass(classId) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['hod', 'courses', classId],
    queryFn: () => fetchCoursesByClassForHod(classId),
    enabled: !!classId && !!user?.id,
    retry: 2,
    retryDelay: RETRY_DELAY,
    staleTime: 1000 * 60 * 2,
  })
}

export function useHodCourseAttendanceSummary(courseId, startDate = null, endDate = null) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['hod', 'attendance-summary', courseId, startDate, endDate],
    queryFn: () => fetchCourseAttendanceSummary(courseId, startDate, endDate),
    enabled: !!courseId && !!user?.id,
    retry: 2,
    retryDelay: RETRY_DELAY,
    staleTime: 1000 * 60 * 2,
  })
}

export function useHodDailyAttendance(courseId, date) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['hod', 'daily', courseId, date],
    queryFn: () => fetchDailyAttendanceForHod(courseId, date),
    enabled: !!courseId && !!date && !!user?.id,
    retry: 2,
    retryDelay: RETRY_DELAY,
    staleTime: 1000 * 60,
  })
}

export function useHodStudentsWithPercentage(courseId, startDate = null, endDate = null) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['hod', 'students-pct', courseId, startDate, endDate],
    queryFn: () => fetchStudentsWithPercentage(courseId, startDate, endDate),
    enabled: !!courseId && !!user?.id,
    retry: 2,
    retryDelay: RETRY_DELAY,
    staleTime: 1000 * 60 * 2,
  })
}

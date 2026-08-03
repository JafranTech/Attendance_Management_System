import { useQuery } from '@tanstack/react-query'
import {
  fetchAllClassesForHod,
  fetchCoursesByClassForHod,
  fetchCourseAttendanceSummary,
  fetchDailyAttendanceForHod,
  fetchStudentsWithPercentage,
} from '../services/hodService'

export function useHodClasses() {
  return useQuery({
    queryKey: ['hod', 'classes'],
    queryFn: fetchAllClassesForHod,
    staleTime: 1000 * 60 * 2, // 2 min
  })
}

export function useHodCoursesByClass(classId) {
  return useQuery({
    queryKey: ['hod', 'courses', classId],
    queryFn: () => fetchCoursesByClassForHod(classId),
    enabled: !!classId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useHodCourseAttendanceSummary(courseId) {
  return useQuery({
    queryKey: ['hod', 'attendance-summary', courseId],
    queryFn: () => fetchCourseAttendanceSummary(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useHodDailyAttendance(courseId, date) {
  return useQuery({
    queryKey: ['hod', 'daily', courseId, date],
    queryFn: () => fetchDailyAttendanceForHod(courseId, date),
    enabled: !!courseId && !!date,
    staleTime: 1000 * 60,
  })
}

export function useHodStudentsWithPercentage(courseId) {
  return useQuery({
    queryKey: ['hod', 'students-pct', courseId],
    queryFn: () => fetchStudentsWithPercentage(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  })
}

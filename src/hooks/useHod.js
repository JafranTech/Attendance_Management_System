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

export function useHodCourseAttendanceSummary(courseId, startDate = null, endDate = null) {
  return useQuery({
    queryKey: ['hod', 'attendance-summary', courseId, startDate, endDate],
    queryFn: () => fetchCourseAttendanceSummary(courseId, startDate, endDate),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2,
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

export function useHodStudentsWithPercentage(courseId, startDate = null, endDate = null) {
  return useQuery({
    queryKey: ['hod', 'students-pct', courseId, startDate, endDate],
    queryFn: () => fetchStudentsWithPercentage(courseId, startDate, endDate),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2,
  })
}

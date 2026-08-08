import { useQuery } from '@tanstack/react-query'
import { getMyStudentRecord, getMySubjects, getMyCourseAttendance } from '../services/studentPortalService'

/**
 * Fetch the student's own profile row from the students table.
 * Uses their Supabase auth UID to find the record.
 */
export function useMyStudentRecord(authUserId) {
  return useQuery({
    queryKey: ['student-record', authUserId],
    queryFn: () => getMyStudentRecord(authUserId),
    enabled: !!authUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Fetch all enrolled subjects with attendance percentage for the logged-in student.
 */
export function useMySubjects(studentId) {
  return useQuery({
    queryKey: ['my-subjects', studentId],
    queryFn: () => getMySubjects(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2, // 2 minutes — attendance can change when faculty marks
  })
}

/**
 * Fetch session-by-session attendance history for a specific course.
 */
export function useMyCourseAttendance(courseId, studentId) {
  return useQuery({
    queryKey: ['my-course-attendance', courseId, studentId],
    queryFn: () => getMyCourseAttendance(courseId, studentId),
    enabled: !!courseId && !!studentId,
    staleTime: 1000 * 60 * 2,
  })
}

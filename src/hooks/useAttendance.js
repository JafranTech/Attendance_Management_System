import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  checkAttendanceExists,
  saveAttendance,
  fetchAttendanceHistory,
  fetchAllHistory,
  fetchSessionDetails,
  editAttendanceDetail,
  fetchStudentAttendance,
  fetchAllStudentPercentages,
  deleteSession,
} from '../services/attendanceService'
import { useAuth } from './useAuth'

export function useCheckAttendance(courseId, date, hour) {
  return useQuery({
    queryKey: ['attendance-check', courseId, date, hour],
    queryFn: () => checkAttendanceExists(courseId, date, hour),
    enabled: !!courseId && !!date && !!hour,
    staleTime: 1000 * 30, // 30 seconds — re-check if stale
  })
}

export function useSaveAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, date, hour, studentStatuses, isHoliday, holidayReason }) =>
      saveAttendance(courseId, date, hour, studentStatuses, isHoliday, holidayReason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-history', variables.courseId] })
      queryClient.invalidateQueries({ queryKey: ['attendance-history', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['attendance-check'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useAttendanceHistory(courseId) {
  return useQuery({
    queryKey: ['attendance-history', courseId],
    queryFn: () => fetchAttendanceHistory(courseId),
    enabled: !!courseId,
  })
}

export function useAllHistory() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['attendance-history', 'all', user?.id],
    queryFn: () => fetchAllHistory(user.id),
    enabled: !!user?.id,
  })
}

export function useSessionDetails(attendanceId) {
  return useQuery({
    queryKey: ['session-details', attendanceId],
    queryFn: () => fetchSessionDetails(attendanceId),
    enabled: !!attendanceId,
  })
}

export function useEditAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ attendanceId, studentId, oldStatus, newStatus, reason }) =>
      editAttendanceDetail(attendanceId, studentId, oldStatus, newStatus, reason),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['session-details', vars.attendanceId] })
    },
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (attendanceId) => deleteSession(attendanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useStudentAttendance(courseId, studentId) {
  return useQuery({
    queryKey: ['student-attendance', courseId, studentId],
    queryFn: () => fetchStudentAttendance(courseId, studentId),
    enabled: !!courseId && !!studentId,
  })
}

/**
 * Fetches attendance percentage for ALL students in a course at once.
 * Returns map: { [studentId]: percentage }
 */
export function useAllStudentPercentages(courseId) {
  return useQuery({
    queryKey: ['student-percentages', courseId],
    queryFn: () => fetchAllStudentPercentages(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2, // 2 min — refresh after marking
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  checkAttendanceExists,
  saveAttendance,
  fetchAttendanceHistory,
  fetchAllHistory,
  fetchSessionDetails,
  editAttendanceDetail,
} from '../services/attendanceService'
import { useAuth } from './useAuth'

export function useCheckAttendance(courseId, date, hour) {
  return useQuery({
    queryKey: ['attendance-check', courseId, date, hour],
    queryFn: () => checkAttendanceExists(courseId, date, hour),
    enabled: !!courseId && !!date && !!hour,
  })
}

export function useSaveAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, date, hour, studentStatuses }) =>
      saveAttendance(courseId, date, hour, studentStatuses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] })
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

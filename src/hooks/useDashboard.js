import { useQuery } from '@tanstack/react-query'
import {
  getDashboardStats,
  getAttendanceTrend,
  getLowAttendanceStudents,
  getTodaySchedule,
} from '../services/dashboardService'
import { useAuth } from './useAuth'

export function useDashboardStats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['dashboard', 'stats', user?.id],
    queryFn: () => getDashboardStats(user.id),
    enabled: !!user?.id,
  })
}

export function useAttendanceTrend(courseId = null) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['dashboard', 'trend', user?.id, courseId],
    queryFn: () => getAttendanceTrend(user.id, courseId),
    enabled: !!user?.id,
  })
}

export function useLowAttendanceStudents() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['dashboard', 'low-attendance', user?.id],
    queryFn: () => getLowAttendanceStudents(user.id),
    enabled: !!user?.id,
  })
}

export function useTodaySchedule() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['dashboard', 'today-schedule', user?.id],
    queryFn: () => getTodaySchedule(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 min — schedule doesn't change mid-day
  })
}

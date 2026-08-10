import { useQuery } from '@tanstack/react-query'
import { fetchClasses, fetchClassById } from '../services/classesService'
import { useAuth } from './useAuth'

export function useClasses() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['classes'],
    queryFn: fetchClasses,
    enabled: !!user?.id,           // Don't fire until auth session is confirmed
    retry: 2,                      // Auto-retry up to 2 times on failure
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000), // Exponential backoff: 2s, 4s
    staleTime: 1000 * 60 * 2,      // 2 min cache
  })
}

export function useClass(classId) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['class', classId],
    queryFn: () => fetchClassById(classId),
    enabled: !!classId && !!user?.id,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  })
}

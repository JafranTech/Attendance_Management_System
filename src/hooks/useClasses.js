import { useQuery } from '@tanstack/react-query'
import { fetchClasses, fetchClassById } from '../services/classesService'

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  })
}

export function useClass(classId) {
  return useQuery({
    queryKey: ['class', classId],
    queryFn: () => fetchClassById(classId),
    enabled: !!classId,
  })
}

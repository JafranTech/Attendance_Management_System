import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTimetable, addTimetableEntry, deleteTimetableEntry } from '../services/timetableService'

export function useTimetable(courseId) {
  return useQuery({
    queryKey: ['timetable', courseId],
    queryFn: () => fetchTimetable(courseId),
    enabled: !!courseId,
  })
}

export function useAddTimetableEntry(courseId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addTimetableEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timetable', courseId] }),
  })
}

export function useDeleteTimetableEntry(courseId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTimetableEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timetable', courseId] }),
  })
}

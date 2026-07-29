import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchHolidays, addHoliday, deleteHoliday } from '../services/holidaysService'

export function useHolidays() {
  return useQuery({
    queryKey: ['holidays'],
    queryFn: fetchHolidays,
  })
}

export function useAddHoliday() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addHoliday,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['holidays'] }),
  })
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['holidays'] }),
  })
}

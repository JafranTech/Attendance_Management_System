import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchHolidays, addHoliday, deleteHoliday } from '../services/holidaysService'
import { useAuth } from '../hooks/useAuth'

export function useHolidays() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['holidays', user?.id],
    queryFn: () => fetchHolidays(user.id),
    enabled: !!user?.id,
  })
}

export function useAddHoliday() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (data) => addHoliday({ ...data, facultyId: user.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays', user?.id] })
    },
  })
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays', user?.id] })
    },
  })
}

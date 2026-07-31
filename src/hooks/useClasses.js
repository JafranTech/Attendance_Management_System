import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchClasses, createClass, deleteClass, fetchClassById } from '../services/classesService'
import { useAuth } from './useAuth'

export function useClasses() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['classes', user?.id],
    queryFn: () => fetchClasses(user?.id),
    enabled: !!user?.id,
  })
}

export function useClass(classId) {
  return useQuery({
    queryKey: ['class', classId],
    queryFn: () => fetchClassById(classId),
    enabled: !!classId,
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (name) => createClass({ facultyId: user?.id, name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

export function useDeleteClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (classId) => deleteClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

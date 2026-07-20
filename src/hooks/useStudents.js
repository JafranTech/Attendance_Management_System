import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchStudentsForCourse,
  addStudentToCourse,
  removeStudentFromCourse,
  bulkImportStudents,
} from '../services/studentsService'

export function useStudents(courseId) {
  return useQuery({
    queryKey: ['students', courseId],
    queryFn: () => fetchStudentsForCourse(courseId),
    enabled: !!courseId,
  })
}

export function useAddStudent(courseId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentData) => addStudentToCourse(courseId, studentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useRemoveStudent(courseId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentId) => removeStudentFromCourse(courseId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useBulkImportStudents(courseId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentsArray) => bulkImportStudents(courseId, studentsArray),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

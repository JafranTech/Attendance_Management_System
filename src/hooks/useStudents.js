import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchStudentsForCourse,
  fetchStudentsByClass,
  fetchAllStudents,
  addStudentToCourse,
  addStudentToClass,
  removeStudentFromCourse,
  removeStudentFromClass,
  bulkImportStudents,
  bulkImportStudentsToClass,
  enrollDefaultStudents,
  enrollSelectedStudents,
  updateStudentBatches,
  bulkDeleteStudents,
} from '../services/studentsService'

export function useStudents(courseId) {
  return useQuery({
    queryKey: ['students', courseId],
    queryFn: () => fetchStudentsForCourse(courseId),
    enabled: !!courseId,
  })
}

export function useClassStudents(classId) {
  return useQuery({
    queryKey: ['students', 'class', classId],
    queryFn: () => fetchStudentsByClass(classId),
    enabled: !!classId,
  })
}

export function useAllStudents() {
  return useQuery({
    queryKey: ['all-students'],
    queryFn: () => fetchAllStudents({ page: 0, pageSize: 50 }),
    staleTime: 1000 * 60 * 10,
    select: (result) => result.data,
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

export function useAddStudentToClass(classId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentData) => addStudentToClass(classId, studentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'class', classId] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
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

export function useRemoveStudentFromClass(classId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentId) => removeStudentFromClass(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'class', classId] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
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

export function useBulkImportStudentsToClass(classId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentsArray) => bulkImportStudentsToClass(classId, studentsArray),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'class', classId] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

export function useEnrollDefaultStudents() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, targetClassId }) => enrollDefaultStudents(courseId, targetClassId),
    onSuccess: (_data, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['students', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useEnrollSelectedStudents() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, studentIds }) => enrollSelectedStudents(courseId, studentIds),
    onSuccess: (_data, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['students', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useUpdateStudentBatches(courseId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studentIds, batch }) => updateStudentBatches(studentIds, batch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', courseId] })
    },
  })
}

export function useBulkDeleteStudents(classId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentIds) => bulkDeleteStudents(studentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'class', classId] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

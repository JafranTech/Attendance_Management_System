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
  updateStudentBatchesForCourse,
  bulkDeleteStudents,
} from '../services/studentsService'
import { supabase } from '../lib/supabase'

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
    mutationFn: async (studentId) => {
      // 1. Fetch the student record to get their roll_number and auth_user_id for deactivation
      const { data: student } = await supabase
        .from('students')
        .select('id, roll_number, name, auth_user_id')
        .eq('id', studentId)
        .single()

      // 2. Deactivate their auth account BEFORE removing from DB
      if (student?.roll_number) {
        try {
          await supabase.functions.invoke('provision-student', {
            body: {
              action: 'deactivate',
              students: [{ roll_number: student.roll_number, name: student.name, student_id: student.id, auth_user_id: student.auth_user_id }],
            },
          })
        } catch (deactivateErr) {
          console.warn('Deactivation failed (non-critical):', deactivateErr)
        }
      }

      // 3. Remove from students table
      return removeStudentFromClass(studentId)
    },
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
    // Write to course_students.batch — scoped by courseId so batches never bleed across courses
    mutationFn: ({ studentIds, batch }) => updateStudentBatchesForCourse(courseId, studentIds, batch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', courseId] })
    },
  })
}

export function useBulkDeleteStudents(classId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (studentIds) => {
      if (!studentIds || studentIds.length === 0) return

      // 1. Fetch the student records to get their roll_number and auth_user_id for deactivation
      const { data: students } = await supabase
        .from('students')
        .select('id, roll_number, name, auth_user_id')
        .in('id', studentIds)

      // 2. Deactivate their auth accounts BEFORE removing from DB
      if (students && students.length > 0) {
        try {
          await supabase.functions.invoke('provision-student', {
            body: {
              action: 'deactivate',
              students: students.map(s => ({ roll_number: s.roll_number, name: s.name, student_id: s.id, auth_user_id: s.auth_user_id })),
            },
          })
        } catch (deactivateErr) {
          console.warn('Deactivation failed (non-critical):', deactivateErr)
        }
      }

      // 3. Remove from students table
      return bulkDeleteStudents(studentIds)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'class', classId] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

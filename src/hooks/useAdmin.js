import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllUsers,
  adminResetPassword,
  adminResetStudentPassword,
  adminGetAllClasses,
  adminCreateClass,
  adminDeleteClass,
  adminGetClassStudents,
  adminAddStudent,
  adminBulkInsertStudents,
  adminDeleteStudent,
  adminBulkDeleteStudents,
  adminGetStats,
} from '../services/adminService'

// ─── Users ────────────────────────────────────────────────────────────────────

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAllUsers,
    staleTime: 30_000,
  })
}

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: ({ targetUserId, newPassword }) => adminResetPassword(targetUserId, newPassword),
  })
}

export function useAdminResetStudentPassword(classId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studentId, authUserId, rollNumber, name, newPassword }) =>
      adminResetStudentPassword({ studentId, authUserId, rollNumber, name, newPassword }),
    onSuccess: () => {
      if (classId) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'students', classId] })
        queryClient.invalidateQueries({ queryKey: ['students', classId] })
      }
    },
  })
}

// ─── Classes ─────────────────────────────────────────────────────────────────

export function useAdminClasses() {
  return useQuery({
    queryKey: ['admin', 'classes'],
    queryFn: adminGetAllClasses,
    staleTime: 60_000,
  })
}

export function useAdminCreateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name) => adminCreateClass(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] })
      queryClient.invalidateQueries({ queryKey: ['classes'] }) // invalidate faculty view too
    },
  })
}

export function useAdminDeleteClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (classId) => adminDeleteClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
    },
  })
}

// ─── Students ────────────────────────────────────────────────────────────────

export function useAdminClassStudents(classId) {
  return useQuery({
    queryKey: ['admin', 'students', classId],
    queryFn: () => adminGetClassStudents(classId),
    enabled: !!classId,
    staleTime: 30_000,
  })
}

export function useAdminAddStudent(classId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentData) => adminAddStudent({ classId, ...studentData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'students', classId] })
      queryClient.invalidateQueries({ queryKey: ['students', classId] })
    },
  })
}

export function useAdminBulkInsertStudents(classId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (students) => adminBulkInsertStudents(classId, students),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'students', classId] })
      queryClient.invalidateQueries({ queryKey: ['students', classId] })
    },
  })
}

export function useAdminDeleteStudent(classId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentId) => adminDeleteStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'students', classId] })
      queryClient.invalidateQueries({ queryKey: ['students', classId] })
    },
  })
}

export function useAdminBulkDeleteStudents(classId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentIds) => adminBulkDeleteStudents(studentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'students', classId] })
      queryClient.invalidateQueries({ queryKey: ['students', classId] })
    },
  })
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminGetStats,
    staleTime: 60_000,
  })
}

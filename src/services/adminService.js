import { supabase } from '../lib/supabase'

// ─── Faculty / HOD User Management ────────────────────────────────────────────

/**
 * Fetch all faculty and HOD users (Admin only)
 * Explicitly excludes student accounts that may have leaked into the faculty table
 * via the handle_new_user trigger (which is now fixed to skip students).
 */
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('faculty')
    .select('id, name, email, department, role, created_at')
    .in('role', ['faculty', 'hod', 'admin'])
    .order('role', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)

  // Belt-and-suspenders: filter out any rows whose name is purely numeric
  // (roll-number style) — these are students that slipped in via the old trigger
  return (data ?? []).filter(u => !/^\d+$/.test(u.name ?? ''))
}

/**
 * Reset a user's password via the admin-reset-password Edge Function.
 * The Edge Function uses the service_role key server-side — never exposed to client.
 */
export async function adminResetPassword(targetUserId, newPassword) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No active session')

  const { data, error } = await supabase.functions.invoke('admin-reset-password', {
    body: { target_user_id: targetUserId, new_password: newPassword },
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data
}

/**
 * Reset a student's password (and auto-provisions their auth account if missing).
 */
export async function adminResetStudentPassword({ studentId, authUserId, rollNumber, name, newPassword }) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No active session')

  const { data, error } = await supabase.functions.invoke('admin-reset-password', {
    body: {
      target_user_id: authUserId || undefined,
      student_id: studentId,
      roll_number: rollNumber,
      name: name,
      new_password: newPassword,
    },
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data
}

// ─── Admin Classes & Roster Management ───────────────────────────────────────

/**
 * Fetch all classes (same as existing useClasses, but admin gets this from the service)
 */
export async function adminGetAllClasses() {
  const { data, error } = await supabase
    .from('classes')
    .select('id, name, created_at')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

/**
 * Create a new class (Admin only)
 */
export async function adminCreateClass(name) {
  const { data, error } = await supabase
    .from('classes')
    .insert({ name })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Delete a class and all its students (Admin only) — CASCADE handles DB cleanup
 */
export async function adminDeleteClass(classId) {
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId)

  if (error) throw new Error(error.message)
}

/**
 * Fetch all students for a class (Admin view)
 */
export async function adminGetClassStudents(classId) {
  if (!classId) return []
  const { data, error } = await supabase
    .from('students')
    .select('id, roll_number, name, email, batch, auth_user_id, created_at')
    .eq('class_id', classId)
    .order('roll_number', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

/**
 * Add a single student to a class (Admin only)
 */
export async function adminAddStudent({ classId, rollNumber, name, email, batch }) {
  const { data, error } = await supabase
    .from('students')
    .insert({ class_id: classId, roll_number: rollNumber, name, email: email || null, batch: batch || null })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Bulk insert students (Admin import) 
 */
export async function adminBulkInsertStudents(classId, students) {
  const rows = students.map(s => ({
    class_id: classId,
    roll_number: s.roll_number,
    name: s.name,
    email: s.email || null,
    batch: s.batch || null,
  }))

  const { data, error } = await supabase
    .from('students')
    .upsert(rows, { onConflict: 'roll_number', ignoreDuplicates: false })
    .select()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Delete a single student (Admin only)
 */
export async function adminDeleteStudent(studentId) {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId)

  if (error) throw new Error(error.message)
}

/**
 * Bulk delete students (Admin only) — also deactivates their auth accounts
 */
export async function adminBulkDeleteStudents(studentIds) {
  // 1. Fetch student records to get roll_numbers for auth deactivation
  const { data: students } = await supabase
    .from('students')
    .select('id, roll_number, name, auth_user_id')
    .in('id', studentIds)

  // 2. Deactivate their auth accounts via Edge Function
  if (students && students.length > 0) {
    try {
      await supabase.functions.invoke('provision-student', {
        body: {
          action: 'deactivate',
          students: students.map(s => ({
            roll_number: s.roll_number,
            name: s.name,
            student_id: s.id,
            auth_user_id: s.auth_user_id,
          })),
        },
      })
    } catch (deactivateErr) {
      console.warn('Auth deactivation failed (non-critical):', deactivateErr)
    }
  }

  // 3. Delete from students table
  const { error } = await supabase
    .from('students')
    .delete()
    .in('id', studentIds)

  if (error) throw new Error(error.message)
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────

/**
 * Get summary counts for admin dashboard
 */
export async function adminGetStats() {
  const [facultyRes, classesRes, studentsRes] = await Promise.all([
    supabase.from('faculty').select('id', { count: 'exact', head: true }).in('role', ['faculty', 'hod']),
    supabase.from('classes').select('id', { count: 'exact', head: true }),
    supabase.from('students').select('id', { count: 'exact', head: true }),
  ])

  return {
    facultyCount: facultyRes.count ?? 0,
    classesCount: classesRes.count ?? 0,
    studentsCount: studentsRes.count ?? 0,
  }
}

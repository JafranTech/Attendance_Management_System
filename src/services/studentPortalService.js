import { supabase } from '../lib/supabase'

/**
 * Get the student record for the currently logged-in student.
 * Uses auth_user_id to find their students row.
 */
export async function getMyStudentRecord(authUserId) {
  const { data, error } = await supabase
    .from('students')
    .select('id, name, roll_number, email, class_id')
    .eq('auth_user_id', authUserId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Get all subjects (courses) the student is enrolled in,
 * along with their attendance percentage for each.
 * Returns: [{ course_id, course_name, course_code, semester, total, present, absent, percentage }]
 */
export async function getMySubjects(studentId) {
  // 1. Fetch all courses this student is enrolled in
  const { data: enrollments, error: enrollError } = await supabase
    .from('course_students')
    .select(`
      course_id,
      courses (
        id,
        course_code,
        course_name,
        semester,
        faculty:faculty_id ( name )
      )
    `)
    .eq('student_id', studentId)

  if (enrollError) throw new Error(enrollError.message)
  if (!enrollments || enrollments.length === 0) return []

  // 2. For each course, fetch attendance stats for this student
  const results = await Promise.all(
    enrollments.map(async (enrollment) => {
      const course = enrollment.courses
      if (!course) return null

      // Get all attendance sessions for this course
      const { data: sessions, error: sessError } = await supabase
        .from('attendance')
        .select('id')
        .eq('course_id', course.id)

      if (sessError || !sessions) return {
        course_id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        semester: course.semester,
        faculty_name: course.faculty?.name ?? '',
        total: 0, present: 0, absent: 0, percentage: 0
      }

      const sessionIds = sessions.map(s => s.id)
      if (sessionIds.length === 0) return {
        course_id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        semester: course.semester,
        faculty_name: course.faculty?.name ?? '',
        total: 0, present: 0, absent: 0, percentage: 0
      }

      // Get this student's attendance details for those sessions
      const { data: details, error: detError } = await supabase
        .from('attendance_details')
        .select('status')
        .eq('student_id', studentId)
        .in('attendance_id', sessionIds)

      if (detError) throw new Error(detError.message)

      const total = details?.length ?? 0
      const present = details?.filter(d => d.status === 'Present').length ?? 0
      const absent = total - present
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0

      return {
        course_id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        semester: course.semester,
        faculty_name: course.faculty?.name ?? '',
        total,
        present,
        absent,
        percentage,
      }
    })
  )

  return results.filter(Boolean)
}

/**
 * Get the full session-by-session attendance history for a student in a specific course.
 * Returns: [{ attendance_id, date, hour, status }] sorted newest first
 */
export async function getMyCourseAttendance(courseId, studentId) {
  // Get all sessions for this course
  const { data: sessions, error: sessError } = await supabase
    .from('attendance')
    .select('id, date, hour')
    .eq('course_id', courseId)
    .order('date', { ascending: false })
    .order('hour', { ascending: false })

  if (sessError) throw new Error(sessError.message)
  if (!sessions || sessions.length === 0) return []

  const sessionIds = sessions.map(s => s.id)

  // Get this student's status for each session
  const { data: details, error: detError } = await supabase
    .from('attendance_details')
    .select('attendance_id, status')
    .eq('student_id', studentId)
    .in('attendance_id', sessionIds)

  if (detError) throw new Error(detError.message)

  // Build a map of attendance_id → status
  const statusMap = {}
  details?.forEach(d => { statusMap[d.attendance_id] = d.status })

  // Join sessions with status — only include sessions where the student has a record
  return sessions
    .filter(s => statusMap[s.id] !== undefined)
    .map(s => ({
      attendance_id: s.id,
      date: s.date,
      hour: s.hour,
      status: statusMap[s.id],
    }))
}

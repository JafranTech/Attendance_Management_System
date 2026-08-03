import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export const LOW_ATTENDANCE_THRESHOLD = 75

/**
 * Fetch ALL classes across all faculty (HOD sees everything).
 * Returns each class with faculty name, student count, course count.
 */
export async function fetchAllClassesForHod() {
  const { data, error } = await supabase
    .from('classes')
    .select(`
      id, name, created_at,
      faculty:faculty_id(name),
      students(count)
    `)
    .order('name', { ascending: true })

  if (error) throw new Error('Unable to load classes for HOD.')
  return data ?? []
}

/**
 * Fetch all courses mapped to a specific class (via target_class_id).
 * Includes faculty name.
 */
export async function fetchCoursesByClassForHod(classId) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, course_code, course_name, semester, created_at,
      faculty:faculty_id(id, name),
      course_students(count)
    `)
    .eq('target_class_id', classId)
    .order('course_name', { ascending: true })

  if (error) throw new Error('Unable to load courses for this class.')
  return data ?? []
}

/**
 * Compute per-student attendance percentage for a course.
 * Returns { overall, perStudent: { [studentId]: pct } }
 */
export async function fetchCourseAttendanceSummary(courseId) {
  const { data: sessions, error: sessErr } = await supabase
    .from('attendance')
    .select('id')
    .eq('course_id', courseId)
    .eq('is_holiday', false)

  if (sessErr) throw new Error('Unable to fetch session data.')
  if (!sessions || sessions.length === 0) return { overall: null, perStudent: {} }

  const sessionIds = sessions.map((s) => s.id)

  const { data: details, error: detErr } = await supabase
    .from('attendance_details')
    .select('student_id, status')
    .in('attendance_id', sessionIds)

  if (detErr) throw new Error('Unable to fetch attendance details.')

  const studentMap = {}
  let totalPresent = 0
  let totalRecords = 0

  details?.forEach((d) => {
    if (!studentMap[d.student_id]) {
      studentMap[d.student_id] = { present: 0, total: 0 }
    }
    studentMap[d.student_id].total++
    totalRecords++
    if (d.status === 'Present') {
      studentMap[d.student_id].present++
      totalPresent++
    }
  })

  const perStudent = {}
  Object.entries(studentMap).forEach(([studentId, { present, total }]) => {
    perStudent[studentId] = total > 0 ? Math.round((present / total) * 100) : 0
  })

  const overall = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : null
  return { overall, perStudent }
}

/**
 * Fetch attendance sessions for a course on a specific date.
 */
export async function fetchDailyAttendanceForHod(courseId, date) {
  const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('attendance')
    .select(`
      id, hour, is_holiday, holiday_reason,
      attendance_details(
        student_id, status,
        students(id, roll_number, name)
      )
    `)
    .eq('course_id', courseId)
    .eq('date', dateStr)
    .order('hour', { ascending: true })

  if (error) throw new Error('Unable to load daily attendance.')
  return data ?? []
}

/**
 * Fetch enrolled students for a course with overall attendance percentage.
 */
export async function fetchStudentsWithPercentage(courseId) {
  const { data: enrolled, error: enrollErr } = await supabase
    .from('course_students')
    .select(`student_id, students(id, roll_number, name)`)
    .eq('course_id', courseId)

  if (enrollErr) throw new Error('Unable to fetch enrolled students.')
  if (!enrolled || enrolled.length === 0) return []

  const { perStudent } = await fetchCourseAttendanceSummary(courseId)

  const result = enrolled.map((e) => ({
    id: e.students.id,
    roll_number: e.students.roll_number,
    name: e.students.name,
    percentage: perStudent[e.students.id] ?? null,
    isLow: perStudent[e.students.id] != null && perStudent[e.students.id] < LOW_ATTENDANCE_THRESHOLD,
  }))

  result.sort((a, b) => {
    if (a.isLow && !b.isLow) return -1
    if (!a.isLow && b.isLow) return 1
    if (a.percentage != null && b.percentage != null) return a.percentage - b.percentage
    return a.roll_number.localeCompare(b.roll_number)
  })

  return result
}

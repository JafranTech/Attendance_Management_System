import { supabase } from '../lib/supabase'
import { format, subDays } from 'date-fns'

const MIN_ATTENDANCE_PERCENTAGE = 75

export async function getDashboardStats(facultyId) {
  // Total courses
  const { count: coursesCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('faculty_id', facultyId)

  // Total unique students across all courses
  const { data: studentLinks } = await supabase
    .from('course_students')
    .select('student_id, courses!inner(faculty_id)')
    .eq('courses.faculty_id', facultyId)

  const uniqueStudents = new Set(studentLinks?.map((r) => r.student_id) || []).size

  return {
    totalCourses: coursesCount ?? 0,
    totalStudents: uniqueStudents,
  }
}

export async function getAttendanceTrend(facultyId) {
  const days = 7
  const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')

  const { data } = await supabase
    .from('attendance')
    .select(`
      date,
      courses!inner(faculty_id),
      attendance_details(status)
    `)
    .eq('courses.faculty_id', facultyId)
    .gte('date', startDate)

  if (!data) return []

  // Group by date
  const trendMap = {}
  for (let i = 0; i < days; i++) {
    const d = format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd')
    trendMap[d] = { date: d, present: 0, absent: 0 }
  }

  data.forEach((session) => {
    const d = session.date
    if (!trendMap[d]) return
    session.attendance_details.forEach((det) => {
      if (det.status === 'Present') trendMap[d].present++
      else trendMap[d].absent++
    })
  })

  return Object.values(trendMap).map((d) => ({
    ...d,
    label: format(new Date(d.date + 'T00:00:00'), 'EEE'),
  }))
}

export async function getLowAttendanceStudents(facultyId) {
  // Fetch all attendance details for this faculty's courses
  const { data } = await supabase
    .from('attendance_details')
    .select(`
      status,
      students(id, name, roll_number),
      attendance(
        course_id,
        courses!inner(course_name, course_code, faculty_id)
      )
    `)
    .eq('attendance.courses.faculty_id', facultyId)

  if (!data) return []

  // Aggregate per student per course
  const key = (studentId, courseId) => `${studentId}::${courseId}`
  const map = {}

  data.forEach((row) => {
    const studentId = row.students?.id
    const courseId = row.attendance?.course_id
    const course = row.attendance?.courses
    if (!studentId || !courseId) return

    const k = key(studentId, courseId)
    if (!map[k]) {
      map[k] = {
        studentId,
        name: row.students.name,
        rollNumber: row.students.roll_number,
        courseCode: course?.course_code,
        courseName: course?.course_name,
        present: 0,
        total: 0,
      }
    }
    map[k].total++
    if (row.status === 'Present') map[k].present++
  })

  return Object.values(map)
    .map((r) => ({ ...r, percentage: r.total > 0 ? Math.round((r.present / r.total) * 100) : 0 }))
    .filter((r) => r.percentage < MIN_ATTENDANCE_PERCENTAGE)
    .sort((a, b) => a.percentage - b.percentage)
}

export async function getTodaySchedule(facultyId) {
  const today = format(new Date(), 'yyyy-MM-dd')
  // day_of_week: 1=Mon..7=Sun; JS getDay: 0=Sun..6=Sat → convert
  const jsDay = new Date().getDay()
  const dayOfWeek = jsDay === 0 ? 7 : jsDay

  const { data } = await supabase
    .from('timetable')
    .select(`
      hour, course_id,
      courses!inner(course_name, course_code, faculty_id)
    `)
    .eq('courses.faculty_id', facultyId)
    .eq('day_of_week', dayOfWeek)
    .order('hour', { ascending: true })

  return data || []
}

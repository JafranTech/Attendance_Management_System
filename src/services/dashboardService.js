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
  const { data, error } = await supabase.rpc('get_low_attendance_students', {
    faculty_uuid: facultyId,
    min_percentage: MIN_ATTENDANCE_PERCENTAGE,
  })

  if (error) throw new Error('Unable to load low attendance data.')
  return data ?? []
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

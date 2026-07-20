import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export async function checkAttendanceExists(courseId, date, hour) {
  const { data, error } = await supabase
    .from('attendance')
    .select('id')
    .eq('course_id', courseId)
    .eq('date', date)
    .eq('hour', hour)
    .maybeSingle()

  if (error) throw new Error('Unable to validate attendance. Please try again.')
  return data // null if not exists
}

export async function saveAttendance(courseId, date, hour, studentStatuses) {
  // 1. Insert main attendance record
  const { data: attendanceRecord, error: attError } = await supabase
    .from('attendance')
    .insert({ course_id: courseId, date, hour })
    .select()
    .single()

  if (attError) {
    if (attError.code === '23505') throw new Error('Attendance for this hour is already marked.')
    throw new Error('Unable to save attendance. Please try again.')
  }

  // 2. Insert details for each student
  const details = studentStatuses.map((s) => ({
    attendance_id: attendanceRecord.id,
    student_id: s.studentId,
    status: s.status,
  }))

  const { error: detError } = await supabase
    .from('attendance_details')
    .insert(details)

  if (detError) throw new Error('Attendance saved but details failed. Please contact support.')
  return attendanceRecord
}

export async function fetchAttendanceHistory(courseId) {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      id, date, hour, created_at, course_id,
      courses(course_name, course_code),
      attendance_details(id, status)
    `)
    .eq('course_id', courseId)
    .order('date', { ascending: false })
    .order('hour', { ascending: false })

  if (error) throw new Error('Unable to load attendance history. Please try again.')
  return data
}

export async function fetchAllHistory(facultyId) {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      id, date, hour, created_at, course_id,
      courses!inner(course_name, course_code, faculty_id),
      attendance_details(id, status)
    `)
    .eq('courses.faculty_id', facultyId)
    .order('date', { ascending: false })
    .order('hour', { ascending: false })
    .limit(100)

  if (error) throw new Error('Unable to load history. Please try again.')
  return data
}

export async function fetchSessionDetails(attendanceId) {
  const { data, error } = await supabase
    .from('attendance_details')
    .select(`
      id, status,
      students(id, roll_number, name, email)
    `)
    .eq('attendance_id', attendanceId)
    .order('students(roll_number)', { ascending: true })

  if (error) throw new Error('Unable to load session details. Please try again.')
  return data
}

export async function editAttendanceDetail(attendanceId, studentId, oldStatus, newStatus, reason) {
  const { error: updateError } = await supabase
    .from('attendance_details')
    .update({ status: newStatus })
    .match({ attendance_id: attendanceId, student_id: studentId })

  if (updateError) throw new Error('Unable to update attendance. Please try again.')

  const { error: logError } = await supabase
    .from('attendance_edits')
    .insert({ attendance_id: attendanceId, student_id: studentId, previous_status: oldStatus, new_status: newStatus, reason })

  if (logError) throw new Error('Update saved but audit log failed. Please contact support.')
}

export async function getReportData(courseId, startDate, endDate) {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      id, date, hour,
      attendance_details(
        status,
        students(id, roll_number, name)
      )
    `)
    .eq('course_id', courseId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('hour', { ascending: true })

  if (error) throw new Error('Unable to fetch report data. Please try again.')
  return data
}

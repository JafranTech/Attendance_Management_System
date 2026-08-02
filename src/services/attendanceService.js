import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export async function checkAttendanceExists(courseId, date, hour) {
  const { data, error } = await supabase
    .from('attendance')
    .select('id, is_holiday, holiday_reason, attendance_details(student_id, status)')
    .eq('course_id', courseId)
    .eq('date', date)
    .eq('hour', hour)
    .maybeSingle()

  if (error) throw new Error('Unable to validate attendance. Please try again.')
  return data // null if not exists
}

export async function saveAttendance(courseId, date, hour, studentStatuses, isHoliday = false, holidayReason = null) {
  // 1. Get existing or insert main attendance record
  let attendanceId
  const { data: existing, error: existError } = await supabase
    .from('attendance')
    .select('id')
    .eq('course_id', courseId)
    .eq('date', date)
    .eq('hour', hour)
    .maybeSingle()

  if (existing) {
    attendanceId = existing.id
    // Update it in case it's being changed to/from a holiday
    await supabase.from('attendance')
      .update({ is_holiday: isHoliday, holiday_reason: holidayReason })
      .eq('id', attendanceId)
  } else {
    const { data: newAtt, error: attError } = await supabase
      .from('attendance')
      .insert({ course_id: courseId, date, hour, is_holiday: isHoliday, holiday_reason: holidayReason })
      .select()
      .single()
    if (attError) throw new Error('Unable to save attendance. Please try again.')
    attendanceId = newAtt.id
  }

  // 2. Handle details: if holiday, clear all. Otherwise, update for current batch.
  if (isHoliday) {
    await supabase.from('attendance_details').delete().eq('attendance_id', attendanceId)
  } else if (studentStatuses && studentStatuses.length > 0) {
    // Delete existing details for these specific students to avoid unique constraint errors if any
    const studentIds = studentStatuses.map(s => s.studentId)
    await supabase.from('attendance_details')
      .delete()
      .eq('attendance_id', attendanceId)
      .in('student_id', studentIds)

    const details = studentStatuses.map((s) => ({
      attendance_id: attendanceId,
      student_id: s.studentId,
      status: s.status,
    }))

    const { error: detError } = await supabase
      .from('attendance_details')
      .insert(details)

    if (detError) throw new Error('Attendance saved but details failed. Please contact support.')
  }

  return { id: attendanceId }
}

export async function fetchAttendanceHistory(courseId) {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      id, date, hour, created_at, course_id, is_holiday, holiday_reason,
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
      id, date, hour, created_at, course_id, is_holiday, holiday_reason,
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
  const { data: details, error: detError } = await supabase
    .from('attendance_details')
    .select(`
      id, status, student_id,
      students(id, roll_number, name, email)
    `)
    .eq('attendance_id', attendanceId)
    .order('students(roll_number)', { ascending: true })

  if (detError) throw new Error('Unable to load session details. Please try again.')

  // Fetch edits for this session
  const { data: edits } = await supabase
    .from('attendance_edits')
    .select('student_id, reason, edited_at')
    .eq('attendance_id', attendanceId)
    .order('edited_at', { ascending: false })

  // Attach latest edit reason to each detail
  const detailsWithEdits = details.map(d => {
    const latestEdit = edits?.find(e => e.student_id === d.student_id)
    return {
      ...d,
      latest_edit_reason: latestEdit ? latestEdit.reason : null,
      edited_at: latestEdit ? latestEdit.edited_at : null
    }
  })

  return detailsWithEdits
}

export async function deleteSession(attendanceId) {
  // Deleting the main record will cascade to attendance_details due to FK
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', attendanceId)
    
  if (error) throw new Error('Unable to delete session. Please try again.')
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

export async function fetchStudentAttendance(courseId, studentId) {
  const { data, error } = await supabase
    .from('attendance_details')
    .select(`
      id, status,
      attendance!inner(
        id, date, hour, course_id
      )
    `)
    .eq('student_id', studentId)
    .eq('attendance.course_id', courseId)
    .order('attendance(date)', { ascending: false })
    .order('attendance(hour)', { ascending: false })

  if (error) throw new Error('Unable to load student attendance history.')
  return data
}

/**
 * Bulk-fetch attendance percentages for ALL students in a course.
 * Returns a map: { [studentId]: percentage (0-100) }
 * Uses 2 queries total (not N queries per student).
 */
export async function fetchAllStudentPercentages(courseId) {
  // 1. Get all non-holiday session IDs for this course
  const { data: sessions, error: sessErr } = await supabase
    .from('attendance')
    .select('id')
    .eq('course_id', courseId)
    .eq('is_holiday', false)

  if (sessErr) throw new Error('Unable to fetch session data.')
  if (!sessions || sessions.length === 0) return {}

  const sessionIds = sessions.map((s) => s.id)

  // 2. Get all attendance_details for those sessions in one query
  const { data: details, error: detErr } = await supabase
    .from('attendance_details')
    .select('student_id, status')
    .in('attendance_id', sessionIds)

  if (detErr) throw new Error('Unable to fetch attendance details.')

  // 3. Compute per-student totals client-side
  const studentMap = {}
  details?.forEach((d) => {
    if (!studentMap[d.student_id]) {
      studentMap[d.student_id] = { present: 0, total: 0 }
    }
    studentMap[d.student_id].total++
    if (d.status === 'Present') studentMap[d.student_id].present++
  })

  // 4. Convert to percentage map
  const percentages = {}
  Object.entries(studentMap).forEach(([studentId, { present, total }]) => {
    percentages[studentId] = total > 0 ? Math.round((present / total) * 100) : 0
  })

  return percentages
}

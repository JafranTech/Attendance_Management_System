import * as XLSX from 'xlsx'
import { format, parseISO } from 'date-fns'

/**
 * Generates and triggers download of an Excel attendance report.
 * @param {object} course - Course object { course_code, course_name, semester }
 * @param {Array} sessions - Array from getReportData()
 * @param {string} facultyName - Faculty display name
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 */
export function exportAttendanceToExcel({ course, sessions, facultyName, startDate, endDate }) {
  // Build unique student list ordered by roll number
  const studentMap = {}
  sessions.forEach((session) => {
    session.attendance_details.forEach((detail) => {
      const s = detail.students
      if (!studentMap[s.id]) studentMap[s.id] = { id: s.id, roll_number: s.roll_number, name: s.name }
    })
  })
  const students = Object.values(studentMap).sort((a, b) =>
    a.roll_number.localeCompare(b.roll_number, undefined, { numeric: true })
  )

  // Build session column headers
  const sessionHeaders = sessions.map(
    (s) => `${format(parseISO(s.date), 'dd/MM')}\nHr ${s.hour}`
  )

  // Build data rows
  const rows = students.map((student) => {
    let presentCount = 0
    const sessionStatuses = sessions.map((session) => {
      const detail = session.attendance_details.find((d) => d.students.id === student.id)
      const status = detail?.status || 'Absent'
      if (status === 'Present') presentCount++
      return status === 'Present' ? 'P' : 'A'
    })
    const totalSessions = sessions.length
    const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0

    return [
      student.roll_number,
      student.name,
      ...sessionStatuses,
      presentCount,
      totalSessions - presentCount,
      totalSessions,
      `${percentage}%`,
    ]
  })

  // Title rows
  const title = [
    [`${course.course_code} — ${course.course_name}`],
    [`Faculty: ${facultyName} | Semester: ${course.semester || 'N/A'} | Period: ${format(parseISO(startDate), 'dd MMM yyyy')} – ${format(parseISO(endDate), 'dd MMM yyyy')}`],
    [], // blank row
    ['Roll No.', 'Name', ...sessionHeaders, 'Present', 'Absent', 'Total', 'Attendance %'],
    ...rows,
  ]

  const ws = XLSX.utils.aoa_to_sheet(title)

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, // Roll No.
    { wch: 28 }, // Name
    ...sessions.map(() => ({ wch: 9 })),
    { wch: 9 }, { wch: 9 }, { wch: 9 }, { wch: 13 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report')
  XLSX.writeFile(wb, `${course.course_code}_Attendance_${startDate}_to_${endDate}.xlsx`)
}

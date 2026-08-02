import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format, parseISO } from 'date-fns'

/**
 * Generates and triggers download of a PDF attendance report.
 * @param {object} course - Course object
 * @param {Array} sessions - Array from getReportData()
 * @param {string} facultyName - Faculty display name
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 */
export function generateAttendancePdf({ course, sessions, facultyName, startDate, endDate }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // ── Header ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(30, 64, 175) // Blue
  doc.text('Faculty Attendance Management System', 148.5, 15, { align: 'center' })

  doc.setFontSize(11)
  doc.setTextColor(30, 30, 30)
  doc.text(`${course.course_code} — ${course.course_name}`, 148.5, 22, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Faculty: ${facultyName}   |   Semester: ${course.semester || 'N/A'}   |   Period: ${format(parseISO(startDate), 'dd MMM yyyy')} – ${format(parseISO(endDate), 'dd MMM yyyy')}`,
    148.5, 28, { align: 'center' }
  )

  // Divider
  doc.setDrawColor(200, 200, 200)
  doc.line(14, 31, 283, 31)

  // ── Build table data ──
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

  const sessionCols = sessions.map((s) => ({
    header: s.is_holiday ? `${format(parseISO(s.date), 'dd/MM')}\n(Hol)` : `${format(parseISO(s.date), 'dd/MM')}\nHr${s.hour}`,
    dataKey: s.id,
  }))

  const columns = [
    { header: '#', dataKey: 'idx' },
    { header: 'Roll No.', dataKey: 'roll' },
    { header: 'Name', dataKey: 'name' },
    ...sessionCols,
    { header: 'P', dataKey: 'present' },
    { header: 'A', dataKey: 'absent' },
    { header: 'Total', dataKey: 'total' },
    { header: '%', dataKey: 'pct' },
  ]

  const rows = students.map((student, idx) => {
    let presentCount = 0
    let totalSessions = 0
    const sessionStatuses = {}
    sessions.forEach((session) => {
      if (session.is_holiday) {
        const reason = session.holiday_reason || 'HOLIDAY'
        sessionStatuses[session.id] = reason.split('').join('\n')
      } else {
        const detail = session.attendance_details.find((d) => d.students.id === student.id)
        if (detail) {
          totalSessions++
          const status = detail.status === 'Present' ? 'P' : 'A'
          if (status === 'P') presentCount++
          sessionStatuses[session.id] = status
        } else {
          sessionStatuses[session.id] = '-'
        }
      }
    })
    const pct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0
    return {
      idx: idx + 1,
      roll: student.roll_number,
      name: student.name,
      ...sessionStatuses,
      present: presentCount,
      absent: totalSessions - presentCount,
      total: totalSessions,
      pct: `${pct}%`,
    }
  })

  autoTable(doc, {
    startY: 34,
    columns,
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: { fontSize: 7, halign: 'center' },
    columnStyles: {
      idx: { cellWidth: 8 },
      roll: { cellWidth: 20 },
      name: { cellWidth: 40, halign: 'left' },
      present: { cellWidth: 10, fillColor: [240, 253, 244], textColor: [22, 163, 74] },
      absent: { cellWidth: 10, fillColor: [254, 242, 242], textColor: [220, 38, 38] },
      pct: { cellWidth: 14, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      // Colour P/A cells, or holiday text
      const isSessionCol = sessions.some((s) => s.id === data.column.dataKey)
      if (isSessionCol && data.section === 'body') {
        const session = sessions.find((s) => s.id === data.column.dataKey)
        if (session?.is_holiday) {
          data.cell.styles.fillColor = [255, 251, 235] // Light yellow/amber
          data.cell.styles.textColor = [180, 83, 9] // Dark amber
          data.cell.styles.fontSize = 5 // Smaller font for vertical reason
          data.cell.styles.fontStyle = 'bold'
        } else {
          if (data.cell.raw === 'P') {
            data.cell.styles.fillColor = [220, 252, 231]
            data.cell.styles.textColor = [22, 163, 74]
          } else if (data.cell.raw === 'A') {
            data.cell.styles.fillColor = [254, 226, 226]
            data.cell.styles.textColor = [220, 38, 38]
          } else if (data.cell.raw === '-') {
            data.cell.styles.textColor = [156, 163, 175] // gray-400
          }
        }
      }
      // Low attendance rows
      if (data.column.dataKey === 'pct' && data.section === 'body') {
        const pctVal = parseInt(data.cell.raw, 10)
        if (pctVal < 75) {
          data.cell.styles.textColor = [220, 38, 38]
          data.cell.styles.fillColor = [255, 240, 240]
        } else {
          data.cell.styles.textColor = [22, 163, 74]
        }
      }
    },
    margin: { left: 14, right: 14 },
  })

  // ── Signature Block ──
  const finalY = doc.lastAutoTable.finalY + 15
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.line(14, finalY + 8, 60, finalY + 8)
  doc.line(120, finalY + 8, 166, finalY + 8)
  doc.line(226, finalY + 8, 283, finalY + 8)
  doc.text('Faculty Signature', 37, finalY + 12, { align: 'center' })
  doc.text('HOD Signature', 143, finalY + 12, { align: 'center' })
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 255, finalY + 12, { align: 'center' })

  doc.save(`${course.course_code}_Attendance_${startDate}_to_${endDate}.pdf`)
}

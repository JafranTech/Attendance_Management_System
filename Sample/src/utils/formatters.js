import { format, parseISO } from 'date-fns'

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd MMM yyyy, HH:mm')
}

export function formatDayOfWeek(dayOfWeek) {
  const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days[dayOfWeek] || '—'
}

export function getAttendanceColor(percentage) {
  if (percentage >= 75) return 'green'
  if (percentage >= 50) return 'amber'
  return 'red'
}

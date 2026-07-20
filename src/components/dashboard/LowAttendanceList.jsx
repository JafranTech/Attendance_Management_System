import { AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

export function LowAttendanceList({ students }) {
  if (!students || students.length === 0) return (
    <div className="text-center py-6 text-sm text-slate-400">
      🎉 All students are above 75% attendance.
    </div>
  )

  return (
    <div className="space-y-2">
      {students.map((s, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800">{s.name}</p>
              <p className="text-xs text-slate-500">{s.rollNumber} · {s.courseCode}</p>
            </div>
          </div>
          <span className={clsx(
            'text-sm font-bold px-2.5 py-1 rounded-full',
            s.percentage < 50 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
          )}>
            {s.percentage}%
          </span>
        </div>
      ))}
    </div>
  )
}

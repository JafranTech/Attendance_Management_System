import clsx from 'clsx'
import { CheckCircle2, XCircle, Circle } from 'lucide-react'

export function StudentAttendanceRow({ student, status, onToggle, attendancePercent }) {
  const isPresent = status === 'Present'
  const isAbsent = status === 'Absent'
  const isUnmarked = !isPresent && !isAbsent

  const percentColor =
    attendancePercent === undefined
      ? null
      : attendancePercent < 50
      ? 'text-red-600 bg-red-50'
      : attendancePercent < 75
      ? 'text-amber-600 bg-amber-50'
      : 'text-green-600 bg-green-50'

  return (
    <div
      className={clsx(
        'flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-all duration-150 select-none bg-white',
        isPresent ? 'border-green-200 bg-green-50/40' :
        isAbsent  ? 'border-red-200 bg-red-50/40' :
        'border-slate-200 hover:border-slate-300'
      )}
      onClick={() => onToggle(student.id)}
      role="button"
    >
      {/* Left: Avatar + Name + Percentage */}
      <div className="flex items-center gap-3">
        <div className={clsx(
          'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
          isPresent ? 'bg-green-200 text-green-800' :
          isAbsent  ? 'bg-red-200 text-red-800' :
          'bg-slate-200 text-slate-600'
        )}>
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className={clsx('text-sm font-semibold',
              isPresent ? 'text-green-800' :
              isAbsent  ? 'text-red-700' :
              'text-slate-800'
            )}>
              {student.name}
            </p>
            {attendancePercent !== undefined && (
              <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded-md', percentColor)}>
                {attendancePercent}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{student.roll_number}</p>
        </div>
      </div>

      {/* Right: Mark toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className={clsx('text-xs font-semibold',
            isPresent ? 'text-green-600' :
            isAbsent  ? 'text-red-500' :
            'text-slate-400'
          )}>
            {isPresent ? 'Present' : isAbsent ? 'Absent' : 'Mark'}
          </span>
          {isPresent
            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
            : isAbsent
            ? <XCircle className="w-5 h-5 text-red-400" />
            : <Circle className="w-5 h-5 text-slate-300" />
          }
        </div>
      </div>
    </div>
  )
}

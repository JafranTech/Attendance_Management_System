import clsx from 'clsx'
import { CheckCircle2, XCircle } from 'lucide-react'

export function StudentAttendanceRow({ student, status, onToggle }) {
  const isPresent = status === 'Present'

  return (
    <div
      className={clsx(
        'flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-all duration-150 select-none',
        isPresent
          ? 'bg-green-50 border-green-200 hover:border-green-300'
          : 'bg-red-50 border-red-200 hover:border-red-300'
      )}
      onClick={() => onToggle(student.id)}
      role="button"
      aria-pressed={isPresent}
      style={{ minHeight: '56px' }}
    >
      <div className="flex items-center gap-3">
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
          isPresent ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
        )}>
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className={clsx('text-sm font-semibold', isPresent ? 'text-green-800' : 'text-red-800')}>
            {student.name}
          </p>
          <p className={clsx('text-xs', isPresent ? 'text-green-600' : 'text-red-500')}>
            {student.roll_number}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={clsx('text-xs font-semibold', isPresent ? 'text-green-700' : 'text-red-600')}>
          {isPresent ? 'Present' : 'Absent'}
        </span>
        {isPresent
          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
          : <XCircle className="w-5 h-5 text-red-400" />
        }
      </div>
    </div>
  )
}

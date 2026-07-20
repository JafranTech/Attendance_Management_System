import clsx from 'clsx'
import { CheckCircle2, XCircle, Circle } from 'lucide-react'

export function StudentAttendanceRow({ student, status, onToggle }) {
  const isPresent = status === 'Present'
  const isAbsent = status === 'Absent'
  const isUnmarked = !status

  return (
    <div
      className={clsx(
        'flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-all duration-150 select-none',
        isPresent ? 'bg-green-50 border-green-200 hover:border-green-300' :
        isAbsent ? 'bg-red-50 border-red-200 hover:border-red-300' :
        'bg-slate-50 border-slate-200 hover:border-slate-300'
      )}
      onClick={() => onToggle(student.id)}
      role="button"
      style={{ minHeight: '56px' }}
    >
      <div className="flex items-center gap-3">
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
          isPresent ? 'bg-green-200 text-green-800' : 
          isAbsent ? 'bg-red-200 text-red-800' :
          'bg-slate-200 text-slate-700'
        )}>
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className={clsx('text-sm font-semibold transition-colors', 
            isPresent ? 'text-green-800' : 
            isAbsent ? 'text-red-800' :
            'text-slate-700'
          )}>
            {student.name}
          </p>
          <p className={clsx('text-xs transition-colors', 
            isPresent ? 'text-green-600' : 
            isAbsent ? 'text-red-500' :
            'text-slate-500'
          )}>
            {student.roll_number}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={clsx('text-xs font-semibold', 
          isPresent ? 'text-green-700' : 
          isAbsent ? 'text-red-600' :
          'text-slate-400'
        )}>
          {isPresent ? 'Present' : isAbsent ? 'Absent' : 'Mark'}
        </span>
        {isPresent ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
         isAbsent ? <XCircle className="w-5 h-5 text-red-400" /> :
         <Circle className="w-5 h-5 text-slate-300" />
        }
      </div>
    </div>
  )
}

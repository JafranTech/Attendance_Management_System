import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, ChevronRight } from 'lucide-react'

export function QuickActions({ schedule }) {
  const navigate = useNavigate()

  if (!schedule || schedule.length === 0) return (
    <p className="text-sm text-slate-400 py-4 text-center">No classes scheduled for today.</p>
  )

  return (
    <div className="space-y-2">
      {schedule.map((entry) => (
        <button
          key={`${entry.course_id}-${entry.hour}`}
          onClick={() => navigate('/attendance')}
          className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-blue-800">{entry.courses?.course_name}</p>
              <p className="text-xs text-blue-600">{entry.courses?.course_code} · Hour {entry.hour}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      ))}
    </div>
  )
}

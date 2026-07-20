import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { X, Calendar, Search, CheckCircle2, XCircle } from 'lucide-react'
import { useStudentAttendance } from '../../hooks/useAttendance'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import clsx from 'clsx'

export function StudentAttendanceModal({ isOpen, onClose, student, courseId }) {
  const [filter, setFilter] = useState('All') // 'All' | 'Present' | 'Absent'
  const [searchTerm, setSearchTerm] = useState('')

  const { data: records, isLoading } = useStudentAttendance(
    isOpen ? courseId : null, 
    isOpen ? student?.id : null
  )

  const filteredRecords = useMemo(() => {
    if (!records) return []
    let result = records

    if (filter === 'Present') result = result.filter(r => r.status === 'Present')
    if (filter === 'Absent') result = result.filter(r => r.status === 'Absent')

    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      result = result.filter(r => {
        const dateStr = format(parseISO(r.attendance.date), 'dd MMM yyyy').toLowerCase()
        return dateStr.includes(lower)
      })
    }
    return result
  }, [records, filter, searchTerm])

  const stats = useMemo(() => {
    if (!records) return { total: 0, present: 0, absent: 0, percentage: 0 }
    const present = records.filter(r => r.status === 'Present').length
    const total = records.length
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0
    return { total, present, absent: total - present, percentage }
  }, [records])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{student?.name}</h2>
            <p className="text-sm text-slate-500">{student?.roll_number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-4 items-center">
          <div className={clsx(
            "px-4 py-2 rounded-xl border flex items-center gap-2",
            stats.percentage >= 75 ? "bg-green-50 border-green-100 text-green-700" : 
            stats.percentage >= 60 ? "bg-amber-50 border-amber-100 text-amber-700" :
            "bg-red-50 border-red-100 text-red-700"
          )}>
            <span className="text-2xl font-bold">{stats.percentage}%</span>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Attendance</span>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold">Classes</span>
              <span className="font-bold text-slate-900">{stats.total}</span>
            </div>
            <div>
              <span className="text-green-600 block text-xs uppercase tracking-wider font-semibold">Present</span>
              <span className="font-bold text-green-700">{stats.present}</span>
            </div>
            <div>
              <span className="text-red-500 block text-xs uppercase tracking-wider font-semibold">Absent</span>
              <span className="font-bold text-red-600">{stats.absent}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="flex p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
            {['All', 'Present', 'Absent'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                  filter === f ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search date (e.g. Jul 20)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {isLoading ? (
            <div className="py-12"><LoadingSpinner /></div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No attendance records found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map(record => (
                <div key={record.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                      <Calendar className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {format(parseISO(record.attendance.date), 'dd MMM yyyy')}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Hour {record.attendance.hour}
                      </p>
                    </div>
                  </div>
                  
                  {record.status === 'Present' ? (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-semibold tracking-wide">Present</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold tracking-wide">Absent</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useMemo, useEffect } from 'react'
import { CheckCircle2, XCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '../ui/Badge'
import clsx from 'clsx'

export function InteractiveMode({ students, statuses, setStatuses }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const student = students[currentIndex]

  // Allow jumping to a student via search
  useEffect(() => {
    if (!searchTerm) return
    const lower = searchTerm.toLowerCase()
    const index = students.findIndex(s => 
      s.name.toLowerCase().includes(lower) || 
      s.roll_number.toLowerCase().includes(lower)
    )
    if (index !== -1) {
      setCurrentIndex(index)
    }
  }, [searchTerm, students])

  const handleMark = (status) => {
    setStatuses(prev => ({ ...prev, [student.id]: status }))
    // Auto-advance
    if (currentIndex < students.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSearchTerm('') // clear search on auto-advance
    }
  }

  const goNext = () => {
    if (currentIndex < students.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSearchTerm('')
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setSearchTerm('')
    }
  }

  if (!student) return null

  const currentStatus = statuses[student.id]

  return (
    <div className="flex flex-col items-center">
      {/* Search Bar */}
      <div className="w-full max-w-md mb-6 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Jump to student (name or roll no.)..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
        
        {/* Progress Bar at top */}
        <div className="h-1.5 w-full bg-slate-100 absolute top-0 left-0">
          <div 
            className="h-full bg-blue-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / students.length) * 100}%` }}
          />
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-widest">
            Student {currentIndex + 1} of {students.length}
          </div>
          
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
            {student.name.charAt(0).toUpperCase()}
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{student.name}</h2>
          <Badge variant="blue" className="text-base px-3 py-1">{student.roll_number}</Badge>
          
          {currentStatus && (
            <div className={clsx(
              "mt-4 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5",
              currentStatus === 'Present' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {currentStatus === 'Present' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {currentStatus}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 border-t border-slate-100 divide-x divide-slate-100">
          <button
            onClick={() => handleMark('Present')}
            className={clsx(
              "py-5 flex flex-col items-center justify-center gap-2 transition-colors",
              currentStatus === 'Present' ? "bg-green-50" : "hover:bg-slate-50"
            )}
          >
            <CheckCircle2 className={clsx("w-8 h-8", currentStatus === 'Present' ? "text-green-600" : "text-green-500")} />
            <span className={clsx("font-bold", currentStatus === 'Present' ? "text-green-700" : "text-slate-600")}>Present</span>
          </button>
          
          <button
            onClick={() => handleMark('Absent')}
            className={clsx(
              "py-5 flex flex-col items-center justify-center gap-2 transition-colors",
              currentStatus === 'Absent' ? "bg-red-50" : "hover:bg-slate-50"
            )}
          >
            <XCircle className={clsx("w-8 h-8", currentStatus === 'Absent' ? "text-red-600" : "text-red-500")} />
            <span className={clsx("font-bold", currentStatus === 'Absent' ? "text-red-700" : "text-slate-600")}>Absent</span>
          </button>
        </div>
      </div>

      {/* Manual Navigation */}
      <div className="flex items-center justify-between w-full max-w-md mt-6">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex === students.length - 1}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded-lg transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

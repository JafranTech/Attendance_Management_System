import { useState } from 'react'
import { Button } from '../ui/Button'
import { Users } from 'lucide-react'
import toast from 'react-hot-toast'

export function QuickEntryMode({ students, statuses, setStatuses }) {
  const [inputText, setInputText] = useState('')

  const handleMark = () => {
    if (!inputText.trim()) {
      toast.error('Please enter roll numbers first')
      return
    }

    const numbers = inputText
      .split(/[\s,]+/)
      .map(s => s.trim())
      .filter(Boolean)

    if (numbers.length === 0) return

    let matchCount = 0
    const newStatuses = { ...statuses }

    // First mark all as Present by default if they are unmarked
    students.forEach(s => {
      if (!newStatuses[s.id]) {
        newStatuses[s.id] = 'Present'
      }
    })

    // Then process absentees
    numbers.forEach(num => {
      const matchedStudent = students.find(s => {
        // Extract the trailing digits of the roll number.
        // e.g. "IT2021001" -> "1". "IT2021035" -> "35". "IT2021115" -> "115"
        const match = s.roll_number.match(/(\d+)$/)
        if (!match) return false
        const suffix = match[1]
        
        return parseInt(suffix, 10) === parseInt(num, 10)
      })

      if (matchedStudent) {
        newStatuses[matchedStudent.id] = 'Absent'
        matchCount++
      }
    })

    setStatuses(newStatuses)
    setInputText('')
    toast.success(`Marked ${matchCount} student(s) as absent. Remaining marked as present.`)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-500" />
        Quick Entry (Absentees)
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Enter the last digits of the roll numbers for students who are <strong>absent</strong> (comma separated, e.g., 1, 2, 14).
        Everyone else will be marked as present.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="e.g. 1, 2, 14"
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleMark()
            }
          }}
        />
        <Button onClick={handleMark} className="bg-red-600 hover:bg-red-700 text-white shrink-0">
          Mark as Absent
        </Button>
      </div>
    </div>
  )
}

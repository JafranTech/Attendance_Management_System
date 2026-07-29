import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTimetable, useAddTimetableEntry, useDeleteTimetableEntry } from '../../hooks/useTimetable'
import { Badge } from '../ui/Badge'
import { LoadingSpinner } from '../ui/LoadingSpinner'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8]

export function TimetableTab({ courseId }) {
  const [selectedDay, setSelectedDay] = useState(1)
  const [selectedHour, setSelectedHour] = useState(1)
  const { data: entries, isLoading } = useTimetable(courseId)
  const addEntry = useAddTimetableEntry(courseId)
  const deleteEntry = useDeleteTimetableEntry(courseId)

  const isSlotTaken = (day, hour) =>
    entries?.some((e) => e.day_of_week === day && e.hour === hour)

  const handleAdd = async () => {
    if (isSlotTaken(selectedDay, selectedHour)) {
      toast.error('This slot is already added.')
      return
    }
    try {
      await addEntry.mutateAsync({ courseId, dayOfWeek: selectedDay, hour: selectedHour })
      toast.success('Time slot added.')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteEntry.mutateAsync(id)
      toast.success('Time slot removed.')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (isLoading) return <LoadingSpinner />

  // Group entries by day
  const byDay = DAYS.reduce((acc, _, i) => {
    acc[i + 1] = entries?.filter((e) => e.day_of_week === i + 1) || []
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Add Slot */}
      <div className="bg-slate-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Add Time Slot</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
              className="block border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DAYS.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">Hour</label>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(Number(e.target.value))}
              className="block border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {HOURS.map((h) => <option key={h} value={h}>Hour {h}</option>)}
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={addEntry.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {addEntry.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Slot
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="space-y-3">
        {DAYS.map((day, i) => {
          const dayEntries = byDay[i + 1]
          if (dayEntries.length === 0) return null
          return (
            <div key={day} className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 w-24 flex-shrink-0">{day}</span>
              {dayEntries
                .sort((a, b) => a.hour - b.hour)
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-xs font-medium text-blue-700">Hour {entry.hour}</span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleteEntry.isPending}
                      className="text-blue-300 hover:text-blue-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>
          )
        })}
        {entries?.length === 0 && (
          <p className="text-sm text-slate-400 py-4 text-center">No time slots set. Add your first slot above.</p>
        )}
      </div>
    </div>
  )
}

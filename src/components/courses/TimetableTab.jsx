import { useState } from 'react'
import { Plus, X, Loader2, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTimetable, useAddTimetableEntry, useDeleteTimetableEntry } from '../../hooks/useTimetable'
import { LoadingSpinner } from '../ui/LoadingSpinner'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8]
const SESSION_TYPES = [
  { label: '1 Hour (Lecture)', hours: 1 },
  { label: '2 Hours (Lab Block)', hours: 2 },
  { label: '3 Hours (Lab Block)', hours: 3 },
  { label: '4 Hours (Lab Block)', hours: 4 },
]

export function TimetableTab({ courseId }) {
  const [selectedDay, setSelectedDay] = useState(1)
  const [selectedHour, setSelectedHour] = useState(1)
  const [selectedType, setSelectedType] = useState(1) // duration in hours
  const { data: entries, isLoading } = useTimetable(courseId)
  const addEntry = useAddTimetableEntry(courseId)
  const deleteEntry = useDeleteTimetableEntry(courseId)

  const isSlotTaken = (day, hour) =>
    entries?.some((e) => e.day_of_week === day && e.hour === hour)

  const handleAdd = async () => {
    // Check if any slot in the block is taken
    const blockHours = Array.from({ length: selectedType }, (_, i) => selectedHour + i)
    
    // Validate we don't go past hour 8
    if (selectedHour + selectedType - 1 > 8) {
      toast.error('Session extends beyond available hours (Hour 8).')
      return
    }

    const conflict = blockHours.find(h => isSlotTaken(selectedDay, h))
    if (conflict) {
      toast.error(`Hour ${conflict} is already assigned on this day.`)
      return
    }

    try {
      await addEntry.mutateAsync({ courseId, dayOfWeek: selectedDay, hours: blockHours })
      toast.success('Time slot(s) added.')
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

  // Group entries by day and identify contiguous blocks
  const getBlocksForDay = (dayIndex) => {
    if (!entries) return []
    const dayEntries = entries.filter((e) => e.day_of_week === dayIndex).sort((a, b) => a.hour - b.hour)
    
    const blocks = []
    let currentBlock = null

    dayEntries.forEach(entry => {
      if (!currentBlock) {
        currentBlock = { start: entry.hour, end: entry.hour, ids: [entry.id] }
      } else if (entry.hour === currentBlock.end + 1) {
        currentBlock.end = entry.hour
        currentBlock.ids.push(entry.id)
      } else {
        blocks.push(currentBlock)
        currentBlock = { start: entry.hour, end: entry.hour, ids: [entry.id] }
      }
    })
    
    if (currentBlock) blocks.push(currentBlock)
    return blocks
  }

  return (
    <div className="space-y-6">
      {/* Add Slot */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Add Time Slot</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
              className="block border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DAYS.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Start Hour</label>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(Number(e.target.value))}
              className="block border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {HOURS.map((h) => <option key={h} value={h}>Hour {h}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Session Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(Number(e.target.value))}
              className="block border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
            >
              {SESSION_TYPES.map((t) => <option key={t.hours} value={t.hours}>{t.label}</option>)}
            </select>
          </div>

          {selectedType > 1 && (
            <div className="bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg flex items-center gap-2 h-[38px]">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">
                Hours {selectedHour}-{selectedHour + selectedType - 1} will be one block
              </span>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={addEntry.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 h-[38px] ml-auto"
          >
            {addEntry.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {selectedType > 1 ? 'Add Block' : 'Add Slot'}
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="space-y-3 bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        {DAYS.map((day, i) => {
          const blocks = getBlocksForDay(i + 1)
          if (blocks.length === 0) return null
          
          return (
            <div key={day} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-24 flex-shrink-0">{day}</span>
              <div className="flex gap-2 flex-wrap">
                {blocks.map((block, idx) => {
                  const isBlock = block.start !== block.end
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 ${
                        isBlock ? 'bg-purple-50 border-purple-100' : 'bg-blue-50 border-blue-100'
                      }`}
                    >
                      <span className={`text-xs font-semibold ${isBlock ? 'text-purple-700' : 'text-blue-700'}`}>
                        {isBlock ? `Hours ${block.start}-${block.end} (Lab)` : `Hour ${block.start}`}
                      </span>
                      <div className="flex gap-1 border-l pl-2 ml-1 border-slate-200/50">
                        {block.ids.map(id => (
                          <button
                            key={id}
                            onClick={() => handleDelete(id)}
                            disabled={deleteEntry.isPending}
                            className={`transition-colors p-0.5 rounded hover:bg-white/50 ${
                              isBlock ? 'text-purple-400 hover:text-purple-600' : 'text-blue-400 hover:text-blue-600'
                            }`}
                            title="Remove this hour"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {entries?.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">No time slots set.</p>
            <p className="text-xs text-slate-400 mt-1">Add your first lecture or lab block above.</p>
          </div>
        )}
      </div>
    </div>
  )
}

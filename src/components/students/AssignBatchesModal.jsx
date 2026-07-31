import { useState, useMemo, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Check, Loader2, GitMerge } from 'lucide-react'
import { useUpdateStudentBatches } from '../../hooks/useStudents'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export function AssignBatchesModal({ isOpen, onClose, courseId, students }) {
  const updateBatches = useUpdateStudentBatches(courseId)
  
  // Track which students are in Batch 1 (Set of IDs)
  const [batch1Ids, setBatch1Ids] = useState(new Set())

  // Initialize from current data when modal opens
  useEffect(() => {
    if (isOpen && students) {
      const b1 = new Set()
      students.forEach(s => {
        if (s.batch === 'Batch 1') b1.add(s.id)
      })
      setBatch1Ids(b1)
    }
  }, [isOpen, students])

  const toggleStudent = (id) => {
    setBatch1Ids(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAutoSplit = () => {
    if (!students || students.length === 0) return
    const half = Math.ceil(students.length / 2)
    const newB1 = new Set()
    // First half based on current sorted order
    students.slice(0, half).forEach(s => newB1.add(s.id))
    setBatch1Ids(newB1)
  }

  const handleSelectAll = () => {
    if (!students) return
    const newB1 = new Set(students.map(s => s.id))
    setBatch1Ids(newB1)
  }

  const handleClearAll = () => {
    setBatch1Ids(new Set())
  }

  const handleSave = async () => {
    if (!students) return
    try {
      // Split into two arrays
      const b1Array = Array.from(batch1Ids)
      const b2Array = students.filter(s => !batch1Ids.has(s.id)).map(s => s.id)

      // Update both concurrently
      await Promise.all([
        b1Array.length > 0 ? updateBatches.mutateAsync({ studentIds: b1Array, batch: 'Batch 1' }) : Promise.resolve(),
        b2Array.length > 0 ? updateBatches.mutateAsync({ studentIds: b2Array, batch: 'Batch 2' }) : Promise.resolve(),
      ])

      toast.success('Batches assigned successfully.')
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to assign batches.')
    }
  }

  const b1Count = batch1Ids.size
  const total = students?.length || 0
  const b2Count = total - b1Count

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Students to Batches">
      <div className="space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl border border-blue-100">
          <p className="font-semibold mb-1">How it works</p>
          <p>
            Select the students you want in <span className="font-bold">Batch 1</span>. All remaining students will automatically be assigned to <span className="font-bold">Batch 2</span>.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-purple-700">{b1Count}</p>
            <p className="text-sm font-semibold text-purple-600 mt-1">BATCH 1</p>
            <p className="text-xs text-purple-500 mt-0.5">Selected below</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{b2Count}</p>
            <p className="text-sm font-semibold text-green-600 mt-1">BATCH 2</p>
            <p className="text-xs text-green-500 mt-0.5">Auto-assigned</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoSplit} className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
            <GitMerge className="w-4 h-4 mr-2" />Auto Split (50/50)
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>

        {/* List Header */}
        <div className="flex justify-between items-end mt-4 border-b pb-2">
          <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
            <Check className="w-4 h-4" /> BATCH 1 — SELECT STUDENTS
          </h3>
          <span className="text-xs text-slate-500 font-medium">{total} total</span>
        </div>

        {/* Student List */}
        <div className="max-h-64 overflow-y-auto space-y-1 p-1">
          {students?.map((student, index) => {
            const isB1 = batch1Ids.has(student.id)
            return (
              <button
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    isB1 ? 'bg-purple-600 border-purple-600' : 'border-slate-300 group-hover:border-purple-400'
                  )}>
                    {isB1 && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-slate-400 w-4">{index + 1}</span>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{student.roll_number}</span>
                  <span className="text-sm font-semibold text-slate-800">{student.name}</span>
                </div>
                {/* Badge indicator for what batch they will be in */}
                <div className={clsx(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full',
                  isB1 ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                )}>
                  {isB1 ? 'B1' : 'B2'}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" 
            onClick={handleSave}
            disabled={updateBatches.isPending}
          >
            {updateBatches.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Assign Batches'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

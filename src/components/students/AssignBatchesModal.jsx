import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Loader2, GitMerge } from 'lucide-react'
import { useUpdateStudentBatches } from '../../hooks/useStudents'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export function AssignBatchesModal({ isOpen, onClose, courseId, students }) {
  const updateBatches = useUpdateStudentBatches(courseId)
  
  // Track each student's batch selection (id -> 'Batch 1' | 'Batch 2' | null)
  const [studentBatches, setStudentBatches] = useState({})

  // Initialize from current data when modal opens
  useEffect(() => {
    if (isOpen && students) {
      const initial = {}
      students.forEach(s => {
        initial[s.id] = s.batch || null
      })
      setStudentBatches(initial)
    }
  }, [isOpen, students])

  const setStudentBatch = (id, batch) => {
    setStudentBatches(prev => ({
      ...prev,
      [id]: batch
    }))
  }

  const handleAutoSplit = () => {
    if (!students || students.length === 0) return
    const half = Math.ceil(students.length / 2)
    const next = {}
    students.forEach((s, idx) => {
      next[s.id] = idx < half ? 'Batch 1' : 'Batch 2'
    })
    setStudentBatches(next)
  }

  const handleSelectAllB1 = () => {
    if (!students) return
    const next = {}
    students.forEach(s => {
      next[s.id] = 'Batch 1'
    })
    setStudentBatches(next)
  }

  const handleSelectAllB2 = () => {
    if (!students) return
    const next = {}
    students.forEach(s => {
      next[s.id] = 'Batch 2'
    })
    setStudentBatches(next)
  }

  const handleClearAll = () => {
    if (!students) return
    const next = {}
    students.forEach(s => {
      next[s.id] = null
    })
    setStudentBatches(next)
  }

  const handleSave = async () => {
    if (!students) return
    try {
      const b1Array = []
      const b2Array = []
      const clearArray = []

      students.forEach(s => {
        const batch = studentBatches[s.id]
        if (batch === 'Batch 1') b1Array.push(s.id)
        else if (batch === 'Batch 2') b2Array.push(s.id)
        else clearArray.push(s.id)
      })

      // Sequential awaits to avoid React Query race condition
      if (b1Array.length > 0) {
        await updateBatches.mutateAsync({ studentIds: b1Array, batch: 'Batch 1' })
      }
      if (b2Array.length > 0) {
        await updateBatches.mutateAsync({ studentIds: b2Array, batch: 'Batch 2' })
      }
      if (clearArray.length > 0) {
        await updateBatches.mutateAsync({ studentIds: clearArray, batch: null })
      }

      toast.success('Batches assigned successfully.')
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to assign batches.')
    }
  }

  const b1Count = Object.values(studentBatches).filter(b => b === 'Batch 1').length
  const b2Count = Object.values(studentBatches).filter(b => b === 'Batch 2').length
  const unassignedCount = Object.values(studentBatches).filter(b => !b).length
  const total = students?.length || 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Students to Batches" size="lg">
      <div className="space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl border border-blue-100">
          <p className="font-semibold mb-1">How it works</p>
          <p>
            Assign each student to <span className="font-bold">Batch 1</span>, <span className="font-bold">Batch 2</span>, or leave them as <span className="font-bold">All</span> (unassigned).
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-700">{b1Count}</p>
            <p className="text-xs font-semibold text-purple-600 mt-0.5">BATCH 1</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{b2Count}</p>
            <p className="text-xs font-semibold text-green-600 mt-0.5">BATCH 2</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-slate-700">{unassignedCount}</p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">UNASSIGNED (ALL)</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoSplit} className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
            <GitMerge className="w-4 h-4 mr-2" />Auto Split (50/50)
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelectAllB1} className="text-purple-600 border-purple-200 hover:bg-purple-50">
            All Batch 1
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelectAllB2} className="text-green-600 border-green-200 hover:bg-green-50">
            All Batch 2
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll} className="text-slate-600 border-slate-300">
            Clear All (All)
          </Button>
        </div>

        {/* List Header */}
        <div className="flex justify-between items-end mt-4 border-b pb-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            STUDENT BATCH LIST
          </h3>
          <span className="text-xs text-slate-500 font-medium">{total} total</span>
        </div>

        {/* Student List */}
        <div className="max-h-80 overflow-y-auto space-y-1.5 p-1 border rounded-xl divide-y divide-slate-100 bg-white">
          {students?.map((student, index) => {
            const currentBatch = studentBatches[student.id]
            return (
              <div
                key={student.id}
                className="flex items-center justify-between p-2 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs text-slate-400 w-5 text-right flex-shrink-0">{index + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{student.name}</p>
                    <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 inline-block mt-0.5">{student.roll_number}</span>
                  </div>
                </div>
                
                {/* 3-way Segmented Control */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setStudentBatch(student.id, 'Batch 1')}
                    className={clsx(
                      'px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all duration-200',
                      currentBatch === 'Batch 1'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    B1
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentBatch(student.id, 'Batch 2')}
                    className={clsx(
                      'px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all duration-200',
                      currentBatch === 'Batch 2'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    B2
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentBatch(student.id, null)}
                    className={clsx(
                      'px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all duration-200',
                      !currentBatch
                        ? 'bg-slate-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    All
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" 
            onClick={handleSave}
            disabled={updateBatches.isPending}
          >
            {updateBatches.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Assignments'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

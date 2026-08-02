import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRemoveStudent, useRemoveStudentFromClass } from '../../hooks/useStudents'
import { Badge } from '../ui/Badge'
import { StudentAttendanceModal } from './StudentAttendanceModal'

export function StudentList({ students, courseId, classId, selectedIds, onSelectChange, onSelectAll }) {
  const removeStudentCourse = useRemoveStudent(courseId)
  const removeStudentClass = useRemoveStudentFromClass(classId)
  const removeStudent = classId ? removeStudentClass : removeStudentCourse
  const [selectedStudent, setSelectedStudent] = useState(null)

  const handleRemove = async (e, student) => {
    e.stopPropagation()
    if (!confirm(`Remove ${student.name}?`)) return
    try {
      await removeStudent.mutateAsync(student.id)
      toast.success(`${student.name} removed.`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (!students || students.length === 0) return null

  // Bulk selection mode is active if selectedIds is defined (passed from parent)
  const isBulkMode = selectedIds !== undefined && onSelectChange !== undefined

  const allSelected = isBulkMode && students.length > 0 && students.every(s => selectedIds.has(s.id))
  const someSelected = isBulkMode && students.some(s => selectedIds.has(s.id)) && !allSelected

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {isBulkMode && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected }}
                    onChange={() => onSelectAll?.(students)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
              )}
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Roll No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Batch</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map((student, i) => {
              const isSelected = isBulkMode && selectedIds.has(student.id)
              return (
                <tr
                  key={student.id}
                  onClick={() => {
                    if (isBulkMode) {
                      onSelectChange?.(student.id)
                    } else {
                      setSelectedStudent(student)
                    }
                  }}
                  className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${isSelected ? 'bg-indigo-50/50' : ''}`}
                >
                  {isBulkMode && (
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectChange?.(student.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-xs text-slate-400 font-medium">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Badge variant="blue">{student.roll_number}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{student.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                    {student.batch ? (
                      <Badge variant={student.batch.toLowerCase().includes('1') ? 'purple' : 'green'}>
                        {student.batch}
                      </Badge>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => handleRemove(e, student)}
                      disabled={removeStudent.isPending}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      aria-label={`Remove ${student.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <StudentAttendanceModal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        student={selectedStudent}
        courseId={courseId}
      />
    </>
  )
}

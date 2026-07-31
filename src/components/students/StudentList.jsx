import { useState } from 'react'
import { Trash2, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRemoveStudent, useRemoveStudentFromClass } from '../../hooks/useStudents'
import { Badge } from '../ui/Badge'
import { StudentAttendanceModal } from './StudentAttendanceModal'

export function StudentList({ students, courseId, classId }) {
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

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Roll No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Batch</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map((student) => (
              <tr 
                key={student.id} 
                onClick={() => setSelectedStudent(student)}
                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
              >
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
                  ) : (
                    '—'
                  )}
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
            ))}
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

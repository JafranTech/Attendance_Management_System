import { useState, useRef } from 'react'
import { Plus, FileSpreadsheet, GraduationCap, Loader2, Users, Search, X, Trash2, ChevronDown } from 'lucide-react'
import { useClasses, useCreateClass, useDeleteClass } from '../hooks/useClasses'
import { useClassStudents, useBulkDeleteStudents } from '../hooks/useStudents'
import { ImportExcelModal } from '../components/students/ImportExcelModal'
import { AddStudentModal } from '../components/students/AddStudentModal'
import { StudentList } from '../components/students/StudentList'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Pre-built class suggestions
const PRESET_CLASSES = [
  'IT Final year',
  'IT 3rd year - section A',
  'IT 3rd year - section B',
  'IT 2nd year - section A',
  'IT 2nd year - section B',
  'IT 1st year - section A',
  'IT 1st year - section B',
  'CS Final year',
  'CS 3rd year',
  'CS 2nd year',
  'CS 1st year',
  'ECE Final year',
  'ECE 3rd year',
  'ME Final year',
  'MBA 1st year',
  'MBA 2nd year',
]

export default function ClassesPage() {
  const { data: classes, isLoading: classesLoading } = useClasses()
  const createClass = useCreateClass()
  const deleteClass = useDeleteClass()

  const [activeClassId, setActiveClassId] = useState(() => localStorage.getItem('activeClassId') || null)
  const [isImportModalOpen, setImportModalOpen] = useState(false)
  const [isAddStudentModalOpen, setAddStudentModalOpen] = useState(false)

  // Add class state
  const [isAddingClass, setIsAddingClass] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Search
  const [searchTerm, setSearchTerm] = useState('')

  // Delete class
  const [deletingClassId, setDeletingClassId] = useState(null)

  // Bulk select students
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set())

  const inputRef = useRef(null)

  // Use first class as active if none selected
  const currentClassId = activeClassId || (classes?.length > 0 ? classes[0].id : null)
  const { data: students, isLoading: studentsLoading } = useClassStudents(currentClassId)
  const bulkDelete = useBulkDeleteStudents(currentClassId)
  const activeClass = classes?.find((c) => c.id === currentClassId)

  // Filter suggestions based on typed text and exclude already existing classes
  const existingNames = new Set(classes?.map(c => c.name.toLowerCase()) || [])
  const filteredSuggestions = PRESET_CLASSES.filter(
    p => !existingNames.has(p.toLowerCase()) &&
      (!newClassName || p.toLowerCase().includes(newClassName.toLowerCase()))
  )

  const handleStartAdding = () => {
    setIsAddingClass(true)
    setShowSuggestions(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleCreateClass = async (nameToSave = newClassName) => {
    const trimmed = (typeof nameToSave === 'string' ? nameToSave : newClassName).trim()
    if (!trimmed) {
      setIsAddingClass(false)
      setNewClassName('')
      setShowSuggestions(false)
      return
    }
    try {
      const created = await createClass.mutateAsync(trimmed)
      setActiveClassId(created.id)
      localStorage.setItem('activeClassId', created.id)
      setSelectedStudentIds(new Set())
      toast.success(`"${trimmed}" created!`)
    } catch (e) {
      toast.error(e.message || 'Failed to create class.')
    } finally {
      setNewClassName('')
      setIsAddingClass(false)
      setShowSuggestions(false)
    }
  }

  const handleSelectPreset = (preset) => {
    handleCreateClass(preset)
  }

  const handleDeleteClass = async (e, classId, className) => {
    e.stopPropagation()
    if (!confirm(`Delete "${className}"? This will unlink all its students from this class.`)) return
    setDeletingClassId(classId)
    try {
      await deleteClass.mutateAsync(classId)
      if (currentClassId === classId) {
        setActiveClassId(null)
        localStorage.removeItem('activeClassId')
      }
      setSelectedStudentIds(new Set())
      toast.success(`"${className}" deleted.`)
    } catch (err) {
      toast.error(err.message || 'Failed to delete class.')
    } finally {
      setDeletingClassId(null)
    }
  }

  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  const handleSelectAll = (visibleStudents) => {
    const allSelected = visibleStudents.every(s => selectedStudentIds.has(s.id))
    if (allSelected) {
      setSelectedStudentIds(new Set())
    } else {
      setSelectedStudentIds(new Set(visibleStudents.map(s => s.id)))
    }
  }

  const handleBulkDelete = async () => {
    const count = selectedStudentIds.size
    if (!confirm(`Permanently delete ${count} selected student${count !== 1 ? 's' : ''} and all their data?`)) return
    try {
      await bulkDelete.mutateAsync(Array.from(selectedStudentIds))
      setSelectedStudentIds(new Set())
      toast.success(`${count} student${count !== 1 ? 's' : ''} deleted.`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filteredStudents = students?.filter(s =>
    !searchTerm ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Switch class → clear selection
  const handleSwitchClass = (classId) => {
    setActiveClassId(classId)
    localStorage.setItem('activeClassId', classId)
    setSelectedStudentIds(new Set())
    setSearchTerm('')
  }

  if (classesLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5" onClick={() => { if (showSuggestions) setShowSuggestions(false) }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            Class Sections & Master Lists
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage student rosters for each of the{' '}
            <span className="font-semibold text-slate-700">{classes?.length || 0}</span>{' '}
            class sections.
          </p>
        </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedStudentIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDelete.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
            >
              {bulkDelete.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Trash2 className="w-4 h-4" />
              }
              Delete Selected ({selectedStudentIds.size})
            </button>
          )}
          <Button
            onClick={() => setImportModalOpen(true)}
            variant="outline"
            className="flex-1 sm:flex-none bg-white"
            disabled={!currentClassId}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-indigo-600" />
            Import Excel
          </Button>
          <Button
            onClick={() => setAddStudentModalOpen(true)}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700"
            disabled={!currentClassId}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Class Tabs + Add Class */}
      <div className="flex flex-wrap items-center gap-2">
        {classes?.map((c) => {
          const isActive = currentClassId === c.id
          const isDeleting = deletingClassId === c.id
          return (
            <div
              key={c.id}
              onClick={() => handleSwitchClass(c.id)}
              className={clsx(
                'group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border cursor-pointer select-none',
                isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              )}
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{c.name}</span>
              {/* Delete X button – shown on hover */}
              <button
                onClick={(e) => handleDeleteClass(e, c.id, c.name)}
                disabled={isDeleting}
                className={clsx(
                  'ml-1 rounded-full p-0.5 transition-all flex-shrink-0',
                  isActive
                    ? 'opacity-70 hover:opacity-100 hover:bg-indigo-500'
                    : 'opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-red-100 hover:text-red-600',
                )}
                title="Delete class"
              >
                {isDeleting
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <X className="w-3 h-3" />
                }
              </button>
            </div>
          )
        })}

        {/* Add Class control */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          {isAddingClass ? (
            <div>
              <div className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type or pick below…"
                  value={newClassName}
                  onChange={(e) => { setNewClassName(e.target.value); setShowSuggestions(true) }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateClass()
                    if (e.key === 'Escape') { setIsAddingClass(false); setNewClassName(''); setShowSuggestions(false) }
                  }}
                  className="border border-slate-200 rounded-l-lg px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <button
                  onClick={() => handleCreateClass()}
                  disabled={createClass.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60 h-[38px] flex items-center gap-1"
                >
                  {createClass.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
                <button
                  onClick={() => { setIsAddingClass(false); setNewClassName(''); setShowSuggestions(false) }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-2 rounded-r-lg text-sm transition-colors h-[38px] flex items-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dropdown suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full mt-1 left-0 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Pick</p>
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filteredSuggestions.map((preset) => (
                      <button
                        key={preset}
                        onMouseDown={(e) => { e.preventDefault(); handleSelectPreset(preset) }}
                        className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors"
                      >
                        <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleStartAdding}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </button>
          )}
        </div>
      </div>

      {/* Student Roster Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {activeClass?.name || 'No Class Selected'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Enrolled Students:{' '}
              <span className="font-semibold text-indigo-600">{students?.length || 0}</span>
              {selectedStudentIds.size > 0 && (
                <span className="ml-2 text-indigo-500">({selectedStudentIds.size} selected)</span>
              )}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!currentClassId}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full disabled:opacity-50 disabled:bg-slate-50"
            />
          </div>
        </div>

        {studentsLoading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner /></div>
        ) : !currentClassId ? (
          <div className="p-16 text-center text-slate-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Create or select a class to view its students.</p>
          </div>
        ) : students?.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">
              No students found in {activeClass?.name}. Click "Add Student" or "Import Excel" to populate.
            </p>
          </div>
        ) : (
          <div className="p-4">
            <StudentList
              students={filteredStudents}
              classId={currentClassId}
              selectedIds={selectedStudentIds}
              onSelectChange={handleToggleStudent}
              onSelectAll={handleSelectAll}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {currentClassId && (
        <>
          <ImportExcelModal
            isOpen={isImportModalOpen}
            onClose={() => setImportModalOpen(false)}
            classId={currentClassId}
          />
          <AddStudentModal
            isOpen={isAddStudentModalOpen}
            onClose={() => setAddStudentModalOpen(false)}
            classId={currentClassId}
          />
        </>
      )}
    </div>
  )
}

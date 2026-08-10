import { useState } from 'react'
import { Plus, FileSpreadsheet, Loader2, Users, Search, Trash2, RefreshCw, AlertTriangle } from 'lucide-react'
import cresLogo from '../assets/Logo.jpeg'
import { useClasses } from '../hooks/useClasses'
import { useClassStudents, useBulkDeleteStudents } from '../hooks/useStudents'
import { ImportExcelModal } from '../components/students/ImportExcelModal'
import { AddStudentModal } from '../components/students/AddStudentModal'
import { StudentList } from '../components/students/StudentList'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ClassesPage() {
  const { data: classes, isLoading: classesLoading, isError: classesError, refetch: refetchClasses } = useClasses()
  const { user } = useAuth()

  // Namespace localStorage key by user ID so Faculty A's selection never bleeds into Faculty B
  const storageKey = user?.id ? `activeClassId_${user.id}` : 'activeClassId'
  const [activeClassId, setActiveClassId] = useState(() => localStorage.getItem(storageKey) || null)
  const [isImportModalOpen, setImportModalOpen] = useState(false)
  const [isAddStudentModalOpen, setAddStudentModalOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Backfill: provision auth accounts for ALL existing students who don't have one yet
  const handleSyncAllAccounts = async () => {
    setIsSyncing(true)
    try {
      // Fetch all students without an auth_user_id
      const { data: unprovisioned, error } = await supabase
        .from('students')
        .select('id, roll_number, name')
        .is('auth_user_id', null)

      if (error) throw new Error(error.message)
      if (!unprovisioned || unprovisioned.length === 0) {
        toast.success('All students already have accounts!')
        setIsSyncing(false)
        return
      }

      const payload = unprovisioned.map(s => ({
        roll_number: s.roll_number,
        name: s.name,
        student_id: s.id,
      }))

      const { error: fnError } = await supabase.functions.invoke('provision-student', {
        body: { action: 'backfill', students: payload },
      })

      if (fnError) throw new Error(fnError.message)
      toast.success(`${unprovisioned.length} student accounts synced!`)
    } catch (err) {
      toast.error(`Sync failed: ${err.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  // Search
  const [searchTerm, setSearchTerm] = useState('')

  // Bulk select students
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set())

  // Use first class as active if none selected
  const currentClassId = activeClassId || (classes?.length > 0 ? classes[0].id : null)
  const { data: students, isLoading: studentsLoading } = useClassStudents(currentClassId)
  const bulkDelete = useBulkDeleteStudents(currentClassId)
  const activeClass = classes?.find((c) => c.id === currentClassId)

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
    localStorage.setItem(storageKey, classId)
    setSelectedStudentIds(new Set())
    setSearchTerm('')
  }

  if (classesLoading) return <LoadingSpinner />

  if (classesError) return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-red-50 border border-red-200 rounded-xl p-5 mt-4">
      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" />
      <div className="flex-1">
        <p className="font-semibold text-red-700 text-sm">Failed to load class sections</p>
        <p className="text-xs text-red-500 mt-0.5">There was a problem connecting. This usually resolves on its own.</p>
      </div>
      <button
        onClick={() => refetchClasses()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex-shrink-0"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <img src={cresLogo} className="w-7 h-7 object-contain inline-block" alt="" />
            Class Sections & Master Lists
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage student rosters for each of the predefined{' '}
            <span className="font-semibold text-slate-700">{classes?.length || 0}</span>{' '}
            class sections in the department.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
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
          <button
            onClick={handleSyncAllAccounts}
            disabled={isSyncing}
            title="Create login accounts for all existing students who don't have one yet"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-60"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isSyncing ? 'Syncing...' : 'Sync Accounts'}
          </button>
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

      {/* Class Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {classes?.map((c) => {
          const isActive = currentClassId === c.id
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
            </div>
          )
        })}
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
            <img src={cresLogo} className="w-12 h-12 mx-auto mb-3 object-contain opacity-20 grayscale" alt="" />
            <p className="text-sm">Select a class to view its students.</p>
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

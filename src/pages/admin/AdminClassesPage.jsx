import { useState, useRef } from 'react'
import {
  useAdminClasses, useAdminCreateClass, useAdminDeleteClass,
  useAdminClassStudents, useAdminAddStudent, useAdminBulkInsertStudents,
  useAdminDeleteStudent, useAdminBulkDeleteStudents,
} from '../../hooks/useAdmin'
import { supabase } from '../../lib/supabase'
import * as XLSX from 'xlsx'
import {
  GraduationCap, Plus, Trash2, FileSpreadsheet, Upload,
  Search, Loader2, Users, AlertCircle, CheckCircle2, RefreshCw, X, Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { Badge } from '../../components/ui/Badge'

// ─── Add Class Modal ──────────────────────────────────────────────────────────
function AddClassModal({ onClose }) {
  const createClass = useAdminCreateClass()
  const [name, setName] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await createClass.mutateAsync(name.trim())
      toast.success(`Class "${name.trim()}" created!`)
      onClose()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Create New Class</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Class Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. B.Tech IT – 2nd Year A"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || createClass.isPending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
            >
              {createClass.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Add Student Modal ────────────────────────────────────────────────────────
function AddStudentModal({ classId, onClose }) {
  const addStudent = useAdminAddStudent(classId)
  const [form, setForm] = useState({ rollNumber: '', name: '', email: '', batch: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.rollNumber.trim() || !form.name.trim()) {
      toast.error('Roll number and name are required')
      return
    }
    try {
      const result = await addStudent.mutateAsync(form)
      // Provision student auth account
      try {
        await supabase.functions.invoke('provision-student', {
          body: { action: 'provision', students: [{ roll_number: result.roll_number, name: result.name, student_id: result.id }] },
        })
        toast.success(`${result.name} added and account provisioned!`)
      } catch {
        toast.success(`${result.name} added!`)
      }
      onClose()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const field = (key, label, placeholder, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Add Student</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {field('rollNumber', 'Roll Number *', '211001001', 'text')}
          {field('name', 'Full Name *', 'Mohammed Ali')}
          {field('email', 'Email (optional)', 'student@crescent.education', 'email')}
          {field('batch', 'Batch (optional)', 'Batch 1 or Batch 2')}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={addStudent.isPending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {addStudent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Import Excel Modal ───────────────────────────────────────────────────────
function AdminImportExcelModal({ classId, onClose }) {
  const [preview, setPreview] = useState([])
  const [parseError, setParseError] = useState('')
  const fileInputRef = useRef(null)
  const bulkInsert = useAdminBulkInsertStudents(classId)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setParseError('')
    setPreview([])
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(new Uint8Array(evt.target.result), { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        const students = rows.slice(1)
          .filter(r => r[1] || r[2])
          .map(r => ({
            roll_number: r[1] ? String(r[1]).trim() : '',
            name: r[2] ? String(r[2]).trim() : '',
            email: r[3] ? String(r[3]).trim() : '',
            batch: r[4] ? String(r[4]).trim() : '',
          }))
          .filter(s => s.roll_number && s.name)
        if (students.length === 0) {
          setParseError('No valid rows. Columns must be: S.No | Roll No | Name | Email (optional) | Batch (optional)')
          return
        }
        setPreview(students)
      } catch {
        setParseError('Could not read file. Use a valid .xlsx file.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    try {
      const result = await bulkInsert.mutateAsync(preview)
      toast.success(`${result?.length ?? preview.length} students imported!`)
      // Provision student auth accounts
      const provisionPayload = (result ?? preview).map(s => ({
        roll_number: s.roll_number,
        name: s.name,
        student_id: s.id,
      })).filter(s => s.student_id)

      if (provisionPayload.length > 0) {
        try {
          await supabase.functions.invoke('provision-student', {
            body: { action: 'provision', students: provisionPayload },
          })
          toast.success(`${provisionPayload.length} student accounts provisioned!`)
        } catch (e) {
          toast('Students imported. Use Sync Accounts to provision logins.', { icon: 'ℹ️' })
        }
      }
      setPreview([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      onClose()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Import Students from Excel</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
            <p className="font-medium mb-1">Expected Excel Format (Row 1 = header, skipped):</p>
            <p className="font-mono">Col A: S.No | Col B: Roll Number | Col C: Name | Col D: Email | Col E: Batch</p>
          </div>
          <label className="block border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/20 transition-all">
            <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">Click to choose Excel file</p>
            <p className="text-xs text-slate-400 mt-1">.xlsx files only</p>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="sr-only" onChange={handleFile} />
          </label>
          {parseError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{parseError}</p>
            </div>
          )}
          {preview.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <p className="text-sm font-medium text-slate-700">{preview.length} students ready to import</p>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 text-slate-500">Roll No.</th>
                      <th className="text-left px-3 py-2 text-slate-500">Name</th>
                      <th className="text-left px-3 py-2 text-slate-500 hidden sm:table-cell">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {preview.slice(0, 20).map((s, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-slate-600">{s.roll_number}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">{s.name}</td>
                        <td className="px-3 py-2 text-slate-500 hidden sm:table-cell">{s.email || '—'}</td>
                      </tr>
                    ))}
                    {preview.length > 20 && (
                      <tr><td colSpan={3} className="px-3 py-2 text-slate-400 italic">...and {preview.length - 20} more</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              disabled={preview.length === 0 || bulkInsert.isPending}
              onClick={handleImport}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {bulkInsert.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Importing...</>
                : <><Upload className="w-4 h-4" />Import {preview.length > 0 ? `${preview.length} Students` : ''}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminClassesPage() {
  const { data: classes, isLoading: classesLoading } = useAdminClasses()
  const deleteClass = useAdminDeleteClass()
  const [activeClassId, setActiveClassId] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showAddClass, setShowAddClass] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const currentClassId = activeClassId || (classes?.[0]?.id ?? null)
  const { data: students, isLoading: studentsLoading } = useAdminClassStudents(currentClassId)
  const deleteStudent = useAdminDeleteStudent(currentClassId)
  const bulkDelete = useAdminBulkDeleteStudents(currentClassId)

  const activeClass = classes?.find(c => c.id === currentClassId)

  const filteredStudents = (students ?? []).filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  )

  const allSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.id))
  const someSelected = filteredStudents.some(s => selectedIds.has(s.id)) && !allSelected

  const handleToggle = (id) => setSelectedIds(prev => {
    const n = new Set(prev)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  const handleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(filteredStudents.map(s => s.id)))
  }

  const handleDeleteClass = async (cls) => {
    if (!confirm(`Permanently delete class "${cls.name}" and ALL its students? This cannot be undone.`)) return
    try {
      await deleteClass.mutateAsync(cls.id)
      if (currentClassId === cls.id) setActiveClassId(null)
      toast.success(`Class "${cls.name}" deleted.`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteStudent = async (student) => {
    if (!confirm(`Remove ${student.name} from the master roster? This will deactivate their student portal login.`)) return
    try {
      // Deactivate auth account first
      if (student.auth_user_id || student.roll_number) {
        await supabase.functions.invoke('provision-student', {
          body: { action: 'deactivate', students: [{ roll_number: student.roll_number, name: student.name, student_id: student.id, auth_user_id: student.auth_user_id }] },
        }).catch(() => {})
      }
      await deleteStudent.mutateAsync(student.id)
      toast.success(`${student.name} removed.`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleBulkDelete = async () => {
    const count = selectedIds.size
    if (!confirm(`Permanently delete ${count} student${count > 1 ? 's' : ''} and deactivate their portal logins?`)) return
    try {
      await bulkDelete.mutateAsync(Array.from(selectedIds))
      setSelectedIds(new Set())
      toast.success(`${count} student${count > 1 ? 's' : ''} deleted.`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-amber-500" />
            Classes &amp; Roster
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Master student lists for all class sections. Only Admins can add or delete students.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDelete.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
            >
              {bulkDelete.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Selected ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => setShowImport(true)}
            disabled={!currentClassId}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Import Excel
          </button>
          <button
            onClick={() => setShowAddStudent(true)}
            disabled={!currentClassId}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-400 hover:bg-amber-500 text-slate-900 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
          <button
            onClick={() => setShowAddClass(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Class
          </button>
        </div>
      </div>

      {/* Class Tabs */}
      {classesLoading ? (
        <div className="flex gap-2">
          {[1,2,3].map(i => <div key={i} className="h-10 w-32 rounded-xl bg-slate-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(classes ?? []).map(cls => (
            <div
              key={cls.id}
              className={clsx(
                'group flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl text-sm font-medium transition-all border cursor-pointer select-none',
                currentClassId === cls.id
                  ? 'bg-amber-400 border-amber-400 text-slate-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
              onClick={() => { setActiveClassId(cls.id); setSelectedIds(new Set()); setSearch('') }}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>{cls.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls) }}
                disabled={deleteClass.isPending}
                className={clsx(
                  'ml-1 p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100',
                  currentClassId === cls.id ? 'hover:bg-amber-300 text-slate-700' : 'hover:bg-red-100 text-slate-400 hover:text-red-500'
                )}
                title={`Delete class ${cls.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {(classes ?? []).length === 0 && (
            <p className="text-sm text-slate-400">No classes yet. Click "New Class" to create one.</p>
          )}
        </div>
      )}

      {/* Student List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">{activeClass?.name ?? 'No Class Selected'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Total: <span className="font-semibold text-indigo-600">{students?.length ?? 0}</span> students
              {selectedIds.size > 0 && <span className="ml-2 text-amber-600">({selectedIds.size} selected)</span>}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!currentClassId}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Body */}
        {studentsLoading ? (
          <div className="flex items-center justify-center p-16"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>
        ) : !currentClassId ? (
          <div className="p-16 text-center text-slate-400">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Select a class to view its students.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No students found. Import an Excel file or add manually.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = someSelected }}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Roll No.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Batch</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((s, i) => (
                  <tr key={s.id} className={clsx('hover:bg-slate-50/80 transition-colors group', selectedIds.has(s.id) && 'bg-amber-50/50')}>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(s.id)}
                        onChange={() => handleToggle(s.id)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                      />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-medium">{i + 1}</td>
                    <td className="px-4 py-3"><Badge variant="blue">{s.roll_number}</Badge></td>
                    <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs hidden sm:table-cell">{s.email || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-500 text-xs">{s.batch || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteStudent(s)}
                        disabled={deleteStudent.isPending}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all focus:opacity-100"
                        title={`Remove ${s.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddClass && <AddClassModal onClose={() => setShowAddClass(false)} />}
      {showAddStudent && currentClassId && <AddStudentModal classId={currentClassId} onClose={() => setShowAddStudent(false)} />}
      {showImport && currentClassId && <AdminImportExcelModal classId={currentClassId} onClose={() => setShowImport(false)} />}
    </div>
  )
}

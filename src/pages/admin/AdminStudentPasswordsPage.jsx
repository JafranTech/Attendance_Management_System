import { useState } from 'react'
import {
  useAdminClasses,
  useAdminClassStudents,
  useAdminResetStudentPassword,
} from '../../hooks/useAdmin'
import { supabase } from '../../lib/supabase'
import {
  KeyRound,
  Search,
  Loader2,
  Users,
  ShieldCheck,
  RefreshCw,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  UserCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { Badge } from '../../components/ui/Badge'

// ─── Reset Password Modal ─────────────────────────────────────────────────────
function StudentResetPasswordModal({ student, classId, onClose }) {
  const resetPassword = useAdminResetStudentPassword(classId)
  const [newPassword, setNewPassword] = useState('crescent1234')
  const [showPassword, setShowPassword] = useState(false)
  const loginEmail = `${student.roll_number}@crescent.education`

  const handleReset = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    try {
      await resetPassword.mutateAsync({
        studentId: student.id,
        authUserId: student.auth_user_id,
        rollNumber: student.roll_number,
        name: student.name,
        newPassword: newPassword,
      })
      toast.success(`Password for ${student.name} (${student.roll_number}) reset successfully!`)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to reset student password')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <KeyRound className="w-4.5 h-4.5 text-amber-600" size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Reset Student Password</h2>
                <p className="text-xs text-slate-500">
                  Student: <span className="font-semibold text-slate-700">{student.name}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-3.5 text-sm text-slate-600 border border-slate-200 space-y-1.5">
            <p className="font-medium text-slate-700 mb-1">Student Account Info</p>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Roll Number:</span>
              <span className="font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {student.roll_number}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Login Email:</span>
              <span className="font-mono font-medium text-slate-700">{loginEmail}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Portal Status:</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Ready for Login
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password (min. 6 chars)"
                className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Default is <code className="font-mono font-semibold text-amber-700 bg-amber-50 px-1 py-0.5 rounded">crescent1234</code>.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Tell the student to log in at the student portal using their email{' '}
              <span className="font-mono font-semibold">{loginEmail}</span> and this password.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={resetPassword.isPending || newPassword.length < 6}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {resetPassword.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Resetting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Reset Password
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Student Password Management Page ──────────────────────────────────
export default function AdminStudentPasswordsPage() {
  const { data: classes, isLoading: classesLoading } = useAdminClasses()
  const [activeClassId, setActiveClassId] = useState(null)
  const [search, setSearch] = useState('')
  const [resetTarget, setResetTarget] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const currentClassId = activeClassId || (classes?.[0]?.id ?? null)
  const { data: students, isLoading: studentsLoading, refetch: refetchStudents } =
    useAdminClassStudents(currentClassId)

  const activeClass = classes?.find((c) => c.id === currentClassId)

  const filteredStudents = (students ?? []).filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(search.toLowerCase())
  )

  const handleCopyEmail = (email, id) => {
    navigator.clipboard.writeText(email)
    setCopiedId(id)
    toast.success('Email copied!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSyncAllInClass = async () => {
    if (!students || students.length === 0) return
    setIsSyncing(true)
    try {
      const payload = students.map((s) => ({
        roll_number: s.roll_number,
        name: s.name,
        student_id: s.id,
      }))

      const { error: fnError } = await supabase.functions.invoke('provision-student', {
        body: { action: 'backfill', students: payload },
      })

      if (fnError) throw new Error(fnError.message)
      await refetchStudents()
      toast.success(`All ${students.length} student logins in ${activeClass?.name} verified & synced!`)
    } catch (err) {
      toast.error(`Sync failed: ${err.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-amber-500" />
            Student Passwords
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage student portal credentials and reset forgotten passwords for any class.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSyncAllInClass}
            disabled={isSyncing || !currentClassId || students?.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            title="Ensure every student in this class has an active auth login"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isSyncing ? 'Syncing...' : 'Sync Class Logins'}
          </button>
        </div>
      </div>

      {/* Class Tabs */}
      {classesLoading ? (
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-36 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(classes ?? []).map((cls) => {
            const isActive = currentClassId === cls.id
            return (
              <button
                key={cls.id}
                onClick={() => {
                  setActiveClassId(cls.id)
                  setSearch('')
                }}
                className={clsx(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border select-none',
                  isActive
                    ? 'bg-amber-400 border-amber-400 text-slate-900 font-semibold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                )}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>{cls.name}</span>
              </button>
            )
          })}
          {(classes ?? []).length === 0 && (
            <p className="text-sm text-slate-400">No classes found in system.</p>
          )}
        </div>
      )}

      {/* Student Passwords Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table header with title and search */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {activeClass?.name ?? 'No Class Selected'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Students: <span className="font-semibold text-indigo-600">{students?.length ?? 0}</span>
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!currentClassId}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Table body */}
        {studentsLoading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
        ) : !currentClassId ? (
          <div className="p-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Select a class section above to view student credentials.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No students found in {activeClass?.name}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-10">
                    #
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Roll No.
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Student Name
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Login Email
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((s, i) => {
                  const studentEmail = `${s.roll_number}@crescent.education`
                  const isCopied = copiedId === s.id
                  const hasAccount = !!s.auth_user_id

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-5 py-3.5 text-xs text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="blue">{s.roll_number}</Badge>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{s.name}</span>
                          {s.batch && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {s.batch}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-600">
                          <span>{studentEmail}</span>
                          <button
                            onClick={() => handleCopyEmail(studentEmail, s.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Copy email"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        {hasAccount ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <UserCheck className="w-3 h-3" /> Login Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" /> Auto-Provision on Reset
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setResetTarget(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 transition-colors"
                          title="Reset student password to crescent1234 or custom"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Modal */}
      {resetTarget && (
        <StudentResetPasswordModal
          student={resetTarget}
          classId={currentClassId}
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  )
}

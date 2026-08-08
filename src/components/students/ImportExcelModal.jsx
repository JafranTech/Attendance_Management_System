import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { Upload, AlertCircle, CheckCircle2, Loader2, FileSpreadsheet, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useBulkImportStudents, useBulkImportStudentsToClass } from '../../hooks/useStudents'
import { supabase } from '../../lib/supabase'

export function ImportExcelModal({ isOpen, onClose, courseId, classId }) {
  const [preview, setPreview] = useState([])
  const [parseError, setParseError] = useState('')
  const fileInputRef = useRef(null)
  
  const bulkImportCourse = useBulkImportStudents(courseId)
  const bulkImportClass = useBulkImportStudentsToClass(classId)
  const bulkImport = classId ? bulkImportClass : bulkImportCourse

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setParseError('')
    setPreview([])

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        // Skip header row, map columns (Col A: S.No, Col B: Roll Number, Col C: Name)
        const students = rows
          .slice(1)
          .filter((r) => r[1] || r[2]) // Check if Roll Number or Name exists
          .map((r) => ({
            rollNumber: r[1] ? String(r[1]).trim() : '',
            name: r[2] ? String(r[2]).trim() : '',
            email: r[3] ? String(r[3]).trim() : '',
            batch: r[4] ? String(r[4]).trim() : '',
          }))
          .filter((s) => s.rollNumber && s.name)

        if (students.length === 0) {
          setParseError('No valid student rows found. Make sure columns are: S.No, Roll No, Name.')
          return
        }
        setPreview(students)
      } catch {
        setParseError('Could not read file. Please ensure it is a valid Excel (.xlsx) file.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    try {
      const result = await bulkImport.mutateAsync(preview)
      toast.success(`${result.length} students imported!`)

      // Auto-provision student auth accounts in the background
      if (result && result.length > 0) {
        const provisionPayload = result.map(s => ({
          roll_number: s.roll_number,
          name: s.name,
          student_id: s.id,
        }))

        try {
          const { error: fnError } = await supabase.functions.invoke('provision-student', {
            body: { action: 'provision', students: provisionPayload },
          })
          if (fnError) {
            console.warn('Account provisioning error:', fnError.message)
            toast('Students imported. Accounts will be provisioned shortly.', { icon: 'ℹ️' })
          } else {
            toast.success(`${result.length} student accounts provisioned!`)
          }
        } catch (provErr) {
          console.warn('Provisioning failed (non-critical):', provErr)
          toast('Students imported. Contact admin if login issues occur.', { icon: 'ℹ️' })
        }
      }

      setPreview([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      onClose()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleClose = () => {
    setPreview([])
    setParseError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Students from Excel" size="lg">
      <div className="space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p className="text-xs text-blue-700 font-medium mb-1">Expected Excel Format:</p>
          <p className="text-xs text-blue-600">Column A: S.No | Column B: Roll Number | Column C: Name</p>
          <p className="text-xs text-blue-500 mt-1">Row 1 is treated as header and skipped.</p>
        </div>

        {/* File input */}
        <label
          htmlFor="excel-file-input"
          className="block border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
        >
          <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">Click to choose Excel file</p>
          <p className="text-xs text-slate-400 mt-1">.xlsx files only</p>
          <input
            id="excel-file-input"
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="sr-only"
            onChange={handleFile}
          />
        </label>

        {/* Error */}
        {parseError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{parseError}</p>
          </div>
        )}

        {/* Preview */}
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
                      <td className="px-3 py-2 text-slate-600">{s.rollNumber}</td>
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

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button
            className="flex-1"
            disabled={preview.length === 0 || bulkImport.isPending}
            onClick={handleImport}
          >
            {bulkImport.isPending
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importing...</>
              : <><Upload className="w-4 h-4 mr-2" />Import {preview.length > 0 ? `${preview.length} Students` : ''}</>
            }
          </Button>
        </div>
      </div>
    </Modal>
  )
}

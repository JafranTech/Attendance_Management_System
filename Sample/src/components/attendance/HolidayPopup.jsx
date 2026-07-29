import { useState } from 'react'
import { AlertCircle, Calendar } from 'lucide-react'

export function HolidayPopup({ isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!reason.trim()) return
    onConfirm(reason)
    setReason('')
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Mark as Holiday</h3>
          <p className="text-sm text-slate-500 text-center mb-6">
            This will mark the entire session as a holiday. No student attendance records will be created.
          </p>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Reason for holiday *</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Heavy Rain, College Festival"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm()
              }}
            />
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="flex-1 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Holiday
          </button>
        </div>
      </div>
    </div>
  )
}

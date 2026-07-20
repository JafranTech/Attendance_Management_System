import { X, AlertCircle } from 'lucide-react'

export function UnfilledPopup({ isOpen, onClose, unfilledStudents }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Fill all details</h3>
          <p className="text-sm text-slate-500 text-center mb-6">
            You cannot save until all students are marked. The following students are still unmarked:
          </p>
          
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {unfilledStudents.map(s => (
                <div key={s.id} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 shadow-sm" title={s.name}>
                  {s.roll_number.slice(-2)}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

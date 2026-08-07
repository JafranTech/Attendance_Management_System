import React from 'react'
import { WifiOff, RotateCw } from 'lucide-react'

export function OfflineBlocker() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
          <WifiOff className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">You are Offline</h2>
        <p className="text-slate-400 mt-3 text-sm leading-relaxed">
          This system is configured to run <strong className="text-indigo-400 font-semibold">completely online</strong> to guarantee live updates and prevent out-of-sync attendance records.
        </p>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed">
          Access has been disabled until a network connection is restored.
        </p>
        
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center gap-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">
          <RotateCw className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Reconnecting to network...</span>
        </div>
      </div>
    </div>
  )
}

import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export function LoadingSpinner({ className, size = 'md', fullPage = false }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('flex items-center justify-center p-8', className)}>
      <Loader2 className={clsx('text-blue-600 animate-spin', sizes[size])} />
    </div>
  )
}

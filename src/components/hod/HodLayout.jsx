import { useState } from 'react'
import { LogOut, ShieldCheck, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import cresLogo from '../../assets/Logo.jpeg'

export function HodLayout({ children, backTo, backLabel }) {
  const { profile, signOut, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [tempName, setTempName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out.')
    navigate('/login')
  }

  const handleOpenDrawer = () => {
    setTempName(profile?.name === 'HOD' ? '' : (profile?.name || ''))
    setIsDrawerOpen(true)
  }

  const handleSaveName = async (e) => {
    e.preventDefault()
    const trimmed = tempName.trim()
    if (!trimmed) {
      toast.error('Name cannot be empty')
      return
    }
    setIsSaving(true)
    const loadId = toast.loading('Updating name...')
    try {
      const { error } = await supabase
        .from('faculty')
        .update({ name: trimmed })
        .eq('id', profile.id)
      
      if (error) throw error
      toast.success('Name updated successfully!', { id: loadId })
      if (profile?.id) {
        await fetchProfile(profile.id)
      }
      setIsDrawerOpen(false)
    } catch (err) {
      toast.error('Failed to update name: ' + err.message, { id: loadId })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo + title */}
          <button
            onClick={() => navigate('/hod/dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-lg bg-white border border-slate-200">
              <img src={cresLogo} alt="CRES Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-900 leading-none">IT Department</p>
              <p className="text-xs text-slate-500 leading-none mt-0.5">HOD Monitoring Console</p>
            </div>
          </button>

          {/* Center: Breadcrumb */}
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
            >
              <span className="text-slate-400">←</span>
              {backLabel || 'Back'}
            </button>
          )}

          {/* Right: User + logout */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={handleOpenDrawer}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors text-left"
              title="Click to edit name"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-indigo-900 leading-none">{profile?.name || 'Set Name'}</p>
                <p className="text-[10px] text-indigo-600 font-medium leading-none mt-0.5">Head of Department</p>
              </div>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-8">
        {children}
      </main>

      {/* Right Drawer / Slide-Over */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Edit HOD Profile</h2>
                <p className="text-xs text-slate-500 mt-1">Update your display name for the console and hero sections.</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveName} className="flex-1 flex flex-col p-6 justify-between">
              <div className="space-y-4">
                <div>
                  <label htmlFor="hod-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    HOD Name
                  </label>
                  <input
                    id="hod-name"
                    type="text"
                    required
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="e.g. DR.N. Prakash"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                    autoFocus
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}



import { createContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)     // faculty row: { name, role, ... }
  const [profileLoading, setProfileLoading] = useState(true) // stays true until profile fetch done

  const fetchProfile = useCallback(async (userId) => {
    setProfileLoading(true)
    if (!userId) {
      setProfile(null)
      setProfileLoading(false)
      return
    }
    const { data } = await supabase
      .from('faculty')
      .select('id, name, email, department, role')
      .eq('id', userId)
      .single()
    setProfile(data ?? null)
    setProfileLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      fetchProfile(session?.user?.id ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      fetchProfile(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  }

  // loading = true until BOTH session and profile are resolved
  const loading = session === undefined || profileLoading
  const role = profile?.role ?? null // 'faculty' | 'hod' | null

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, signIn, signOut, updatePassword, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

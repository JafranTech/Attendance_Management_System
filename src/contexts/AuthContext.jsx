import { createContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)     // faculty row: { name, role, ... }
  const [profileLoading, setProfileLoading] = useState(true)

  const fetchProfile = useCallback(async (authUser) => {
    setProfileLoading(true)
    if (!authUser) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    // Students are identified by user_metadata.role = 'student'
    // They don't have a row in the faculty table, so skip that query
    if (authUser.user_metadata?.role === 'student') {
      setProfile({
        id: authUser.id,
        name: authUser.user_metadata?.name ?? authUser.email?.split('@')[0] ?? 'Student',
        email: authUser.email,
        role: 'student',
        roll_number: authUser.user_metadata?.roll_number ?? '',
      })
      setProfileLoading(false)
      return
    }

    // Faculty / HOD: look up the faculty table
    const { data } = await supabase
      .from('faculty')
      .select('id, name, email, department, role')
      .eq('id', authUser.id)
      .single()
    setProfile(data ?? null)
    setProfileLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      fetchProfile(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      fetchProfile(session?.user ?? null)
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
  const role = profile?.role ?? null // 'faculty' | 'hod' | 'student' | 'admin' | null

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, signIn, signOut, updatePassword, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

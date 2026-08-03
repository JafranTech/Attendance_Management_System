import { supabase } from '../lib/supabase'

export async function fetchClasses() {
  const { data, error } = await supabase
    .from('classes')
    .select('*, students(count)')
    .order('created_at', { ascending: true })

  if (error) throw new Error('Unable to load classes. Please refresh and try again.')
  return data ?? []
}

export async function fetchClassById(classId) {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single()

  if (error) throw new Error('Class not found.')
  return data
}

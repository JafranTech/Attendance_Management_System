import { supabase } from '../lib/supabase'

export async function fetchClasses(facultyId) {
  const { data, error } = await supabase
    .from('classes')
    .select('*, students(count)')
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: true })

  if (error) throw new Error('Unable to load classes. Please refresh and try again.')
  return data ?? []
}

export async function createClass({ facultyId, name }) {
  const { data, error } = await supabase
    .from('classes')
    .insert({
      faculty_id: facultyId,
      name,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('A class with this name already exists.')
    throw new Error('Unable to create class. Please try again.')
  }
  return data
}

export async function deleteClass(classId) {
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId)

  if (error) throw new Error('Unable to delete class. Please try again.')
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

import { supabase } from '../lib/supabase'

export async function fetchHolidays(facultyId) {
  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .eq('faculty_id', facultyId)
    .order('date', { ascending: true })

  if (error) throw new Error('Unable to load holidays. Please try again.')
  return data
}

export async function addHoliday({ date, description, facultyId }) {
  const { data, error } = await supabase
    .from('holidays')
    .insert({ date, description, faculty_id: facultyId })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('A holiday on this date already exists.')
    throw new Error('Unable to add holiday. Please try again.')
  }
  return data
}

export async function deleteHoliday(id) {
  const { error } = await supabase.from('holidays').delete().eq('id', id)
  if (error) throw new Error('Unable to delete holiday. Please try again.')
}

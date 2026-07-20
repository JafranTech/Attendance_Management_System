import { supabase } from '../lib/supabase'

export async function fetchHolidays() {
  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .order('date', { ascending: true })

  if (error) throw new Error('Unable to load holidays. Please try again.')
  return data
}

export async function addHoliday({ date, description }) {
  const { data, error } = await supabase
    .from('holidays')
    .insert({ date, description })
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

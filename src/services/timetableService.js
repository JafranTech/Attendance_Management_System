import { supabase } from '../lib/supabase'

export async function fetchTimetable(courseId) {
  const { data, error } = await supabase
    .from('timetable')
    .select('*')
    .eq('course_id', courseId)
    .order('day_of_week', { ascending: true })

  if (error) throw new Error('Unable to load timetable. Please try again.')
  return data
}

export async function addTimetableEntry({ courseId, dayOfWeek, hours }) {
  const records = hours.map((hour) => ({ course_id: courseId, day_of_week: dayOfWeek, hour }))
  const { data, error } = await supabase
    .from('timetable')
    .insert(records)
    .select()

  if (error) {
    if (error.code === '23505') throw new Error('One or more of these time slots are already set.')
    throw new Error('Unable to add timetable entries. Please try again.')
  }
  return data
}

export async function deleteTimetableEntry(id) {
  const { error } = await supabase.from('timetable').delete().eq('id', id)
  if (error) throw new Error('Unable to remove timetable entry. Please try again.')
}

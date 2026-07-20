import { supabase } from '../lib/supabase'

export async function fetchCourses(facultyId) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      course_students(count)
    `)
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Unable to load courses. Please refresh and try again.')
  return data
}

export async function createCourse({ facultyId, courseCode, courseName, semester, enrollmentType = 'default' }) {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      faculty_id: facultyId,
      course_code: courseCode,
      course_name: courseName,
      semester,
      enrollment_type: enrollmentType,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('A course with this code already exists.')
    throw new Error('Unable to create course. Please try again.')
  }
  return data
}

export async function deleteCourse(courseId) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)

  if (error) throw new Error('Unable to delete course. Please try again.')
}

export async function fetchCourseById(courseId) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (error) throw new Error('Course not found.')
  return data
}

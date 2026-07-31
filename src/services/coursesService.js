import { supabase } from '../lib/supabase'

export async function fetchCourses(facultyId, { page = 0, pageSize = 50 } = {}) {
  const from = page * pageSize
  const to   = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('courses')
    .select('*, course_students(count)', { count: 'exact' })
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error('Unable to load courses. Please refresh and try again.')
  return {
    data: data ?? [],
    hasMore: count != null && to + 1 < count,
    total: count ?? 0,
  }
}

export async function createCourse({ facultyId, courseCode, courseName, semester, enrollmentType = 'default', targetClassId = null }) {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      faculty_id: facultyId,
      course_code: courseCode,
      course_name: courseName,
      semester,
      enrollment_type: enrollmentType,
      target_class_id: targetClassId,
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

import { supabase } from '../lib/supabase'

export async function fetchStudentsForCourse(courseId) {
  const { data, error } = await supabase
    .from('course_students')
    .select(`
      student_id,
      students (
        id, roll_number, name, email, batch, created_at
      )
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: true })

  if (error) throw new Error('Unable to load students. Please refresh and try again.')
  return data.map((row) => row.students)
}

export async function fetchAllStudents({ page = 0, pageSize = 50 } = {}) {
  const from = page * pageSize
  const to   = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('students')
    .select('id, roll_number, name, email, batch', { count: 'exact' })
    .order('roll_number', { ascending: true })
    .range(from, to)

  if (error) throw new Error('Unable to load student list. Please refresh and try again.')
  return {
    data: data ?? [],
    hasMore: count != null && to + 1 < count,
    total: count ?? 0,
  }
}

export async function addStudentToCourse(courseId, { rollNumber, name, email, batch }) {
  // Upsert student (by roll number)
  const { data: student, error: studentError } = await supabase
    .from('students')
    .upsert({ roll_number: rollNumber, name, email, batch }, { onConflict: 'roll_number' })
    .select()
    .single()

  if (studentError) throw new Error('Unable to save student. Please try again.')

  // Link to course
  const { error: linkError } = await supabase
    .from('course_students')
    .upsert({ course_id: courseId, student_id: student.id }, { onConflict: 'course_id,student_id' })

  if (linkError) throw new Error('Unable to enroll student in course. Please try again.')
  return student
}

export async function removeStudentFromCourse(courseId, studentId) {
  const { error } = await supabase
    .from('course_students')
    .delete()
    .match({ course_id: courseId, student_id: studentId })

  if (error) throw new Error('Unable to remove student. Please try again.')
}

export async function enrollDefaultStudents(courseId) {
  // Fetch all students from master list
  const { data: allStudents, error: fetchError } = await supabase
    .from('students')
    .select('id')

  if (fetchError) throw new Error('Unable to fetch student list. Please try again.')

  // Bulk link all students to the course
  const links = allStudents.map((s) => ({ course_id: courseId, student_id: s.id }))
  const { error: linkError } = await supabase
    .from('course_students')
    .upsert(links, { onConflict: 'course_id,student_id' })

  if (linkError) throw new Error('Unable to enroll default students. Please try again.')
  return allStudents.length
}

export async function enrollSelectedStudents(courseId, studentIds) {
  if (!studentIds || studentIds.length === 0) return 0

  const links = studentIds.map((id) => ({ course_id: courseId, student_id: id }))
  const { error } = await supabase
    .from('course_students')
    .upsert(links, { onConflict: 'course_id,student_id' })

  if (error) throw new Error('Unable to enroll selected students. Please try again.')
  return studentIds.length
}

export async function bulkImportStudents(courseId, studentsArray) {
  // Upsert all students
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .upsert(
      studentsArray.map((s) => ({
        roll_number: s.rollNumber,
        name: s.name,
        email: s.email || null,
        batch: s.batch || null,
      })),
      { onConflict: 'roll_number' }
    )
    .select()

  if (studentsError) throw new Error('Unable to import students. Please try again.')

  // Link all to course
  const links = students.map((s) => ({ course_id: courseId, student_id: s.id }))
  const { error: linkError } = await supabase
    .from('course_students')
    .upsert(links, { onConflict: 'course_id,student_id' })

  if (linkError) throw new Error('Unable to enroll imported students. Please try again.')
  return students
}

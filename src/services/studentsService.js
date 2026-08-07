import { supabase } from '../lib/supabase'

export async function fetchStudentsForCourse(courseId) {
  const { data, error } = await supabase
    .from('course_students')
    .select(`
      student_id,
      batch,
      students (
        id, roll_number, name, email, class_id, created_at
      )
    `)
    .eq('course_id', courseId)

  if (error) throw new Error('Unable to load students. Please refresh and try again.')
  
  const mapped = data.map((row) => ({
    ...row.students,
    // course_students.batch is the per-course source of truth (not students.batch)
    batch: row.batch ?? null,
  }))

  // Robustly sort by roll_number alphanumeric order
  return mapped.sort((a, b) => {
    const aRoll = a.roll_number || ''
    const bRoll = b.roll_number || ''
    return aRoll.localeCompare(bRoll, undefined, { numeric: true, sensitivity: 'base' })
  })
}

export async function fetchStudentsByClass(classId) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('class_id', classId)
    .order('roll_number', { ascending: true })

  if (error) throw new Error('Unable to load class students. Please refresh and try again.')
  return data
}

export async function fetchAllStudents({ page = 0, pageSize = 50 } = {}) {
  const from = page * pageSize
  const to   = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('students')
    .select('id, roll_number, name, email, batch, class_id', { count: 'exact' })
    .order('roll_number', { ascending: true })
    .range(from, to)

  if (error) throw new Error('Unable to load student list. Please refresh and try again.')
  return {
    data: data ?? [],
    hasMore: count != null && to + 1 < count,
    total: count ?? 0,
  }
}

export async function addStudentToClass(classId, { rollNumber, name, email, batch }) {
  const { data, error } = await supabase
    .from('students')
    .upsert({ roll_number: rollNumber, name, email, batch, class_id: classId }, { onConflict: 'roll_number' })
    .select()
    .single()

  if (error) throw new Error('Unable to save student. Please try again.')
  
  if (data) {
    await syncClassStudentsToCourses(classId, [data.id])
  }
  
  return data
}

export async function addStudentToCourse(courseId, { rollNumber, name, email, batch }) {
  // Fetch existing class_id so we don't wipe it
  const { data: existing } = await supabase
    .from('students')
    .select('class_id')
    .eq('roll_number', rollNumber)
    .maybeSingle()

  // Upsert the student identity row — do NOT write batch here (batch is per-course, not global)
  const { data: student, error: studentError } = await supabase
    .from('students')
    .upsert({
      roll_number: rollNumber,
      name,
      email,
      class_id: existing?.class_id || null,
    }, { onConflict: 'roll_number' })
    .select()
    .single()

  if (studentError) throw new Error('Unable to save student. Please try again.')

  // Link to course AND set batch on course_students (per-course batch, not global)
  const { error: linkError } = await supabase
    .from('course_students')
    .upsert(
      { course_id: courseId, student_id: student.id, batch: batch || null },
      { onConflict: 'course_id,student_id' }
    )

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

export async function removeStudentFromClass(studentId) {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId)

  if (error) throw new Error('Unable to remove student. Please try again.')
}

export async function bulkDeleteStudents(studentIds) {
  if (!studentIds || studentIds.length === 0) return
  const { error } = await supabase
    .from('students')
    .delete()
    .in('id', studentIds)

  if (error) throw new Error('Unable to delete students. Please try again.')
}

export async function enrollDefaultStudents(courseId, targetClassId) {
  let query = supabase.from('students').select('id')
  if (targetClassId) {
    query = query.eq('class_id', targetClassId)
  }

  const { data: allStudents, error: fetchError } = await query

  if (fetchError) throw new Error('Unable to fetch student list. Please try again.')

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

export async function bulkImportStudentsToClass(classId, studentsArray) {
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .upsert(
      studentsArray.map((s) => ({
        roll_number: s.rollNumber,
        name: s.name,
        email: s.email || null,
        batch: s.batch || null,
        class_id: classId,
      })),
      { onConflict: 'roll_number' }
    )
    .select()

  if (studentsError) throw new Error('Unable to import students. Please try again.')

  if (students && students.length > 0) {
    await syncClassStudentsToCourses(classId, students.map((s) => s.id))
  }

  return students
}

export async function updateStudentBatchesForCourse(courseId, studentIds, batch) {
  // Update batch on course_students for this specific course — NOT the shared students table.
  // This ensures Blockchain batch assignments don't bleed into IoT or any other course.
  if (!courseId || !studentIds || studentIds.length === 0) return

  // Build the update as individual upserts per student to hit the composite PK
  const updates = studentIds.map((studentId) => ({ course_id: courseId, student_id: studentId, batch }))

  const { error } = await supabase
    .from('course_students')
    .upsert(updates, { onConflict: 'course_id,student_id' })

  if (error) throw new Error('Unable to update student batches. Please try again.')
}

// Legacy: kept for backward compat but no longer called for batch assignment
export async function updateStudentBatches(studentIds, batch) {
  if (!studentIds || studentIds.length === 0) return

  const { error } = await supabase
    .from('students')
    .update({ batch })
    .in('id', studentIds)

  if (error) throw new Error('Unable to update student batches. Please try again.')
}

export async function bulkImportStudents(courseId, studentsArray) {
  // Fetch existing class_ids so we don't overwrite them
  const rollNumbers = studentsArray.map(s => s.rollNumber)
  const { data: existing } = await supabase
    .from('students')
    .select('roll_number, class_id')
    .in('roll_number', rollNumbers)

  const existingMap = {}
  existing?.forEach(s => {
    existingMap[s.roll_number] = s.class_id
  })

  // Fetch course to get target_class_id
  const { data: course } = await supabase
    .from('courses')
    .select('target_class_id')
    .eq('id', courseId)
    .single()

  const targetClassId = course?.target_class_id || null

  // Upsert student identity rows — do NOT write batch here (batch is per-course, not global)
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .upsert(
      studentsArray.map((s) => ({
        roll_number: s.rollNumber,
        name: s.name,
        email: s.email || null,
        class_id: existingMap[s.rollNumber] || targetClassId,
      })),
      { onConflict: 'roll_number' }
    )
    .select()

  if (studentsError) throw new Error('Unable to import students. Please try again.')

  // Build a map from roll_number → student id for batch assignment
  const rollToStudent = {}
  students.forEach(s => { rollToStudent[s.roll_number] = s.id })

  // Link all to course AND set per-course batch on course_students
  const links = studentsArray.map((s) => ({
    course_id: courseId,
    student_id: rollToStudent[s.rollNumber],
    batch: s.batch || null,
  })).filter(l => l.student_id) // guard against any missing students

  const { error: linkError } = await supabase
    .from('course_students')
    .upsert(links, { onConflict: 'course_id,student_id' })

  if (linkError) throw new Error('Unable to enroll imported students. Please try again.')
  return students
}

/**
 * Automatically syncs students added to a class section to all default (core) courses for that class.
 */
async function syncClassStudentsToCourses(classId, studentIds) {
  if (!classId || !studentIds || studentIds.length === 0) return

  // Fetch all core courses mapped to this class
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id')
    .eq('target_class_id', classId)
    .eq('enrollment_type', 'default')

  if (error || !courses || courses.length === 0) return

  // Prepare links
  const links = []
  courses.forEach((c) => {
    studentIds.forEach((sid) => {
      links.push({ course_id: c.id, student_id: sid })
    })
  })

  // Upsert into course_students
  await supabase
    .from('course_students')
    .upsert(links, { onConflict: 'course_id,student_id' })
}


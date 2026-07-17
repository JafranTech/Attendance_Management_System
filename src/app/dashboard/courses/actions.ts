"use server"

import { createSupabaseContext } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const courseSchema = z.object({
  course_code: z.string().min(1, "Course code is required"),
  course_name: z.string().min(1, "Course name is required"),
  semester: z.string().min(1, "Semester is required"),
})

export async function createCourse(formData: FormData) {
  const { data: ctx, error: authError } = await createSupabaseContext()
  if (authError || !ctx?.userClaims) {
    return { error: "Not authenticated" }
  }

  const result = courseSchema.safeParse({
    course_code: formData.get("course_code"),
    course_name: formData.get("course_name"),
    semester: formData.get("semester"),
  })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { supabase } = ctx
  const userId = (ctx.userClaims as any).sub

  // 1. Ensure faculty profile exists
  const { error: facultyError } = await supabase
    .from("faculty")
    .upsert(
      { 
        id: userId, 
        email: (ctx.userClaims as any).email || "unknown@email.com", 
        name: "Faculty Member" // Default placeholder
      },
      { onConflict: "id" }
    )

  if (facultyError) {
    console.error("Failed to upsert faculty profile", facultyError)
    return { error: "Failed to initialize faculty profile" }
  }

  // 2. Insert Course
  const { error: courseError } = await supabase
    .from("courses")
    .insert({
      faculty_id: userId,
      course_code: result.data.course_code,
      course_name: result.data.course_name,
      semester: result.data.semester,
    })

  if (courseError) {
    console.error("Failed to insert course", courseError)
    if (courseError.code === "23505") { // Unique violation
      return { error: "A course with this code already exists for you." }
    }
    return { error: "Failed to create course" }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function addStudentToCourse(formData: FormData, courseId: string) {
  const { data: ctx, error: authError } = await createSupabaseContext()
  if (authError || !ctx?.userClaims) return { error: "Not authenticated" }

  const rollNumber = formData.get("roll_number") as string
  const name = formData.get("name") as string

  if (!rollNumber || !name) {
    return { error: "Roll Number and Name are required" }
  }

  const { supabaseAdmin } = ctx // Using admin to bypass RLS if needed for student global table

  // 1. Upsert student
  // Wait, if a student exists, we need their ID. 
  // Supabase doesn't return the id easily on upsert conflict without a DO UPDATE.
  let studentId: string | null = null

  // Check if student exists
  const { data: existingStudent } = await supabaseAdmin
    .from("students")
    .select("id")
    .eq("roll_number", rollNumber)
    .single()

  if (existingStudent) {
    studentId = existingStudent.id
  } else {
    const { data: newStudent, error: createError } = await supabaseAdmin
      .from("students")
      .insert({ roll_number: rollNumber, name })
      .select("id")
      .single()
      
    if (createError || !newStudent) return { error: "Failed to create student" }
    studentId = newStudent.id
  }

  // 2. Link to course
  const { error: linkError } = await ctx.supabase
    .from("course_students")
    .insert({
      course_id: courseId,
      student_id: studentId,
    })

  if (linkError && linkError.code !== "23505") {
    return { error: "Failed to enroll student in course" }
  }

  revalidatePath(`/dashboard/courses/${courseId}`)
  return { success: true }
}

export async function importStudentsBulk(students: { RRN: string; NAME: string }[], courseId: string) {
  const { data: ctx, error: authError } = await createSupabaseContext()
  if (authError || !ctx?.userClaims) return { error: "Not authenticated" }

  const { supabaseAdmin, supabase } = ctx

  if (!students || students.length === 0) {
    return { error: "No students to import" }
  }

  // Process in chunks to avoid huge payloads (simple approach for now)
  for (const student of students) {
    if (!student.RRN || !student.NAME) continue;

    let studentId: string | null = null

    // Check if student exists
    const { data: existingStudent } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("roll_number", student.RRN.toString())
      .single()

    if (existingStudent) {
      studentId = existingStudent.id
    } else {
      const { data: newStudent, error } = await supabaseAdmin
        .from("students")
        .insert({ roll_number: student.RRN.toString(), name: student.NAME })
        .select("id")
        .single()
      
      if (!error && newStudent) {
        studentId = newStudent.id
      }
    }

    if (studentId) {
      // Link to course
      await supabase
        .from("course_students")
        .insert({
          course_id: courseId,
          student_id: studentId,
        })
    }
  }

  revalidatePath(`/dashboard/courses/${courseId}`)
  return { success: true }
}

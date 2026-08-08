# Database Schema

## Role of This File

This file defines the complete PostgreSQL database schema for the Faculty Attendance Management System running on Supabase. The AI agent must use exactly these table names, column names, data types, and constraints.

---

## Entity Relationship Overview

```
auth.users (Supabase managed)
    │
    └──▶ faculty (1:1)
            │
            └──▶ courses (1:many)
                    │
                    ├──▶ target_class_id ──▶ classes
                    │                          │
                    │                          └──▶ students (1:many per class)
                    │
                    ├──▶ course_students (many:many bridge to students)
                    │
                    └──▶ attendance (1:many per course/date/hour)
                            │
                            ├──▶ attendance_details (1:many per student)
                            │
                            └──▶ attendance_edits (audit logs for edits)
```

---

## Table Definitions

### Table: `faculty`
Stores faculty profile details. Linked 1:1 to Supabase `auth.users`.

```sql
CREATE TABLE faculty (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  email        text NOT NULL UNIQUE,
  department   text,
  role         text NOT NULL DEFAULT 'faculty' CHECK (role IN ('faculty', 'hod')),
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
```

### Table: `classes`
Master list of class sections.

```sql
CREATE TABLE classes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
```

### Table: `students`
Master list of all students belonging to a specific class section.

```sql
CREATE TABLE students (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id       uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  roll_number    text NOT NULL UNIQUE,
  name           text NOT NULL,
  email          text,
  batch          text, -- DEPRECATED: Moved to course_students for course-specific batch splits
  auth_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- [V3] Links to student's Supabase auth account
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
```

> **V3 Note:** `auth_user_id` is populated automatically by the `provision-student` Edge Function when faculty adds a student. It is `NULL` until provisioned. When a student is removed, their auth account is banned (not deleted), so this field retains the reference for historical audit purposes.

### Table: `courses`
Courses taught by faculty.

```sql
CREATE TABLE courses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id   uuid NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  course_code  text NOT NULL,
  course_name  text NOT NULL,
  semester     text,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(faculty_id, course_code)
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
```

### Table: `course_students`
Maps students to the courses they are enrolled in.

```sql
CREATE TABLE course_students (
  course_id    uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id   uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  batch        text, -- Added: Maps student to a specific lab batch (Batch 1 / Batch 2) for this course
  created_at   timestamptz DEFAULT now(),
  PRIMARY KEY (course_id, student_id)
);

ALTER TABLE course_students ENABLE ROW LEVEL SECURITY;
```

### Table: `timetable`
Defines the weekly schedule for courses.

```sql
CREATE TABLE timetable (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  day_of_week  integer NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Mon, 7=Sun
  hour         integer NOT NULL CHECK (hour > 0),
  created_at   timestamptz DEFAULT now(),
  UNIQUE(course_id, day_of_week, hour)
);

ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
```

### Table: `holidays`
System-wide or faculty-wide holidays to prevent attendance marking.

```sql
CREATE TABLE holidays (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date         date NOT NULL UNIQUE,
  description  text NOT NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
```

### Table: `attendance`
Main record for a specific class session.

```sql
CREATE TABLE attendance (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  date           date NOT NULL,
  hour           integer NOT NULL CHECK (hour > 0),
  is_holiday     boolean DEFAULT false,
  holiday_reason text,
  created_at     timestamptz DEFAULT now(),
  UNIQUE(course_id, date, hour) -- Prevent duplicate attendance for same hour
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
```

### Table: `attendance_details`
Line items for each student's attendance in a session.

```sql
CREATE TABLE attendance_details (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id  uuid NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  student_id     uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status         text NOT NULL CHECK (status IN ('Present', 'Absent')),
  created_at     timestamptz DEFAULT now(),
  UNIQUE(attendance_id, student_id)
);

ALTER TABLE attendance_details ENABLE ROW LEVEL SECURITY;
```

### Table: `attendance_edits`
Audit trail for changes made to attendance records.

```sql
CREATE TABLE attendance_edits (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id    uuid NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  student_id       uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  previous_status  text NOT NULL,
  new_status       text NOT NULL,
  reason           text NOT NULL,
  edited_at        timestamptz DEFAULT now()
);

ALTER TABLE attendance_edits ENABLE ROW LEVEL SECURITY;
```

---

## Indexes for Performance

```sql
-- Fast lookups for faculty dashboard
CREATE INDEX idx_attendance_course_date ON attendance(course_id, date);
CREATE INDEX idx_attendance_details_attendance ON attendance_details(attendance_id);
CREATE INDEX idx_attendance_details_student ON attendance_details(student_id);
CREATE INDEX idx_course_students_course ON course_students(course_id);
CREATE INDEX idx_course_students_student ON course_students(student_id);
-- Fast lookups for student portal (V3)
CREATE INDEX idx_students_auth_user ON students(auth_user_id);
CREATE INDEX idx_students_roll_number ON students(roll_number);
```

---

## V3 RLS Policies — Student Portal

These policies allow students to read ONLY their own attendance data. They cannot write anything.

### `students` Table — Student self-read
```sql
CREATE POLICY "Student can view own record"
ON students FOR SELECT
USING (auth_user_id = auth.uid());
```

### `course_students` Table — Student sees own enrollments
```sql
CREATE POLICY "Student can view own enrollments"
ON course_students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE id = course_students.student_id
    AND auth_user_id = auth.uid()
  )
);
```

### `courses` Table — Student can see courses they are enrolled in
```sql
CREATE POLICY "Student can view enrolled courses"
ON courses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM course_students cs
    JOIN students s ON cs.student_id = s.id
    WHERE cs.course_id = courses.id
    AND s.auth_user_id = auth.uid()
  )
);
```

### `attendance` Table — Student sees sessions for their courses
```sql
CREATE POLICY "Student can view attendance sessions for their courses"
ON attendance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM course_students cs
    JOIN students s ON cs.student_id = s.id
    WHERE cs.course_id = attendance.course_id
    AND s.auth_user_id = auth.uid()
  )
);
```

### `attendance_details` Table — Student sees only their own detail rows
```sql
CREATE POLICY "Student can view own attendance details"
ON attendance_details FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE id = attendance_details.student_id
    AND auth_user_id = auth.uid()
  )
);
```

> **Security Note:** Students have SELECT-only access. No INSERT, UPDATE, or DELETE policies are granted to students on any table.
CREATE INDEX idx_courses_faculty_id ON courses(faculty_id);

-- Fetching students for a course
CREATE INDEX idx_course_students_course_id ON course_students(course_id);
CREATE INDEX idx_course_students_student_id ON course_students(student_id);

-- Fetching attendance history
CREATE INDEX idx_attendance_course_date ON attendance(course_id, date);

-- Fetching detailed attendance lists
CREATE INDEX idx_attendance_details_att_id ON attendance_details(attendance_id);
```

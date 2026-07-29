# Backend Design

## Role of This File

This file defines every Supabase operation, Row Level Security policy, authentication pattern, and server-side logic rule in the Faculty Attendance Management System. The AI agent must implement all backend interactions exactly as specified here. Do not bypass RLS, do not use service keys in the frontend, and adhere to secure API patterns.

---

## Supabase Service Architecture

```
Supabase Project
├── Auth             ← Email/password auth (Faculty)
└── Database         ← PostgreSQL with full Row Level Security
```

---

## Authentication System

### Auth Strategy
- **Faculty:** Sign in with college email + password via Supabase Auth.
- *(Future)* **Students / Admin:** Will use role-based tables. For Version 1, assume all users are Faculty.

### Login Flow (React Client-Side)

```jsx
// src/contexts/AuthContext.jsx
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}
```

### Session Protection (React Router)

```jsx
// src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!session) return <Navigate to="/login" replace />

  return children
}
```

---

## Row Level Security (RLS) Policies

RLS must be enabled on every table. These are the exact policies to implement for V1 (Faculty).

### `faculty` Table
```sql
CREATE POLICY "Faculty can view own profile"
ON faculty FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Faculty can update own profile"
ON faculty FOR UPDATE USING (auth.uid() = id);
```

### `courses` Table
```sql
CREATE POLICY "Faculty can view own courses"
ON courses FOR SELECT USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can insert own courses"
ON courses FOR INSERT WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update own courses"
ON courses FOR UPDATE USING (faculty_id = auth.uid());
```

### `students` Table
```sql
-- Students are shared across the college, so all authenticated faculty can read them
CREATE POLICY "Faculty can view all students"
ON students FOR SELECT TO authenticated USING (true);

-- Faculty can insert new students
CREATE POLICY "Faculty can insert students"
ON students FOR INSERT TO authenticated WITH CHECK (true);
```

### `course_students` Table
```sql
CREATE POLICY "Faculty can manage course enrollments"
ON course_students FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE id = course_students.course_id AND faculty_id = auth.uid()
  )
);
```

### `attendance` & `attendance_details` Tables
```sql
CREATE POLICY "Faculty can manage attendance for their courses"
ON attendance FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE id = attendance.course_id AND faculty_id = auth.uid()
  )
);

CREATE POLICY "Faculty can manage attendance details"
ON attendance_details FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM attendance
    JOIN courses ON attendance.course_id = courses.id
    WHERE attendance.id = attendance_details.attendance_id AND courses.faculty_id = auth.uid()
  )
);
```

### `attendance_edits` Table
```sql
CREATE POLICY "Faculty can manage attendance edits"
ON attendance_edits FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM attendance
    JOIN courses ON attendance.course_id = courses.id
    WHERE attendance.id = attendance_edits.attendance_id AND courses.faculty_id = auth.uid()
  )
);
```

---

## Data Operation Patterns

### Saving Attendance (Client-Side API Call)

Because saving attendance involves inserting into `attendance` and multiple rows into `attendance_details`, it should be handled robustly.

```js
export async function saveAttendance(courseId, date, hour, studentStatuses) {
  // 1. Insert main attendance record
  const { data: attendanceRecord, error: attError } = await supabase
    .from('attendance')
    .insert({ course_id: courseId, date, hour })
    .select()
    .single()

  if (attError) throw attError

  // 2. Map and insert details
  const details = studentStatuses.map(s => ({
    attendance_id: attendanceRecord.id,
    student_id: s.studentId,
    status: s.status, // 'Present' or 'Absent'
  }))

  const { error: detError } = await supabase
    .from('attendance_details')
    .insert(details)

  if (detError) throw detError
  return true
}
```

### Editing Attendance (Audit Trail)

When a faculty edits an existing attendance record, they must provide a reason.

```js
export async function editAttendance(attendanceId, studentId, oldStatus, newStatus, reason) {
  // 1. Update the status
  const { error: updateError } = await supabase
    .from('attendance_details')
    .update({ status: newStatus })
    .match({ attendance_id: attendanceId, student_id: studentId })

  if (updateError) throw updateError

  // 2. Log the edit
  const { error: logError } = await supabase
    .from('attendance_edits')
    .insert({
      attendance_id: attendanceId,
      student_id: studentId,
      previous_status: oldStatus,
      new_status: newStatus,
      reason: reason
    })

  if (logError) throw logError
}
```

---

## Error Handling

### Backend Constraints
- A unique constraint on `(course_id, date, hour)` in the `attendance` table prevents double-marking the same hour.
- Attempting to mark attendance for a holiday or non-working Saturday should be validated on the client, but verified on the server if possible.

```
Database Error Mappings:
23505 (unique_violation) → "Attendance for this course and hour already exists."
```

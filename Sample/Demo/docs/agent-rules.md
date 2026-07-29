# Agent Rules

## Role of This File

This file defines non-negotiable operating rules for the AI development agent building the Faculty Attendance Management System. These rules govern code quality, React + Vite patterns, security, and error handling. Every rule applies to every file, in every phase, without exception.

---

## Prime Directive

> "Build production-quality, fast, and faculty-friendly code. Every component must handle its loading state, error state, and empty state. Every Supabase call must have error handling. Every form must validate using Zod before submitting. The attendance taking process must be optimized for speed and reliability, requiring maximum 3 taps."

---

## Code Quality Rules — NEVER VIOLATE

| Rule | Detail |
|---|---|
| Plain JavaScript | No TypeScript in v1. Use `.jsx` for components, `.js` for utilities/hooks. |
| Single Supabase client | Import `supabase` only from `src/lib/supabase.js`. Never instantiate a new client. |
| React Query for all data | Use `useQuery` and `useMutation` for every Supabase operation. No bare `useEffect` fetching. |
| No inline styles | Never use `style={{ ... }}`. Use Tailwind utility classes only. |
| No `console.log` in production | Remove all debug logs. Use `console.error` only in catch blocks. |
| No magic numbers | Extract repeated values into named constants (e.g., `MIN_ATTENDANCE_PERCENT = 75`). |
| Max component length: 150 lines | If a component exceeds 150 lines, split it into smaller sub-components. |
| Friendly error messages | Never expose raw Supabase error messages. Show user-friendly text with `toast.error()`. |

---

## Naming Conventions — EXACT

### Files
```
Pages:        PascalCase + Page suffix    LoginPage.jsx, DashboardPage.jsx
Components:   PascalCase                  CourseCard.jsx, StudentRow.jsx
Hooks:        camelCase + use prefix      useCourses.js, useAttendance.js
Services:     camelCase + Service suffix  coursesService.js, attendanceService.js
Utilities:    camelCase                   formatters.js, exportExcel.js
```

### Variables and Functions
```
React state:      camelCase               const [isLoading, setIsLoading] = useState(false)
Event handlers:   handle prefix           const handleSave = () => {}
Boolean props:    is/has/can prefix       isLoading, hasError, canEdit
Constants:        UPPER_SNAKE_CASE        MIN_ATTENDANCE_PERCENTAGE, MAX_HOURS
Supabase queries: descriptive verbs       fetchCourses, saveAttendance, getReportData
```

### Supabase
```
Table names:      snake_case              faculty, students, attendance, holidays
Column names:     snake_case              faculty_id, course_code, created_at
```

---

## React Patterns — REQUIRED

### Data Fetching with React Query
```jsx
// hooks/useCourses.js
import { useQuery } from '@tanstack/react-query'
import { fetchCourses } from '../services/coursesService'

export function useCourses(facultyId) {
  return useQuery({
    queryKey: ['courses', facultyId],
    queryFn: () => fetchCourses(facultyId),
    enabled: !!facultyId,
  })
}
```

### Service Layer Pattern
```js
// services/coursesService.js
import { supabase } from '../lib/supabase'

export async function fetchCourses(facultyId) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Unable to load courses. Please refresh and try again.')
  return data
}
```

### Form Validation (React Hook Form + Zod)
```jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
```

### Protected Route
```jsx
// routes/ProtectedRoute.jsx
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!session) return <Navigate to="/login" replace />
  return children
}
```

---

## Security Rules — ABSOLUTE

| Rule | Detail |
|---|---|
| Anon key only | Never use the service role key in any frontend code. Only `VITE_SUPABASE_ANON_KEY`. |
| Validate inputs | Zod validation on client; Supabase constraints on backend. |
| RLS on every table | Every table must have Row Level Security enabled. |
| Environment variables | All Supabase credentials must be in `.env.local` prefixed with `VITE_`. Never hardcode. |

---

## Error Handling Rules

### User-Facing Error Messages — Friendly Always
```
Database error    →  "Something went wrong. Please try again."
Network timeout   →  "Connection lost. Check your internet and retry."
Duplicate entry   →  "Attendance for this hour is already marked."
Login Failed      →  "Incorrect email or password."
Student missing   →  "Student data not found for this course."
```

### Toast Pattern
```jsx
// Always use react-hot-toast
import toast from 'react-hot-toast'

// Success
toast.success("Attendance saved successfully!")

// Error (catch block only)
toast.error("Unable to save attendance. Please try again.")
```

---

## Git and File Rules

- Never commit `.env.local` — it is in `.gitignore`.
- `.env.example` must always list all required variable names with empty values.
- All components must be importable without circular dependencies.

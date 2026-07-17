# Agent Rules

## Role of This File

This file defines non-negotiable operating rules for the AI development agent building the Faculty Attendance Management System. These rules govern code quality, Next.js App Router patterns, security, error handling, and behaviour patterns. Every rule here applies to every file generated, in every phase, without exception. When in doubt, be stricter — not looser.

---

## Prime Directive

> "Build production-quality, fast, and faculty-friendly code. Every component must handle its loading state, error state, and empty state. Every Supabase call must have error handling. Every form must validate using Zod before submitting. The attendance taking process must be optimized for speed and reliability, requiring maximum 3 taps."

---

## Code Quality Rules — NEVER VIOLATE

| Rule | Detail |
|---|---|
| Use Next.js App Router | All pages go in `app/`. Use Server Components by default for data fetching. |
| Use `"use client"` sparingly | Only use `"use client"` when React hooks, state, or event listeners are needed. |
| No inline styles | Never use `style={{ ... }}` on elements. Use Tailwind utility classes only. |
| Use shadcn/ui | Rely on shadcn/ui components instead of building custom UI from scratch where applicable. |
| No `console.log` in production code | Remove all debug logs. Use `console.error` only in catch blocks. |
| No magic numbers | Extract repeated values (e.g., minimum attendance percentage 75%) into constants. |
| Strict TypeScript | Use TypeScript for all files (`.ts`, `.tsx`). Define interfaces for all Supabase tables. |
| Max component length: 150 lines | If a component exceeds 150 lines, split it into smaller sub-components. |

---

## Naming Conventions — EXACT (FOLLOW PRECISELY)

### Files
```
Components:       PascalCase      CourseCard.tsx, AttendanceTable.tsx, StudentList.tsx
Pages:            page.tsx        app/dashboard/page.tsx, app/attendance/page.tsx
Hooks:            camelCase       useCourses.ts, useAttendance.ts
Utilities:        camelCase       formatters.ts, exportExcel.ts, pdfGenerator.ts
```

### Variables and Functions
```
React state:      camelCase               const [isLoading, setIsLoading] = useState(false)
Event handlers:   handle prefix           const handleSave = () => {}
                                          const handleExport = () => {}
Boolean props:    is/has/can prefix       isLoading, hasError, isWorkingSaturday
Constants:        UPPER_SNAKE_CASE        MIN_ATTENDANCE_PERCENTAGE, MAX_HOURS
Supabase queries: descriptive verbs       fetchCourses, saveAttendance, getReportData
```

### CSS / Tailwind
```
Tailwind config:  camelCase               primaryBlue, secondaryBlue
```

### Supabase
```
Table names:      snake_case              faculty, students, attendance, holidays
Column names:     snake_case              faculty_id, course_code, created_at
RLS policy names: human-readable          "Faculty can view own courses"
```

---

## Next.js & React Patterns — REQUIRED

### Data Fetching (Server Components)

```tsx
// app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: courses, error } = await supabase.from('courses').select('*');

  if (error) return <ErrorState message="Failed to load courses." />;
  if (!courses?.length) return <EmptyState message="No courses available." />;

  return <CourseList courses={courses} />;
}
```

### Form Validation (React Hook Form + Zod)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Use this schema in forms before hitting Supabase to ensure clean data
```

---

## Security Rules — ABSOLUTE

| Rule | Detail |
|---|---|
| Anon key only in frontend | Never use service role key in client components. Only `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| Validate inputs | Never trust frontend input. Zod validation on client, Supabase constraints on backend. |
| RLS on every table | Every table must have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` before any data is inserted. |
| Protect Routes | Use Next.js Middleware to protect routes under `app/(protected)/`. Redirect unauthenticated users to `/login`. |
| Environment variables | Secrets (`NEXT_PUBLIC_SUPABASE_URL`, etc.) must go in `.env.local`. Never hardcode. |

---

## Error Handling Rules

### Supabase Errors — Always Catch, Never Expose Raw

```ts
// WRONG — do not do this
const { data, error } = await supabase.from('courses').select('*')
if (error) toast.error(error.message)   // Raw Supabase error shown to user

// CORRECT
try {
  const { data, error } = await supabase.from('courses').select('*')
  if (error) throw error
  return data
} catch (err) {
  console.error('[fetchCourses] failed:', err)
  throw new Error('Unable to load courses. Please refresh and try again.')
}
```

### User-Facing Error Messages — Friendly Always

```
Database error    →  "Something went wrong. Please try again."
Network timeout   →  "Connection lost. Check your internet and retry."
Duplicate entry   →  "Attendance for this hour is already marked."
Student missing   →  "Student data not found for this course."
Login Failed      →  "Incorrect email or password."
```

---

## Git and File Rules

- Never commit `.env.local` — add it to `.gitignore` immediately.
- `.env.example` must always be kept up to date with all required variable names (values empty).
- All components must be importable without circular dependencies.

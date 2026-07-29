# Faculty Attendance Management System

## Role

Act as a World-Class Senior Full-Stack Engineer specialising in **React 18, Vite 5, React Router DOM 6, Tailwind CSS 3, and Supabase**. You build production-grade, fast, and highly reliable web applications. Every screen must feel premium, professional, and optimised for daily faculty use — clean, intuitive, and visually polished.

---

## Agent Flow — MUST FOLLOW

When this file is loaded, immediately understand the full system context from all linked `.md` files. Do not ask clarifying questions unless a spec is genuinely ambiguous. Do not over-discuss. Build.

### Startup Sequence (run on every new session)

1. Read `gemini.md` — understand the system role and agent rules.
2. Read `architecture.md` — understand the folder structure, routes, and system boundaries.
3. Read `tech-stack.md` — understand every library, its version, and its purpose.
4. Read `ui-design.md` — load the full design system before generating any component.
5. Read `backend-design.md` — understand all Supabase logic and RLS policies.
6. Read `database-schema.md` — understand every table, column, type, and relationship.
7. Read `agent-rules.md` — apply all code quality, naming, and security rules without exception.
8. Read `development-roadmap.md` — know the current phase and build only what is in scope.

> **Execution Directive:** "Build an interface optimized for speed. Faculty take attendance every single day. The UI must be frictionless, require minimum clicks, load instantly, and never fail silently."

---

## Project Identity

**Name:** Faculty Attendance Management System
**Type:** Responsive Web Application (PWA)
**Stack:** React + Vite + Supabase
**Purpose:** Allow faculty members to quickly mark student attendance, manage course enrollments, track history, and generate formal Excel/PDF reports for administration.

---

## User Roles

### Faculty (Version 1 Focus)
- Login securely.
- Manage their assigned courses and enroll students.
- Set up weekly timetables.
- Mark attendance rapidly (mobile or desktop).
- View and edit past attendance records (with audit logging).
- Export attendance reports in Excel and PDF formats.

### Future Scopes
- **Students:** To view their own attendance percentages.
- **Admin/HOD:** To view department-wide reports and manage faculty.

---

## Core System Features

### 1. Rapid Attendance Marking
Optimized UX where all students default to "Present". Faculty only tap on absentees, review, and save. Takes less than 3 taps to start.

### 2. Comprehensive Course Management
Add courses, import student lists via Excel, or add them manually.

### 3. Audit Trail for Edits
If a faculty member edits a past attendance record, they must provide a reason, which is logged in the database.

### 4. Professional Reporting
Client-side generation of Excel sheets and PDFs with summary tables and signature blocks.

### 5. Timetable and Validation
Set up weekly schedules. System prevents marking attendance on holidays or Sundays.

---

## Build Sequence

1. Identify which phase the feature belongs to (see `development-roadmap.md`).
2. Confirm the database tables involved (see `database-schema.md`).
3. Write the data-fetching logic using React Query and the Supabase client.
4. Apply design tokens from `ui-design.md` — never invent colors or spacing.
5. Implement mobile layout first, then add responsive breakpoints.
6. Add loading states, empty states, and error states to every route.
7. Test the happy path, then the error path.

---

## Non-Negotiable Rules

- **Use the single Supabase client** from `src/lib/supabase.js`. Never create multiple instances.
- **Never expose the Supabase service role key** in any client code. Use only the anon key.
- **Never skip RLS.** Every table must have Row Level Security policies active.
- **Every form must validate using Zod** before submitting.
- **Use React Query** for all Supabase data fetching — never fetch in `useEffect` directly.
- **Plain JavaScript only** — no TypeScript for v1.

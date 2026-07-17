# Faculty Attendance Management System

## Role

Act as a World-Class Senior Full-Stack Engineer and Product Architect specialising in Next.js 15 (App Router), Supabase, and Tailwind CSS. You build production-grade, fast, and highly reliable web applications. Every screen you produce must feel like a premium, professional tool — clean, intuitive, and visually polished. Eradicate all generic AI patterns. Every component must be intentional, every interaction smooth, every data flow secure.

---

## Agent Flow — MUST FOLLOW

When this file is loaded into a fresh project session, immediately understand the full system context from all linked `.md` files. Do not ask clarifying questions unless a spec is genuinely ambiguous. Do not over-discuss. Build.

### Startup Sequence (run on every new session)

1. Read `gemini.md` — understand the system role and agent rules.
2. Read `architecture.md` — understand the folder structure, routes, and system boundaries.
3. Read `tech-stack.md` — understand every library, its version, and its purpose.
4. Read `ui-design.md` — load the full design system before generating any component.
5. Read `backend-design.md` — understand all Supabase logic, RLS policies, and server actions.
6. Read `database-schema.md` — understand every table, column, type, and relationship.
7. Read `agent-rules.md` — apply all code quality, naming, and security rules without exception.
8. Read `development-roadmap.md` — know the current phase and build only what is in scope.

> **Execution Directive:** "Build an interface optimized for speed. Faculty take attendance every single day. The UI must be frictionless, require minimum clicks, load instantly, and never fail silently."

---

## Project Identity

**Name:** Faculty Attendance Management System  
**Type:** Responsive Web Application  
**Purpose:** Allow faculty members to quickly mark student attendance, manage course enrollments, track history, and generate formal Excel/PDF reports for administration.

---

## User Roles

### Faculty (Version 1 Focus)
The primary users of the system.
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
Ability to add courses, import student lists via Excel, or add them manually. Link students to specific courses.

### 3. Audit Trail for Edits
If a faculty member edits a past attendance record (e.g., changing Absent to Present), they must provide a reason, which is logged securely in the database.

### 4. Professional Reporting
Client-side generation of Excel sheets and PDFs with college logos, summary tables, and signature blocks.

### 5. Timetable and Validation
Set up weekly schedules. System prevents marking attendance on holidays, Sundays (unless specifically configured), or outside of timetable hours.

---

## Build Sequence

When asked to build any feature, follow this sequence without deviation:

1. Identify which phase the feature belongs to (see `development-roadmap.md`).
2. Confirm the database tables involved (see `database-schema.md`).
3. Write the Server Component for data fetching or Server Action for mutations first.
4. Apply design tokens from `ui-design.md` — never invent colors or spacing. Use shadcn/ui.
5. Implement mobile layout first, then add responsive breakpoints.
6. Add loading states (`loading.tsx`), empty states, and error states (`error.tsx`) to every route.
7. Test the happy path, then the error path (e.g., validation failures).

---

## Non-Negotiable Rules

- **Use Next.js Server Components by default.** Only use `"use client"` when absolutely necessary for interactivity.
- **Never expose the Supabase service key** anywhere in the client code.
- **Never skip RLS.** Every table must have Row Level Security policies active.
- **Every form must have client-side validation using Zod.**
- **Avoid heavy client-side JavaScript where Server Actions suffice.**

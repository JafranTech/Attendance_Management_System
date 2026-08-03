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
9. Read `quality-gate.md` and testing strategy documents (`unit-testing.md`, `integration-testing.md`, `e2e-testing.md`, `security-testing.md`, `load-testing.md`, `deployment-checklist.md`) to apply the appropriate testing protocol based on the change size.

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
- Manage **Class Sections** (Master lists of students).
- Assign students from Master Lists into specific **Courses**.
- Set up weekly timetables.
- Mark attendance rapidly (Mobile or Desktop) using List, Quick Entry, or Interactive Modes.
- View and edit past attendance records (with audit logging).
- Declare independent Holidays for their courses.
- Monitor **Low Attendance** warnings automatically.
- Export attendance reports in Excel and PDF formats.

### HOD (Version 2 — Read-Only Monitoring)
- Login with `role = 'hod'` in the `faculty` table.
- View ALL classes created by any faculty in the department.
- Drill into a class to see all subjects (courses) mapped to it, along with the faculty name and overall attendance %.
- Subjects below 75% attendance are highlighted in red.
- Drill into a subject to see today's (or any past date's) attendance: Total, Present, Absent counts + full student list with status.
- View a "Low Attendance" tab listing all students below 75% for a given subject.
- **Strictly view-only** — cannot mark or edit attendance.

### Future Scopes
- **Students:** To view their own attendance percentages.

---

## Core System Features

### 1. Rapid Attendance Marking
Optimized UX where all students default to "Present". Faculty can tap on absentees, review, and save. Includes three modes:
- **List View**: Standard toggle switch.
- **Quick Entry**: Numpad/keyboard-based rapid entry for roll numbers.
- **Interactive Mode**: Swipe/tap card-based interface optimized for mobile.

### 2. Comprehensive Class & Course Management
- **Classes**: Master rosters for an entire batch. Import via Excel, manage students.
- **Courses**: Subjects mapped to Classes. Pulls students from the master class list.

### 2.5. Mobile Optimized Navigation
- Bottom bar constrained to primary actions (Home, Attend, Courses, History).
- Hamburger menu handles secondary views (Classes, Low Attendance, Reports, Settings).

### 3. Audit Trail for Edits
If a faculty member edits a past attendance record, they must provide a reason, which is logged in the database.

### 4. Professional Reporting
Client-side generation of Excel sheets and PDFs with summary tables and signature blocks.

### 5. Timetable, Validation & Holidays
Set up weekly schedules. System prevents marking attendance on global or faculty-specific holidays, and Sundays. Holidays can be marked specifically for a single session, or broadly across the faculty's calendar.

### 6. Low Attendance Tracking
Dedicated dashboard to easily identify students falling below required attendance thresholds.

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

## Testing & Quality Assurance Protocol

Based on the scope of the changes made, you MUST automatically follow the corresponding testing documentation:

1. **Small Updates (Bug fixes, UI tweaks, minor logic changes):**
   - Follow `unit-testing.md` and `integration-testing.md` to ensure the component works in isolation and interacts correctly.
   
2. **Major Features (New modules, database schema changes, new user flows):**
   - Enforce criteria from `quality-gate.md`.
   - Conduct security checks via `security-testing.md` (especially reviewing Supabase RLS).
   - Ensure unit and integration tests are updated and passing for the new feature.

3. **Production Deployment (Releasing to live environment):**
   - Run end-to-end user flows according to `e2e-testing.md`.
   - Evaluate system limits using `load-testing.md`.
   - Execute the step-by-step `deployment-checklist.md` before, during, and after deployment.

---

## Non-Negotiable Rules

- **Use the single Supabase client** from `src/lib/supabase.js`. Never create multiple instances.
- **Never expose the Supabase service role key** in any client code. Use only the anon key.
- **Never skip RLS.** Every table must have Row Level Security policies active.
- **Every form must validate using Zod** before submitting.
- **Use React Query** for all Supabase data fetching — never fetch in `useEffect` directly.
- **Plain JavaScript only** — no TypeScript for v1.

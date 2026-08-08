# Development Roadmap

## Role of This File

This file defines the phased build sequence for the Faculty Attendance Management System. The AI agent must always know which phase is active and build only features within scope for that phase. Do not skip phases. Every phase ends with a working, testable deliverable.

---

## Roadmap Overview

```
Phase 1 — Project Foundation & Authentication
Phase 2 — Course & Student Management
Phase 3 — Timetable & Holiday Setup
Phase 4 — Core Attendance Module
Phase 5 — History & Edits
Phase 6 — Excel & PDF Reports
Phase 7 — Dashboard Analytics
Phase 8 — Testing & Deployment
```

---

## Phase 1 — Project Foundation & Authentication

**Goal:** A working React + Vite project with Supabase Auth integrated, allowing Faculty to log in and view a basic dashboard.

**Deliverables:**
- [ ] React + Vite project setup
- [ ] Tailwind CSS + shadcn/ui configured
- [ ] `lib/supabase/client.ts` and `lib/supabase/server.ts` created
- [ ] Environment variables set (`.env.local`)
- [ ] Supabase SQL schema for V1 (Faculty) created in DB
- [ ] Login screen (`src/pages/LoginPage.jsx`) with React Hook Form + Zod
- [ ] ProtectedRoute to protect `/dashboard` routes
- [ ] Basic Dashboard Layout (`src/layouts/DashboardLayout.jsx`) with Sidebar/Navbar

---

## Phase 2 — Course & Student Management

**Goal:** Faculty can add courses and enroll students into them via manual entry or Excel import.

**Deliverables:**
- [ ] `src/pages/CoursesPage.jsx` — List of courses
- [ ] Add Course Modal (Course Code, Name, Semester)
- [ ] Course Details Page (`src/pages/CourseDetailPage.jsx`)
- [ ] Student Management Tab inside Course Details
- [ ] Manual Student Entry Form (Roll Number, Name, Email)
- [ ] Bulk Student Import via Excel (using SheetJS to parse)
- [ ] Supabase Hooks/Client Services to save courses and map students (`course_students`)

---

## Phase 3 — Timetable & Holiday Setup

**Goal:** Define when classes occur and manage non-working days.

**Deliverables:**
- [ ] Timetable Setup UI in Course Details (Select Day of Week and Hour)
- [ ] Save timetable to Supabase `timetable` table
- [ ] Holiday Management Page (`src/pages/SettingsPage.jsx`)
- [ ] Add/Remove Holidays
- [ ] Working Saturday Toggle / Management

---

## Phase 4 — Core Attendance Module

**Goal:** The primary functionality. Faculty can take attendance for a specific course and hour in under 3 taps.

**Deliverables:**
- [ ] Attendance Selection Screen (`src/pages/AttendancePage.jsx`) — Pick Course, Date, and Hour
- [ ] Validation: Prevent selecting future dates, holidays, or already marked hours
- [ ] Attendance Marking Screen (Student List)
- [ ] All students default to "Present"
- [ ] Toggle buttons for Present/Absent
- [ ] Save Attendance Action (Bulk insert into `attendance` and `attendance_details`)
- [ ] Success Toast and redirect back to Dashboard

---

## Phase 5 — History & Edits

**Goal:** Faculty can view past attendance records and edit them with an audit trail.

**Deliverables:**
- [ ] History View (`src/pages/HistoryPage.jsx`) — List of past sessions
- [ ] Session Detail View — Shows who was Present/Absent
- [ ] Edit Mode — Allow changing a student's status
- [ ] Prompt for "Reason for Edit" when saving changes
- [ ] Save Edit Action (Update `attendance_details` and insert into `attendance_edits`)

---

## Phase 6 — Excel & PDF Reports

**Goal:** Generate formal reports required by the college administration.

**Deliverables:**
- [ ] Reports Selection Screen (`src/pages/ReportsPage.jsx`) — Select Course, Date Range, Format
- [ ] Excel Export Logic (`src/utils/exportExcel.js`) using SheetJS
- [ ] Excel Format: Columns for Roll No, Name, Date/Hour, Status, Total %
- [ ] PDF Export Logic (`src/utils/generatePdf.js`) using jsPDF + AutoTable
- [ ] PDF Format: Header with College Logo, Faculty Name, Subject, Summary, and Signature Block
- [ ] Client-side generation to ensure fast downloads

---

## Phase 7 — Dashboard Analytics

**Goal:** Provide at-a-glance insights on the main dashboard.

**Deliverables:**
- [ ] Stats Cards: Total Courses, Total Students, Low Attendance Count
- [ ] List of students below 75% attendance across courses
- [ ] Recharts BarChart: Attendance trend over the last 7 days
- [ ] Quick Actions: "Take Attendance Now" for today's scheduled classes (derived from `timetable`)

---

## Phase 8 — Testing & Deployment

**Goal:** Ensure the app is bug-free, responsive, and live.

**Deliverables:**
- [x] Responsive UI testing (Mobile, Tablet, Desktop)
- [x] Edge cases tested (e.g., trying to mark attendance for empty courses)
- [x] Production build (`npm run build`)
- [x] Deploy to Vercel — **Live at `it-erp.vercel.app`**
- [x] Set production environment variables (Supabase URL + Anon Key on Vercel)

---

## Phase 9 — HOD Monitoring System (Version 2)

**Goal:** A strict, read-only monitoring dashboard for the HOD to oversee all classes, subjects, and student attendance across the department.

**Deliverables:**
- [x] Database: Add `role` column to `faculty` table (`'faculty'` | `'hod'`)
- [x] Database: Add HOD-specific RLS read policies on all tables
- [x] Auth: Update `AuthContext.jsx` to fetch `faculty` profile + role after login
- [x] Auth: Update `AppRouter.jsx` — role-based redirect + `HodProtectedRoute`
- [x] Service: `src/services/hodService.js` — all HOD read queries
- [x] Hooks: `src/hooks/useHod.js` — React Query wrappers for HOD
- [x] UI: `src/components/hod/HodLayout.jsx` — separate HOD shell/navbar
- [x] UI: `src/pages/hod/HodDashboard.jsx` — horizontal class cards (IT Final Year, etc.)
- [x] UI: `src/pages/hod/HodClassDetail.jsx` — subjects per class with % and faculty name
- [x] UI: `src/pages/hod/HodCourseDetail.jsx` — daily attendance + date picker + low attendance tab

**Rules:**
- HOD is **view-only** — zero write access
- Low attendance threshold: **75%** (highlighted red)
- HOD can view **any past date** via date picker (defaults to today)
- Everything reads through existing `classes`, `courses`, `attendance`, `attendance_details` tables
- Same React + Vite codebase — no Next.js or Three.js

---

## Phase 10 — Student Self-Service Portal (Version 3) ← ACTIVE

**Goal:** Allow students to log in and view their own attendance data in a mobile-first, read-only portal. Accounts are automatically provisioned and deactivated by faculty actions in Classes & Roster.

### Sub-Phase 10A — Database & Backend
**Deliverables:**
- [ ] Database: Add `auth_user_id uuid REFERENCES auth.users(id)` column to `students` table
- [ ] Database: Apply V3 RLS policies (student self-read on `students`, `course_students`, `courses`, `attendance`, `attendance_details`)
- [ ] Database: Add performance indexes (`idx_students_auth_user`, `idx_students_roll_number`)
- [ ] Edge Function: `supabase/functions/provision-student/index.ts`
  - Accepts `{ action: 'provision' | 'deactivate', roll_number, name }` payload
  - `provision`: Creates auth account `roll_number@crescent.education` / `crescent1234`, links `auth_user_id`
  - `deactivate`: Bans the auth account, preserves all historical data
  - `re-provision`: Detects existing banned account, re-enables it
  - Uses `SUPABASE_SERVICE_ROLE_KEY` — never exposed to frontend

### Sub-Phase 10B — Auth & Routing
**Deliverables:**
- [ ] Auth: Update `AuthContext.jsx` to detect `role = 'student'` from `user_metadata`
- [ ] Auth: Update `AppRouter.jsx` — add `StudentProtectedRoute` + student routes (`/student/dashboard`, `/student/course/:courseId`)
- [ ] Auth: On login, if `role === 'student'` → redirect to `/student/dashboard`

### Sub-Phase 10C — Student Dashboard UI (Mobile-First)
**Deliverables:**
- [ ] Service: `src/services/studentPortalService.js`
  - `getMySubjects(studentId)` → enrolled courses + attendance % per course
  - `getMyCourseAttendance(courseId, studentId)` → session history + status per session
- [ ] Hook: `src/hooks/useStudentPortal.js` — React Query wrappers
- [ ] Page: `src/pages/student/StudentDashboard.jsx`
  - Mobile-first layout (optimized for 390px screens)
  - Header: "Hello, [Student Name]" greeting
  - Subject cards: Course name, code, green/red progress bar, percentage (XX/YY = ZZ%)
  - No Present/Absent buttons — strictly read-only
  - Design: matches existing project (white cards, blue accents, Inter font)
- [ ] Page: `src/pages/student/StudentCourseDetail.jsx`
  - Back button → returns to dashboard
  - Filter pills: All / Present / Absent (client-side filter)
  - Session cards: Date (e.g. "Fri 24 Jul"), Period/Hour, Status badge (green Present / red Absent)
  - Cards sorted newest first

### Sub-Phase 10D — Faculty Side Integration
**Deliverables:**
- [ ] Update `ImportExcelModal.jsx` — after import, call `provision-student` Edge Function for each new student
- [ ] Update `AddStudentModal.jsx` (single add) — call `provision-student` after save
- [ ] Update `useRemoveStudentFromClass` — call `provision-student` with `action='deactivate'` before deletion

**Rules:**
- Student portal is **strictly isolated** in `src/pages/student/` — no shared layout with faculty/HOD
- Student has **zero write access** to any table
- Account management is **exclusively** done through the Edge Function
- Design must be **mobile-first** — the student dashboard is primarily a phone experience
- **Do not break** any existing faculty or HOD feature during implementation

---

## Current Phase Tracker

```
Phase 1  — Project Foundation       [x] Complete
Phase 2  — Course & Students        [x] Complete
Phase 3  — Timetable & Holidays     [x] Complete
Phase 4  — Core Attendance          [x] Complete
Phase 5  — History & Edits          [x] Complete
Phase 6  — Excel & PDF Reports      [x] Complete
Phase 7  — Dashboard Analytics      [x] Complete
Phase 8  — Testing & Deployment     [x] Complete ← Version 1 LIVE: it-erp.vercel.app
Phase 9  — HOD Monitoring System    [x] Complete ← Version 2 LIVE
Phase 10 — Student Portal           [ ] In Progress ← Version 3 ACTIVE
  10A — Database & Edge Function    [ ] TODO
  10B — Auth & Routing              [ ] TODO
  10C — Student Dashboard UI        [ ] TODO
  10D — Faculty Side Integration    [ ] TODO
```


# System Architecture

## Role of This File

This file defines the complete structural blueprint of the Faculty Attendance Management System. The AI agent must read this file before generating any folder, file, route, or component. Architecture decisions defined here are **final and non-negotiable**.

---

## High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (SPA)                         │
│              React 18 + Vite 5 + Tailwind CSS 3               │
│  ┌──────────┐  ┌────────────────┐  ┌───────────────────────┐  │
│  │  Faculty  │  │  HOD (V2 ✅)   │  │  Student (V3 🔧)      │  │
│  │  (V1 ✅)  │  │  Read-only     │  │  Mobile-first,        │  │
│  │          │  │  Department    │  │  read-only portal     │  │
│  │          │  │  Monitoring    │  │  /student/*           │  │
│  └──────────┘  └────────────────┘  └───────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
         │                │                      │
         ▼                ▼                      ▼
┌───────────────────────────────────────────────────────────────┐
│                  SUPABASE BACKEND LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Auth System │  │  PostgreSQL  │  │   Edge Functions   │  │
│  │ (Email/Pass) │  │   Database   │  │ (Admin Auth Ops)   │  │
│  │  role-aware  │  │   Full RLS   │  │  provision-student │  │
│  └──────────────┘  └──────────────┘  └────────────────────┘  │
│  ┌──────────────┐                                             │
│  │   Row Level  │                                             │
│  │   Security   │                                             │
│  └──────────────┘                                             │
└───────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│                   HOSTING LAYER                     │
│               Vercel (Edge Network)                 │
│           Live: https://it-erp.vercel.app           │
└─────────────────────────────────────────────────────┘
```

---

## Folder Structure — CANONICAL (NEVER DEVIATE)

```
src/
│
├── assets/                     ← Static assets (logo, images)
│
├── components/                 ← Reusable UI components
│   ├── layout/                 ← Sidebar, MobileNav, DashboardLayout
│   ├── attendance/             ← StudentRow, AttendanceGrid
│   ├── courses/                ← CourseCard, AddCourseModal
│   ├── students/               ← StudentList, AddStudentModal, ImportExcelModal
│   ├── hod/                    ← HOD-specific components
│   └── ui/                     ← Button, Input, Modal, Badge (custom)
│
├── contexts/                   ← React Context providers
│   └── AuthContext.jsx         ← Auth state (user, session, role, loading)
│
├── hooks/                      ← Custom React Query hooks
│   ├── useAuth.js              ← Login, logout, session, role
│   ├── useCourses.js           ← Fetch and mutate courses
│   ├── useStudents.js          ← Fetch and mutate students
│   ├── useAttendance.js        ← Fetch and save attendance
│   ├── useClasses.js           ← Fetch class sections
│   ├── useDashboard.js         ← Dashboard stats and schedule
│   ├── useHod.js               ← HOD-specific read queries
│   ├── useHolidays.js          ← Fetch and mutate holidays
│   └── useStudentPortal.js     ← [V3] Student's own attendance queries (NEW)
│
├── lib/
│   └── supabase.js             ← Single Supabase client instance (anon key ONLY)
│
├── pages/                      ← Full-page route components
│   ├── LoginPage.jsx           ← Shared login for all roles
│   ├── DashboardPage.jsx       ← Faculty dashboard
│   ├── ClassesPage.jsx         ← Classes & Roster master list
│   ├── CoursesPage.jsx
│   ├── CourseDetailPage.jsx
│   ├── AttendancePage.jsx
│   ├── HistoryPage.jsx
│   ├── ReportsPage.jsx
│   ├── LowAttendancePage.jsx
│   ├── SettingsPage.jsx
│   ├── hod/                    ← HOD-only pages
│   │   ├── HodDashboard.jsx
│   │   ├── HodClassDetail.jsx
│   │   └── HodCourseDetail.jsx
│   └── student/                ← [V3] Student-only pages (NEW — ISOLATED)
│       ├── StudentDashboard.jsx   ← Mobile-first home: subject cards + % bars
│       └── StudentCourseDetail.jsx ← Session-by-session history + All/Present/Absent filter
│
├── routes/
│   ├── AppRouter.jsx           ← Role-aware routing (faculty/hod/student)
│   └── ProtectedRoute.jsx      ← Auth guard wrapper
│
├── services/                   ← Supabase query functions
│   ├── coursesService.js
│   ├── studentsService.js
│   ├── attendanceService.js
│   ├── hodService.js           ← HOD read-only queries
│   ├── holidaysService.js
│   └── studentPortalService.js ← [V3] Student's read-only queries (NEW)
│
├── utils/                      ← Pure helper functions
│   ├── formatters.js           ← Date and text formatting
│   ├── exportExcel.js          ← SheetJS logic
│   └── generatePdf.js          ← jsPDF + AutoTable logic
│
├── main.jsx                    ← Vite entry point
└── index.css                   ← Tailwind base imports

supabase/
└── functions/
    └── provision-student/      ← [V3] Edge Function: create/disable auth accounts
        └── index.ts

public/
├── favicon.ico
└── manifest.json               ← PWA manifest

docs/                           ← Architecture and rule documents
.env.local                      ← Environment variables (anon key only)
vite.config.js
tailwind.config.js
package.json
```

---

## Route Architecture

All routes are defined in `src/routes/AppRouter.jsx` using React Router DOM v6.

```
PUBLIC ROUTES
/login               → Shared login screen for all roles (Faculty / HOD / Student)

FACULTY ROUTES (role = 'faculty')
/                    → Redirects to /dashboard
/dashboard           → Overview: stats, chart, today's classes
/classes             → Classes & Roster — master student lists, Import Excel
/courses             → Manage all subjects/courses
/courses/:id         → Course detail: students + timetable + low attendance tabs
/attendance          → Select course + hour → mark attendance
/history             → View and edit past attendance records
/reports             → Generate Excel/PDF reports
/low-attendance      → Students below 75% across all courses
/settings            → Manage holidays, preferences

HOD ROUTES (role = 'hod') — Read-Only
/hod/dashboard       → All class sections overview
/hod/class/:classId  → All subjects for a class with % + faculty name
/hod/course/:id      → Daily attendance detail + date picker + low attendance tab

STUDENT ROUTES (role = 'student') [V3] — Read-Only, Mobile-First
/student/dashboard           → Subject cards with attendance % progress bars
/student/course/:courseId    → Session-by-session history + All/Present/Absent filter
```

---

## Data Flow Architecture

### Auth Flow (Role-Aware)
```
User enters email + password
    → supabase.auth.signInWithPassword()
    → AuthContext fetches role from faculty table OR user_metadata
    → role === 'faculty' → Redirect to /dashboard
    → role === 'hod'     → Redirect to /hod/dashboard
    → role === 'student' → Redirect to /student/dashboard
    → ProtectedRoute checks session + role on every route change
```

### Student Account Provisioning Flow (V3)
```
Faculty imports/adds student in Classes & Roster
    → studentsService.bulkImportStudentsToClass() saves to students table
    → Frontend calls Supabase Edge Function: provision-student
    → Edge Function (using service_role key):
        → Checks if auth account already exists for roll_number@crescent.education
        → If not: supabase.auth.admin.createUser() → creates account
        → If banned (deactivated): re-enables account
        → Returns auth user id
    → students.auth_user_id updated with returned auth id

Faculty removes student from roster
    → studentsService.removeStudentFromClass() deletes from students table
    → Frontend calls provision-student Edge Function with action='deactivate'
    → Edge Function: supabase.auth.admin.updateUser({ banned: true })
    → Student can no longer log in — historical attendance data preserved
```

### Student Attendance View Flow (V3)
```
Student logs in at /login
    → AuthContext detects role = 'student' from user_metadata
    → Redirect to /student/dashboard
    → studentPortalService.getMySubjects() fetches:
        → All courses where student is enrolled (via course_students)
        → Attendance % for each course calculated from attendance_details
    → Subject cards render with progress bars

Student taps a subject card
    → Navigate to /student/course/:courseId
    → studentPortalService.getMyCourseAttendance() fetches:
        → All attendance sessions for that course
        → Student's status (Present/Absent) for each session
    → Sessions render as cards sorted by date descending
    → Filter pills (All/Present/Absent) filter the list client-side
```

### Attendance Marking Flow (Faculty)
```
Faculty selects Course & Hour
    → React Query fetches enrolled students
    → All students default to Present
    → Faculty taps absentees to toggle
    → Taps "Save"
    → Zod validates all students are marked
    → attendanceService.saveAttendance() → Supabase upsert
    → toast.success() + redirect to history
```

### Report Generation Flow
```
Faculty selects criteria (Course, Date Range, Format)
    → React Query fetches attendance + attendance_details
    → exportExcel.js or generatePdf.js formats the data
    → Browser downloads the file
```

---

## System Boundaries

| Boundary | Rule |
|---|---|
| Frontend ↔ Supabase | All queries go through the single `src/lib/supabase.js` client (anon key only) |
| Faculty Data | Faculty can only view/modify their own data (enforced by RLS) |
| HOD Data | HOD can read all department data but cannot write anything (enforced by RLS) |
| Student Data | Students can only read their own attendance records (enforced by RLS + `auth.uid() = students.auth_user_id`) |
| Student Account Management | ONLY done via Supabase Edge Function (`provision-student`) using service_role key |
| Excel/PDF Exports | Generated entirely client-side |
| Authentication | Managed completely by Supabase Auth. Role determined by `faculty.role` column OR `user_metadata.role` |
| Route Protection | `AppRouter.jsx` redirects by role. `ProtectedRoute.jsx` checks session before rendering |
| Student Portal Isolation | `src/pages/student/` is fully isolated. No shared components with faculty or HOD pages |

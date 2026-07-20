# System Architecture

## Role of This File

This file defines the complete structural blueprint of the Faculty Attendance Management System. The AI agent must read this file before generating any folder, file, route, or component. Architecture decisions defined here are **final and non-negotiable**.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│               CLIENT LAYER (SPA)                    │
│         React 18 + Vite 5 + Tailwind CSS 3          │
│  ┌───────────┐  ┌───────────┐  ┌────────────────┐  │
│  │  Faculty  │  │ Students  │  │   Admin/HOD    │  │
│  │    App    │  │ (Future)  │  │    (Future)    │  │
│  └─────┬─────┘  └─────┬─────┘  └───────┬────────┘  │
└────────┼──────────────┼────────────────┼────────────┘
         │              │                │
         ▼              ▼                ▼
┌─────────────────────────────────────────────────────┐
│               SUPABASE BACKEND LAYER                │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │  Auth System │  │  PostgreSQL  │                 │
│  │ (Email/Pass) │  │   Database   │                 │
│  └──────────────┘  └──────────────┘                 │
│  ┌──────────────┐                                   │
│  │   Row Level  │                                   │
│  │   Security   │                                   │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│                   HOSTING LAYER                     │
│               Vercel (Edge Network)                 │
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
│   ├── layout/                 ← Sidebar, Header, PageWrapper
│   ├── attendance/             ← StudentRow, AttendanceGrid
│   ├── courses/                ← CourseCard, AddCourseModal
│   ├── students/               ← StudentList, AddStudentModal
│   └── ui/                     ← Button, Input, Modal, Badge (custom)
│
├── contexts/                   ← React Context providers
│   └── AuthContext.jsx         ← Auth state (user, session, loading)
│
├── hooks/                      ← Custom React Query hooks
│   ├── useAuth.js              ← Login, logout, session
│   ├── useCourses.js           ← Fetch and mutate courses
│   ├── useStudents.js          ← Fetch and mutate students
│   ├── useAttendance.js        ← Fetch and save attendance
│   └── useHolidays.js          ← Fetch and mutate holidays
│
├── lib/
│   └── supabase.js             ← Single Supabase client instance
│
├── pages/                      ← Full-page route components
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── CoursesPage.jsx
│   ├── CourseDetailPage.jsx
│   ├── AttendancePage.jsx
│   ├── HistoryPage.jsx
│   ├── ReportsPage.jsx
│   └── SettingsPage.jsx
│
├── routes/
│   ├── AppRouter.jsx           ← React Router DOM route definitions
│   └── ProtectedRoute.jsx      ← Auth guard wrapper
│
├── services/                   ← Supabase query functions
│   ├── coursesService.js
│   ├── studentsService.js
│   ├── attendanceService.js
│   └── holidaysService.js
│
├── utils/                      ← Pure helper functions
│   ├── formatters.js           ← Date and text formatting
│   ├── exportExcel.js          ← SheetJS logic
│   └── generatePdf.js          ← jsPDF + AutoTable logic
│
├── App.jsx                     ← Root component, providers
├── main.jsx                    ← Vite entry point
└── index.css                   ← Tailwind base imports

public/
├── favicon.ico
└── manifest.json               ← PWA manifest

docs/                           ← Architecture and rule documents
.env.local                      ← Environment variables
vite.config.js
tailwind.config.js
postcss.config.js
package.json
```

---

## Route Architecture

All routes are defined in `src/routes/AppRouter.jsx` using React Router DOM v6.

```
PUBLIC ROUTES
/login               → Faculty login screen

PROTECTED ROUTES (ProtectedRoute checks Supabase session)
/                    → Redirects to /dashboard
/dashboard           → Overview: course cards + quick actions
/courses             → Manage all courses
/courses/:id         → Course detail: students + timetable tabs
/attendance          → Select course + hour → mark attendance
/history             → View and edit past attendance records
/reports             → Generate Excel/PDF reports
/settings/holidays   → Manage non-working days
```

---

## Data Flow Architecture

### Auth Flow
```
User enters email + password
    → supabase.auth.signInWithPassword()
    → On success: store session in AuthContext
    → Redirect to /dashboard
    → ProtectedRoute checks session on every route change
```

### Attendance Marking Flow
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
| Frontend ↔ Supabase | All queries go through the single `src/lib/supabase.js` client |
| Faculty Data | Faculty can only view/modify their own data (enforced by RLS) |
| Excel/PDF Exports | Generated entirely client-side |
| Authentication | Managed completely by Supabase Auth (Email/Password) |
| Route Protection | `ProtectedRoute.jsx` checks `supabase.auth.getSession()` before rendering |

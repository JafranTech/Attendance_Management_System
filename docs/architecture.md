# System Architecture

## Role of This File

This file defines the complete structural blueprint of the Faculty Attendance Management System. The AI agent must read this file before generating any folder, file, route, or component. Architecture decisions defined here are **final and non-negotiable** — do not restructure without explicit instruction.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT LAYER (WEB)                 │
│         Next.js 15 (App Router) + Tailwind CSS      │
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
│  │ (Email/Role) │  │   Database   │                 │
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
attendance-system/
│
├── public/
│   ├── favicon.ico
│   └── logo.png
│
├── app/                        ← Next.js 15 App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx        ← Faculty login page
│   ├── dashboard/
│   │   ├── page.tsx            ← Main dashboard
│   │   ├── courses/            ← Course management
│   │   │   └── page.tsx
│   │   ├── attendance/         ← Attendance marking
│   │   │   └── page.tsx
│   │   ├── history/            ← Attendance history & edit
│   │   │   └── page.tsx
│   │   ├── reports/            ← Excel & PDF reports
│   │   │   └── page.tsx
│   │   └── settings/           ← User settings
│   │       └── page.tsx
│   ├── layout.tsx              ← Root layout (fonts, providers)
│   └── page.tsx                ← Landing/Redirect to login
│
├── components/                 ← Reusable UI components
│   ├── ui/                     ← shadcn/ui components (buttons, cards, etc.)
│   ├── layout/                 ← Navbar, Sidebar, Page containers
│   ├── attendance/             ← Attendance specific (StudentList, DatePicker)
│   ├── courses/                ← Course specific (CourseCard, AddCourseModal)
│   └── reports/                ← Report specific components
│
├── hooks/                      ← Custom React hooks
│   ├── useAuth.ts              ← Authentication state
│   ├── useCourses.ts           ← Course fetching
│   └── useAttendance.ts        ← Attendance logic
│
├── lib/                        
│   ├── supabase/               
│   │   ├── client.ts           ← Supabase browser client
│   │   └── server.ts           ← Supabase server client
│   └── utils.ts                ← Tailwind clsx/twMerge utility (from shadcn)
│
├── types/                      ← TypeScript definitions
│   └── database.types.ts       ← Supabase generated types
│
├── utils/                      ← Helper functions
│   ├── formatters.ts           ← Date and name formatting
│   ├── exportExcel.ts          ← SheetJS logic
│   └── generatePdf.ts          ← jsPDF + AutoTable logic
│
├── docs/                       ← Architecture and rule documents
│   ├── gemini.md
│   ├── architecture.md
│   ├── tech-stack.md
│   ├── ui-design.md
│   ├── backend-design.md
│   ├── database-schema.md
│   ├── agent-rules.md
│   └── development-roadmap.md
│
├── middleware.ts               ← Next.js middleware for route protection
├── .env.local                  ← Environment variables
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Route Architecture

All routes are defined in the `app/` directory using Next.js conventions.

```
PUBLIC ROUTES
/                    → Redirects to /login if not authenticated
/login               → Faculty login screen

PROTECTED ROUTES (Middleware enforces auth)
/dashboard           → Overview of courses, pending attendance
/dashboard/courses   → Manage courses and student mapping
/dashboard/attendance→ Select course and hour to take attendance
/dashboard/history   → View and edit past attendance records
/dashboard/reports   → Generate Excel/PDF reports
```

### Route Protection (Middleware)

`middleware.ts` intercepts all requests to `/dashboard/*`. If no active Supabase session exists, it redirects the user to `/login`. If logged in, it allows the request.

---

## Data Flow Architecture

### Attendance Marking Flow
```
Faculty selects Course & Hour
    → Server fetches enrolled students (Server Component)
    → Data passed to Client Component (Attendance interface)
    → Faculty marks Present/Absent (default: Present)
    → Taps "Save"
    → Zod validation (checks if all students are marked)
    → Client sends bulk insert/update to Supabase via Server Action or API
    → On success: redirect to Dashboard or History with Toast
```

### Report Generation Flow
```
Faculty selects criteria (Course, Date Range, Format)
    → Submits form
    → System queries Supabase for `attendance` and `attendance_details`
    → Data formatting utility transforms raw rows into structured tables
    → Excel Flow: SheetJS generates .xlsx and triggers download
    → PDF Flow: jsPDF + AutoTable generates PDF with College Logo and headers
```

---

## System Boundaries

| Boundary | Rule |
|---|---|
| Frontend ↔ Supabase | Next.js Server Components query Supabase directly using cookies. Client components use `createBrowserClient`. |
| Faculty Data | Faculty can only view/modify their own courses and attendance data (Enforced by RLS). |
| Excel/PDF Exports | Generated entirely client-side using SheetJS/jsPDF to save server compute. |
| Authentication | Managed completely by Supabase Auth (Email/Password). |

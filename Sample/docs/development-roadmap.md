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
- [ ] Responsive UI testing (Mobile, Tablet, Desktop)
- [ ] Edge cases tested (e.g., trying to mark attendance for empty courses)
- [ ] Production build (`npm run build`)
- [ ] Deploy to Vercel
- [ ] Set production environment variables

---

## Current Phase Tracker

```
Phase 1 — Project Foundation       [ ] In Progress  [ ] Complete
Phase 2 — Course & Students        [ ] In Progress  [ ] Complete
Phase 3 — Timetable & Holidays     [ ] In Progress  [ ] Complete
Phase 4 — Core Attendance          [ ] In Progress  [ ] Complete
Phase 5 — History & Edits          [ ] In Progress  [ ] Complete
Phase 6 — Excel & PDF Reports      [ ] In Progress  [ ] Complete
Phase 7 — Dashboard Analytics      [ ] In Progress  [ ] Complete
Phase 8 — Testing & Deployment     [ ] In Progress  [ ] Complete
```

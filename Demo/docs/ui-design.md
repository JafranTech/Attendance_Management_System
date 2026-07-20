# UI/UX Design Guide

## Role of This File

This file is the single source of truth for every visual decision in the Faculty Attendance Management System. The AI agent must apply these tokens, patterns, and rules to every component it generates. Do not invent colors, spacing, or typography outside of this system.

> **Design Identity:** Mobile-First, Minimal, Fast, and Faculty-Centric. Every interaction is optimized to minimize the number of clicks required for taking attendance. The interface emphasizes clarity, consistency, and speed over unnecessary visual complexity. Inspired by Google Workspace and Material Design.

---

## Color Palette — FIXED (NEVER CHANGE)

```
Primary Blue:       #2563EB     ← Primary buttons, active states, branding
Primary Hover:      #1D4ED8     ← Hover states for primary elements
Background (Body):  #F8FAFC     ← App background (slate-50)
Surface (Cards):    #FFFFFF     ← Card backgrounds, modals
Border:             #E5E7EB     ← Dividers, input borders
Success Green:      #16A34A     ← 'Present' state, success toasts
Danger Red:         #DC2626     ← 'Absent' state, error toasts, delete actions
Warning Amber:      #F59E0B     ← Low attendance highlights, pending states
Text Primary:       #111827     ← Main headings, body text
Text Secondary:     #6B7280     ← Subtitles, placeholders, minor details
```

---

## Typography

```
Font Family:   'Inter', system-ui, sans-serif
```

### Scale
```
Page Title:     text-3xl font-bold      (32px)
Section Title:  text-2xl font-bold      (24px)
Card Title:     text-xl font-semibold   (20px)
Body:           text-base font-normal   (16px)
Label:          text-sm font-medium     (14px)
Caption:        text-xs font-normal     (12px)
```

---

## Spacing and Layout

- **Grid System:** Consistent 8px grid (`gap-4`, `p-4`, `mt-8`).
- **Page padding (mobile):** `px-4 py-4`
- **Page padding (desktop):** `px-8 py-6`
- **Card padding:** `p-4` or `p-6`

---

## Border Radius & Shadows

```
Buttons:          rounded-lg (12px)
Cards:            rounded-xl (12px)
Input fields:     rounded-lg
Shadows:          Soft only (shadow-sm, shadow-md). Never use heavy shadows.
```

---

## Component Patterns (shadcn/ui overrides)

### Buttons
- **Primary:** Filled Blue (`bg-blue-600 hover:bg-blue-700 text-white`). Minimum height `44px` for touch targets on mobile.
- **Secondary:** Outline (`border-gray-200 text-gray-900 hover:bg-gray-50`).
- **Danger:** Filled Red (`bg-red-600 hover:bg-red-700 text-white`).
- **Disabled:** Grayed out (`opacity-50 cursor-not-allowed`).

### Cards
- Clean white background (`bg-white`).
- Border (`border border-gray-100`).
- Soft shadow (`shadow-sm`).
- Rounded corners (`rounded-xl`).

---

## Screen-by-Screen Design Specification

### 1. Login Screen
- Minimal layout. Centered card on a light gray background (`#F8FAFC`).
- Form: Email, Password, Login Button (Primary).
- Forgot Password link (Disabled for V1).

### 2. Dashboard
- **Top:** Welcome message, Date.
- **Stats:** 3 Cards (Total Courses, Pending Attendances today, Quick Report).
- **Recent Activity:** Quick view of the last 3 attendance sessions logged.
- **Navigation:** Sidebar on Desktop, Bottom Tab Bar or Hamburger Menu on Mobile.

### 3. Course Management
- **List View:** Grid of Course Cards (Code, Name, Semester, Student Count).
- **Course Detail:** Tabs for "Overview", "Students", "Timetable".
- **Student List:** Clean table. Add Student button opens a modal. Import Excel button adjacent.

### 4. Attendance Marking Screen (Critical UX)
- **Header:** Course Name, Date, Hour.
- **Body:** List of students. 
- **Interaction:**
  - ALL students default to "Present" (Green text/icon).
  - Tapping a student toggles them to "Absent" (Red text/icon).
  - Tapping again toggles back.
- **Bottom:** Sticky bottom bar on mobile with "Review & Save" button (Primary Blue). 
- *Rule: Maximum three taps to reach this screen from dashboard.*

### 5. History & Edit
- **List:** Chronological list of past attendance sessions.
- **Detail:** View who was present/absent.
- **Edit Action:** Clicking "Edit" opens a modal. Modifying a record shows a required "Reason for Edit" text area before saving.

### 6. Reports Screen
- Clean form to select Course, Start Date, End Date.
- Two primary action buttons side-by-side: "Download Excel" (Green tint) and "Download PDF" (Red tint).

---

## Responsive & UX Rules

- **Mobile First:** All interfaces must work flawlessly on a 390px width screen.
- **Touch Targets:** Any clickable element must be at least 44x44px.
- **One Primary Action:** Each screen should have exactly one primary highlighted button.
- **Sticky Actions:** On long scrolling lists (like attendance taking), the 'Save' button must be sticky at the bottom of the viewport.
- **Animations:** Keep them minimal. Use 200ms smooth transitions for hover states and modal fades. Avoid heavy bouncing or sliding.

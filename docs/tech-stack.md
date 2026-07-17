# Technology Stack

## Role of This File

This file defines every library and tool used in the Faculty Attendance Management System. The AI agent must use **exactly these libraries**. Do not substitute, upgrade, or add libraries without explicit instruction. Every choice here is intentional.

---

## Core Framework

| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | React framework, routing, server components, server actions |
| React 19 | Underlying UI library |
| Tailwind CSS 3.x | Utility-first styling |
| TypeScript | Static typing |

### Setup Command
```bash
npx create-next-app@latest attendance-system
# Select: TypeScript, Tailwind CSS, ESLint, App Router, src/ directory = No
```

---

## UI Components & Icons

| Technology | Purpose |
|---|---|
| shadcn/ui | Radix-based accessible components (Cards, Buttons, Inputs, Tables) |
| Lucide React | Consistent stroke icons |
| clsx & tailwind-merge | Utility for merging Tailwind classes dynamically |

### Setup Command
```bash
npx shadcn@latest init
npx shadcn@latest add button card input table select dialog toast
```

---

## Backend and Database

| Technology | Purpose |
|---|---|
| @supabase/supabase-js | Supabase browser client |
| @supabase/ssr | Supabase server-side rendering helpers (auth and cookies) |

### Supabase Client Setup (Server) — `lib/supabase/server.ts`
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
```

---

## Forms & Validation

| Technology | Purpose |
|---|---|
| React Hook Form | Efficient client-side form state management |
| Zod | Schema declaration and validation |
| @hookform/resolvers | Connects Zod to React Hook Form |

---

## Reports & Exports

| Technology | Purpose |
|---|---|
| xlsx (SheetJS) | Generating and downloading Excel files |
| jspdf | Generating PDF documents |
| jspdf-autotable | Generating tables inside PDFs easily |

### Example PDF Generation — `utils/generatePdf.ts`
```ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToPDF(data) {
  const doc = new jsPDF();
  doc.text("Faculty Attendance Report", 14, 15);
  autoTable(doc, {
    head: [['Roll No', 'Name', 'Percentage']],
    body: data.map(row => [row.rollNo, row.name, row.percentage]),
    startY: 20,
  });
  doc.save('attendance_report.pdf');
}
```

---

## Charts and Analytics

| Technology | Purpose |
|---|---|
| Recharts | Dashboard charts (e.g., attendance trends) |

---

## Utilities

| Technology | Purpose |
|---|---|
| date-fns | Date formatting, calculations, and parsing |

---

## Environment Variables — `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Rule:** All environment variables exposed to the client must be prefixed with `NEXT_PUBLIC_`. Never hardcode these values in any source file.

---

## What Is Intentionally Excluded

| Excluded | Reason |
|---|---|
| Redux / Zustand | Next.js Server Components and simple React state handle data flows adequately. |
| Axios | Native `fetch` or Supabase client handles all HTTP requests. |
| React Query | We use Next.js Server Components caching and revalidation instead of client-side fetching. |

# Technology Stack

## Role of This File

This file defines every library and tool used in the Faculty Attendance Management System. The AI agent must use **exactly these libraries**. Do not substitute, upgrade, or add libraries without explicit instruction.

---

## Core Framework

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI Component Framework |
| Vite | 5.x | Build Tool and Development Server |
| React Router DOM | 6.x | Client-side Routing |
| Tailwind CSS | 3.x | Utility-first CSS Framework |

### Setup Command
```bash
npm create vite@latest . -- --template react
npm install
```

---

## Backend & Database

| Technology | Version | Purpose |
|---|---|---|
| @supabase/supabase-js | 2.x | Authentication, PostgreSQL Database, API |

### Supabase Client — `src/lib/supabase.js`
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

> **Rule:** Create the Supabase client only once. Every component, hook, and service must import this single instance. Never create multiple Supabase clients.

---

## Data Fetching & Server State

| Technology | Version | Purpose |
|---|---|---|
| @tanstack/react-query | 5.x | Server State Management, Caching, Background Refetch |

### React Query Setup — `src/main.jsx`
```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

> **Rule:** Every Supabase database operation must use React Query. Avoid fetching data directly inside `useEffect`.

---

## Forms & Validation

| Technology | Version | Purpose |
|---|---|---|
| react-hook-form | 7.x | Form Handling |
| zod | 3.x | Form Validation |
| @hookform/resolvers | latest | RHF + Zod Integration |

---

## UI & Icons

| Technology | Version | Purpose |
|---|---|---|
| lucide-react | latest | Modern Icon Library |
| react-hot-toast | 2.x | Toast Notifications |
| clsx | 2.x | Conditional Tailwind Classes |

### Toast Examples
```javascript
toast.success("Attendance Saved Successfully")
toast.error("Failed to Save Attendance")
toast("Generating Excel Report...")
```

---

## Reports

| Technology | Version | Purpose |
|---|---|---|
| xlsx | latest | Excel Report Generation |
| jspdf | latest | PDF Generation |
| jspdf-autotable | latest | Attendance Table inside PDF |

---

## Charts & Analytics

| Technology | Version | Purpose |
|---|---|---|
| recharts | 2.x | Dashboard Analytics |

---

## Utilities

| Technology | Version | Purpose |
|---|---|---|
| date-fns | 3.x | Date Formatting & Calculations |

---

## Environment Variables — `.env.local`
```env
VITE_SUPABASE_URL=https://dhbiagnhjzkkxfcyqpct.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_d-p-zfFB4DVzyIwDiN_3sg_no6kCMIq
```

> **Rule:** Never hardcode Supabase credentials. Always use `import.meta.env.VITE_*`.

---

## Complete Install Command
```bash
npm install \
  @supabase/supabase-js \
  @tanstack/react-query \
  react-router-dom \
  react-hook-form \
  zod \
  @hookform/resolvers \
  lucide-react \
  react-hot-toast \
  clsx \
  xlsx \
  jspdf \
  jspdf-autotable \
  recharts \
  date-fns

npm install -D \
  tailwindcss \
  postcss \
  autoprefixer
```

---

## What Is Intentionally Excluded

| Excluded | Reason |
|---|---|
| Next.js | React + Vite is sufficient and simpler |
| TypeScript | Plain JavaScript keeps v1 simpler and faster to develop |
| Redux / Zustand | React Query handles server state; React state handles UI state |
| Axios | Supabase client handles all requests |
| @supabase/ssr | Not needed — single-page app uses browser client only |

---

## Hosting

| Technology | Purpose |
|---|---|
| Vercel | Frontend Hosting |
| Supabase | Backend + Database |

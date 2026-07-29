# IT ERP - Attendance Management System

Welcome to the **IT ERP** project! This is a modern, mobile-first Web Application designed for university and college faculties to effortlessly manage courses, students, and track daily attendance. 

---

## 🚀 Tech Stack

This project is built using a modern, highly scalable, and lightning-fast technology stack:

- **Frontend Framework:** [React.js](https://react.js.org/) powered by [Vite](https://vitejs.dev/) for blazing fast development and builds.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for beautiful, responsive, and custom utility-based UI design.
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL) for real-time database management, automated APIs, and secure data storage.
- **Authentication:** Supabase Auth for secure faculty login sessions.
- **Hosting:** [Vercel](https://vercel.com/) for automated, seamless, and high-performance edge network deployments.
- **PWA (Progressive Web App):** Users can install the application directly to their mobile home screens. Configured as "Online-Only" to guarantee users always receive the newest updates instantly upon launch without caching conflicts.

---

## ✨ Key Features

### 1. 🔐 Secure Authentication
- Faculty members log in securely using their credentials.
- Protected routing ensures unauthorized users cannot access sensitive data.

### 2. 📊 Interactive Dashboard
- A high-level overview of the day's tasks.
- Quick statistics on attendance rates, total students, and assigned courses.

### 3. 📚 Course & Student Management
- **Courses:** Add, edit, or delete courses. Assign specific faculty members to courses.
- **Students:** Register new students, update details, and map students to their respective courses.

### 4. 📝 Smart Attendance Tracking
- **List View:** A traditional table view to quickly mark students as Present or Absent.
- **Quick Entry (Mobile Optimized):** A beautiful card-swiping interface perfect for mobile phones to quickly tap through student rosters.
- **Validation:** Smart validation prevents faculty from submitting attendance if any student is left unmarked.

### 5. 📅 History & Editing
- View historical attendance records filtered by date and course.
- **Editable Records:** Faculty can go back to previous days and edit attendance mistakes seamlessly.

### 6. 📥 Excel Exporting
- Export attendance reports directly to `.xlsx` Excel files for administrative reporting and permanent record keeping.

### 7. 📱 Mobile-First Design
- The UI dynamically adapts based on the device.
- **Desktop:** Features a persistent left-hand sidebar for easy navigation.
- **Mobile:** Features a modern, bottom-sticky navigation bar (like native iOS/Android apps) for perfect thumb reachability.

---

## 🛠 How It Works (Architecture)

1. **The Client (Vite + React):** The user accesses the app via `it-erp.vercel.app`. The React application loads into their browser.
2. **The API (Supabase):** When a user requests data (like a list of students), React uses the Supabase JavaScript Client to securely query the PostgreSQL database.
3. **Row Level Security (RLS):** Supabase ensures that faculty can only see and modify data they are authorized to access.
4. **Deployments:** Pushing code to the `main` branch automatically triggers Vercel to build the Vite project and deploy it globally within seconds.

---

## 💻 Running Locally for Development

To run this project on your local machine:

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:**
   Ensure you have a `.env.local` file in the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
4. **Build for Production:**
   ```bash
   npm run build
   ```

---

*Designed and engineered for peak efficiency in educational IT administration.*

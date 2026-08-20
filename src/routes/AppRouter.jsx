import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { AdminLayout } from '../components/layout/AdminLayout'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import CoursesPage from '../pages/CoursesPage'
import CourseDetailPage from '../pages/CourseDetailPage'
import AttendancePage from '../pages/AttendancePage'
import HistoryPage from '../pages/HistoryPage'
import ReportsPage from '../pages/ReportsPage'
import SettingsPage from '../pages/SettingsPage'
import LowAttendancePage from '../pages/LowAttendancePage'
import ClassesPage from '../pages/ClassesPage'
import HodDashboard from '../pages/hod/HodDashboard'
import HodClassDetail from '../pages/hod/HodClassDetail'
import HodCourseDetail from '../pages/hod/HodCourseDetail'
import HodSettings from '../pages/hod/HodSettings'
import StudentDashboard from '../pages/student/StudentDashboard'
import StudentCourseDetail from '../pages/student/StudentCourseDetail'
import StudentSettings from '../pages/student/StudentSettings'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminClassesPage from '../pages/admin/AdminClassesPage'
import AdminStudentPasswordsPage from '../pages/admin/AdminStudentPasswordsPage'
import { useAuth } from '../hooks/useAuth'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { OfflineBlocker } from '../components/ui/OfflineBlocker'
import Logo from '../assets/Logo.jpeg'

// Faculty layout wrapper — blocks HOD, admin, and students from faculty pages
function ProtectedLayout({ children }) {
  const { role } = useAuth()
  if (role === 'hod') return <Navigate to="/hod/dashboard" replace />
  if (role === 'student') return <Navigate to="/student/dashboard" replace />
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}

// Admin layout wrapper — only admins can access /admin/* routes
function AdminProtectedRoute({ children }) {
  const { user, role, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role !== 'admin') return <Navigate to="/login" replace />
  return (
    <AdminLayout>{children}</AdminLayout>
  )
}

// HOD layout wrapper — blocks faculty, admin, and students from HOD pages
function HodProtectedRoute({ children }) {
  const { user, role, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role === 'faculty') return <Navigate to="/dashboard" replace />
  if (role === 'student') return <Navigate to="/student/dashboard" replace />
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return children
}

// Student route wrapper — blocks faculty, HOD, and admin from student pages
function StudentProtectedRoute({ children }) {
  const { user, role, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role === 'faculty') return <Navigate to="/dashboard" replace />
  if (role === 'hod') return <Navigate to="/hod/dashboard" replace />
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return children
}

export function AppRouter() {
  const { loading, role } = useAuth()
  const isOnline = useOnlineStatus()

  if (!isOnline) {
    return <OfflineBlocker />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 animate-pulse">
        <img src={Logo} alt="IT Department Logo" className="w-32 h-32 object-contain mb-6 drop-shadow-md rounded-2xl" />
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Information Technology ERP</h1>
        <p className="text-sm text-slate-500 font-medium mt-2 tracking-wide uppercase">Attendance Management System</p>
        <div className="mt-8 flex gap-1.5">
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Root redirect — role-aware */}
      <Route
        path="/"
        element={
          role === 'hod'
            ? <Navigate to="/hod/dashboard" replace />
            : role === 'student'
            ? <Navigate to="/student/dashboard" replace />
            : role === 'admin'
            ? <Navigate to="/admin/dashboard" replace />
            : <Navigate to="/dashboard" replace />
        }
      />

      {/* Faculty routes */}
      <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/classes" element={<ProtectedLayout><ClassesPage /></ProtectedLayout>} />
      <Route path="/courses" element={<ProtectedLayout><CoursesPage /></ProtectedLayout>} />
      <Route path="/courses/:id" element={<ProtectedLayout><CourseDetailPage /></ProtectedLayout>} />
      <Route path="/attendance" element={<ProtectedLayout><AttendancePage /></ProtectedLayout>} />
      <Route path="/history" element={<ProtectedLayout><HistoryPage /></ProtectedLayout>} />
      <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
      <Route path="/low-attendance" element={<ProtectedLayout><LowAttendancePage /></ProtectedLayout>} />

      {/* HOD routes */}
      <Route path="/hod/dashboard" element={<HodProtectedRoute><HodDashboard /></HodProtectedRoute>} />
      <Route path="/hod/class/:classId" element={<HodProtectedRoute><HodClassDetail /></HodProtectedRoute>} />
      <Route path="/hod/course/:courseId" element={<HodProtectedRoute><HodCourseDetail /></HodProtectedRoute>} />
      <Route path="/hod/settings" element={<HodProtectedRoute><HodSettings /></HodProtectedRoute>} />

      {/* Student routes — isolated, mobile-first, read-only */}
      <Route path="/student/dashboard" element={<StudentProtectedRoute><StudentDashboard /></StudentProtectedRoute>} />
      <Route path="/student/course/:courseId" element={<StudentProtectedRoute><StudentCourseDetail /></StudentProtectedRoute>} />
      <Route path="/student/settings" element={<StudentProtectedRoute><StudentSettings /></StudentProtectedRoute>} />

      {/* Admin routes — fully isolated from faculty/hod/student */}
      <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>} />
      <Route path="/admin/classes" element={<AdminProtectedRoute><AdminClassesPage /></AdminProtectedRoute>} />
      <Route path="/admin/student-passwords" element={<AdminProtectedRoute><AdminStudentPasswordsPage /></AdminProtectedRoute>} />
    </Routes>
  )
}


import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import CoursesPage from '../pages/CoursesPage'
import CourseDetailPage from '../pages/CourseDetailPage'
import AttendancePage from '../pages/AttendancePage'
import HistoryPage from '../pages/HistoryPage'
import ReportsPage from '../pages/ReportsPage'
import SettingsPage from '../pages/SettingsPage'
import LowAttendancePage from '../pages/LowAttendancePage'
import { useAuth } from '../hooks/useAuth'
import Logo from '../assets/Logo.jpeg'

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}

export function AppRouter() {
  const { loading } = useAuth()

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
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/courses" element={<ProtectedLayout><CoursesPage /></ProtectedLayout>} />
      <Route path="/courses/:id" element={<ProtectedLayout><CourseDetailPage /></ProtectedLayout>} />
      <Route path="/attendance" element={<ProtectedLayout><AttendancePage /></ProtectedLayout>} />
      <Route path="/history" element={<ProtectedLayout><HistoryPage /></ProtectedLayout>} />
      <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
      <Route path="/low-attendance" element={<ProtectedLayout><LowAttendancePage /></ProtectedLayout>} />
    </Routes>
  )
}

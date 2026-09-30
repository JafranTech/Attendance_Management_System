import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { LogIn, Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Logo from '../assets/Logo.jpeg'
import CrescLogo from '../assets/campus-bg.webp'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const { signIn, session, loading, role } = useAuth()
  const navigate = useNavigate()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Responsive state: < 1024px is Mobile View (Glassmorphism), >= 1024px is Desktop View (Split Screen)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  // Auto-redirect if already logged in
  if (!loading && session) {
    if (role === 'hod') return <Navigate to="/hod/dashboard" replace />
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (role === 'student') return <Navigate to="/student/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (data) => {
    try {
      setIsLoggingIn(true)
      const result = await signIn(data.email, data.password)
      // Fetch the faculty profile to determine role before navigating
      const { data: profile } = await supabase
        .from('faculty')
        .select('role')
        .eq('id', result.user.id)
        .single()
      toast.success('Login successful!')
      if (profile?.role === 'hod') {
        navigate('/hod/dashboard', { replace: true })
      } else if (profile?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (result.user.user_metadata?.role === 'student') {
        navigate('/student/dashboard', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 1. MOBILE VIEW (< 1024px): Glassmorphism UI
  // ══════════════════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div
        className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat relative selection:bg-indigo-500 selection:text-white"
        style={{
          backgroundImage: `url("${CrescLogo}")`,
        }}
      >
        {/* Subtle background shade for contrast */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />

        {/* Glassmorphic Login Card */}
        <div
          className="relative z-10 w-full max-w-[390px] rounded-[28px] p-6 sm:p-9 text-center text-white"
          style={{
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.28)',
            boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.28), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
          }}
        >
          {/* Institute Logo Badge */}
          <div className="w-[88px] h-[88px] rounded-[22px] bg-white p-2.5 mx-auto mb-5 flex items-center justify-center shadow-lg shadow-black/15">
            <img
              src={Logo}
              alt="Institute Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          {/* Heading */}
          <h1 className="text-[22px] sm:text-[25px] font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
            Information Technology ERP
          </h1>
          <p className="text-[11px] sm:text-[12px] font-medium tracking-[2.2px] uppercase text-white/85 mt-1.5 mb-7 drop-shadow-sm">
            Attendance Management System
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left" autoComplete="off">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[13px] font-medium text-white/95 drop-shadow-sm">
                Email Address
              </label>
              <div
                className={`relative flex items-center rounded-[15px] overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-white/40 ${
                  errors.email
                    ? 'border border-red-400 bg-red-500/10'
                    : 'border border-white/35 bg-white/20 focus-within:border-white focus-within:bg-white/25'
                }`}
              >
                <Mail className="w-[18px] h-[18px] text-white/85 ml-4 shrink-0" />
                <input
                  id="email"
                  type="email"
                  autoComplete="off"
                  placeholder="Enter your email"
                  {...register('email')}
                  className="w-full bg-transparent border-none text-white text-[15px] placeholder:text-white/60 py-3.5 pl-3 pr-4 focus:outline-none focus:ring-0"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-200 font-medium ml-1 drop-shadow-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[13px] font-medium text-white/95 drop-shadow-sm">
                Password
              </label>
              <div
                className={`relative flex items-center rounded-[15px] overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-white/40 ${
                  errors.password
                    ? 'border border-red-400 bg-red-500/10'
                    : 'border border-white/35 bg-white/20 focus-within:border-white focus-within:bg-white/25'
                }`}
              >
                <Lock className="w-[18px] h-[18px] text-white/85 ml-4 shrink-0" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className="w-full bg-transparent border-none text-white text-[15px] placeholder:text-white/60 py-3.5 pl-3 pr-11 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/75 hover:text-white transition-colors p-1 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-200 font-medium ml-1 drop-shadow-sm">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn || loading}
                className="w-full py-3.5 px-4 rounded-[15px] text-white font-semibold text-[15px] sm:text-[16px] flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #6d5bf0 0%, #4834e0 100%)',
                  boxShadow: '0 6px 20px rgba(72, 52, 224, 0.55)',
                }}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-[18px] h-[18px]" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-[11px] sm:text-[12px] text-white/80 mt-6 font-normal drop-shadow-sm">
            © {new Date().getFullYear()} Crescent Institute of Science &amp; Technology
          </p>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 2. DESKTOP / LAPTOP / PC VIEW (>= 1024px): Original Split-Screen Layout
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL: Campus Image (Desktop only) ── */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden">
        {/* Campus Photo */}
        <img
          src={CrescLogo}
          alt="Crescent Institute of Science & Technology"
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
        {/* Gradient overlay from bottom — lighter so image is cleaner */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Content over image */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Top: Logo & Name */}
          <div className="flex items-center gap-3">
            <img
              src={Logo}
              alt="IT ERP Logo"
              className="w-10 h-10 object-contain rounded-xl shadow-lg ring-2 ring-white/20"
            />
            <div>
              <p className="text-white font-semibold text-sm leading-tight">Information Technology</p>
              <p className="text-white/60 text-xs">Attendance Management System</p>
            </div>
          </div>

          {/* Bottom: Quote / Info */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-0.5 w-8 bg-blue-400 rounded" />
                <span className="text-blue-400 text-xs font-semibold uppercase tracking-widest">Est. 1994</span>
              </div>
              <h2 className="text-white text-4xl font-bold leading-snug mb-3">
                Department of<br />
                <span className="text-blue-300">Information Technology</span>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                Empowering education through technology. Exclusive Faculty Portal for seamless attendance management and academic tracking.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
              {[
                { label: 'Courses', value: '50+' },
                { label: 'Faculty', value: '30+' },
                { label: 'Students', value: '500+' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-white font-bold text-xl">{value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Desktop heading */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest">Faculty Portal</p>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">Welcome back</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Sign in to access your attendance dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" autoComplete="off">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email-desktop">Email Address</Label>
              <Input
                id="email-desktop"
                type="email"
                autoComplete="off"
                {...register('email')}
                className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password-desktop">Password</Label>
              <div className="relative">
                <Input
                  id="password-desktop"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password')}
                  className={`pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full h-11 text-base font-semibold mt-2" disabled={isLoggingIn || loading}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-10">
            © {new Date().getFullYear()} Crescent Institute of Science & Technology
          </p>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { LogIn, Loader2, Eye, EyeOff, BookCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Logo from '../assets/Logo.jpeg'
import CrescLogo from '../assets/Login logo.png'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const { signIn, session, loading } = useAuth()
  const navigate = useNavigate()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const { role } = useAuth()

  if (!loading && session) {
    return <Navigate to={role === 'hod' ? '/hod/dashboard' : '/dashboard'} replace />
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
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL: Campus Image (Desktop only) ── */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden">
        {/* Campus Photo */}
        <img
          src={CrescLogo}
          alt="Crescent Institute of Science & Technology"
          className="absolute inset-0 w-full h-full object-cover"
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
          {/* Mobile logo (shown only when left panel is hidden) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src={Logo} alt="IT ERP Logo" className="w-16 h-16 object-contain rounded-2xl shadow-md mb-4" />
            <h1 className="text-xl font-bold text-slate-900 text-center">Information Technology ERP</h1>
            <p className="text-slate-500 mt-1 text-center text-xs uppercase tracking-wide">Attendance Management System</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest">Faculty Portal</p>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">Welcome back</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Sign in to access your attendance dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="faculty@crescent.education"
                {...register('email')}
                className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, GraduationCap, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import type { CourseSettings } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const [courseSettings, setCourseSettings] = useState<CourseSettings | null>(null)
  const [mode, setMode] = useState<'select' | 'admin'>('select')
  const [adminPassword, setAdminPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/course-settings')
      .then((r) => r.json())
      .then((d) => setCourseSettings(d))
      .catch(() => {})
  }, [])

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      })
      if (res.ok) {
        sessionStorage.setItem('isAdmin', 'true')
        toast.success('Selamat datang, Pensyarah!')
        router.push('/admin')
      } else {
        toast.error('Password tidak betul')
      }
    } finally {
      setLoading(false)
    }
  }

  const courseName = courseSettings?.course_name || 'Platform Pembelajaran'
  const courseCode = courseSettings?.course_code || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{courseName}</h1>
          {courseCode && (
            <p className="text-blue-200 text-sm mt-1">{courseCode}</p>
          )}
          {courseSettings?.lecturer_name && (
            <p className="text-blue-200 text-sm">
              {courseSettings.lecturer_name}
            </p>
          )}
        </div>

        {/* Mode Selection */}
        {mode === 'select' && (
          <div className="space-y-3">
            <button
              onClick={() => router.push('/student')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-5 flex items-center gap-4 transition-all shadow-lg"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Masuk sebagai Pelajar</p>
                <p className="text-sm text-gray-500">Akses nota, video & Cikgu AI</p>
              </div>
            </button>

            <button
              onClick={() => setMode('admin')}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl p-5 flex items-center gap-4 transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Saya Pensyarah</p>
                <p className="text-sm text-blue-200">Masuk dengan password</p>
              </div>
            </button>
          </div>
        )}

        {/* Admin Login Form */}
        {mode === 'admin' && (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <button
              onClick={() => setMode('select')}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
            >
              ← Kembali
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Log Masuk Pensyarah</h2>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Masukkan password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Sedang log masuk...' : 'Log Masuk'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-blue-200 text-xs mt-6">
          Platform Pembelajaran Digital © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen, ChevronRight,
  ClipboardList, MessageCircle, LogOut, GraduationCap
} from 'lucide-react'
import type { CourseSettings, Topic } from '@/types'

export default function StudentHome() {
  const router = useRouter()
  const [courseSettings, setCourseSettings] = useState<CourseSettings | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/course-settings', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/topics', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([cs, tp]) => {
      setCourseSettings(cs)
      setTopics(Array.isArray(tp) ? tp : [])
      setLoading(false)
    })
  }, [])

  function handleLogout() {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuatkan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm leading-none">
                {courseSettings?.course_name || 'Platform Pembelajaran'}
              </p>
              {courseSettings?.course_code && (
                <p className="text-xs text-gray-400">{courseSettings.course_code}</p>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">{courseSettings?.course_name || 'Selamat Datang'}</p>
              {courseSettings?.lecturer_name && (
                <p className="text-blue-100 text-sm">{courseSettings.lecturer_name}</p>
              )}
            </div>
          </div>
          {courseSettings?.course_description && (
            <p className="text-blue-100 text-sm mt-3">{courseSettings.course_description}</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/student/pastyear')}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <ClipboardList className="w-6 h-6 text-orange-500 mb-2" />
            <p className="font-semibold text-gray-800 text-sm">Past Year</p>
            <p className="text-xs text-gray-500 mt-0.5">Soalan peperiksaan lepas</p>
          </button>

          <button
            onClick={() => router.push('/student/ask-ai')}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <MessageCircle className="w-6 h-6 text-purple-500 mb-2" />
            <p className="font-semibold text-gray-800 text-sm">Tanya Cikgu AI</p>
            <p className="text-xs text-gray-500 mt-0.5">Soal apa sahaja tentang kursus</p>
          </button>
        </div>

        {/* Topics */}
        <div>
          <h2 className="font-bold text-gray-800 mb-3">📂 Topik-topik</h2>
          {topics.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Tiada topik lagi. Pensyarah belum memuatkan kandungan.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topics.map((topic, idx) => (
                <button
                  key={topic.id}
                  onClick={() => router.push(`/student/topic/${topic.id}`)}
                  className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{topic.title}</p>
                    {topic.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{topic.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {courseSettings?.lecturer_name && (
          <p className="text-center text-xs text-gray-400 pb-4">
            Pensyarah: {courseSettings.lecturer_name}
          </p>
        )}
      </main>
    </div>
  )
}

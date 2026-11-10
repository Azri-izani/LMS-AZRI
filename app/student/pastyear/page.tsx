'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ClipboardList, FileText, Eye, EyeOff } from 'lucide-react'
import type { PastYear } from '@/types'
import PdfFlipbook from '@/components/PdfFlipbook'

export default function PastYearPage() {
  const router = useRouter()
  const [items, setItems] = useState<PastYear[]>([])
  const [loading, setLoading] = useState(true)
  const [activePdf, setActivePdf] = useState<{ url: string; title: string } | null>(null)
  const [filterYear, setFilterYear] = useState<string>('all')

  useEffect(() => {
    fetch('/api/pastyear')
      .then(r => r.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  const years = [...new Set(items.map(i => i.year))].sort((a, b) => b - a)
  const filtered = filterYear === 'all' ? items : items.filter(i => i.year === Number(filterYear))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {activePdf && (
        <PdfFlipbook pdfUrl={activePdf.url} title={activePdf.title} onClose={() => setActivePdf(null)} />
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Soalan Past Year</p>
            <p className="text-xs text-gray-400">Koleksi soalan peperiksaan lepas</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Filter by year */}
        {years.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterYear('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterYear === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              Semua
            </button>
            {years.map(year => (
              <button
                key={year}
                onClick={() => setFilterYear(String(year))}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filterYear === String(year) ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-gray-100">
            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Tiada soalan past year lagi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.year} • {item.semester}</p>

                    <div className="flex gap-2 mt-3 flex-wrap">
                      <button
                        onClick={() => setActivePdf({ url: item.question_pdf_url, title: `${item.title} — Soalan` })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Baca Soalan
                      </button>

                      {item.answer_pdf_url && item.answer_visible && (
                        <button
                          onClick={() => setActivePdf({ url: item.answer_pdf_url!, title: `${item.title} — Skema Jawapan` })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Skema Jawapan
                        </button>
                      )}

                      {item.answer_pdf_url && !item.answer_visible && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg text-xs">
                          <EyeOff className="w-3.5 h-3.5" /> Skema belum tersedia
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

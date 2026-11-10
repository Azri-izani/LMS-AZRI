'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react'

interface PdfFlipbookProps {
  pdfUrl: string
  title: string
  onClose: () => void
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfjsLib: any
  }
}

export default function PdfFlipbook({ pdfUrl, title, onClose }: PdfFlipbookProps) {
  const [pages, setPages] = useState<string[]>([]) // Array of canvas data URLs
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1.2)
  const [flipping, setFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'left' | 'right'>('right')
  const containerRef = useRef<HTMLDivElement>(null)

  const renderPage = useCallback(async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf: any,
    pageNum: number,
    renderScale: number
  ): Promise<string> => {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: renderScale })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.height = viewport.height
    canvas.width = viewport.width
    await page.render({ canvasContext: context, viewport }).promise
    return canvas.toDataURL()
  }, [])

  useEffect(() => {
    // Load PDF.js dari CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = async () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

      try {
        const pdf = await window.pdfjsLib.getDocument(pdfUrl).promise
        setTotalPages(pdf.numPages)

        // Render semua pages
        const pageImages: string[] = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const dataUrl = await renderPage(pdf, i, scale)
          pageImages.push(dataUrl)
        }
        setPages(pageImages)
        setLoading(false)
      } catch (err) {
        console.error('PDF load error:', err)
        setLoading(false)
      }
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl])

  function goNext() {
    if (currentPage < totalPages - 1 && !flipping) {
      setFlipDirection('right')
      setFlipping(true)
      setTimeout(() => {
        setCurrentPage(p => p + 1)
        setFlipping(false)
      }, 300)
    }
  }

  function goPrev() {
    if (currentPage > 0 && !flipping) {
      setFlipDirection('left')
      setFlipping(true)
      setTimeout(() => {
        setCurrentPage(p => p - 1)
        setFlipping(false)
      }, 300)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, totalPages, flipping])

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
          <div>
            <p className="font-medium text-sm">{title}</p>
            {!loading && (
              <p className="text-xs text-gray-400">Halaman {currentPage + 1} daripada {totalPages}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
            className="w-8 h-8 bg-gray-700 rounded hover:bg-gray-600 flex items-center justify-center">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-300 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.2))}
            className="w-8 h-8 bg-gray-700 rounded hover:bg-gray-600 flex items-center justify-center">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Flipbook Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-800 p-4">
        {loading ? (
          <div className="text-center text-white">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm">Memuatkan PDF...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center text-gray-400">
            <p>Tidak dapat memuatkan PDF. Sila semak URL fail.</p>
          </div>
        ) : (
          <div ref={containerRef} className="relative">
            {/* Page with flip animation */}
            <div
              className={`transition-all duration-300 ${
                flipping
                  ? flipDirection === 'right'
                    ? 'opacity-0 translate-x-4 scale-95'
                    : 'opacity-0 -translate-x-4 scale-95'
                  : 'opacity-100 translate-x-0 scale-100'
              }`}
            >
              <img
                src={pages[currentPage]}
                alt={`Halaman ${currentPage + 1}`}
                style={{ maxHeight: 'calc(100vh - 180px)', maxWidth: '100%' }}
                className="shadow-2xl rounded-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {!loading && pages.length > 0 && (
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={goPrev}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-40 hover:bg-gray-600 transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Sebelum
          </button>

          {/* Page dots */}
          <div className="flex items-center gap-1 overflow-hidden max-w-xs">
            {Array.from({ length: Math.min(totalPages, 15) }, (_, i) => {
              const pageIdx = totalPages > 15 ? Math.floor(i * totalPages / 15) : i
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageIdx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    pageIdx === currentPage ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                />
              )
            })}
          </div>

          <button
            onClick={goNext}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-40 hover:bg-gray-600 transition-colors text-sm"
          >
            Seterus <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, FileText, Youtube, BookOpen } from 'lucide-react'
import type { Topic, Note, Video } from '@/types'
import PdfFlipbook from '@/components/PdfFlipbook'
import { getYouTubeId, getYouTubeThumbnail } from '@/lib/utils'

export default function TopicPage() {
  const router = useRouter()
  const params = useParams()
  const topicId = params.id as string

  const [topic, setTopic] = useState<Topic | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [activeVideo, setActiveVideo] = useState<Video | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/topics').then(r => r.json()),
      fetch(`/api/notes?topic_id=${topicId}`).then(r => r.json()),
      fetch(`/api/videos?topic_id=${topicId}`).then(r => r.json()),
    ]).then(([allTopics, notesData, videosData]) => {
      const topics = Array.isArray(allTopics) ? allTopics : []
      const found = topics.find((t: Topic) => t.id === topicId)
      setTopic(found || null)
      setNotes(Array.isArray(notesData) ? notesData : [])
      setVideos(Array.isArray(videosData) ? videosData : [])
      setLoading(false)
    })
  }, [topicId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PDF Flipbook Overlay */}
      {activeNote && (
        <PdfFlipbook
          pdfUrl={activeNote.file_url}
          title={activeNote.title}
          onClose={() => setActiveNote(null)}
        />
      )}

      {/* YouTube Modal */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between text-white mb-3">
              <p className="font-medium">{activeVideo.title}</p>
              <button onClick={() => setActiveVideo(null)} className="hover:text-gray-300 text-2xl leading-none">&times;</button>
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.youtube_url)}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {activeVideo.description && (
              <p className="text-gray-300 text-sm mt-3">{activeVideo.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{topic?.title || 'Topik'}</p>
            {topic?.description && <p className="text-xs text-gray-400 truncate">{topic.description}</p>}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Notes Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-gray-800">Nota Kuliah</h2>
          </div>
          {notes.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
              <BookOpen className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Tiada nota untuk topik ini.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map(note => (
                <button
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{note.title}</p>
                    <p className="text-xs text-blue-500 mt-0.5">Klik untuk baca →</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Videos Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Youtube className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-gray-800">Video Berkaitan</h2>
          </div>
          {videos.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
              <Youtube className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Tiada video untuk topik ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {videos.map(video => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left overflow-hidden"
                >
                  <div className="relative aspect-video">
                    <img
                      src={getYouTubeThumbnail(video.youtube_url)}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-gray-800 text-sm line-clamp-2">{video.title}</p>
                    {video.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{video.description}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

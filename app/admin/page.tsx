'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen, FolderOpen, FileText, Youtube, ClipboardList,
  Settings, LogOut, ChevronRight, Plus, Users, BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { CourseSettings, Topic, Note, Video, PastYear } from '@/types'

// ============================================================
// Sub-components
// ============================================================

function CourseSettingsPanel({ settings, onSave }: {
  settings: CourseSettings | null
  onSave: (s: CourseSettings) => void
}) {
  const [form, setForm] = useState({
    course_name: settings?.course_name || '',
    course_code: settings?.course_code || '',
    course_description: settings?.course_description || '',
    lecturer_name: settings?.lecturer_name || '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) setForm({
      course_name: settings.course_name,
      course_code: settings.course_code,
      course_description: settings.course_description,
      lecturer_name: settings.lecturer_name,
    })
  }, [settings])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/course-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      onSave(data)
      toast.success('Maklumat kursus disimpan!')
    } catch {
      toast.error('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold text-gray-800 mb-4">⚙️ Maklumat Kursus</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nama Kursus *</label>
            <input className="input" value={form.course_name}
              onChange={e => setForm(f => ({ ...f, course_name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Kod Kursus</label>
            <input className="input" placeholder="Contoh: DKP3013" value={form.course_code}
              onChange={e => setForm(f => ({ ...f, course_code: e.target.value }))} />
          </div>
          <div>
            <label className="label">Nama Pensyarah</label>
            <input className="input" placeholder="Nama anda" value={form.lecturer_name}
              onChange={e => setForm(f => ({ ...f, lecturer_name: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="label">Penerangan Kursus</label>
          <textarea className="input" rows={3} value={form.course_description}
            onChange={e => setForm(f => ({ ...f, course_description: e.target.value }))} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  )
}

function TopicsPanel() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [editId, setEditId] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/topics')
    const data = await res.json()
    setTopics(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) {
      await fetch(`/api/topics/${editId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      toast.success('Topik dikemaskini!')
    } else {
      await fetch('/api/topics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      toast.success('Topik ditambah!')
    }
    setForm({ title: '', description: '' })
    setShowForm(false)
    setEditId(null)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Padam topik ini? Semua nota & video dalam topik ini akan turut dipadam.')) return
    await fetch(`/api/topics/${id}`, { method: 'DELETE' })
    toast.success('Topik dipadam')
    load()
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">📂 Topik-topik</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: '', description: '' }) }}
          className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Topik
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 rounded-xl p-4 mb-4 space-y-3">
          <div>
            <label className="label">Tajuk Topik *</label>
            <input className="input" placeholder="Contoh: Pengenalan Petrokimia"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Penerangan (optional)</label>
            <input className="input" placeholder="Penerangan ringkas topik"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">{editId ? 'Kemaskini' : 'Tambah'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }}
              className="btn-secondary text-sm">Batal</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-gray-400 text-sm">Memuatkan...</p> : (
        <div className="space-y-2">
          {topics.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Belum ada topik. Tambah topik pertama anda!</p>}
          {topics.map((topic, idx) => (
            <div key={topic.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{topic.title}</p>
                {topic.description && <p className="text-xs text-gray-500 truncate">{topic.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditId(topic.id); setForm({ title: topic.title, description: topic.description }); setShowForm(true) }}
                  className="text-xs text-blue-600 hover:underline px-2">Edit</button>
                <button onClick={() => handleDelete(topic.id)}
                  className="text-xs text-red-500 hover:underline px-2">Padam</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotesPanel() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ topic_id: '', title: '', file_url: '', file_name: '' })
  const [indexing, setIndexing] = useState<string | null>(null)

  async function loadAll() {
    const [tr, nr] = await Promise.all([fetch('/api/topics'), fetch('/api/notes')])
    const [td, nd] = await Promise.all([tr.json(), nr.json()])
    setTopics(Array.isArray(td) ? td : [])
    setNotes(Array.isArray(nd) ? nd : [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const note = await res.json()
    toast.success('Nota berjaya ditambah! PDF boleh diakses pelajar.')
    setForm({ topic_id: '', title: '', file_url: '', file_name: '' })
    setShowForm(false)
    loadAll()

    // Auto-index reminder
    toast('Nota ditambah. Untuk Cikgu AI boleh menjawab berdasarkan nota ini, gunakan butang "Index AI" selepas nota muncul dalam senarai.', { icon: 'ℹ️', duration: 5000 })
    void note
  }

  async function handleDelete(id: string) {
    if (!confirm('Padam nota ini?')) return
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    toast.success('Nota dipadam')
    loadAll()
  }

  async function handleIndex(note: Note) {
    const text = prompt('Tampal teks daripada PDF nota ini untuk Cikgu AI belajar:\n(Buka PDF, select all text, copy, paste di sini)')
    if (!text?.trim()) return
    setIndexing(note.id)
    try {
      const res = await fetch('/api/notes/index', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: note.id, topic_id: note.topic_id, text_content: text }),
      })
      const data = await res.json()
      toast.success(`✅ ${data.chunks_indexed} bahagian nota berjaya di-index untuk Cikgu AI!`)
    } catch {
      toast.error('Gagal index nota')
    } finally {
      setIndexing(null)
    }
  }

  const topicMap = new Map(topics.map(t => [t.id, t.title]))

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">📄 Nota PDF</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Nota
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 rounded-xl p-4 mb-4 space-y-3">
          <p className="text-xs text-blue-700 bg-blue-100 rounded-lg p-2">
            💡 Upload PDF ke <strong>Supabase Storage</strong> bucket &quot;notes&quot; dahulu, kemudian tampal URL di bawah.
          </p>
          <div>
            <label className="label">Topik *</label>
            <select className="input" value={form.topic_id}
              onChange={e => setForm(f => ({ ...f, topic_id: e.target.value }))} required>
              <option value="">-- Pilih Topik --</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tajuk Nota *</label>
            <input className="input" placeholder="Contoh: Nota Topik 1 - Pengenalan"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="label">URL Fail PDF *</label>
            <input className="input" placeholder="https://xxx.supabase.co/storage/v1/object/public/notes/fail.pdf"
              value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Nama Fail</label>
            <input className="input" placeholder="fail.pdf"
              value={form.file_name} onChange={e => setForm(f => ({ ...f, file_name: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Tambah Nota</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Batal</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-gray-400 text-sm">Memuatkan...</p> : (
        <div className="space-y-2">
          {notes.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Belum ada nota. Tambah nota pertama!</p>}
          {notes.map(note => (
            <div key={note.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{note.title}</p>
                <p className="text-xs text-gray-500">{topicMap.get(note.topic_id) || '—'}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => handleIndex(note)} disabled={indexing === note.id}
                  className="text-xs text-purple-600 hover:underline px-2 border border-purple-200 rounded py-1">
                  {indexing === note.id ? 'Indexing...' : '🤖 Index AI'}
                </button>
                <a href={note.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline px-2">Buka</a>
                <button onClick={() => handleDelete(note.id)}
                  className="text-xs text-red-500 hover:underline px-2">Padam</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VideosPanel() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ topic_id: '', title: '', youtube_url: '', description: '' })

  async function loadAll() {
    const [tr, vr] = await Promise.all([fetch('/api/topics'), fetch('/api/videos')])
    const [td, vd] = await Promise.all([tr.json(), vr.json()])
    setTopics(Array.isArray(td) ? td : [])
    setVideos(Array.isArray(vd) ? vd : [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/videos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    toast.success('Video berjaya ditambah!')
    setForm({ topic_id: '', title: '', youtube_url: '', description: '' })
    setShowForm(false)
    loadAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('Padam video ini?')) return
    await fetch(`/api/videos/${id}`, { method: 'DELETE' })
    toast.success('Video dipadam')
    loadAll()
  }

  const topicMap = new Map(topics.map(t => [t.id, t.title]))

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">🎬 Video YouTube</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Video
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 rounded-xl p-4 mb-4 space-y-3">
          <div>
            <label className="label">Topik *</label>
            <select className="input" value={form.topic_id}
              onChange={e => setForm(f => ({ ...f, topic_id: e.target.value }))} required>
              <option value="">-- Pilih Topik --</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tajuk Video *</label>
            <input className="input" placeholder="Contoh: Proses Distilasi Minyak"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="label">URL YouTube *</label>
            <input className="input" placeholder="https://www.youtube.com/watch?v=..."
              value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Penerangan (optional)</label>
            <input className="input" placeholder="Penerangan ringkas video ini"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Tambah Video</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Batal</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-gray-400 text-sm">Memuatkan...</p> : (
        <div className="space-y-2">
          {videos.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Belum ada video.</p>}
          {videos.map(video => (
            <div key={video.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Youtube className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{video.title}</p>
                <p className="text-xs text-gray-500">{topicMap.get(video.topic_id) || '—'}</p>
              </div>
              <div className="flex gap-1">
                <a href={video.youtube_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline px-2">Buka</a>
                <button onClick={() => handleDelete(video.id)}
                  className="text-xs text-red-500 hover:underline px-2">Padam</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PastYearPanel() {
  const [items, setItems] = useState<PastYear[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', question_pdf_url: '', answer_pdf_url: '', answer_visible: false
  })

  async function load() {
    const res = await fetch('/api/pastyear')
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/pastyear', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    toast.success('Soalan past year berjaya ditambah!')
    setForm({ title: '', question_pdf_url: '', answer_pdf_url: '', answer_visible: false })
    setShowForm(false)
    load()
  }

  async function toggleAnswer(item: PastYear) {
    await fetch(`/api/pastyear/${item.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer_visible: !item.answer_visible }),
    })
    toast.success(item.answer_visible ? 'Skema jawapan disembunyikan' : 'Skema jawapan ditunjukkan')
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Padam soalan past year ini?')) return
    await fetch(`/api/pastyear/${id}`, { method: 'DELETE' })
    toast.success('Soalan dipadam')
    load()
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">📝 Soalan Past Year</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Soalan
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 rounded-xl p-4 mb-4 space-y-3">
          <div>
            <label className="label">Tajuk *</label>
            <input className="input" placeholder="Contoh: Peperiksaan Akhir 2024"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="label">URL PDF Soalan *</label>
            <input className="input" placeholder="https://xxx.supabase.co/storage/v1/object/public/pastyear/soalan.pdf"
              value={form.question_pdf_url} onChange={e => setForm(f => ({ ...f, question_pdf_url: e.target.value }))} required />
          </div>
          <div>
            <label className="label">URL PDF Skema Jawapan (optional)</label>
            <input className="input" placeholder="https://xxx.supabase.co/storage/v1/object/public/pastyear/skema.pdf"
              value={form.answer_pdf_url} onChange={e => setForm(f => ({ ...f, answer_pdf_url: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ans-vis" checked={form.answer_visible}
              onChange={e => setForm(f => ({ ...f, answer_visible: e.target.checked }))} />
            <label htmlFor="ans-vis" className="text-sm text-gray-700">Tunjukkan skema jawapan kepada pelajar</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Tambah</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Batal</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-gray-400 text-sm">Memuatkan...</p> : (
        <div className="space-y-2">
          {items.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Belum ada soalan past year.</p>}
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <ClipboardList className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{item.title}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                {item.answer_pdf_url && (
                  <button onClick={() => toggleAnswer(item)}
                    className={`text-xs px-2 py-1 rounded border ${item.answer_visible ? 'text-green-600 border-green-200' : 'text-gray-500 border-gray-200'}`}>
                    {item.answer_visible ? '👁️ Skema On' : '🙈 Skema Off'}
                  </button>
                )}
                <a href={item.question_pdf_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline px-2">Soalan</a>
                <button onClick={() => handleDelete(item.id)}
                  className="text-xs text-red-500 hover:underline px-2">Padam</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Main Admin Dashboard
// ============================================================

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('settings')
  const [courseSettings, setCourseSettings] = useState<CourseSettings | null>(null)

  useEffect(() => {
    fetch('/api/course-settings')
      .then(r => r.json())
      .then(d => setCourseSettings(d))
  }, [])

  function handleLogout() {
    sessionStorage.removeItem('isAdmin')
    router.push('/')
  }

  const tabs = [
    { id: 'settings', label: 'Kursus', icon: Settings },
    { id: 'topics', label: 'Topik', icon: FolderOpen },
    { id: 'notes', label: 'Nota PDF', icon: FileText },
    { id: 'videos', label: 'Video', icon: Youtube },
    { id: 'pastyear', label: 'Past Year', icon: ClipboardList },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm leading-none">
                {courseSettings?.course_name || 'Admin Dashboard'}
              </p>
              <p className="text-xs text-gray-400">Panel Pensyarah</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" /> Log Keluar
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-0">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'settings' && (
          <CourseSettingsPanel settings={courseSettings} onSave={setCourseSettings} />
        )}
        {activeTab === 'topics' && <TopicsPanel />}
        {activeTab === 'notes' && <NotesPanel />}
        {activeTab === 'videos' && <VideosPanel />}
        {activeTab === 'pastyear' && <PastYearPanel />}
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Bot, User, Loader2, BookOpen } from 'lucide-react'
import type { ChatMessage } from '@/types'

const SUGGESTED_QUESTIONS = [
  'Apakah topik utama dalam kursus ini?',
  'Boleh terangkan konsep yang ada dalam nota?',
  'Apakah soalan yang kerap keluar dalam peperiksaan?',
  'Tolong ringkaskan topik pertama.',
]

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-blue-600' : 'bg-purple-100'
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-purple-600" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-sm'
          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
      }`}>
        {/* Render newlines and bold */}
        {msg.content.split('\n').map((line, i) => {
          // Simple bold markdown **text**
          const parts = line.split(/\*\*(.*?)\*\*/g)
          return (
            <p key={i} className={i > 0 ? 'mt-1' : ''}>
              {parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j}>{part}</strong> : part
              )}
            </p>
          )
        })}
      </div>
    </div>
  )
}

export default function AskAiPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: 'Assalamualaikum! Saya Cikgu AI anda. 😊\n\nSaya boleh membantu anda memahami topik-topik dalam kursus ini berdasarkan nota yang telah dimuatnaik oleh pensyarah.\n\nApa yang ingin anda tanya hari ini?',
    }])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const question = (text || input).trim()
    if (!question || loading) return

    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history: messages.slice(-6), // Last 3 exchanges for context
        }),
      })
      const data = await res.json()

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: data.answer || data.error || 'Maaf, saya tidak dapat menjawab sekarang.',
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Maaf, berlaku ralat teknikal. Sila cuba lagi.',
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Cikgu AI</p>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Dalam talian
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Notice */}
      <div className="bg-purple-50 border-b border-purple-100 flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
          <p className="text-xs text-purple-700">
            Cikgu AI menjawab berdasarkan nota kursus sahaja. Soalan di luar skop akan dimaklumkan.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Cikgu AI sedang berfikir...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggested questions (show only at start) */}
      {messages.length <= 1 && (
        <div className="max-w-2xl mx-auto px-4 pb-2 w-full">
          <p className="text-xs text-gray-400 mb-2">Cadangan soalan:</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent max-h-32"
              placeholder="Taip soalan anda... (Enter untuk hantar)"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

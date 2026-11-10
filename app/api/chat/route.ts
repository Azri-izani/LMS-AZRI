import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { generateAnswer, generateEmbedding, CIKGU_AI_SYSTEM_PROMPT } from '@/lib/gemini'

export async function POST(request: Request) {
  try {
    const { question, history = [] } = await request.json()

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Soalan diperlukan' }, { status: 400 })
    }

    const supabase = getServiceClient()

    // Step 1: Cuba generate embedding & cari nota berkaitan
    let relevantContext = ''
    let hasContext = false

    try {
      const embedding = await generateEmbedding(question)
      const { data: chunks } = await supabase.rpc('match_note_chunks', {
        query_embedding: embedding,
        match_threshold: 0.65,
        match_count: 3,
      })

      if (chunks && chunks.length > 0) {
        hasContext = true
        const topicIds = Array.from(new Set(chunks.map((c: { topic_id: string }) => c.topic_id)))
        const { data: topics } = await supabase
          .from('topics')
          .select('id, title')
          .in('id', topicIds)
        const topicMap = new Map(topics?.map((t: { id: string; title: string }) => [t.id, t.title]) || [])
        relevantContext = chunks
          .map((chunk: { content: string; topic_id: string }, i: number) => {
            const topicTitle = topicMap.get(chunk.topic_id) || 'Topik tidak diketahui'
            return `[Nota ${i + 1} — ${topicTitle}]\n${chunk.content}`
          })
          .join('\n\n---\n\n')
      }
    } catch (embeddingError) {
      console.error('Embedding error (skipped):', embeddingError)
    }

    // Step 2: Bina prompt
    const fullPrompt = hasContext
      ? `${CIKGU_AI_SYSTEM_PROMPT}\n\n---\n\nNOTA KURSUS YANG BERKAITAN:\n\n${relevantContext}\n\n---\n\nSoalan pelajar: ${question}`
      : `${CIKGU_AI_SYSTEM_PROMPT}\n\n---\n\nNota untuk topik ini belum di-index dalam sistem. Jawab berdasarkan pengetahuan umum topik kursus petrokimia/kejuruteraan jika berkaitan, atau beritahu pelajar dengan sopan jika soalan di luar skop.\n\n---\n\nSoalan pelajar: ${question}`

    // Step 3: Hantar ke Gemini
    const response = await generateAnswer(fullPrompt)

    return NextResponse.json({ answer: response, hasContext })
  } catch (error: unknown) {
    console.error('Chat error:', error)
    const message = error instanceof Error ? error.message : String(error)
    const isRateLimit = message.includes('429') || message.includes('rate_limit') || message.includes('Rate limit')
    return NextResponse.json(
      {
        answer: isRateLimit
          ? '⏳ Sila tunggu sebentar dan cuba soal semula. Sistem sedang sibuk.'
          : `⚠️ Ralat teknikal: ${message}`,
        hasContext: false,
      },
      { status: 200 }
    )
  }
}

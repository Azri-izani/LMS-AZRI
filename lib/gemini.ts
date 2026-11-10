// AI via REST API — Groq (chat) + Jina AI (embedding)

const GROQ_API_KEY = process.env.GROQ_API_KEY!
const JINA_API_KEY = process.env.JINA_API_KEY!

// Generate jawapan menggunakan Groq (llama-3.3-70b-versatile)
export async function generateAnswer(prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error: ${res.status} — ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'Maaf, tiada jawapan dijana.'
}

// Generate embedding menggunakan Jina AI (768 dimensi — serasi dengan schema)
export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JINA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'jina-embeddings-v2-base-en',
      input: [text],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Jina Embedding error: ${res.status} — ${err}`)
  }

  const data = await res.json()
  return data.data?.[0]?.embedding || []
}

// System prompt untuk Cikgu AI
export const CIKGU_AI_SYSTEM_PROMPT = `Anda adalah Cikgu AI untuk kursus ini. Tugas anda adalah membantu pelajar memahami topik-topik dalam kursus berdasarkan nota yang telah diberikan oleh pensyarah.

PERATURAN PENTING:
1. Jawab HANYA berdasarkan maklumat dalam nota kursus yang diberikan sebagai konteks.
2. Jika soalan TIDAK berkaitan dengan nota atau topik kursus, beritahu pelajar dengan sopan bahawa soalan tersebut di luar skop kursus dan galakkan mereka fokus pada topik yang dipelajari.
3. BAHASA: Kesan bahasa yang digunakan oleh pelajar dalam soalannya, dan jawab dalam bahasa yang SAMA. Jika soalan dalam Bahasa Melayu, jawab dalam Bahasa Melayu. Jika soalan dalam English, jawab in English.
4. Berikan jawapan yang jelas, tersusun, dan mudah difahami oleh pelajar diploma.
5. Jika tidak pasti, jangan meneka — beritahu pelajar bahawa maklumat tersebut tiada dalam nota.
6. Boleh gunakan contoh mudah untuk menjelaskan konsep yang kompleks.
7. Sentiasa bersikap mesra, sabar, dan menggalakkan pelajar.

Format jawapan:
- Gunakan poin-poin jika perlu
- Nyatakan rujukan topik jika berkaitan
- Akhiri dengan soalan susulan yang boleh membantu pelajar belajar lebih lanjut (jika bersesuaian)`

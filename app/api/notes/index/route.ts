import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/gemini'
import { splitIntoChunks } from '@/lib/utils'

// API untuk index PDF ke vector database
// Dipanggil selepas PDF berjaya diupload
export async function POST(request: Request) {
  try {
    const { note_id, topic_id, text_content } = await request.json()

    if (!note_id || !topic_id || !text_content) {
      return NextResponse.json({ error: 'note_id, topic_id, dan text_content diperlukan' }, { status: 400 })
    }

    const supabase = getServiceClient()

    // Padam chunks lama jika ada
    await supabase.from('note_chunks').delete().eq('note_id', note_id)

    // Split teks kepada chunks
    const chunks = splitIntoChunks(text_content, 400, 50)

    if (chunks.length === 0) {
      return NextResponse.json({ message: 'Tiada teks untuk di-index', chunks: 0 })
    }

    // Generate embeddings dan simpan
    const insertData = []
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      if (chunk.length < 20) continue // Skip chunks terlalu pendek

      try {
        const embedding = await generateEmbedding(chunk)
        insertData.push({
          note_id,
          topic_id,
          content: chunk,
          embedding,
          chunk_index: i,
        })
      } catch {
        console.error(`Failed to embed chunk ${i}`)
      }
    }

    if (insertData.length > 0) {
      const { error } = await supabase.from('note_chunks').insert(insertData)
      if (error) throw error
    }

    return NextResponse.json({
      success: true,
      chunks_indexed: insertData.length,
      total_chunks: chunks.length,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

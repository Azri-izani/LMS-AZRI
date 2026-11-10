import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const topicId = searchParams.get('topic_id')
  const supabase = getServiceClient()

  let query = supabase.from('videos').select('*, topic:topics(title)').order('created_at', { ascending: false })
  if (topicId) query = query.eq('topic_id', topicId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = getServiceClient()
  const { data, error } = await supabase.from('videos').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

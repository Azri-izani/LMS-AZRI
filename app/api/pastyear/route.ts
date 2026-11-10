import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('past_year')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = getServiceClient()
  const { data, error } = await supabase.from('past_year').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

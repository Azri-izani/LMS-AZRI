import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('topics')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = getServiceClient()
  const { error } = await supabase.from('topics').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

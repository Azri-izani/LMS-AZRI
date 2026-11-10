import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = getServiceClient()
  const { error } = await supabase.from('videos').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('course_settings')
    .select('*')
    .limit(1)
    .single()
  if (error) return NextResponse.json({ course_name: 'Platform Pembelajaran' })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const supabase = getServiceClient()
  const { data: existing } = await supabase.from('course_settings').select('id').limit(1).single()

  let result
  if (existing) {
    result = await supabase
      .from('course_settings')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    result = await supabase.from('course_settings').insert(body).select().single()
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
  return NextResponse.json(result.data)
}

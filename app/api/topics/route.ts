import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('order_no', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = getServiceClient()

  // Get max order_no
  const { data: existing } = await supabase
    .from('topics')
    .select('order_no')
    .order('order_no', { ascending: false })
    .limit(1)
    .single()

  const order_no = (existing?.order_no ?? 0) + 1

  const { data, error } = await supabase
    .from('topics')
    .insert({ ...body, order_no })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

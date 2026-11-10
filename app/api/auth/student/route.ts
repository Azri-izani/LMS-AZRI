import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const { name, matric_no } = await request.json()

  if (!name || !matric_no) {
    return NextResponse.json({ error: 'Nama dan nombor matrik diperlukan' }, { status: 400 })
  }

  const supabase = getServiceClient()

  // Check if student exists, if not create
  let { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('matric_no', matric_no.toUpperCase())
    .single()

  if (!student) {
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({ name, matric_no: matric_no.toUpperCase() })
      .select()
      .single()
    if (error) return NextResponse.json({ error: 'Gagal mendaftar pelajar' }, { status: 500 })
    student = newStudent
  } else {
    // Update name if different
    if (student.name !== name) {
      await supabase.from('students').update({ name }).eq('id', student.id)
      student.name = name
    }
  }

  return NextResponse.json({ student })
}

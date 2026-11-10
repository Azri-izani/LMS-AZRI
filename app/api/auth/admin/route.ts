import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.json({ error: 'Admin password tidak dikonfigurasi' }, { status: 500 })
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Password tidak betul' }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requirePlatformAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requirePlatformAccess()
  if ('error' in auth) return auth.error

  try {
    const { data, error } = await createServiceClient()
      .from('monitor_incidents')
      .select('*')
      .order('status', { ascending: true })   // fail primero
      .order('check_name')

    if (error) throw error
    return NextResponse.json({ incidents: data ?? [], ok: true })
  } catch (e) {
    return NextResponse.json({ incidents: [], ok: false, error: String(e) })
  }
}

import { NextResponse } from 'next/server'
import { runMultiStoreHealth } from '@/lib/monitor'
import { requirePlatformAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requirePlatformAccess()
  if ('error' in auth) return auth.error

  const data = await runMultiStoreHealth()
  return NextResponse.json(data)
}

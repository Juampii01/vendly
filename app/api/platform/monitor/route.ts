import { NextResponse } from 'next/server'
import { runMultiStoreHealth } from '@/lib/monitor'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await runMultiStoreHealth()
  return NextResponse.json(data)
}

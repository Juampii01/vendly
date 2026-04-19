import { NextResponse } from 'next/server'
import { runAllChecks } from '@/lib/monitor'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin
  const checks = await runAllChecks(baseUrl)

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    baseUrl,
    checks,
    summary: {
      total: checks.length,
      ok: checks.filter(c => c.ok).length,
      failing: checks.filter(c => !c.ok).length,
    },
  })
}

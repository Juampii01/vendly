import { NextResponse } from 'next/server'
import { requireStoreAdmin } from '@/lib/auth'
import { HOME_PRESETS, type HomePresetName } from '@/lib/home-presets'

/**
 * GET /api/admin/store-config/preset?name=athletic
 *
 * Devuelve el JSON de un preset de home_layout. El editor lo usa para
 * preview / aplicación inline desde el admin.
 *
 * El usuario igual puede aplicar el preset por CLI:
 *   node scripts/apply-home-preset.mjs <store_id> athletic
 */
export async function GET(req: Request) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') as HomePresetName | null

  if (!name || !(name in HOME_PRESETS)) {
    return NextResponse.json(
      { error: `Preset inválido. Opciones: ${Object.keys(HOME_PRESETS).join(', ')}` },
      { status: 400 },
    )
  }

  // Devolvemos una COPIA — no queremos que el cliente mute el preset original
  return NextResponse.json(JSON.parse(JSON.stringify(HOME_PRESETS[name])))
}

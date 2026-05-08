/**
 * Aplica un preset de home_layout (lib/home-presets.ts) a un store via REST.
 *
 * Requiere: la migration `supabase/migration_home_layout.sql` ya aplicada
 * (las columnas home_layout y theme_tokens deben existir en store_config).
 *
 * Uso:
 *   node scripts/apply-home-preset.mjs <store_id> <preset_name>
 *
 * Ejemplo:
 *   node scripts/apply-home-preset.mjs ff851df8-a894-488b-bd04-f12b4b761851 athletic
 *
 * Presets disponibles: athletic | default | minimal (ver lib/home-presets.ts)
 */

const SUPABASE_URL = 'https://qcfhxhokryjvaejgbjpw.supabase.co'
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmh4aG9rcnlqdmFlamdianB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI5Nzk3NSwiZXhwIjoyMDkxODczOTc1fQ.bNti54KyCgP73WJG5jLokkeTUq1_qvI5ochLzbDZJrk'

// Inline copy de los presets para no depender del bundler de TS.
// Si actualizás lib/home-presets.ts, actualizá esto también.
const PRESETS = {
  athletic: [
    { id: 'hero',         type: 'hero',             active: true, content: { height: 'screen', overlay: 'gradient-left' } },
    { id: 'marquee',      type: 'marquee',          active: true, content: { background: 'primary', speed: 'medium' } },
    { id: 'categories',   type: 'categoryGrid',     active: true, content: { title: 'Colecciones', layout: 'bento' } },
    { id: 'featured',     type: 'featuredProducts', active: true, content: { eyebrow: 'Selección', title: 'Destacados', columns: 4, source: 'featured' } },
    { id: 'editorial',    type: 'editorialSplit',   active: true, content: { imagePosition: 'left' } },
    { id: 'new-season',   type: 'productScroll',    active: true, content: { title: 'Nueva temporada', desktopColumns: 3, source: 'all', background: 'transparent' } },
    { id: 'trust',        type: 'trustBar',         active: true, content: { layout: 'border' } },
    { id: 'newsletter',   type: 'newsletter',       active: true, content: { background: 'primary' } },
  ],
  default: [
    { id: 'hero',         type: 'hero',             active: true, content: { height: 'screen', overlay: 'gradient-bottom' } },
    { id: 'marquee',      type: 'marquee',          active: true, content: { background: 'accent', speed: 'medium' } },
    { id: 'categories',   type: 'categoryGrid',     active: true, content: { layout: 'bento' } },
    { id: 'editorial',    type: 'editorialSplit',   active: true, content: { imagePosition: 'left' } },
    { id: 'featured',     type: 'featuredProducts', active: true, content: { columns: 4, source: 'featured' } },
    { id: 'best-sellers', type: 'productScroll',    active: true, content: { source: 'all' } },
    { id: 'gallery',      type: 'instagramGallery', active: true, content: {} },
    { id: 'newsletter',   type: 'newsletter',       active: true, content: { background: 'primary' } },
    { id: 'trust',        type: 'trustBar',         active: true, content: { layout: 'border' } },
  ],
  minimal: [
    { id: 'hero',       type: 'hero',             active: true, content: { height: 'tall', overlay: 'gradient-bottom' } },
    { id: 'featured',   type: 'featuredProducts', active: true, content: { columns: 3, source: 'all', maxItems: 6 } },
    { id: 'trust',      type: 'trustBar',         active: true, content: { layout: 'cards' } },
    { id: 'newsletter', type: 'newsletter',       active: true, content: { background: 'subtle' } },
  ],
}

const [, , storeId, presetName] = process.argv

if (!storeId || !presetName) {
  console.error('Uso: node scripts/apply-home-preset.mjs <store_id> <preset_name>')
  console.error('Presets:', Object.keys(PRESETS).join(' | '))
  process.exit(1)
}

const preset = PRESETS[presetName]
if (!preset) {
  console.error(`Preset "${presetName}" no existe. Opciones: ${Object.keys(PRESETS).join(' | ')}`)
  process.exit(1)
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

const url = `${SUPABASE_URL}/rest/v1/store_config?id=eq.${storeId}`

const res = await fetch(url, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({ home_layout: preset }),
})

if (!res.ok) {
  const text = await res.text()
  console.error(`Error ${res.status}: ${text}`)
  if (text.includes('home_layout')) {
    console.error('\n¿Corriste la migration? supabase/migration_home_layout.sql')
  }
  process.exit(1)
}

const [updated] = await res.json()
console.log(`✓ home_layout aplicado a "${updated?.name ?? storeId}" (preset: ${presetName})`)
console.log(`  ${preset.length} secciones: ${preset.map(s => s.type).join(' → ')}`)
console.log(`\nReload la home del store para ver el resultado.`)

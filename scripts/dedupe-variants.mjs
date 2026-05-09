/**
 * One-shot cleanup: borra variantes duplicadas (mismo product_id + atributos).
 *
 * Uso:
 *   node scripts/dedupe-variants.mjs                      # todas las stores (dry-run)
 *   node scripts/dedupe-variants.mjs <store_id>           # solo ese store (dry-run)
 *   node scripts/dedupe-variants.mjs <store_id> --apply   # aplica las deletes
 *
 * Estrategia:
 *   - Agrupa variantes por (product_id, JSON.stringify(attributes))
 *   - Si hay >1 fila por grupo, conserva la PRIMERA (created_at más viejo) y
 *     marca el resto para borrar
 *   - --apply hace los DELETEs; sin --apply solo muestra qué borraría
 *
 * Este script NO debería ser necesario después de mergear PR #13 (el fix de
 * DELETE-then-INSERT). Queda como herramienta para limpiar damage histórico
 * o por si aparece un nuevo bug parecido.
 */

const SUPABASE_URL = 'https://qcfhxhokryjvaejgbjpw.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmh4aG9rcnlqdmFlamdianB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI5Nzk3NSwiZXhwIjoyMDkxODczOTc1fQ.bNti54KyCgP73WJG5jLokkeTUq1_qvI5ochLzbDZJrk'

const HEADERS = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
}

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const storeId = args.find(a => !a.startsWith('--'))

const filter = storeId ? `&store_id=eq.${storeId}` : ''
const url = `${SUPABASE_URL}/rest/v1/products?select=id,name,store_id,variants:product_variants(id,attributes,stock,created_at)${filter}`

console.log(`Mode: ${apply ? '🔥 APPLY' : '🟡 DRY-RUN'} ${storeId ? `· store ${storeId}` : '· todas las stores'}\n`)

const res = await fetch(url, { headers: HEADERS })
if (!res.ok) {
  console.error(`HTTP ${res.status}: ${await res.text()}`)
  process.exit(1)
}
const products = await res.json()

const toDelete = []
let dupCount = 0

for (const p of products) {
  const variants = p.variants ?? []
  if (variants.length === 0) continue

  const groups = new Map()
  for (const v of variants) {
    const key = JSON.stringify(v.attributes ?? {})
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(v)
  }

  for (const [key, group] of groups) {
    if (group.length <= 1) continue
    // Conservar el más viejo (created_at ASC) → borrar el resto
    group.sort((a, b) => a.created_at.localeCompare(b.created_at))
    const keep = group[0]
    const drop = group.slice(1)
    dupCount += drop.length
    console.log(`  ${p.name}`)
    console.log(`    Atributos: ${key}`)
    console.log(`    Conservar: ${keep.id} (created_at ${keep.created_at})`)
    for (const d of drop) {
      console.log(`    Borrar:    ${d.id} (created_at ${d.created_at})`)
      toDelete.push(d.id)
    }
  }
}

console.log(`\n📊 Total a borrar: ${toDelete.length} variantes duplicadas`)

if (toDelete.length === 0) {
  console.log('✓ Sin duplicados. Nada que hacer.')
  process.exit(0)
}

if (!apply) {
  console.log('\nℹ️  Dry-run. Para aplicar: agregá --apply al comando.')
  process.exit(0)
}

// Apply: bulk delete por id (chunks de 50 para no exceder URL length)
const CHUNK = 50
let deleted = 0
for (let i = 0; i < toDelete.length; i += CHUNK) {
  const chunk = toDelete.slice(i, i + CHUNK)
  const idsCSV = chunk.join(',')
  const delRes = await fetch(`${SUPABASE_URL}/rest/v1/product_variants?id=in.(${idsCSV})`, {
    method: 'DELETE',
    headers: HEADERS,
  })
  if (!delRes.ok) {
    console.error(`Falló chunk ${i}-${i + CHUNK}: HTTP ${delRes.status}`)
    process.exit(1)
  }
  deleted += chunk.length
  process.stdout.write(`\r  Borradas: ${deleted}/${toDelete.length}`)
}
console.log(`\n✓ Listo. ${deleted} variantes duplicadas eliminadas.`)

/**
 * Fix Spriovani: revierte la categorización arbitraria.
 * Las imágenes que el cliente subió al Storage son remeras → todos a Remeras.
 * Nombres neutrales numerados para que el cliente edite uno por uno desde admin.
 *
 * Run: node scripts/fix-spriovani.mjs
 */

const SUPABASE_URL = 'https://qcfhxhokryjvaejgbjpw.supabase.co'
const SK =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmh4aG9rcnlqdmFlamdianB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI5Nzk3NSwiZXhwIjoyMDkxODczOTc1fQ.bNti54KyCgP73WJG5jLokkeTUq1_qvI5ochLzbDZJrk'
const STORE_ID = 'ff851df8-a894-488b-bd04-f12b4b761851'

const HEADERS = {
  apikey: SK,
  Authorization: `Bearer ${SK}`,
  'Content-Type': 'application/json',
}

async function get(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { ...HEADERS, Prefer: 'return=representation' },
  })
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`)
  return r.json()
}

async function patch(path, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: { ...HEADERS, Prefer: 'return=minimal' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`PATCH ${path} → ${r.status}: ${await r.text()}`)
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  const cats = await get(`categories?store_id=eq.${STORE_ID}&select=id,slug,name`)
  const remerasCat = cats.find((c) => c.slug === 'remeras')
  if (!remerasCat) throw new Error('Categoría "remeras" no encontrada')

  // Filtramos productos con imágenes válidas (no /logos/spriovanni.png que era fallback)
  const products = await get(
    `products?store_id=eq.${STORE_ID}&select=id,name,images&order=created_at.asc`,
  )

  console.log(`📦 ${products.length} productos a normalizar`)

  let n = 1
  for (const p of products) {
    // Filtrar imágenes inválidas (Unsplash 404 que metí del seed-spriovani anterior)
    const validImages = (p.images ?? []).filter((url) => {
      // Sólo conservamos URLs del Supabase Storage del store y URLs HTTP que NO sean Unsplash
      // (porque las de Unsplash que estaban hardcodeadas pueden estar caídas)
      return (
        url.includes(`/storage/v1/object/public/products/${STORE_ID}/`) ||
        (!url.includes('unsplash') && url.startsWith('http'))
      )
    })

    const num = String(n).padStart(3, '0')
    const name = `Spriovanni N°${num}`
    const slug = slugify(name) + '-' + p.id.slice(0, 6)

    await patch(`products?id=eq.${p.id}`, {
      name,
      slug,
      description:
        'Prenda Spriovanni — calidad premium, confección impecable. Editá esta descripción desde el panel para personalizarla.',
      price: 19500,
      compare_at_price: null,
      category_id: remerasCat.id,
      is_active: true,
      // Primeros 8 destacados para que la home tenga buen visual
      is_featured: n <= 8,
      tags: ['remeras', 'verano', 'algodon'],
      images: validImages.length > 0 ? validImages : (p.images ?? []),
    })

    console.log(
      `  ✓ ${name} · ${validImages.length || (p.images?.length ?? 0)} imgs ${n <= 8 ? '⭐' : ''}`,
    )
    n++
  }

  // Si quedaron Buzos / Camperas vacíos, mejor desactivarlos
  for (const cat of cats) {
    if (cat.slug !== 'remeras') {
      await patch(`categories?id=eq.${cat.id}`, { is_active: false })
      console.log(`  · Desactivada categoría: ${cat.name}`)
    }
  }

  console.log(`\n✅ ${products.length} productos normalizados como remeras numeradas.`)
  console.log(`   Editá desde /admin/productos para customizar uno por uno.`)
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})

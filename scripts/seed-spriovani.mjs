/**
 * One-shot seeder: adds product images + polishes Spriovani store config
 * Run: node scripts/seed-spriovani.mjs
 */

const SUPABASE_URL = 'https://qcfhxhokryjvaejgbjpw.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmh4aG9rcnlqdmFlamdianB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI5Nzk3NSwiZXhwIjoyMDkxODczOTc1fQ.bNti54KyCgP73WJG5jLokkeTUq1_qvI5ochLzbDZJrk'

const HEADERS = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
}

const STORE_ID = '30ea383a-adbe-4c30-bff8-aa733efd40ec'

// ─── Curated Unsplash images by clothing type ─────────────────────────────────

const IMAGES = {
  remera: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80',
  ],
  pantalon: [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    'https://images.unsplash.com/photo-1551854838-212c9a5bca4b?w=800&q=80',
    'https://images.unsplash.com/photo-1542574271-7f3b92e6c821?w=800&q=80',
  ],
  vestido: [
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
    'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80',
    'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=800&q=80',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
  ],
  conjunto: [
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80',
  ],
  saco: [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80',
  ],
  accesorio: [
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&q=80',
  ],
  falda: [
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80',
    'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=800&q=80',
    'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800&q=80',
  ],
  camisa: [
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4f79?w=800&q=80',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
  ],
  calza: [
    'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800&q=80',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
  ],
  buzo: [
    'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80',
  ],
}

// ─── Category images ──────────────────────────────────────────────────────────

const CATEGORY_IMAGES = {
  remera: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  pantalon: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
  vestido: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80',
  conjunto: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80',
  saco: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
  accesorio: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80',
  falda: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80',
  camisa: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4f79?w=600&q=80',
  calza: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600&q=80',
  buzo: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
  default: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
}

function getKey(text) {
  const t = text.toLowerCase()
  if (t.includes('remera') || t.includes('camiseta')) return 'remera'
  if (t.includes('pantalon') || t.includes('jean') || t.includes('jogger') || t.includes('chino')) return 'pantalon'
  if (t.includes('vestido')) return 'vestido'
  if (t.includes('conjunto') || t.includes('set') || t.includes('outfit')) return 'conjunto'
  if (t.includes('saco') || t.includes('blazer') || t.includes('campera') || t.includes('abrigo')) return 'saco'
  if (t.includes('accesorio') || t.includes('cartera') || t.includes('bolso') || t.includes('cinturon') || t.includes('bufanda')) return 'accesorio'
  if (t.includes('falda') || t.includes('pollera')) return 'falda'
  if (t.includes('camisa') || t.includes('blusa')) return 'camisa'
  if (t.includes('calza') || t.includes('legging')) return 'calza'
  if (t.includes('buzo') || t.includes('sweater') || t.includes('hoodie') || t.includes('pulover')) return 'buzo'
  return 'default'
}

// Round-robin image picker per key
const counters = {}
function pickImages(key, count = 2) {
  const pool = IMAGES[key] || IMAGES.default
  if (!counters[key]) counters[key] = 0
  const imgs = []
  for (let i = 0; i < count; i++) {
    imgs.push(pool[counters[key] % pool.length])
    counters[key]++
  }
  return imgs
}

async function get(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
  })
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}: ${await res.text()}`)
  return res.json()
}

async function patch(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}: ${await res.text()}`)
}

async function main() {
  console.log('🔍 Fetching store data...')

  // Fetch categories
  const categories = await get(`categories?store_id=eq.${STORE_ID}&select=id,name,slug`)
  console.log(`📁 Found ${categories.length} categories`)

  // Fetch products
  const products = await get(`products?store_id=eq.${STORE_ID}&select=id,name,category_id,images,is_featured`)
  console.log(`📦 Found ${products.length} products`)

  // Build category id → key map
  const catMap = {}
  for (const cat of categories) {
    catMap[cat.id] = getKey(cat.name)
  }

  // ─── Update categories with images ───────────────────────────────────────
  console.log('\n🖼  Updating category images...')
  for (const cat of categories) {
    const key = getKey(cat.name)
    const imageUrl = CATEGORY_IMAGES[key] || CATEGORY_IMAGES.default
    await patch(`categories?id=eq.${cat.id}`, { image_url: imageUrl })
    console.log(`  ✓ ${cat.name} → ${key}`)
  }

  // ─── Update product images & set featured products ────────────────────────
  console.log('\n📸 Updating product images...')
  let featuredCount = 0
  for (const product of products) {
    const catKey = product.category_id ? (catMap[product.category_id] || getKey(product.name)) : getKey(product.name)
    const images = pickImages(catKey, 2)
    const isFeatured = product.is_featured || featuredCount < 6 // ensure at least 6 featured
    if (!product.is_featured && featuredCount < 6) featuredCount++

    await patch(`products?id=eq.${product.id}`, {
      images,
      is_featured: isFeatured,
    })
    console.log(`  ✓ ${product.name} → [${catKey}] ${isFeatured ? '⭐' : ''}`)
  }

  // ─── Update store config ──────────────────────────────────────────────────
  console.log('\n🎨 Polishing store config...')
  await patch(`store_config?id=eq.${STORE_ID}`, {
    hero_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=85',
    home_split_image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=85',
    home_marquee_items: [
      'NUEVA COLECCIÓN 2024',
      'ENVÍOS A TODO EL PAÍS',
      'PRENDAS EXCLUSIVAS',
      'CALIDAD PREMIUM',
      '✦ SPRIOVANI INDUMENTARIA',
      'ENVÍO GRATIS EN COMPRAS +$50.000',
    ],
    home_editorial_label: 'Colección 2024',
    home_editorial_title: 'Estilo que habla',
    home_editorial_body: 'Cada prenda es una pieza pensada para vos. Diseños únicos que combinan tendencia y comodidad, hechos para las mujeres que saben lo que quieren.',
    hero_title: 'Nueva Colección',
    hero_subtitle: 'Prendas exclusivas para cada momento de tu vida',
    hero_cta_label: 'Ver colección',
    hero_cta_url: '/productos',
  })
  console.log('  ✓ Store config updated')

  console.log('\n✅ Spriovani store polished and ready to launch!')
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})

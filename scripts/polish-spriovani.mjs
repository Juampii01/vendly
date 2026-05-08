/**
 * Polish completo Spriovani Indumentaria — masculina, AR.
 * Renombra productos genéricos, asigna precios por categoría, descripciones,
 * marca destacados, agrega variantes con talles, limpia sections placeholder,
 * setea logo y asegura imágenes.
 *
 * Run: node scripts/polish-spriovani.mjs
 */

const SUPABASE_URL = 'https://qcfhxhokryjvaejgbjpw.supabase.co'
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmh4aG9rcnlqdmFlamdianB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI5Nzk3NSwiZXhwIjoyMDkxODczOTc1fQ.bNti54KyCgP73WJG5jLokkeTUq1_qvI5ochLzbDZJrk'

const STORE_ID = 'ff851df8-a894-488b-bd04-f12b4b761851'

const HEADERS = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

const HEADERS_MIN = { ...HEADERS, Prefer: 'return=minimal' }

// ─── Catálogo: nombres reales por categoría ──────────────────────────────────

const CATALOG = {
  remeras: {
    base_price: 18000,
    descriptions: [
      'Remera de algodón premium con caída moderna y costuras reforzadas. Calce regular fit.',
      'Básica esencial. Algodón peinado 100%, mangas reforzadas y cuello acanalado.',
      'Remera oversize con estampa frontal minimalista. Tela suave y caída relajada.',
      'Remera de manga corta con detalle bordado en el pecho. Confección premium.',
      'Remera fit slim con cuello redondo. Algodón orgánico que respira en los días de calor.',
    ],
    names: [
      'Remera Oversize Negra',
      'Remera Básica Blanca',
      'Remera Estampada Beige',
      'Remera Manga Corta Verde Militar',
      'Remera Slim Fit Gris Topo',
      'Remera Bordada Vino',
      'Remera Box Fit Crema',
      'Remera Henley Azul Marino',
      'Remera Logo Mineral',
      'Remera Algodón Peinado Negra',
    ],
  },
  buzos: {
    base_price: 38000,
    descriptions: [
      'Buzo hoodie con frisa interior 100% algodón. Capucha forrada y bolsillo canguro.',
      'Buzo cuello redondo con frisa premium. Mangas con puños acanalados.',
      'Buzo oversize con estampa minimalista. Caída relajada y costuras reforzadas.',
      'Buzo zipper con cierre metálico y bolsillos laterales. Frisa cálida.',
      'Buzo crew neck en algodón premium con detalle bordado.',
    ],
    names: [
      'Buzo Hoodie Negro',
      'Buzo Cuello Redondo Gris Melange',
      'Buzo Oversize Crema',
      'Buzo Zipper Verde Botella',
      'Buzo Crew Neck Beige',
      'Buzo Estampado Vino',
      'Buzo Hoodie Mineral',
      'Buzo Frisa Premium Azul Marino',
    ],
  },
  camperas: {
    base_price: 65000,
    descriptions: [
      'Campera de paño con forro interior. Cierre frontal y dos bolsillos laterales.',
      'Campera puffer ultraliviana con relleno térmico. Resistente al viento.',
      'Bomber clásica con detalle de cuello acanalado. Confección premium.',
      'Campera de jean negra desgastada. Calce regular con bolsillos al pecho.',
      'Sobretodo largo con doble botonera. Tela de paño grueso para invierno.',
    ],
    names: [
      'Campera Bomber Negra',
      'Campera Puffer Verde Militar',
      'Campera de Jean Negra',
      'Sobretodo Paño Camel',
      'Campera Trucker Azul',
      'Campera Liviana Mineral',
      'Bomber Beige',
    ],
  },
}

// Talles estándar masculinos
const SIZES = ['S', 'M', 'L', 'XL']

// ─── Utilidades HTTP ─────────────────────────────────────────────────────────

async function get(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { ...HEADERS, Prefer: 'return=representation' },
  })
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}: ${await res.text()}`)
  return res.json()
}

async function patch(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: HEADERS_MIN,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}: ${await res.text()}`)
}

async function insert(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: HEADERS_MIN,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${await res.text()}`)
}

async function del(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'DELETE',
    headers: HEADERS_MIN,
  })
  if (!res.ok) throw new Error(`DELETE ${path} → ${res.status}: ${await res.text()}`)
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Cargando categorías y productos...')

  const categories = await get(
    `categories?store_id=eq.${STORE_ID}&select=id,name,slug,is_active&order=position.asc`,
  )
  const products = await get(
    `products?store_id=eq.${STORE_ID}&select=id,name,images,category_id&order=created_at.asc`,
  )

  console.log(`📁 ${categories.length} categorías · 📦 ${products.length} productos`)

  // Map categoría → catálogo
  const catBySlug = {}
  for (const cat of categories) catBySlug[cat.slug] = cat

  if (!catBySlug.remeras || !catBySlug.buzos || !catBySlug.camperas) {
    throw new Error('Faltan categorías esperadas (remeras, buzos, camperas)')
  }

  // ─── 1. Distribuir productos entre categorías ──────────────────────────────
  // Asumimos 25 productos: 10 remeras, 8 buzos, 7 camperas
  const groups = {
    remeras: products.slice(0, 10),
    buzos: products.slice(10, 18),
    camperas: products.slice(18, 25),
  }

  // ─── 2. Limpiar variantes viejas ──────────────────────────────────────────
  console.log('\n🧹 Limpiando variantes existentes...')
  for (const p of products) {
    await del(`product_variants?product_id=eq.${p.id}`)
  }

  // ─── 3. Renombrar + asignar precios + descripciones + variantes ────────────
  console.log('\n✏️  Renombrando productos y agregando datos...')

  let featuredCount = 0
  for (const [catSlug, list] of Object.entries(groups)) {
    const cat = catBySlug[catSlug]
    const config = CATALOG[catSlug]
    let nameIdx = 0

    for (const p of list) {
      const name = config.names[nameIdx % config.names.length]
      const description = config.descriptions[nameIdx % config.descriptions.length]
      // Variación de precio ±20% para evitar que todos cuesten lo mismo
      const variation = (nameIdx % 4) * 0.07 - 0.05 // -5% a +16%
      const price = Math.round((config.base_price * (1 + variation)) / 500) * 500
      // Algunos con compare_at_price (oferta)
      const compare_at_price = nameIdx % 3 === 0 ? Math.round(price * 1.25 / 500) * 500 : null
      // Marcamos los primeros 8 como destacados
      const is_featured = featuredCount < 8
      if (is_featured) featuredCount++
      // Slug único
      const slug = slugify(name) + '-' + p.id.slice(0, 6)

      const tags =
        catSlug === 'remeras'
          ? ['remeras', 'verano', 'algodon']
          : catSlug === 'buzos'
            ? ['buzos', 'frisa', 'invierno']
            : ['camperas', 'invierno', 'abrigo']

      await patch(`products?id=eq.${p.id}`, {
        name,
        slug,
        description,
        price,
        compare_at_price,
        category_id: cat.id,
        is_active: true,
        is_featured,
        tags,
        // Aseguramos al menos una imagen
        images: p.images && p.images.length > 0 ? p.images : [`/logos/spriovanni.png`],
      })

      // Variantes por talle
      const variants = SIZES.map((talle) => ({
        product_id: p.id,
        attributes: { talle },
        sku: `SP-${p.id.slice(0, 4).toUpperCase()}-${talle}`,
        stock: 8 + Math.floor(Math.random() * 12), // 8-20
        price_override: null,
        is_active: true,
      }))
      await insert('product_variants', variants)

      console.log(
        `  ✓ [${catSlug}] ${name} · $${price.toLocaleString('es-AR')}${
          compare_at_price ? ` (antes $${compare_at_price.toLocaleString('es-AR')})` : ''
        }${is_featured ? ' ⭐' : ''} · 4 talles`,
      )
      nameIdx++
    }
  }

  // ─── 4. Pulir store_config ─────────────────────────────────────────────────
  console.log('\n🎨 Puliendo store_config...')
  await patch(`store_config?id=eq.${STORE_ID}`, {
    logo_url: '/logos/spriovanni.png',
    email: 'contacto@spriovanni.com.ar',
    // Limpiar sections placeholder ("Tu negocio en un solo lugar") — site_type
    // 'athletic' no las renderiza, pero las dejamos en null para evitar ruido.
    sections: null,
    // Refrescar marquee/editorial coherente con masculino
    home_marquee_items: [
      'NUEVA COLECCIÓN VERANO 2026',
      'ENVÍO GRATIS DESDE $30.000',
      'REMERAS · BUZOS · CAMPERAS',
      'ESTILO Y ACTITUD',
      '✦ SPRIOVANNI INDUMENTARIA',
    ],
    home_editorial_label: 'Verano 2026',
    home_editorial_title: 'El estilo que refleja tu energía',
    home_editorial_body:
      'Cada prenda Spriovanni está pensada para el hombre que no necesita justificar su estilo. Básicos impecables, cortes precisos, materiales que duran temporada tras temporada.',
    hero_title: 'ESTILO. ACTITUD.',
    hero_subtitle: 'Indumentaria masculina pensada para los que tienen identidad propia.',
    hero_cta_label: 'Ver colección',
    hero_cta_url: '/productos',
    hero_image_url:
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1800&q=85',
    home_split_image_url:
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1200&q=85',
  })

  // ─── 5. Asegurar admin_users tenga algún owner registrado ──────────────────
  console.log('\n👤 Verificando admin_users...')
  const adminUsers = await get(
    `admin_users?store_id=eq.${STORE_ID}&select=email,role`,
  )
  if (adminUsers.length === 0) {
    console.log('  ⚠️  No hay admin_users — se creará en bootstrap al primer login con store.email')
  } else {
    for (const a of adminUsers) console.log(`  ✓ ${a.role}: ${a.email}`)
  }

  console.log('\n✅ Spriovanni listo!')
  console.log(`   STORE_ID = ${STORE_ID}`)
  console.log(`   slug     = spriovani-indumentaria`)
  console.log(`   site_type = athletic`)
  console.log(`   Productos = 25 (10 remeras + 8 buzos + 7 camperas)`)
  console.log(`   Destacados = ${featuredCount}`)
}

main().catch((err) => {
  console.error('❌ Error:', err.message)
  console.error(err.stack)
  process.exit(1)
})

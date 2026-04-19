import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

interface BulkProductInput {
  name: string
  price: number
  description?: string
  compare_at_price?: number | null
  category_slug?: string | null
  tags?: string[]
  images?: string[]
  is_active?: boolean
  is_featured?: boolean
  slug?: string
}

/**
 * POST /api/platform/stores/[id]/products/bulk
 * Body: { products: BulkProductInput[] }
 *
 * Crea todos los productos de una sola vez.
 * Resuelve categorías por slug, genera slugs únicos, ignora errores individuales.
 * Devuelve { created, skipped, errors }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const h = await headers()
  const userEmail = h.get('x-user-email')
  if (!userEmail) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id: storeId } = await params
  const service = createServiceClient()

  const body = await req.json() as { products: BulkProductInput[] }
  const inputs = body.products

  if (!Array.isArray(inputs) || inputs.length === 0) {
    return NextResponse.json({ error: 'Array de productos requerido' }, { status: 400 })
  }
  if (inputs.length > 500) {
    return NextResponse.json({ error: 'Máximo 500 productos por operación' }, { status: 400 })
  }

  // ── Precargar categorías del store ────────────────────────────────────────
  const { data: existingCats } = await service
    .from('categories')
    .select('id, slug, name')
    .eq('store_id', storeId)

  const catBySlug = new Map<string, string>()
  for (const c of existingCats ?? []) catBySlug.set(c.slug, c.id)

  // Auto-crear categorías que no existen ─────────────────────────────────────
  const uniqueSlugs = Array.from(new Set(
    inputs
      .filter(p => p.category_slug)
      .map(p => p.category_slug!)
  ))
  const slugsNeeded = uniqueSlugs.filter(s => !catBySlug.has(s))

  if (slugsNeeded.length > 0) {
    const { data: newCats } = await service
      .from('categories')
      .upsert(
        slugsNeeded.map((slug, i) => ({
          store_id: storeId,
          slug,
          name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
          position: (existingCats?.length ?? 0) + i,
          is_active: true,
        })),
        { onConflict: 'store_id,slug', ignoreDuplicates: false }
      )
      .select('id, slug')
    for (const c of newCats ?? []) catBySlug.set(c.slug, c.id)
  }

  // ── Precargar slugs existentes para evitar duplicados ─────────────────────
  const { data: existingSlugs } = await service
    .from('products')
    .select('slug')
    .eq('store_id', storeId)

  const usedSlugs = new Set((existingSlugs ?? []).map(r => r.slug))

  // ── Construir filas ────────────────────────────────────────────────────────
  const rows: Record<string, unknown>[] = []
  const errors: { index: number; name: string; error: string }[] = []

  for (let i = 0; i < inputs.length; i++) {
    const p = inputs[i]

    if (!p.name || typeof p.name !== 'string') {
      errors.push({ index: i, name: '(sin nombre)', error: 'name requerido' })
      continue
    }
    if (p.price == null || typeof p.price !== 'number' || p.price < 0) {
      errors.push({ index: i, name: p.name, error: 'price inválido' })
      continue
    }

    // Slug único
    let baseSlug = p.slug || slugify(p.name)
    if (!baseSlug) baseSlug = `producto-${i}`
    let slug = baseSlug
    let attempt = 0
    while (usedSlugs.has(slug)) {
      attempt++
      slug = `${baseSlug}-${attempt}`
    }
    usedSlugs.add(slug)

    const category_id = p.category_slug ? (catBySlug.get(p.category_slug) ?? null) : null

    rows.push({
      store_id: storeId,
      name: p.name.trim(),
      slug,
      description: p.description?.trim() ?? null,
      price: p.price,
      compare_at_price: p.compare_at_price ?? null,
      category_id,
      tags: Array.isArray(p.tags) ? p.tags : [],
      images: Array.isArray(p.images) ? p.images : [],
      is_active: p.is_active ?? true,
      is_featured: p.is_featured ?? false,
    })
  }

  if (rows.length === 0) {
    return NextResponse.json({ created: 0, skipped: inputs.length, errors })
  }

  // ── Insert en chunks de 100 ────────────────────────────────────────────────
  const CHUNK = 100
  let created = 0

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { error } = await service.from('products').insert(chunk)
    if (error) {
      // Registrar error del chunk pero seguir
      for (let j = i; j < i + chunk.length; j++) {
        errors.push({ index: j, name: String(rows[j].name), error: error.message })
      }
    } else {
      created += chunk.length
    }
  }

  return NextResponse.json({
    created,
    skipped: inputs.length - rows.length,
    errors,
  })
}

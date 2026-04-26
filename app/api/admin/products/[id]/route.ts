import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'

interface RouteContext {
  params: Promise<{ id: string }>
}

// ─── PATCH /api/admin/products/[id] ──────────────────────────────────────────
// Actualiza un producto y reemplaza sus variantes.
export async function PATCH(req: Request, { params }: RouteContext) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const { variants_data, ...productData } = body

    const [service, storeId] = [createServiceClient(), await getStoreId()]

    // Verificar que el producto pertenece a este store
    const { data: existing } = await service
      .from('products')
      .select('id')
      .eq('id', id)
      .eq('store_id', storeId)
      .single()
    if (!existing) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    // Actualizar producto
    const { error: productError } = await service
      .from('products')
      .update({ ...sanitizeProduct(productData), updated_at: new Date().toISOString() })
      .eq('id', id)
    if (productError) {
      if (productError.code === '23505') {
        return NextResponse.json(
          { error: 'Ya existe un producto con ese slug. Cambiá el nombre o el slug manualmente.' },
          { status: 409 },
        )
      }
      console.error('[PATCH product] DB error:', JSON.stringify(productError))
      throw productError
    }

    // Reemplazar variantes: delete old → insert new
    await service.from('product_variants').delete().eq('product_id', id)

    if (variants_data?.length > 0) {
      const variantRows = buildVariantRows(id, variants_data)
      if (variantRows.length > 0) {
        const { error: varError } = await service
          .from('product_variants')
          .insert(variantRows)
        if (varError) throw varError
      }
    }

    // Re-fetch producto completo
    const { data: updated } = await service
      .from('products')
      .select('*, category:categories(id, name, slug), variants:product_variants(*)')
      .eq('id', id)
      .single()

    return NextResponse.json({ data: updated })
  } catch (e) {
    console.error('[PATCH product] Unexpected error:', e)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

// ─── DELETE /api/admin/products/[id] ─────────────────────────────────────────
export async function DELETE(_req: Request, { params }: RouteContext) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const [service, storeId] = [createServiceClient(), await getStoreId()]

    const { error } = await service
      .from('products')
      .delete()
      .eq('id', id)
      .eq('store_id', storeId)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}

// ─── PATCH /api/admin/products/[id] toggle active shortcut ───────────────────
// También usado para cambiar is_active con un body mínimo { is_active: bool }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRODUCT_FIELDS = [
  'name', 'slug', 'description', 'price', 'compare_at_price',
  'images', 'is_active', 'is_featured', 'tags', 'category_id',
]

function sanitizeProduct(data: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const k of PRODUCT_FIELDS) {
    if (k in data) out[k] = data[k]
  }
  return out
}

interface VariantRow {
  talle?: string
  color?: string
  stock?: string
  price_override?: string
}

function buildVariantRows(productId: string, variants: VariantRow[]) {
  return variants
    .filter((v) => v.talle || v.color)
    .map((v) => ({
      product_id: productId,
      attributes: {
        ...(v.talle ? { talle: v.talle } : {}),
        ...(v.color ? { color: v.color } : {}),
      },
      stock: parseInt(v.stock ?? '0') || 0,
      price_override: v.price_override ? parseFloat(v.price_override) : null,
      is_active: true,
    }))
}

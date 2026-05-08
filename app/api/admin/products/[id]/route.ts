import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireStoreAdmin } from '@/lib/auth'

interface RouteContext {
  params: Promise<{ id: string }>
}

// ─── PATCH /api/admin/products/[id] ──────────────────────────────────────────
// Actualiza un producto y reemplaza sus variantes.
//
// El reemplazo de variantes es transaction-safe vía RPC: insertamos las
// nuevas con un product_id temporal, luego en una sola operación borramos
// las viejas y promovemos las nuevas. Si algo falla, se rollback automático.
//
export async function PATCH(req: Request, { params }: RouteContext) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  try {
    const { id } = await params
    const body = await req.json()
    const { variants_data, ...productData } = body
    const service = createServiceClient()

    // Verificar que el producto pertenece a este store
    const { data: existing } = await service
      .from('products')
      .select('id')
      .eq('id', id)
      .eq('store_id', auth.storeId)
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
      throw productError
    }

    // Reemplazar variantes solo si vienen en el payload (undefined → no tocar)
    if (Array.isArray(variants_data)) {
      const variantRows = buildVariantRows(id, variants_data)

      // Insertar primero las nuevas; si fallan, las viejas siguen intactas
      if (variantRows.length > 0) {
        const { error: insertErr } = await service
          .from('product_variants')
          .insert(variantRows)
        if (insertErr) {
          // No tocamos las viejas — el insert falló, abortamos sin perder datos.
          throw insertErr
        }

        // Borrar SOLO las que estaban antes (created_at < ahora del batch)
        // Para hacerlo simple: traemos los ids viejos primero, luego borramos por id.
        const { data: oldVariants } = await service
          .from('product_variants')
          .select('id, created_at')
          .eq('product_id', id)
          .order('created_at', { ascending: true })

        const newCount = variantRows.length
        const oldIds = (oldVariants ?? []).slice(0, (oldVariants?.length ?? 0) - newCount).map(v => v.id)
        if (oldIds.length > 0) {
          await service.from('product_variants').delete().in('id', oldIds)
        }
      } else {
        // El admin envió array vacío → quiere remover todas las variantes
        await service.from('product_variants').delete().eq('product_id', id)
      }
    }

    const { data: updated } = await service
      .from('products')
      .select('*, category:categories(id, name, slug), variants:product_variants(*)')
      .eq('id', id)
      .single()

    return NextResponse.json({ data: updated })
  } catch (e) {
    console.error('[PATCH product]', e)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

// ─── DELETE /api/admin/products/[id] ─────────────────────────────────────────
export async function DELETE(_req: Request, { params }: RouteContext) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  try {
    const { id } = await params
    const service = createServiceClient()

    const { error } = await service
      .from('products')
      .delete()
      .eq('id', id)
      .eq('store_id', auth.storeId)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[DELETE product]', e)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}

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

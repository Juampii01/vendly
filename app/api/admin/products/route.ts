import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireStoreAdmin } from '@/lib/auth'

// ─── GET /api/admin/products ──────────────────────────────────────────────────
// Lista todos los productos con categoría y variantes del store actual.
export async function GET() {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const service = createServiceClient()
  const { data, error } = await service
    .from('products')
    .select('*, category:categories(id, name, slug), variants:product_variants(*)')
    .eq('store_id', auth.storeId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// ─── POST /api/admin/products ─────────────────────────────────────────────────
// Crea un nuevo producto + sus variantes.
export async function POST(req: Request) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  try {
    const body = await req.json()
    const { variants_data, ...productData } = body

    const service = createServiceClient()

    const { data: newProduct, error: productError } = await service
      .from('products')
      .insert({ ...sanitizeProduct(productData), store_id: auth.storeId })
      .select('*, category:categories(id, name, slug), variants:product_variants(*)')
      .single()

    if (productError) {
      if (productError.code === '23505') {
        return NextResponse.json(
          { error: 'Ya existe un producto con ese slug. Cambiá el nombre o el slug manualmente.' },
          { status: 409 },
        )
      }
      throw productError
    }

    if (variants_data?.length > 0) {
      const variantRows = buildVariantRows(newProduct.id, variants_data)
      if (variantRows.length > 0) {
        const { error: varError } = await service
          .from('product_variants')
          .insert(variantRows)
        if (varError) throw varError
      }
    }

    const { data: full } = await service
      .from('products')
      .select('*, category:categories(id, name, slug), variants:product_variants(*)')
      .eq('id', newProduct.id)
      .single()

    return NextResponse.json({ data: full }, { status: 201 })
  } catch (e) {
    console.error('[POST product]', e)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
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

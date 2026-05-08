import 'server-only'
import { NextResponse } from 'next/server'
import { requireStoreAdmin } from '@/lib/auth'
import type { StoreConfig, LandingSection, Product, Category } from '@/types'
import type { DesignMessage, ProductAction, CategoryAction } from './types'

// Re-export so consumers can import from the route path if needed
export type { DesignMessage, ProductAction, CategoryAction } from './types'

export interface DesignRequest {
  message: string
  history: DesignMessage[]
  store: StoreConfig
  products: Pick<Product, 'id' | 'name' | 'price' | 'compare_at_price' | 'is_active' | 'is_featured' | 'tags' | 'description'>[]
  categories: Pick<Category, 'id' | 'name' | 'slug' | 'is_active'>[]
}

export interface DesignResponse {
  explanation: string
  changes: Partial<StoreConfig> | null
  product_actions?: ProductAction[] | null
  category_actions?: CategoryAction[] | null
}

// ─── Campos editables de store_config ────────────────────────────────────────

const EDITABLE_FIELDS = [
  'name',
  'color_primary', 'color_secondary', 'color_accent', 'color_background', 'color_text',
  'hero_title', 'hero_subtitle', 'hero_cta_label', 'hero_cta_url', 'hero_image_url', 'hero_cta_color',
  'home_marquee_items', 'home_split_image_url',
  'home_editorial_label', 'home_editorial_title', 'home_editorial_body',
  'meta_title', 'meta_description',
  'whatsapp_number', 'email', 'instagram_url',
  'free_shipping_threshold', 'shipping_base_price',
  'currency', 'locale', 'base_url',
] as const

function buildSystemPrompt(
  store: StoreConfig,
  products: DesignRequest['products'],
  categories: DesignRequest['categories'],
): string {
  const isLanding = store.site_type !== 'ecommerce'

  const sectionsBlock = isLanding ? `
═══════════════════════════════════════════
SECCIONES DE LA PÁGINA (site_type: ${store.site_type})
═══════════════════════════════════════════
Secciones actuales:
${JSON.stringify(store.sections ?? [], null, 2)}

TIPOS DISPONIBLES: hero, about, services, testimonials, pricing, gallery, faq, contact
Estructuras de contenido:
• hero      → {title, subtitle, cta_label, cta_url, image_url}
• about     → {label, title, body, image_url, cta_label, cta_url}
• services  → {title, subtitle, items:[{icon, title, description}]}
• testimonials → {title, items:[{name, role, text, avatar_url?}]}
• pricing   → {title, subtitle, plans:[{name, price, period, features[], cta_label, cta_url, highlighted}]}
• gallery   → {title, images:[]}
• faq       → {title, items:[{question, answer}]}
• contact   → {title, subtitle}

Para modificar secciones: devolvé el array "sections" COMPLETO con todos los cambios.
Para agregar: incluila al final con un id único tipo "section_XXXX".
Para eliminar: omitila del array. Para desactivar: active: false.
` : ''

  const categoriesBlock = categories.length > 0
    ? `Categorías (${categories.length}):\n${categories.map(c =>
        `• [${c.id}] "${c.name}" (slug: ${c.slug}${!c.is_active ? ', inactiva' : ''})`
      ).join('\n')}`
    : 'Sin categorías todavía.'

  const productsBlock = products.length > 0
    ? `Productos (${products.length}):\n${products.map(p =>
        `• [${p.id}] "${p.name}" — $${p.price}${p.compare_at_price ? ` (antes $${p.compare_at_price})` : ''}${p.is_featured ? ' ⭐' : ''}${!p.is_active ? ' (inactivo)' : ''}${p.description ? ` — ${p.description.slice(0, 60)}` : ''}`
      ).join('\n')}`
    : 'Sin productos todavía.'

  return `Sos el editor de contenido y diseño con IA de Vendly. Podés modificar TODO del sitio "${store.name}": diseño, colores, secciones, productos y categorías — a través de conversación natural en español rioplatense (vos, hacé, etc.).

ESTADO DEL SITIO:
${JSON.stringify({
  id: store.id, name: store.name, slug: store.slug, site_type: store.site_type,
  color_primary: store.color_primary, color_secondary: store.color_secondary,
  color_accent: store.color_accent, color_background: store.color_background, color_text: store.color_text,
  hero_title: store.hero_title, hero_subtitle: store.hero_subtitle,
  hero_cta_label: store.hero_cta_label, hero_cta_url: store.hero_cta_url,
  home_marquee_items: store.home_marquee_items,
  home_editorial_label: store.home_editorial_label, home_editorial_title: store.home_editorial_title,
  home_editorial_body: store.home_editorial_body,
  meta_title: store.meta_title, meta_description: store.meta_description,
  whatsapp_number: store.whatsapp_number, email: store.email, instagram_url: store.instagram_url,
}, null, 2)}
${sectionsBlock}
═══════════════════════════════════════════
CATÁLOGO
═══════════════════════════════════════════
${categoriesBlock}
${productsBlock}

═══════════════════════════════════════════
MAPEO CAMPO → ELEMENTO VISUAL (CRÍTICO — USALO SIEMPRE)
═══════════════════════════════════════════
color_primary     → fondo del navbar, fondo del footer, texto del botón hero
color_secondary   → fondo de categorías sin imagen, fondo de placeholders
color_accent      → badges de oferta, descuentos, elementos destacados
color_background  → fondo de la página, fondo del carrito lateral
color_text        → texto general en toda la tienda
hero_cta_color    → color de fondo del botón "Ver colección" del hero (null = usa color_accent)
hero_title        → título grande del hero ("SPRIOVANI — ESTILO QUE HABLA POR VOS")
hero_subtitle     → subtítulo pequeño arriba del título del hero
hero_cta_label    → texto del botón del hero ("Ver colección", "Comprar ahora", etc.)
hero_image_url    → imagen de fondo del hero

EJEMPLOS DE USO:
• "Botón hero blanco"       → hero_cta_color: "#ffffff"
• "Botón hero dorado"       → hero_cta_color: "#c8a55a"
• "Botón hero sin color"    → hero_cta_color: null  (vuelve a usar color_accent)
• "Fondo de página blanco"  → color_background: "#ffffff"
• "Navbar negro"            → color_primary: "#000000"
• "Acentos en rojo"         → color_accent: "#e53e3e"

═══════════════════════════════════════════
LO QUE PODÉS HACER
═══════════════════════════════════════════
1. DISEÑO: colores, hero, editorial, marquee, meta — campos: ${EDITABLE_FIELDS.join(', ')}${isLanding ? ', sections' : ''}
2. PRODUCTOS: crear, editar nombre/precio/descripción/tags/categoría/destacado/activo, eliminar
3. CATEGORÍAS: crear, editar, eliminar

FORMATO DE RESPUESTA — OBLIGATORIO:
Respondé SIEMPRE con JSON válido, sin texto extra:
{
  "explanation": "Qué hiciste (2-3 oraciones, español rioplatense)",
  "changes": { /* campos de store_config que cambian, o null */ },
  "product_actions": [
    {
      "action": "create" | "update" | "delete",
      "product_id": "uuid (solo para update/delete — exactamente como aparece en la lista)",
      "data": {
        "name": "...",
        "description": "...",
        "price": 1000,
        "compare_at_price": null,
        "is_active": true,
        "is_featured": false,
        "tags": [],
        "category_slug": "slug-de-categoria-existente o null",
        "images": []
      }
    }
  ],
  "category_actions": [
    {
      "action": "create" | "update" | "delete",
      "category_id": "uuid (solo para update/delete)",
      "data": { "name": "...", "description": "...", "is_active": true }
    }
  ]
}

Podés omitir "product_actions" y "category_actions" si no hay operaciones de catálogo.
Podés incluir múltiples acciones en el mismo array.

REGLAS CRÍTICAS — SEGUÍ ESTAS SIN EXCEPCIÓN:
1. NUNCA pidas más información si el usuario ya te dio nombre y precio. EJECUTÁ de inmediato.
2. NUNCA hagas preguntas del tipo "¿qué descripción querés?" o "¿a qué categoría va?". Inferí lo que falte y actuá.
3. Si el usuario lista productos con nombre y precio → product_actions con action:"create" para cada uno. Sin preguntas.
4. Si el usuario pide crear categorías → category_actions. Sin preguntas.
5. Colores siempre en formato #RRGGBB.
6. Para sections: devolvé el array COMPLETO cuando haya cambios.
7. Para update/delete: usá el product_id o category_id UUID exacto de la lista de arriba. NUNCA uses el slug como category_id — son campos distintos.
8. Imágenes: si el usuario no da URL, usá [] — no inventes URLs.
9. Si es solo pregunta/sugerencia sin acción clara: explanation útil, resto null.
10. Explanation máximo 2 oraciones. Directo.
11. NUNCA decir que necesita un desarrollador.
12. Si no podés incluir todos los productos en un solo JSON porque son muchos, incluí los primeros que entren y avisá en explanation cuántos creaste y cuántos faltan.`
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API de IA no configurada' }, { status: 503 })

  const { message, history, store, products = [], categories = [] } = await req.json() as DesignRequest

  // Verificar que el `store` enviado coincide con el store resuelto por hostname/cookie.
  // Esto evita que un admin del store A pueda dirigir cambios al store B vía body.
  if (store?.id !== auth.storeId) {
    return NextResponse.json({ error: 'Store mismatch' }, { status: 403 })
  }

  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ]

  // Prompt caching: el system prompt es grande (~3KB con productos + categorías).
  // Lo marcamos como ephemeral para reusarlo durante 5min sin reenviar tokens.
  const systemPrompt = buildSystemPrompt(store, products, categories)

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      system: [
        { type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } },
      ],
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[design] Anthropic error:', err)
    return NextResponse.json({ error: 'Error al procesar el mensaje' }, { status: 500 })
  }

  const data = await res.json()
  const raw = data.content?.[0]?.text ?? ''
  const stopReason = data.stop_reason ?? ''

  // Detectar respuesta cortada por límite de tokens
  if (stopReason === 'max_tokens') {
    return NextResponse.json({
      explanation: 'La respuesta fue demasiado larga y se cortó. Intentá con menos productos a la vez (máximo 3-4 por mensaje).',
      changes: null,
    } satisfies Omit<DesignResponse, 'product_actions' | 'category_actions'>)
  }

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const parsed = JSON.parse(jsonMatch[0]) as DesignResponse

    // ── Sanitize store config changes ────────────────────────────────────────
    if (parsed.changes) {
      const safe: Record<string, unknown> = {}
      for (const key of EDITABLE_FIELDS) {
        if (key in parsed.changes) {
          safe[key] = (parsed.changes as Record<string, unknown>)[key]
        }
      }
      const rawChanges = parsed.changes as Record<string, unknown>
      if ('sections' in rawChanges && Array.isArray(rawChanges.sections)) {
        const sections = rawChanges.sections as LandingSection[]
        const valid = sections.filter(s => s?.id && s?.type && typeof s?.active === 'boolean')
        if (valid.length > 0) safe.sections = valid
      }
      parsed.changes = Object.keys(safe).length > 0 ? safe as Partial<StoreConfig> : null
    }

    if (parsed.product_actions && !Array.isArray(parsed.product_actions)) {
      parsed.product_actions = null
    }
    if (parsed.category_actions && !Array.isArray(parsed.category_actions)) {
      parsed.category_actions = null
    }

    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({
      explanation: raw || 'No pude procesar esa solicitud.',
      changes: null,
    } satisfies Omit<DesignResponse, 'product_actions' | 'category_actions'>)
  }
}

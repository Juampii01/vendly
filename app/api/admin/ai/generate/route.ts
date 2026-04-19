import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/store'

// ─── Tipos ─────────────────────────────────────────────────────────────────────

type GenerateTarget = 'product_description' | 'hero_title' | 'hero_subtitle' | 'meta_title'

interface GenerateRequest {
  target: GenerateTarget
  /** Para product_description */
  productName?: string
  productCategory?: string
  /** Para hero copy */
  storeName?: string
  storeCategory?: string
  /** Tono de escritura */
  tone?: 'profesional' | 'juvenil' | 'minimalista' | 'premium'
}

// ─── Helper: llamada a Anthropic Messages API ─────────────────────────────────

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada.')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${err}`)
  }

  const json = await res.json()
  const content = json.content?.[0]?.text as string | undefined
  if (!content) throw new Error('Respuesta vacía de la API.')
  return content.trim()
}

// ─── Prompts por target ────────────────────────────────────────────────────────

function buildPrompts(target: GenerateTarget, req: GenerateRequest, storeName: string, locale: string) {
  const lang = locale.startsWith('pt') ? 'Portuguese (Brazil)' : 'Spanish (Latin America)'
  const toneMap = {
    profesional: 'professional, clear, and trustworthy',
    juvenil: 'energetic, fresh, and casual — speaks directly to young adults',
    minimalista: 'minimal, calm, and elegant — less is more',
    premium: 'sophisticated, exclusive, and aspirational',
  }
  const toneDesc = toneMap[req.tone ?? 'profesional']

  if (target === 'product_description') {
    return {
      system: `You are a copywriter for ${storeName}, an ecommerce store.
Write in ${lang}. Tone: ${toneDesc}.
Rules:
- 2-4 sentences, no bullet points
- Focus on benefits and feeling, not just specs
- Never start with the product name
- Return only the description text, nothing else`,
      user: `Write a product description for: "${req.productName}"${req.productCategory ? ` in category "${req.productCategory}"` : ''}.`,
    }
  }

  if (target === 'hero_title') {
    return {
      system: `You are a conversion copywriter for ${storeName}${req.storeCategory ? `, a ${req.storeCategory} store` : ''}.
Write in ${lang}. Tone: ${toneDesc}.
Rules:
- 3-7 words maximum
- A headline that makes someone want to explore the store
- Return only the headline text, no quotes, nothing else`,
      user: 'Write a hero headline for the store homepage.',
    }
  }

  if (target === 'hero_subtitle') {
    return {
      system: `You are a conversion copywriter for ${storeName}${req.storeCategory ? `, a ${req.storeCategory} store` : ''}.
Write in ${lang}. Tone: ${toneDesc}.
Rules:
- 8-15 words maximum
- A supporting tagline that complements the hero headline
- Return only the tagline text, no quotes, nothing else`,
      user: 'Write a hero subtitle for the store homepage.',
    }
  }

  // meta_title
  return {
    system: `You are an SEO copywriter for ${storeName}${req.storeCategory ? `, a ${req.storeCategory} store` : ''}.
Write in ${lang}.
Rules:
- 40-60 characters
- Include the store name
- Compelling and keyword-rich
- Return only the title text, nothing else`,
    user: 'Write an SEO meta title for the store.',
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // Auth: solo admins del store
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API de IA no configurada.' }, { status: 503 })
  }

  try {
    const body = await req.json() as GenerateRequest
    const { target } = body

    const validTargets: GenerateTarget[] = ['product_description', 'hero_title', 'hero_subtitle', 'meta_title']
    if (!validTargets.includes(target)) {
      return NextResponse.json({ error: 'target inválido.' }, { status: 400 })
    }

    const store = await getStoreConfig()
    const { system, user: userPrompt } = buildPrompts(target, body, store.name, store.locale ?? 'es-AR')

    const result = await callClaude(system, userPrompt)
    return NextResponse.json({ ok: true, result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido.'
    console.error('[ai/generate]', e)
    // No exponer detalles de la API key
    return NextResponse.json({
      error: msg.includes('ANTHROPIC_API_KEY') ? 'API de IA no configurada.' : 'Error al generar contenido.',
    }, { status: 500 })
  }
}

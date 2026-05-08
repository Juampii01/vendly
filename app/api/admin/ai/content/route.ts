import 'server-only'
import { NextResponse } from 'next/server'
import { requireStoreAdmin } from '@/lib/auth'

export async function POST(req: Request) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API de IA no configurada.' }, { status: 503 })

  const { prompt, storeName } = await req.json()
  if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt requerido.' }, { status: 400 })
  if (prompt.length > 8000) return NextResponse.json({ error: 'Prompt demasiado largo.' }, { status: 400 })

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      stream: true,
      system: `Sos un experto en copywriting y marketing para e-commerce en América Latina. Trabajás para la tienda "${storeName}". Respondés siempre en español, con copy real, accionable y sin relleno genérico. Formato limpio, sin markdown excesivo.`,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Error al generar contenido.' }, { status: 500 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                controller.enqueue(encoder.encode(parsed.delta.text))
              }
            } catch { /* ignorar líneas no-JSON */ }
          }
        }
      } finally {
        controller.close()
        reader.releaseLock()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  })
}

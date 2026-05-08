import 'server-only'
import { NextResponse } from 'next/server'
import { requireStoreAdmin } from '@/lib/auth'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SiteGenInput {
  tipo_proyecto: string
  nombre: string
  descripcion: string
  producto: string
  cliente_ideal: string
  objetivo: string
  tono: string
  nivel_precio: string
  pais: string
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(input: SiteGenInput): string {
  return `Actuás como un desarrollador senior, diseñador UX/UI y estratega de conversión especializado en creación de sitios web de alto rendimiento.

Tu tarea es generar la estructura completa de un sitio web listo para producción, optimizado para conversión, claridad de mensaje y experiencia de usuario.

---

# CONTEXTO DEL PROYECTO

Tipo de sitio: ${input.tipo_proyecto}
Nombre del negocio: ${input.nombre}
Descripción del negocio: ${input.descripcion}
Producto/servicio principal: ${input.producto}
Cliente ideal: ${input.cliente_ideal}
Objetivo del sitio: ${input.objetivo}
Tono de marca: ${input.tono}
Nivel de precio: ${input.nivel_precio}
País / mercado: ${input.pais}

---

# OBJETIVO

Crear una web que:
- comunique claramente la propuesta de valor en menos de 5 segundos
- genere confianza inmediata
- guíe al usuario hacia una acción concreta (compra, contacto, registro)
- esté estructurada como un sistema de conversión, no como una web estética

---

# REGLAS ESTRICTAS

1. No generar contenido genérico ni relleno.
2. No usar frases vacías tipo "somos líderes" o "calidad garantizada".
3. Todo el contenido debe tener intención estratégica.
4. Cada sección debe existir por una razón clara.
5. Pensar siempre desde el usuario, no desde el negocio.
6. Priorizar claridad sobre creatividad innecesaria.
7. El diseño debe ser simple, moderno y funcional.

---

# OUTPUT REQUERIDO

## 1. ESTRUCTURA COMPLETA DEL SITIO

- listado de páginas
- jerarquía de navegación
- flujo del usuario

---

## 2. HOME PAGE DETALLADA

Para cada sección:

- nombre de la sección
- objetivo de la sección
- contenido (copy real, no placeholders)
- estructura visual (layout)
- CTA asociado

Secciones mínimas:

- Hero (impacto inmediato)
- Prueba de valor
- Problema del cliente
- Solución
- Beneficios claros
- Prueba social
- Oferta / producto
- FAQs (si aplica)
- CTA final

---

## 3. COPY PRINCIPAL

- titulares fuertes
- subtítulos
- bullets claros
- CTAs

Todo orientado a conversión.

---

## 4. DISEÑO UI/UX

- estilo visual recomendado
- uso de colores
- jerarquía visual
- espaciado
- comportamiento mobile

---

## 5. ESTRUCTURA TÉCNICA

- componentes necesarios
- bloques reutilizables
- secciones dinámicas
- qué debería ser editable desde CMS

---

## 6. RECOMENDACIONES AVANZADAS

- mejoras de conversión
- errores a evitar
- ideas para escalar el sitio

---

# FORMATO

Responder en formato estructurado con Markdown.
No explicar el proceso.
No justificar decisiones.
Ir directo a la ejecución.

Este sitio debe poder ser utilizado inmediatamente como base para desarrollo real.`
}

// ─── Route — streaming ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API de IA no configurada.' }, { status: 503 })

  const body = await req.json() as SiteGenInput

  const required = ['tipo_proyecto', 'nombre', 'descripcion', 'producto', 'cliente_ideal', 'objetivo', 'tono', 'nivel_precio', 'pais'] as const
  for (const field of required) {
    if (!body[field]?.trim()) {
      return NextResponse.json({ error: `El campo "${field}" es requerido.` }, { status: 400 })
    }
  }

  // Llamada a Anthropic con streaming
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      stream: true,
      system: 'Sos un experto en diseño web, UX/UI y estrategia de conversión para e-commerce y negocios digitales en América Latina. Respondés siempre en español, en formato Markdown estructurado, con copy real y accionable.',
      messages: [{ role: 'user', content: buildPrompt(body) }],
    }),
  })

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text()
    console.error('[generate-site] Anthropic error:', err)
    return NextResponse.json({ error: 'Error al generar contenido.' }, { status: 500 })
  }

  // Proxy del stream SSE de Anthropic → cliente
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const reader = anthropicRes.body!.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          // Parsear eventos SSE de Anthropic y extraer solo el texto
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                controller.enqueue(encoder.encode(parsed.delta.text))
              }
            } catch {
              // Ignorar líneas no-JSON
            }
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

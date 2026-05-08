import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { getResendApiKey, getResendFromDomain } from '@/lib/tenant-credentials'

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const storeId = await getStoreId()
    const service = createServiceClient()

    // 1. Persistir el suscriptor (idempotente — onConflict ignora duplicados)
    const normalizedEmail = email.trim().toLowerCase()
    const { error: insertErr } = await service
      .from('newsletter_subscribers')
      .upsert(
        {
          store_id: storeId,
          email: normalizedEmail,
          source: typeof source === 'string' ? source.slice(0, 40) : null,
        },
        { onConflict: 'store_id,email', ignoreDuplicates: true },
      )

    if (insertErr) {
      console.error('[newsletter] insert error:', insertErr)
      // Seguimos: si la persistencia falla, igual mandamos el email de bienvenida
    }

    // 2. Email de bienvenida con branding del store actual
    const { data: store } = await service
      .from('store_config')
      .select('name, base_url, color_primary, color_accent')
      .eq('id', storeId)
      .single()

    const apiKey = await getResendApiKey(storeId).catch(() => null)
    const domain = await getResendFromDomain(storeId).catch(() => null)

    if (apiKey && domain && store) {
      const { Resend } = await import('resend')
      const resend = new Resend(apiKey)
      const baseUrl = store.base_url ?? process.env.NEXT_PUBLIC_BASE_URL ?? ''

      try {
        await resend.emails.send({
          from: `${store.name} <hola@${domain}>`,
          to: normalizedEmail,
          subject: `¡Bienvenido a ${store.name}! 🎉`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px">
              <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;margin-bottom:16px;color:${store.color_primary}">
                Ya formás parte de ${store.name}
              </h1>
              <p style="font-size:14px;color:#666;line-height:1.6;margin-bottom:24px">
                Vas a ser de los primeros en enterarte de lanzamientos, preventas y descuentos exclusivos.
              </p>
              ${baseUrl ? `<a href="${baseUrl}"
                style="display:inline-block;background:${store.color_accent};color:#fff;padding:14px 28px;text-decoration:none;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">
                Ver tienda
              </a>` : ''}
            </div>
          `,
        })
      } catch (err) {
        console.error('[newsletter] resend send error:', err)
        // No falla el endpoint si Resend tira error — ya persistimos el lead
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[newsletter]', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

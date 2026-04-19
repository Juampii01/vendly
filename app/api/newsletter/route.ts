import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Si Resend está configurado, enviar email de bienvenida
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_DOMAIN) {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: `Ona Store <hola@${process.env.RESEND_FROM_DOMAIN}>`,
        to: email,
        subject: '¡Bienvenida a Ona Store! 🎉',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px">
            <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;margin-bottom:16px">
              Ya sos parte de Ona
            </h1>
            <p style="font-size:14px;color:#666;line-height:1.6;margin-bottom:24px">
              Vas a ser la primera en enterarte de lanzamientos, preventas y descuentos exclusivos.
            </p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}"
              style="display:inline-block;background:#c9a96e;color:#fff;padding:14px 28px;text-decoration:none;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">
              Ver colección
            </a>
          </div>
        `,
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Tenant resolution ────────────────────────────────────────────────────────
//
// Estrategia de routing multi-tenant:
//
//   1. Cookie `__vendly_store` (1 hora) → cero queries en requests subsiguientes
//   2. Subdominio: {slug}.vendly.com   → lookup por store_config.slug
//   3. Dominio propio: ona.com         → lookup en store_domains.domain
//   4. Fallback: NEXT_PUBLIC_STORE_ID  → single-tenant / local dev
//
// El store_id resuelto se inyecta como header `x-store-id` en la request.
// Los Server Components y Route Handlers lo leen vía lib/tenant.ts → getStoreId().

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vendly.com'

/** Hostname no tiene contexto de tienda: local dev, URLs de preview Vercel, etc. */
function isAmbiguousHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname.startsWith('127.') ||
    hostname.startsWith('192.168.') ||
    hostname.endsWith('.vercel.app') ||
    hostname === ROOT_DOMAIN ||
    hostname === `www.${ROOT_DOMAIN}`
  )
}

/**
 * Es el dominio raíz de la plataforma (no una tienda, no dev local).
 * En producción: vendly.com y www.vendly.com.
 * En dev: nunca (localhost es ambiguous).
 */
function isPlatformHost(hostname: string): boolean {
  return hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`
}

/**
 * Extrae el subdominio de un hostname.
 * "ona.vendly.com" → "ona"
 * "ona.localhost"  → "ona"  (local dev)
 * "ona.com"        → null
 */
function extractSubdomain(hostname: string): string | null {
  let sub: string | null = null

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    sub = hostname.slice(0, -(ROOT_DOMAIN.length + 1))
  } else if (hostname.endsWith('.localhost')) {
    // Local dev: adidas.localhost → slug "adidas"
    sub = hostname.slice(0, -('.localhost'.length))
  }

  if (!sub || ['www', 'api', 'admin'].includes(sub)) return null
  return sub
}

/**
 * Resuelve store_id desde el hostname consultando Supabase.
 * Solo se llama cuando el cookie cache no tiene el valor.
 * Usa el cliente anon — store_domains y store_config.slug son datos públicos.
 */
async function resolveStoreFromHostname(hostname: string): Promise<string | null> {
  if (isAmbiguousHost(hostname)) return null

  // Cliente stateless (solo lectura, sin cookies)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  )

  const subdomain = extractSubdomain(hostname)

  if (subdomain) {
    // Subdominio de la plataforma: resolvemos por slug
    const { data } = await supabase
      .from('store_config')
      .select('id')
      .eq('slug', subdomain)
      .single()
    return data?.id ?? null
  }

  // Dominio propio: consultamos store_domains
  const { data } = await supabase
    .from('store_domains')
    .select('store_id')
    .eq('domain', hostname)
    .single()
  return data?.store_id ?? null
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)

  // ── 1. Resolver store_id ────────────────────────────────────────────────────
  //
  // Primero buscamos en cookie (1h TTL) para no pagar una query en cada request.
  // Si no está en cookie, hacemos el lookup por hostname.
  //
  const hostname = (request.headers.get('host') ?? '').split(':')[0]
  const cachedStoreId = request.cookies.get('__vendly_store')?.value ?? null
  let storeId: string | null = cachedStoreId
  let shouldCacheStoreId = false

  if (!storeId) {
    const resolved = await resolveStoreFromHostname(hostname)

    if (resolved) {
      storeId = resolved
      shouldCacheStoreId = true
    } else {
      // Fallback: single-tenant / local dev
      storeId = process.env.NEXT_PUBLIC_STORE_ID ?? null
    }
  }

  // Inyectamos en la request para que llegue a Server Components y Route Handlers
  if (storeId) requestHeaders.set('x-store-id', storeId)

  // ── 2. Supabase — refresh de sesión + auth check ────────────────────────────
  //
  // IMPORTANTE: en setAll recreamos supabaseResponse con los requestHeaders
  // modificados para que x-store-id no se pierda cuando se refrescan los cookies.
  //
  // PERFORMANCE: auth.getUser() hace una llamada de red a Supabase en cada
  // request. Solo la ejecutamos cuando:
  //   a) La ruta requiere autenticación (/admin, /platform)
  //   b) El usuario ya tiene sesión activa (cookie sb-* presente) → necesita refresh
  //
  // Usuarios no autenticados en rutas públicas (store) NO pagan este costo.
  //
  const { pathname } = request.nextUrl
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/platform')
  const hasSessionCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'))

  // PERFORMANCE: auth.getUser() hace una llamada de red (~100-300ms).
  // La corremos solo en rutas que realmente necesitan auth:
  //   - Páginas protegidas: /admin, /platform
  //   - APIs protegidas: /api/admin, /api/platform
  //   - Callback de auth: /auth
  // Rutas públicas del store y APIs públicas nunca pagan este costo.
  const isProtectedApi = pathname.startsWith('/api/admin') || pathname.startsWith('/api/platform')
  const needsAuthCheck = isProtectedRoute || isProtectedApi || (hasSessionCookie && pathname.startsWith('/auth'))

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
  let user: { id: string; email?: string } | null = null

  if (needsAuthCheck) {
    // BUG FIX: el patrón anterior recreaba supabaseResponse dentro de setAll,
    // ANTES de que x-user-email fuera agregado a requestHeaders.
    // Resultado: el Server Component veía x-user-email vacío → redirect loop.
    //
    // Fix: setAll solo acumula las cookies. supabaseResponse se crea UNA SOLA VEZ
    // al final, cuando requestHeaders ya tiene todos los headers (incluido x-user-email).
    //
    type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }
    const pendingAuthCookies: CookieToSet[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Actualizar cookies de request para que getAll() las vea en el mismo ciclo
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            // Acumular para aplicar a supabaseResponse después
            pendingAuthCookies.push(...(cookiesToSet as CookieToSet[]))
          },
        },
      },
    )

    const { data } = await supabase.auth.getUser()
    user = data.user

    // Inyectar datos del usuario — ahora sí, antes de crear supabaseResponse
    if (user) {
      requestHeaders.set('x-user-id', user.id)
      requestHeaders.set('x-user-email', user.email ?? '')
    }

    // Crear la response final con requestHeaders completos (x-store-id + x-user-*)
    supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })

    // Aplicar cookies de auth que Supabase pudo haber refrescado
    for (const { name, value, options } of pendingAuthCookies) {
      supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
    }
  }

  // ── 3. Protección de rutas /admin ───────────────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  // Solo redirigir si el usuario está logueado Y no hay un error de acceso.
  // Sin esta guarda: usuario logueado sin acceso al store → admin/layout redirige a
  // /admin/login?error=sin_acceso → middleware lo manda a /admin → loop infinito.
  //
  // Soporte para ?next=: si la URL tiene un destino válido, usarlo.
  // Ejemplo: platform/layout redirige a /admin/login?next=/platform
  if (pathname === '/admin/login' && user && !request.nextUrl.searchParams.has('error')) {
    const nextParam = request.nextUrl.searchParams.get('next')
    const dest = request.nextUrl.clone()
    dest.search = ''
    dest.pathname = nextParam?.startsWith('/') ? nextParam : '/admin'
    return NextResponse.redirect(dest)
  }

  // ── 4. Cachear store_id en cookie si lo resolvimos por hostname ─────────────
  if (shouldCacheStoreId && storeId) {
    supabaseResponse.cookies.set('__vendly_store', storeId, {
      maxAge: 3600, // 1 hora
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
  }

  // ── 5. Routing raíz de la plataforma ──────────────────────────────────────
  //
  // Aplica en:
  //   - vendly.com / www.vendly.com  → dominio de producción de la plataforma
  //   - localhost / 127.x / 192.168.x → entorno de desarrollo local
  //
  // Sin sesión  → /admin/login?next=/platform  (vuelve a platform tras login)
  // Con sesión  → /platform                    (el layout verifica acceso)
  //
  const isRootContext = isPlatformHost(hostname) || isAmbiguousHost(hostname)
  if (isRootContext && pathname === '/') {
    const dest = request.nextUrl.clone()
    if (user) {
      dest.pathname = '/platform'
      dest.search = ''
    } else {
      dest.pathname = '/admin/login'
      dest.search = '?next=/platform'
    }
    return NextResponse.redirect(dest)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Aplica a todas las rutas excepto assets estáticos y archivos de imagen
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

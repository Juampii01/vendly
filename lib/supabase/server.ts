import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { cache } from 'react'

// ─── createClient — 1 instancia por request (React.cache deduplicates) ────────
//
// Sin cache: cada getStoreConfig(), getCategories(), layout, page, etc.
// creaba su propio cliente (+ await cookies() cada vez).
// Con cache: toda la cadena RSC del mismo request comparte la misma instancia.
//
export const createClient = cache(async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Component — las cookies se setean desde el middleware
          }
        },
      },
    },
  )
})

/**
 * Cliente con service_role para operaciones privilegiadas
 * (webhooks, crons). Nunca exponerlo al browser.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}

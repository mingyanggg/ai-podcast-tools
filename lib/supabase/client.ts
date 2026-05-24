import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — only created when actually used (avoids build-time env issues)
let _supabase: ReturnType<typeof createSupabaseClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    _supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    )
  }
  return _supabase
}

// For compatibility — use this in client components
export const supabase = {
  get auth() { return getSupabase().auth },
  get from() { return getSupabase().from },
  // add other used methods as needed
}

export const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
export const serviceRoleClient = SERVICE_ROLE_KEY
  ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null

export { createSupabaseClient as createClient }

import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Browser/Client-side Supabase client
 * Kullanıcı tarayıcısında çalışır
 */
export function createClientBrowser() {
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}

/**
 * Admin/Service Role Supabase client
 * Server-side admin işlemleri için
 */
export function createClientAdmin() {
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
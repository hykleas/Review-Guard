import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
 * Server-side Supabase client (App Router)
 * Server Components'ta çalışır
 */
export async function createClientServer() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Component'ta cookie set edilemez
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Server Component'ta cookie remove edilemez
          }
        },
      },
    }
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

/**
 * Kullanıcı oturumunu kontrol eder
 */
export async function getSession() {
  const supabase = await createClientServer()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Session error:', error)
    return null
  }
  
  return session
}

/**
 * Mevcut kullanıcıyı getirir
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

/**
 * Kullanıcı profilini getirir
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Profile error:', error)
    return null
  }
  
  return data
}

/**
 * QR Code ID ile profil getirir
 */
export async function getProfileByQRCode(qrCodeId: string) {
  const supabase = await createClientServer()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('qr_code_id', qrCodeId)
    .single()
  
  if (error) {
    console.error('QR Code profile error:', error)
    return null
  }
  
  return data
}
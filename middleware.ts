import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Oturum kontrolü
  const { data: { session } } = await supabase.auth.getSession()

  // Dashboard'a erişim kontrolü
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      // Giriş yapılmamışsa login sayfasına yönlendir
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Login sayfasına erişim kontrolü (giriş yapmış kullanıcı)
  if (request.nextUrl.pathname === '/login') {
    if (session) {
      // Zaten giriş yapmışsa dashboard'a yönlendir
      const redirectUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

// Middleware'in çalışacağı path'ler
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
}
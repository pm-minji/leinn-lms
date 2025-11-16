import { createServerClient } from '@supabase/ssr'
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
        set(name: string, value: string, options: any) {
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
        remove(name: string, options: any) {
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

  const { data: { user } } = await supabase.auth.getUser()

  // 보호된 라우트 확인
  const protectedRoutes = ['/admin', '/coach', '/learner']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // 인증이 필요한 페이지에서 로그인하지 않은 경우
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 역할 기반 접근 제어
  if (user && isProtectedRoute) {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const userRole = userData?.role

      // 관리자 라우트 보호 (admin과 coach만 접근 가능)
      if (request.nextUrl.pathname.startsWith('/admin')) {
        if (userRole !== 'admin' && userRole !== 'coach') {
          return NextResponse.redirect(new URL('/learner/profile', request.url))
        }
      }

      // 코치 라우트 보호 (admin과 coach만 접근 가능)
      if (request.nextUrl.pathname.startsWith('/coach')) {
        if (userRole !== 'admin' && userRole !== 'coach') {
          return NextResponse.redirect(new URL('/learner/profile', request.url))
        }
      }

      // 학습자 라우트 보호 (모든 역할 접근 가능)
      if (request.nextUrl.pathname.startsWith('/learner')) {
        if (!['admin', 'coach', 'learner'].includes(userRole || '')) {
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
    } catch (error) {
      console.error('Middleware error:', error)
      // 에러 발생 시 홈으로 리다이렉션
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
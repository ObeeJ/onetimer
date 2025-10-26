import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ['/', '/login', '/pricing', '/unauthorized']
const authRoutes = ['/auth/', '/filler/auth/', '/creator/auth/', '/admin/auth/', '/super-admin/auth/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow API routes and static files
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next()
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Allow auth routes
  if (authRoutes.some(route => pathname.includes(route))) {
    return NextResponse.next()
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
}
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ['/', '/login', '/pricing', '/unauthorized']
const authRoutes = ['/auth/', '/filler/auth/', '/creator/auth/', '/admin/auth/', '/super-admin/auth/']

// Role-based route protection
const roleRoutes = {
  filler: ['/filler'],
  creator: ['/creator'],
  admin: ['/admin'],
  super_admin: ['/super-admin']
}

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
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check role-based access
  const userRole = request.cookies.get('user_role')?.value
  
  if (userRole) {
    // Check if user is accessing correct role-based routes
    const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || []
    const hasAccess = allowedRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    )
    
    if (!hasAccess) {
      // Redirect to appropriate dashboard based on role
      const dashboardMap = {
        filler: '/filler',
        creator: '/creator',
        admin: '/admin',
        super_admin: '/super-admin'
      }
      
      const redirectUrl = dashboardMap[userRole as keyof typeof dashboardMap] || '/unauthorized'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  } else {
    // No role cookie - redirect to login for protected routes
    const isProtectedRoute = Object.values(roleRoutes).some(routes => 
      routes.some(route => pathname === route || pathname.startsWith(route + '/'))
    )
    
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
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
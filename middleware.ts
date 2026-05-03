import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedPassword = process.env.AUTH_PASSWORD || 'fazil2026'

  if (authHeader) {
    try {
      const authValue = authHeader.split(' ')[1]
      const decoded = atob(authValue)
      const [user, pwd] = decoded.split(':')
      
      if (user === 'admin' && pwd === expectedPassword) {
        return NextResponse.next()
      }
    } catch (e) {
      console.error('Auth decoding failed', e)
    }
  }

  return new NextResponse('Authentication Required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Finance Dashboard"',
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

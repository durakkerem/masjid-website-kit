import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Required by payload-totp (2FA): its admin views need the current path,
 * which server components can't read directly. Without this the admin
 * panel loops between the login and 2FA screens.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.append('x-pathname', request.nextUrl.pathname)
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}

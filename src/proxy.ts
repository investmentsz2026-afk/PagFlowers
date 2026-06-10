import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const { pathname } = req.nextUrl;

  // Protect admin panel routes
  if (pathname.startsWith('/admin')) {
    // Exclude login page from protection to avoid infinite loop
    if (pathname === '/admin/login') {
      // If already logged in, redirect to dashboard
      if (token) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // Redirect to login if token is missing
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

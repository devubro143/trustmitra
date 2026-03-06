import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'tm_session';
const protectedPrefixes = ['/book', '/customer', '/worker', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const url = new URL('/auth', request.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/book/:path*', '/customer/:path*', '/worker/:path*', '/admin/:path*']
};

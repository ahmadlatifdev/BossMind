import { NextResponse } from 'next/server';

const LOCKED_ROUTES = new Set([
  '/', '/pricing', '/about', '/templates', '/contact',
  '/privacy', '/terms', '/admin',
]);

const LOCKED_API = new Set(['/api/checkout']);

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  response.headers.set('X-Route-Owner', pathname.startsWith('/admin') ? 'bossmind' : 'resumora');
  response.headers.set('X-UI-Lock', 'production-confirmed');
  response.headers.set('X-Manifest-Version', '1.0.0');

  if (pathname.startsWith('/admin')) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.svg|robots\\.txt|sitemap\\.xml).*)',
  ],
};

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isPublicBookingHostname } from '@/lib/public-booking-host';

function hostnameFrom(request: NextRequest): string {
  const raw =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    '';
  return raw.split(':')[0].trim().toLowerCase();
}

function isAllowedOnPublicHost(pathname: string): boolean {
  if (pathname === '/reservar' || pathname.startsWith('/reservar/')) return true;
  if (pathname === '/explorar' || pathname.startsWith('/explorar/')) return true;
  if (pathname === '/detalle' || pathname.startsWith('/detalle/')) return true;
  if (pathname === '/finalizar' || pathname.startsWith('/finalizar/')) return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname === '/favicon.ico' || pathname === '/manifest.json') return true;
  if (pathname.startsWith('/api/reservas/disponibles')) return true;
  if (pathname.startsWith('/api/reservas/public')) return true;
  if (/\.(ico|png|jpg|jpeg|gif|webp|svg|json|webmanifest)$/i.test(pathname)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const host = hostnameFrom(request);
  if (!isPublicBookingHostname(host)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/reservar';
    return NextResponse.rewrite(url);
  }

  if (!isAllowedOnPublicHost(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/reservar';
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pedri-public-booking', '1');

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};

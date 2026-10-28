import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore internal Next.js assets, static files, and API endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/stream') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if pathname starts with a supported locale prefix: /en or /ar
  const isEn = pathname === '/en' || pathname.startsWith('/en/');
  const isAr = pathname === '/ar' || pathname.startsWith('/ar/');

  if (isEn || isAr) {
    const locale = isEn ? 'en' : 'ar';
    let internalPath = pathname.replace(/^\/(en|ar)/, '') || '/';
    if (!internalPath.startsWith('/')) {
      internalPath = '/' + internalPath;
    }

    const rewriteUrl = new URL(internalPath + request.nextUrl.search, request.url);
    const response = NextResponse.rewrite(rewriteUrl);

    // Set locale headers and cookies
    response.headers.set('x-zan-lang', locale);
    response.cookies.set('zan_lang', locale, { path: '/', maxAge: 365 * 24 * 60 * 60, sameSite: 'lax' });
    return response;
  }

  // Default Persian locale (no prefix: e.g. /, /courses)
  const response = NextResponse.next();
  response.headers.set('x-zan-lang', 'fa');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

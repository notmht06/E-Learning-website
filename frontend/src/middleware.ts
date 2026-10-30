import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['fa', 'en', 'ar'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip static assets, Next.js internals, media, API, and files with extensions
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/stream') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/audio') ||
    pathname.startsWith('/sample-books') ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot|mp3|mp4|m4a|pdf|json|txt|xml|map)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/');
  const firstSegment = segments[1] as Locale;
  const hasLocalePrefix = SUPPORTED_LOCALES.includes(firstSegment);

  // Case A: URL explicitly starts with /en, /ar, or /fa (e.g., /en/courses or /ar/dashboard)
  if (hasLocalePrefix) {
    const locale = firstSegment;
    if (locale === 'fa') {
      const strippedPathname = '/' + segments.slice(2).join('/');
      const cleanUrl = new URL(strippedPathname === '' ? '/' : strippedPathname, request.url);
      cleanUrl.search = search;
      const redirectResponse = NextResponse.redirect(cleanUrl);
      redirectResponse.cookies.set('zan_lang', 'fa', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
      redirectResponse.headers.set('x-zan-locale', 'fa');
      redirectResponse.headers.set('x-zan-lang', 'fa');
      return redirectResponse;
    }

    const strippedPathname = '/' + segments.slice(2).join('/');
    const targetUrl = new URL(strippedPathname === '' ? '/' : strippedPathname, request.url);
    targetUrl.search = search;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-zan-locale', locale);
    requestHeaders.set('x-zan-lang', locale);

    const response = NextResponse.rewrite(targetUrl, {
      request: {
        headers: requestHeaders,
      },
    });
    response.cookies.set('zan_lang', locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
    response.headers.set('x-zan-locale', locale);
    response.headers.set('x-zan-lang', locale);
    return response;
  }

  // Case B: User clicked an internal link like "/" or "/dashboard" while in 'en' or 'ar' mode
  const cookieLocale = request.cookies.get('zan_lang')?.value as Locale | undefined;
  if (cookieLocale && (cookieLocale === 'en' || cookieLocale === 'ar')) {
    const localizedUrl = new URL(`/${cookieLocale}${pathname === '/' ? '' : pathname}`, request.url);
    localizedUrl.search = search;
    return NextResponse.redirect(localizedUrl);
  }

  const response = NextResponse.next();
  response.headers.set('x-zan-locale', 'fa');
  response.headers.set('x-zan-lang', 'fa');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

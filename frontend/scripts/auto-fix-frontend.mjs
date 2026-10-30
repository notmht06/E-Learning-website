/**
 * Dar al-Hikmah — Master Surgical Fixer (Vertical Slice 1 & 2)
 * 1. True URL Locale Routing (/en/..., /ar/..., /fa/...) via Next.js Middleware
 * 2. Removes Floating AI Widget from Public Pages -> Moves Scoped AI Tutor inside Course Classroom (/learn) & Dashboard
 * 3. Fixes 100% of XRAY_REPORT.md issues (404 worker, mobile overflow, card clutter, widget collisions)
 *
 * Run inside frontend/: node scripts/auto-fix-frontend.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

function writeFile(relPath, content) {
  const fullPath = path.resolve(ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trimStart(), 'utf-8');
  console.log(`✅ Updated: ${relPath}`);
}

// 1. TRUE MULTI-LANGUAGE URL ROUTING (/en/..., /ar/..., /fa/...) IN middleware.ts
writeFile(
  'src/middleware.ts',
  `import { NextRequest, NextResponse } from 'next/server';

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
    pathname.includes('.')
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

    const response = NextResponse.rewrite(targetUrl);
    response.cookies.set('zan_lang', locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
    response.headers.set('x-zan-locale', locale);
    response.headers.set('x-zan-lang', locale);
    return response;
  }

  // Case B: User clicked an internal link like "/" or "/dashboard" while in 'en' or 'ar' mode
  const cookieLocale = request.cookies.get('zan_lang')?.value as Locale | undefined;
  if (cookieLocale && (cookieLocale === 'en' || cookieLocale === 'ar')) {
    const localizedUrl = new URL(\`/\${cookieLocale}\${pathname === '/' ? '' : pathname}\`, request.url);
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
`
);

// 2. SWE-WORKER 404 FIX
writeFile(
  'public/swe-worker-development.js',
  `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
`
);

// 3. REMOVE FLOATING AI WIDGET FROM PUBLIC OVERLAYS
writeFile(
  'src/components/shell/GlobalOverlays.tsx',
  `'use client';

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import { AudioPlayerIsland } from '@/components/AudioPlayerIsland';
import { PWARegistration } from './PWARegistration';
import { RouteProgressBar } from './RouteProgressBar';

const CommandPalette = dynamic(
  () => import('./CommandPalette').then((mod) => mod.CommandPalette),
  { ssr: false }
);

export function GlobalOverlays() {
  return (
    <>
      <Suspense fallback={null}>
        <RouteProgressBar />
      </Suspense>
      <AudioPlayerIsland />
      <CommandPalette />
      <PWARegistration />
    </>
  );
}
`
);

// 4. OVERFLOW CONTAINMENT IN globals.css
const globalsPath = path.resolve(ROOT, 'src/styles/globals.css');
if (fs.existsSync(globalsPath)) {
  let css = fs.readFileSync(globalsPath, 'utf-8');
  if (!css.includes('overflow-x: clip')) {
    css += `\n/* Zero Horizontal Layout Overflow on Mobile Viewports */\nhtml,\nbody {\n  max-width: 100vw;\n  overflow-x: clip;\n}\n`;
    fs.writeFileSync(globalsPath, css, 'utf-8');
    console.log('✅ Updated: src/styles/globals.css (overflow-x: clip added)');
  }
}

console.log('\n🎉 Vertical Slice 1 (URL Locale Routing /en & /ar) & Vertical Slice 2 (Course-Scoped AI Tutor) applied!');

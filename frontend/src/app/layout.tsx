import type { Metadata, Viewport } from 'next';
import { cookies, headers } from 'next/headers';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { DataProvider } from '@/context/DataContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider, Theme } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';
import { GlobalOverlays } from '@/components/shell/GlobalOverlays';
import { Toaster } from 'sonner';
import { SupportedLang } from '@/locales';

export const metadata: Metadata = {
  metadataBase: new URL('https://zanjirzan.ir'),
  title: 'پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی | دروس و معارف علوم عقلی و نقلی',
  description: 'پلتفرم تخصصی نشر کتب فلسفی، رسالات تحلیلی و دوره‌های آموزشی منقح حجت الاسلام دکتر زنجیر زن حسینی',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'حیات',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#8C6834',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headerList = await headers();
  const themeCookie = cookieStore.get('zan_theme')?.value;
  const langCookie = cookieStore.get('zan_lang')?.value;
  const headerLocale = headerList.get('x-zan-locale');

  const initialLang: SupportedLang =
    headerLocale === 'en' || headerLocale === 'ar' || headerLocale === 'fa'
      ? headerLocale
      : langCookie === 'en' || langCookie === 'ar' || langCookie === 'fa'
      ? langCookie
      : 'fa';
  const initialDir = initialLang === 'en' ? 'ltr' : 'rtl';
  const initialTheme: Theme = themeCookie === 'dark' ? 'dark' : 'light';

  return (
    <html
      lang={initialLang}
      dir={initialDir}
      className={initialTheme}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)zan_theme=([^;]+)/);var t=localStorage.getItem('zan_theme')||(m?decodeURIComponent(m[1]):null);var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var isD=t==='dark'||(!t&&d);var cl=document.documentElement.classList;if(isD){cl.add('dark');cl.remove('light');}else{cl.remove('dark');cl.add('light');}var ml=document.cookie.match(/(?:^|;\\s*)zan_lang=([^;]+)/);var l=localStorage.getItem('zan_lang')||(ml?decodeURIComponent(ml[1]):null);if(!l){try{var tz=(Intl&&Intl.DateTimeFormat)?Intl.DateTimeFormat().resolvedOptions().timeZone:'';var nl=((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase();if(tz.indexOf('Tehran')===-1&&tz.indexOf('Iran')===-1){if(nl.indexOf('ar')===0||/Baghdad|Riyadh|Cairo|Damascus|Beirut|Amman|Kuwait|Qatar|Dubai|Muscat|Aden/i.test(tz)){l='ar';}else{l='en';}}else{l='fa';}}catch(e2){l='fa';}}if(l==='fa'||l==='ar'||l==='en'){document.documentElement.lang=l;document.documentElement.dir=l==='en'?'ltr':'rtl';}}catch(e){console&&console.debug&&console.debug(e);}})();`,
          }}
        />
        <link
          rel="preload"
          href="/fonts/dana/DanaFaNum-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/dana/DanaFaNum-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-book-bg dark:bg-book-darkBg text-book-text dark:text-book-darkText min-h-screen transition-colors duration-200 font-sans overflow-x-hidden">
        <ThemeProvider initialTheme={initialTheme}>
          <LanguageProvider initialLang={initialLang}>
            <AuthProvider>
              <DataProvider>
                <PlayerProvider>
                  <CartProvider>
                    {children}
                    <GlobalOverlays />
                    <Toaster
                      position="top-center"
                      richColors
                      dir={initialDir}
                      toastOptions={{
                        className: '!font-sans !font-normal text-xs',
                        classNames: {
                          toast: '!font-sans text-xs',
                          title: '!font-sans font-bold text-xs',
                          description: '!font-sans text-xs',
                        },
                      }}
                    />
                  </CartProvider>
                </PlayerProvider>
              </DataProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

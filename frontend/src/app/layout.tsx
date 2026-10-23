import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Vazirmatn, Lalezar } from 'next/font/google';
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

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazirmatn',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const lalezar = Lalezar({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-lalezar',
  weight: '400',
});

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
  const themeCookie = cookieStore.get('zan_theme')?.value;
  const langCookie = cookieStore.get('zan_lang')?.value;

  const initialLang: SupportedLang =
    langCookie === 'en' || langCookie === 'ar' || langCookie === 'fa' ? langCookie : 'fa';
  const initialDir = initialLang === 'en' ? 'ltr' : 'rtl';
  const initialTheme: Theme = themeCookie === 'dark' ? 'dark' : 'light';

  return (
    <html
      lang={initialLang}
      dir={initialDir}
      className={`${initialTheme} ${vazirmatn.variable} ${lalezar.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)zan_theme=([^;]+)/);var t=localStorage.getItem('zan_theme')||(m?decodeURIComponent(m[1]):null);var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var isD=t==='dark'||(!t&&d);var cl=document.documentElement.classList;if(isD){cl.add('dark');cl.remove('light');}else{cl.remove('dark');cl.add('light');}var ml=document.cookie.match(/(?:^|;\\s*)zan_lang=([^;]+)/);var l=localStorage.getItem('zan_lang')||(ml?decodeURIComponent(ml[1]):null)||'fa';if(l==='fa'||l==='ar'||l==='en'){document.documentElement.lang=l;document.documentElement.dir=l==='en'?'ltr':'rtl';}}catch(e){}})();`,
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
                    <Toaster position="top-center" richColors dir={initialDir} className="font-sans" />
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

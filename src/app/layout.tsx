import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import ThemeProvider from '@/components/providers/ThemeProvider';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'FitDocs — Thư viện tài liệu Fitness', template: '%s | FitDocs' },
  description: 'Thu vien tai lieu Fitness chuyen biet -- PDF, Video, Bai viet huong dan tap luyen va dinh duong.',
  openGraph: { siteName: 'FitDocs', type: 'website' },
};

// Injected before first paint — prevents flash of wrong theme
const themeScript = `(function(){try{
  var t=localStorage.getItem('fitdocs-theme')||'dark';
  document.documentElement.setAttribute('data-theme',t);
  document.documentElement.classList.add(t==='light'?'light':'dark');
}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full dark`} data-theme="dark" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '10px' },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

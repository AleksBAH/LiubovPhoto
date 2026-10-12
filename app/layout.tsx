import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';
import { AppShellClient } from '@/components/app-shell-client';

export const dynamic = 'force-dynamic';

const fontSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Liubov Bakh Photography',
  description: 'Управление проектами фотостудии Liubov Bakh Photography',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Liubov Bakh Photography',
    description: 'Управление проектами фотостудии',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className="font-sans antialiased">
        <ChunkLoadErrorHandler />
        <AppShellClient>{children}</AppShellClient>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

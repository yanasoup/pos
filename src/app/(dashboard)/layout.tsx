import clsx from 'clsx';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import '../globals.css';
import React from 'react';

import { Providers } from '@/providers/provider';

import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export const metadata: Metadata = {
  title: 'POS Retail',
  description: 'Aplikasi Penjualan',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-poppins',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={clsx(poppins.variable, 'antialiased', 'relative')}>
        <Providers>
          <SidebarProvider
            style={
              {
                '--sidebar-width': 'calc(var(--spacing) * 72)',
                '--header-height': 'calc(var(--spacing) * 12)',
              } as React.CSSProperties
            }
          >
            <AppSidebar variant='inset' />
            <SidebarInset>
              <SiteHeader />

              {children}
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}

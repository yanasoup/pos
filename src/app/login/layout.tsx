import clsx from 'clsx';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import '../ocean-breeze.css';

import { Providers } from '@/providers/provider';

export const metadata: Metadata = {
  title: 'New POS Retail ',
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
      <body className={clsx(poppins.variable, 'antialiased')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

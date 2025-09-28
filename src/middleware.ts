// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
// export const runtime = 'edge'; // sudah bisa balik ke edge

export default async function middleware(request: NextRequest) {
  // const token = request.cookies.get('authToken')?.value;
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Panggil API internal Next.js (proxy)
  const checkUrl = new URL('/api/auth/check', request.url);
  checkUrl.searchParams.set('token', token);

  const res = await fetch(checkUrl.toString(), { cache: 'no-store' });

  if (!res.ok) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const data = await res.json();
  // console.log('data', data);
  if (!data.ok) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // cek protected resource authorization
  const grantedMenus = JSON.parse(data.user.data.granted_menus);
  grantedMenus.sort();
  if (!grantedMenus.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL(grantedMenus[0], request.url));
  }

  // ✅ User valid → lanjut
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/penjualan-kasir',
    '/kategori',
    '/pemasok',
    '/inventori',
    '/pembelian',
    '/penjualan',
    '/stok',
    '/laporan-pembelian',
    '/laporan-penjualan',
    '/manajemen-peran',
    '/manajemen-user',
  ],
};

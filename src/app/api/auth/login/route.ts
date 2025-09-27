import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    return NextResponse.json({ message: 'Login failed' }, { status: 401 });
  }

  const data = await res.json();

  // Simpan token ke cookie httpOnly
  const response = NextResponse.json({ user: data.user, token: data.token });

  response.cookies.set('authUser', JSON.stringify(data.user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  response.cookies.set('authToken', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  response.cookies.set('grantedMenus', data.user.granted_menus, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });

  return response;
}

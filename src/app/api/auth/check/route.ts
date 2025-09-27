// app/api/auth/check/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // pakai Node.js runtime untuk fetch Laravel

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { ok: false, message: 'Token missing' },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.trim()}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { ok: false, message: errText },
        { status: res.status }
      );
    }

    const user = await res.json();
    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}

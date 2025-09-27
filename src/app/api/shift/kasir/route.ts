// app/api/auth/check/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { DBUser } from '@/types/user';
import { customAxios } from '@/lib/customAxios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const runtime = 'nodejs'; // pakai Node.js runtime untuk fetch Laravel

// status shift
export async function GET(req: Request) {
  // await wait(500);
  // const { searchParams } = new URL(req.url);
  // const date = searchParams.get('date');
  const date = format(new Date(), 'yyyy-MM-dd', { locale: id });

  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  const user = JSON.parse(
    cookieStore.get('authUser')?.value as string
  ) as DBUser;

  if (!token) {
    return NextResponse.json(
      { ok: false, message: 'Token missing' },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/shif_status?date=${date}&userid=${user.id}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.trim()}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.status) {
      const errText = await res.statusText;
      return NextResponse.json(
        { ok: false, message: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}

// close shift
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  const data = await req.formData();

  const params = {
    balance: data.get('balance'),
    closing_status: data.get('closing_status'),
    shift_id: data.get('shift_id'),
  };
  // console.log('params', params);

  if (!token) {
    return NextResponse.json(
      { ok: false, message: 'Token missing' },
      { status: 401 }
    );
  }

  try {
    const res = await customAxios.post(`/close_shift`, params, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'PUT',
        Authorization: `Bearer ${token.trim()}`,
      },
      // cache: 'no-store',
    });

    if (!res.status) {
      const errText = res.statusText;
      return NextResponse.json(
        { ok: false, message: errText },
        { status: res.status }
      );
    }

    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message, detail: err.response.data },
      { status: err.response.status }
    );
  }
}

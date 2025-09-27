import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { customAxios } from '@/lib/customAxios';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  const { id: shift_id } = await context.params;

  console.log('input shift_id', shift_id);
  // return NextResponse.json({ status: 200, data: params });

  if (!token) {
    return NextResponse.json(
      { ok: false, message: 'Token missing' },
      { status: 401 }
    );
  }
  try {
    const res = await customAxios.get(`/shifts/${shift_id}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.trim()}`,
      },
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

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  const { id: shift_id } = await context.params;
  const data = await req.formData();

  // console.log('input shift_id', shift_id);
  // return NextResponse.json({ status: 200, data: params });

  if (!token) {
    return NextResponse.json(
      { ok: false, message: 'Token missing' },
      { status: 401 }
    );
  }
  try {
    const res = await customAxios.post(
      `/shifts/${shift_id}`,
      {
        balance: data.get('balance'),
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.trim()}`,
          'X-HTTP-Method-Override': 'PUT',
        },
      }
    );

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

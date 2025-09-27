import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { customAxios } from '@/lib/customAxios';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  const { searchParams } = new URL(req.url);
  const params = {
    date_from: searchParams?.get('date_from'),
    date_to: searchParams?.get('date_to'),
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    queryString: searchParams.get('queryString'),
    kasir: searchParams.get('kasir'),
    status: searchParams.get('status'),
    selisih: searchParams.get('selisih'),
  };

  // return NextResponse.json({ status: 200, data: params });

  if (!token) {
    return NextResponse.json(
      { ok: false, message: 'Token missing' },
      { status: 401 }
    );
  }
  try {
    const res = await customAxios.get(`/shifts`, {
      params: params,
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

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  const data = await req.formData();

  if (!token) {
    return NextResponse.json(
      { ok: false, message: 'Token missing' },
      { status: 401 }
    );
  }
  try {
    const res = await customAxios.post(
      `/shifts`,
      {
        balance: data.get('balance'),
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.trim()}`,
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

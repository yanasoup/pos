// app/api/session/route.ts
import { cookies } from 'next/headers';

export async function GET() {
  const cookiesStore = await cookies();
  const session = cookiesStore.get('grantedMenus')?.value || null;
  return Response.json({ session });
}

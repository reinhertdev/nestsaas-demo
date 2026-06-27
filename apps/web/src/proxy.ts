import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/proxy';

const protectedRoutes = ['/dashboard'];
const authRoutes = ['/login', '/signup'];

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (protectedRoutes.some((route) => path.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authRoutes.some((route) => path.startsWith(route)) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

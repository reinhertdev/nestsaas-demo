'use server';

import { createClient } from '@/lib/supabase/server';

async function getAdminHeaders() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Unauthorized');
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

const API = process.env.API_URL ?? 'http://localhost:3001';

export async function getAdminUsers() {
  const headers = await getAdminHeaders();
  const res = await fetch(`${API}/api/admin/users`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getAdminStats() {
  const headers = await getAdminHeaders();
  const res = await fetch(`${API}/api/admin/stats`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

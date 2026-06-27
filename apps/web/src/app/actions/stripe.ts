'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function getAccessToken() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) redirect('/login');
  return data.session.access_token;
}

const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

export async function createCheckout(priceId: string) {
  const token = await getAccessToken();
  const res = await fetch(`${apiUrl}/api/stripe/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ priceId }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Checkout error:', res.status, body);
    throw new Error(`Failed to create checkout session: ${body}`);
  }
  const { url } = await res.json();
  redirect(url);
}

export async function createPortalSession() {
  const token = await getAccessToken();
  const res = await fetch(`${apiUrl}/api/stripe/portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to create portal session');
  const { url } = await res.json();
  redirect(url);
}

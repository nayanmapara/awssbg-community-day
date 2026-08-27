import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { SUPABASE_URL } from '@/lib/supabase/config';

/**
 * Vercel Cron -> pulls the registration count from Luma into event_settings.
 * Runs with the service role key, so it bypasses RLS. Never call from a client.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { LUMA_API_KEY, LUMA_EVENT_ID, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!LUMA_API_KEY || !LUMA_EVENT_ID) {
    return NextResponse.json({ skipped: 'Luma not configured' });
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ skipped: 'SUPABASE_SERVICE_ROLE_KEY not set' }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://api.lu.ma/public/v1/event/get-guests?event_api_id=${LUMA_EVENT_ID}`,
      { headers: { 'x-luma-api-key': LUMA_API_KEY }, cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`Luma responded ${res.status}`);

    const json = await res.json();
    const count = Array.isArray(json?.entries)
      ? json.entries.filter((g: { guest?: { approval_status?: string } }) =>
          g.guest?.approval_status === 'approved').length
      : 0;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    await supabase.from('event_settings').update({ registered_count: count }).eq('id', true);

    revalidatePath('/');
    return NextResponse.json({ ok: true, count });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

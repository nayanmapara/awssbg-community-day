import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '@/lib/supabase/config';

const TABLES = [
  'event_settings', 'agenda_items', 'speakers', 'agenda_speakers', 'team_members',
  'sponsors', 'highlights', 'faqs', 'gallery_items', 'announcements',
  'checkins', 'profiles',
];

/**
 * Nightly JSON snapshot of every table, written to the private "backups"
 * Storage bucket. Create that bucket once in the Supabase dashboard.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ skipped: 'SUPABASE_SERVICE_ROLE_KEY not set' }, { status: 503 });
  }

  const supabase = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } });

  const snapshot: Record<string, unknown> = { takenAt: new Date().toISOString() };
  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) return NextResponse.json({ error: `${table}: ${error.message}` }, { status: 500 });
    snapshot[table] = data;
  }

  const name = `backup-${new Date().toISOString().slice(0, 10)}.json`;
  const { error } = await supabase.storage
    .from('backups')
    .upload(name, JSON.stringify(snapshot, null, 2), {
      contentType: 'application/json',
      upsert: true,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, file: name });
}

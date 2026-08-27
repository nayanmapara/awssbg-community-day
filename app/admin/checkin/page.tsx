import { requireSection } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CheckinConsole } from '@/components/admin/CheckinConsole';
import type { Checkin } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function CheckinPage() {
  await requireSection('checkin');
  const supabase = await createClient();

  const [{ data: settings }, { data: rows }, { count }] = await Promise.all([
    supabase.from('event_settings').select('registered_count').eq('id', true).single(),
    supabase.from('checkins').select('*').order('checked_in_at', { ascending: false }).limit(25),
    supabase.from('checkins').select('id', { count: 'exact', head: true }),
  ]);

  return (
    <CheckinConsole
      recent={(rows ?? []) as Checkin[]}
      total={count ?? 0}
      registered={settings?.registered_count ?? 0}
    />
  );
}

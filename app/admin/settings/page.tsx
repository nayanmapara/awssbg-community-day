import { requireSection } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/admin/SettingsForm';
import type { EventSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireSection('settings');
  const supabase = await createClient();
  const { data } = await supabase.from('event_settings').select('*').eq('id', true).single();

  return <SettingsForm settings={data as EventSettings} />;
}

import { requireSection } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { LuckyDrawConsole, type LuckyDrawEntrant } from '@/components/admin/LuckyDrawConsole';

export const dynamic = 'force-dynamic';

export default async function LuckyDrawPage() {
  await requireSection('lucky-draw');
  const supabase = await createClient();

  const { data } = await supabase
    .from('builder_profiles')
    .select('id, display_name')
    .order('created_at', { ascending: true });

  return <LuckyDrawConsole entrants={(data ?? []) as LuckyDrawEntrant[]} />;
}

import { c } from '@/lib/tokens';
import { requireProfile, can, CAN_PUBLISH } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { COLLECTIONS } from '@/lib/collections';
import { Sidebar } from '@/components/admin/Sidebar';
import { PublishBar, type DiffEntry } from '@/components/admin/PublishBar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const supabase = await createClient();

  // One query for every pending draft across all publishable sections — see
  // the pending_drafts view in supabase-schema.sql — instead of fanning out a
  // separate query per table on every admin navigation. It carries the same
  // RLS as the base tables, so this is a read filtered further by `can()`
  // below, not the security boundary itself.
  const { data } = await supabase
    .from('pending_drafts')
    .select('section, id, label')
    .overrideTypes<{ section: string; id: string; label: string }[], { merge: false }>();

  const drafts: Record<string, number> = {};
  const diff: DiffEntry[] = [];

  (data ?? []).forEach((row) => {
    const key = row.section; // the view's "section" column holds the collection key
    if (!can(profile.role, key)) return;
    const spec = COLLECTIONS[key];
    if (!spec) return;
    drafts[key] = (drafts[key] ?? 0) + 1;
    diff.push({ label: row.label || 'Untitled record', section: spec.section });
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: c.bg, color: c.text, fontSize: 13 }}>
      <Sidebar role={profile.role} name={profile.display_name} drafts={drafts} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <PublishBar
          breadcrumb="Community Day 2026"
          diff={diff}
          canPublish={CAN_PUBLISH.includes(profile.role)}
        />
        <div style={{ padding: '28px 24px 64px', flex: 1 }}>{children}</div>
      </main>
    </div>
  );
}

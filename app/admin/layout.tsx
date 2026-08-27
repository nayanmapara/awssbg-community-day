import { c } from '@/lib/tokens';
import { requireProfile, can, CAN_PUBLISH } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { COLLECTIONS, PUBLISHABLE } from '@/lib/collections';
import { Sidebar } from '@/components/admin/Sidebar';
import { PublishBar, type DiffEntry } from '@/components/admin/PublishBar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const supabase = await createClient();

  // Count pending drafts per section and build the publish diff in one pass.
  const drafts: Record<string, number> = {};
  const diff: DiffEntry[] = [];

  await Promise.all(
    PUBLISHABLE.map(async (key) => {
      if (!can(profile.role, key)) return;
      const spec = COLLECTIONS[key];
      const { data } = await supabase
        .from(spec.table)
        .select(`id, ${spec.labelField}`)
        .eq('status', 'draft')
        .overrideTypes<Record<string, unknown>[], { merge: false }>();

      if (data?.length) {
        drafts[key] = data.length;
        data.forEach((row) => {
          const raw = row[spec.labelField];
          diff.push({ label: String(raw || 'Untitled record'), section: spec.section });
        });
      }
    })
  );

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

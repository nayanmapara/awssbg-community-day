import { requireSection } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { c } from '@/lib/tokens';

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
  await requireSection('activity');
  const supabase = await createClient();

  const { data } = await supabase
    .from('audit_log')
    .select('id, action, table_name, record_id, created_at, profiles(display_name)')
    .order('created_at', { ascending: false })
    .limit(150);

  const rows = data ?? [];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>Activity Log</h1>
      <p style={{ color: c.muted, margin: '0 0 8px', fontSize: 13, maxWidth: 560 }}>
        Written by database triggers, so nothing can bypass it. Every change stores its previous
        value in the <code>diff</code> column for recovery.
      </p>

      <div style={{ marginTop: 22, border: `1px solid ${c.line}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 1fr', gap: 12, padding: '12px 18px', background: c.card, borderBottom: `1px solid ${c.line}` }}>
          {['WHO', 'WHAT', 'ACTION', 'WHEN'].map((h) => (
            <div key={h} style={{ fontSize: 9, color: c.muted, letterSpacing: '0.1em', fontWeight: 700 }}>{h}</div>
          ))}
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: 44, textAlign: 'center', color: c.faint, fontSize: 12 }}>No changes recorded yet.</div>
        ) : (
          rows.map((r: Record<string, unknown>) => (
            <div key={String(r.id)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 1fr', gap: 12, padding: '13px 18px', borderBottom: `1px solid ${c.lineSoft}`, background: c.panel }}>
              <div style={{ fontSize: 12, color: c.textBright, fontWeight: 600 }}>
                {(r.profiles as { display_name?: string } | null)?.display_name ?? 'System'}
              </div>
              <div style={{ fontSize: 12, color: c.muted }}>{String(r.table_name).replace(/_/g, ' ')}</div>
              <div style={{ fontSize: 11, color: c.accent, fontWeight: 700, letterSpacing: '0.04em' }}>
                {String(r.action).toUpperCase()}
              </div>
              <div style={{ fontSize: 11, color: c.faint }}>
                {new Date(String(r.created_at)).toLocaleString('en-CA')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

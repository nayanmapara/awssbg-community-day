import Link from 'next/link';
import { c } from '@/lib/tokens';
import { requireProfile, can } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { COLLECTIONS, PUBLISHABLE } from '@/lib/collections';

export const dynamic = 'force-dynamic';

interface Check { mark: string; color: string; textColor: string; text: string }

export default async function AdminDashboard() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const count = async (table: string, filter?: (q: ReturnType<typeof supabase.from>) => unknown) => {
    let q = supabase.from(table).select('id', { count: 'exact', head: true });
    if (filter) q = filter(q as never) as typeof q;
    const { count: n } = await q;
    return n ?? 0;
  };

  const [
    settings, agendaCount, speakersLive, sponsorCount, galleryCount, checkinCount, tbaCount, recent,
  ] = await Promise.all([
    supabase.from('event_settings').select('*').eq('id', true).single().then((r) => r.data),
    count('agenda_items', (q) => (q as never as { eq: Function }).eq('status', 'published')),
    count('speakers', (q) => (q as never as { eq: Function }).eq('status', 'published')),
    count('sponsors', (q) => (q as never as { eq: Function }).eq('status', 'published')),
    count('gallery_items', (q) => (q as never as { eq: Function }).eq('status', 'published')),
    count('checkins'),
    supabase.from('agenda_items').select('id, attribution').ilike('attribution', '%TBA%')
      .then((r) => r.data?.length ?? 0),
    supabase.from('audit_log')
      .select('id, action, table_name, record_id, created_at, profiles(display_name)')
      .order('created_at', { ascending: false }).limit(6)
      .then((r) => r.data ?? []),
  ]);

  let pending = 0;
  await Promise.all(
    PUBLISHABLE.map(async (key) => {
      if (!can(profile.role, key)) return;
      const { count: n } = await supabase
        .from(COLLECTIONS[key].table).select('id', { count: 'exact', head: true }).eq('status', 'draft');
      pending += n ?? 0;
    })
  );

  const days = settings
    ? Math.max(0, Math.ceil((new Date(settings.starts_at).getTime() - Date.now()) / 86400000))
    : 0;

  const ok = (text: string): Check => ({ mark: '✓', color: c.accent, textColor: c.muted, text });
  const warn = (text: string): Check => ({ mark: '!', color: c.warn, textColor: c.warnText, text });

  const checks: Check[] = [
    speakersLive === 0
      ? warn('No speakers published — the Speakers page is showing radar placeholders.')
      : ok(`${speakersLive} speaker(s) live on the site.`),
    sponsorCount === 0
      ? warn('No sponsors added — the section is showing "your logo here" tiles.')
      : ok(`${sponsorCount} sponsor(s) live.`),
    galleryCount === 0
      ? warn('Gallery is empty — placeholder slots showing on the home page.')
      : ok(`${galleryCount} gallery photo(s) live.`),
    tbaCount > 0
      ? warn(`${tbaCount} agenda session(s) still marked TBA.`)
      : ok('Every agenda session has attribution.'),
    pending > 0
      ? warn(`${pending} unpublished change(s) waiting.`)
      : ok('Site matches the database — nothing pending.'),
  ];

  const kpis = [
    { value: days, label: 'DAYS TO GO', color: c.accent },
    { value: pending, label: 'PENDING CHANGES', color: pending ? c.warn : c.textBright },
    { value: agendaCount, label: 'AGENDA SESSIONS', color: c.textBright },
    { value: speakersLive, label: 'SPEAKERS LIVE', color: speakersLive ? c.textBright : c.warn },
    { value: settings?.registered_count ?? 0, label: 'REGISTERED', color: c.textBright },
    { value: checkinCount, label: 'CHECKED IN', color: c.textBright },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>
        Good to see you, {profile.display_name.split(' ')[0]}
      </h1>
      <p style={{ color: c.muted, margin: '0 0 24px', fontSize: 13 }}>
        {days} days until doors open · {settings?.venue_name}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 1, background: c.line, border: `1px solid ${c.line}`, marginBottom: 28 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: c.panel, padding: 20 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: c.muted, letterSpacing: '0.07em', marginTop: 6, fontWeight: 600 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
        <div style={{ background: c.panel, border: `1px solid ${c.borderMid}`, padding: 22 }}>
          <div style={{ fontSize: 11, color: c.accent, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>
            READINESS CHECKS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {checks.map((ch, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: ch.color, fontWeight: 800, fontSize: 12, flex: '0 0 14px' }}>{ch.mark}</span>
                <span style={{ fontSize: 12, color: ch.textColor, lineHeight: 1.5 }}>{ch.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: c.panel, border: `1px solid ${c.borderMid}`, padding: 22 }}>
          <div style={{ fontSize: 11, color: c.accent, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>
            RECENT ACTIVITY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recent.length === 0 && <div style={{ fontSize: 12, color: c.faint }}>No changes recorded yet.</div>}
            {recent.map((a: Record<string, unknown>) => {
              const who = (a.profiles as { display_name?: string } | null)?.display_name ?? 'Someone';
              return (
                <div key={String(a.id)}>
                  <div style={{ fontSize: 12, color: c.text }}>
                    {who} {String(a.action)} {String(a.table_name).replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: 10, color: c.faint, marginTop: 3 }}>
                    {new Date(String(a.created_at)).toLocaleString('en-CA')}
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/admin/activity" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', display: 'inline-block', marginTop: 16 }}>
            FULL LOG →
          </Link>
        </div>
      </div>
    </div>
  );
}

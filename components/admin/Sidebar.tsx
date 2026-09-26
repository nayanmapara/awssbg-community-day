'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { c } from '@/lib/tokens';
import { can, ROLE_LABELS } from '@/lib/roles';
import { ChipLogo } from '@/components/site/ChipLogo';
import type { MemberRole } from '@/lib/types';

const GROUPS: { label: string; items: { key: string; href: string; label: string }[] }[] = [
  { label: 'OVERVIEW', items: [{ key: 'dashboard', href: '/admin', label: 'Dashboard' }] },
  {
    label: 'CONTENT',
    items: [
      { key: 'agenda', href: '/admin/agenda', label: 'Agenda' },
      { key: 'speakers', href: '/admin/speakers', label: 'Speakers' },
      { key: 'team', href: '/admin/team', label: 'Team & Members' },
      { key: 'sponsors', href: '/admin/sponsors', label: 'Sponsors' },
      { key: 'highlights', href: '/admin/highlights', label: 'Highlights' },
      { key: 'stats', href: '/admin/stats', label: 'Stats' },
      { key: 'faqs', href: '/admin/faqs', label: 'FAQ' },
      { key: 'gallery', href: '/admin/gallery', label: 'Gallery' },
    ],
  },
  {
    label: 'LIVE',
    items: [
      { key: 'announcements', href: '/admin/announcements', label: 'Announcements' },
      { key: 'checkin', href: '/admin/checkin', label: 'Door Check-in' },
      { key: 'lucky-draw', href: '/admin/lucky-draw', label: 'Lucky Draw' },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { key: 'settings', href: '/admin/settings', label: 'Event Settings' },
      { key: 'users', href: '/admin/users', label: 'Users & Roles' },
      { key: 'activity', href: '/admin/activity', label: 'Activity Log' },
    ],
  },
];

export function Sidebar({
  role, name, drafts,
}: {
  role: MemberRole;
  name: string;
  drafts: Record<string, number>;
}) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 236, flex: '0 0 236px', borderRight: `1px solid ${c.line}`,
        background: c.bgAlt, display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}
    >
      <div style={{ padding: '20px 18px', borderBottom: `1px solid ${c.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <ChipLogo size={22} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em' }}>SBG ADMIN</div>
          <div style={{ fontSize: 9, color: c.faint, letterSpacing: '0.06em', marginTop: 2 }}>COMMUNITY DAY 2026</div>
        </div>
      </div>

      <nav style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {GROUPS.map((g) => {
          const items = g.items.filter((it) => it.key === 'dashboard' || can(role, it.key));
          if (items.length === 0) return null;
          return (
            <div key={g.label}>
              <div style={{ fontSize: 9, color: c.faintest, letterSpacing: '0.1em', fontWeight: 700, padding: '0 8px 8px' }}>
                {g.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {items.map((it) => {
                  const active = it.href === '/admin' ? pathname === '/admin' : pathname.startsWith(it.href);
                  const badge = drafts[it.key];
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                        background: active ? c.cardActive : 'transparent',
                        color: active ? c.textBright : c.muted,
                        borderLeft: `2px solid ${active ? c.accent : 'transparent'}`,
                        padding: '9px 10px', fontSize: 12, fontWeight: active ? 700 : 500,
                      }}
                    >
                      <span>{it.label}</span>
                      {badge ? (
                        <span style={{ fontSize: 9, color: c.warn, fontWeight: 700 }}>{badge}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div style={{ padding: 14, borderTop: `1px solid ${c.line}` }}>
        <div style={{ fontSize: 9, color: c.faintest, letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>
          SIGNED IN
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: c.textBright }}>{name}</div>
        <div style={{ fontSize: 10, color: c.accent, letterSpacing: '0.05em', fontWeight: 700, marginTop: 3 }}>
          {ROLE_LABELS[role].toUpperCase()}
        </div>
        <form action="/auth/signout" method="post" style={{ marginTop: 12 }}>
          <button
            type="submit"
            style={{
              width: '100%', background: 'none', border: `1px solid ${c.border}`, color: c.muted,
              padding: '8px 10px', fontSize: 10, letterSpacing: '0.06em', fontWeight: 700, cursor: 'pointer',
            }}
          >
            SIGN OUT
          </button>
        </form>
      </div>
    </aside>
  );
}

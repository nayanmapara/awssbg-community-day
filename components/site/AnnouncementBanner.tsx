'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { c } from '@/lib/tokens';
import type { Announcement } from '@/lib/types';

const STYLES = {
  info: { bg: c.card, border: c.border, text: c.text },
  important: { bg: c.warnBg, border: c.warnBorder, text: c.warnText },
  urgent: { bg: '#2a1318', border: '#5a2028', text: '#f0b8b8' },
} as const;

/**
 * Reads live on every page load rather than at build time, so a day-of room
 * change appears immediately without a publish step.
 */
export function AnnouncementBanner() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [exiting, setExiting] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase.from('announcements').select('*').eq('active', true);
      if (!cancelled) setItems((data ?? []) as Announcement[]);
    };
    load();

    const channel = supabase
      .channel('announcements-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, load)
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, []);

  const dismiss = (id: string) => {
    setExiting((e) => [...e, id]);
    window.setTimeout(() => {
      setDismissed((d) => [...d, id]);
      setExiting((e) => e.filter((x) => x !== id));
    }, 320);
  };

  const visible = items.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div style={{ position: 'relative', zIndex: 40 }}>
      {visible.map((a) => {
        const s = STYLES[a.level] ?? STYLES.info;
        const isExiting = exiting.includes(a.id);
        return (
          <div
            key={a.id}
            role="status"
            className={`announce-banner announce-banner--${a.level}${isExiting ? ' announce-banner--exit' : ''}`}
            style={{
              background: s.bg, borderBottom: `1px solid ${s.border}`, color: s.text,
              padding: '12px 44px 12px 20px', fontSize: 13, textAlign: 'center', position: 'relative',
            }}
          >
            {a.link_url ? <a href={a.link_url}>{a.body}</a> : a.body}
            <button
              onClick={() => dismiss(a.id)}
              aria-label="Dismiss announcement"
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'inherit', opacity: 0.6,
                cursor: 'pointer', fontSize: 15, lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

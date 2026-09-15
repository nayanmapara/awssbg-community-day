'use client';
import { useState, useTransition } from 'react';
import { c } from '@/lib/tokens';
import { updateSettings } from '@/lib/actions';
import type { EventSettings } from '@/lib/types';
import { EVENT_TIME_ZONE, fromDatetimeLocalInput, toDatetimeLocalInput } from '@/lib/event-time';

const FIELDS: { key: keyof EventSettings; label: string; hint?: string; type?: 'text' | 'area' | 'datetime' }[] = [
  { key: 'name', label: 'EVENT NAME', hint: 'Used in page titles and share cards.' },
  { key: 'starts_at', label: 'STARTS', type: 'datetime', hint: `Drives the countdown and live agenda mode (${EVENT_TIME_ZONE}).` },
  { key: 'ends_at', label: 'ENDS', type: 'datetime', hint: `Event local time (${EVENT_TIME_ZONE}).` },
  { key: 'venue_name', label: 'VENUE NAME' },
  { key: 'venue_address', label: 'VENUE ADDRESS' },
  { key: 'map_query', label: 'MAP SEARCH QUERY', hint: 'Feeds the embedded map and the directions link.' },
  { key: 'registration_url', label: 'REGISTRATION URL', hint: 'Every Register button on the site points here.' },
  { key: 'cost_label', label: 'COST LABEL', hint: 'Shown in the hero info strip.' },
  { key: 'capacity_note', label: 'CAPACITY NOTE', hint: 'Kicker above the final call to action.' },
  { key: 'hero_headline', label: 'HERO HEADLINE' },
  { key: 'hero_subline', label: 'HERO SUBLINE', type: 'area' },
];

export function SettingsForm({ settings }: { settings: EventSettings }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    FIELDS.forEach((f) => {
      const raw = settings?.[f.key];
      v[f.key as string] = f.type === 'datetime'
        ? toDatetimeLocalInput((raw as string) ?? null)
        : raw == null ? '' : String(raw);
    });
    return v;
  });
  const [open, setOpen] = useState(settings?.registration_open ?? true);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const save = () => {
    const payload: Record<string, string> = { registration_open: String(open) };
    FIELDS.forEach((f) => {
      const v = values[f.key as string];
      payload[f.key as string] = f.type === 'datetime' && v ? fromDatetimeLocalInput(v) : v;
    });
    start(async () => {
      const res = await updateSettings(payload);
      setMsg(res.ok ? 'Saved — the public site has been revalidated.' : res.error ?? 'Save failed');
    });
  };

  const input: React.CSSProperties = {
    width: '100%', background: c.card, color: c.text,
    border: `1px solid ${c.border}`, padding: '10px 12px', fontSize: 12,
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>Event Settings</h1>
      <p style={{ color: c.muted, margin: '0 0 24px', fontSize: 13 }}>
        These values drive the hero, countdown, location block and every call to action on the public site.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {FIELDS.map((f) => (
          <div key={f.key as string}>
            <label style={{ display: 'block', fontSize: 10, color: c.muted, letterSpacing: '0.07em', fontWeight: 700, marginBottom: 6 }}>
              {f.label}
            </label>
            {f.type === 'area' ? (
              <textarea
                rows={3}
                value={values[f.key as string]}
                onChange={(e) => setValues((s) => ({ ...s, [f.key as string]: e.target.value }))}
                style={{ ...input, lineHeight: 1.6, resize: 'vertical' }}
              />
            ) : (
              <input
                type={f.type === 'datetime' ? 'datetime-local' : 'text'}
                value={values[f.key as string]}
                onChange={(e) => setValues((s) => ({ ...s, [f.key as string]: e.target.value }))}
                style={input}
              />
            )}
            {f.hint && <div style={{ fontSize: 10, color: c.faint, marginTop: 5 }}>{f.hint}</div>}
          </div>
        ))}

        <div>
          <label style={{ display: 'block', fontSize: 10, color: c.muted, letterSpacing: '0.07em', fontWeight: 700, marginBottom: 6 }}>
            REGISTRATION STATE
          </label>
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              background: open ? c.accent : 'transparent',
              color: open ? c.bg : c.muted,
              border: `1px solid ${open ? c.accent : c.border}`,
              padding: '9px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer',
            }}
          >
            {open ? 'OPEN — ACCEPTING SIGNUPS' : 'CLOSED'}
          </button>
          <div style={{ fontSize: 10, color: c.faint, marginTop: 5 }}>
            Closing it swaps every Register button for a &quot;registration closed&quot; state.
          </div>
        </div>
      </div>

      {msg && <p style={{ fontSize: 12, color: c.accent, marginTop: 20 }}>{msg}</p>}

      <button
        onClick={save}
        disabled={pending}
        style={{
          marginTop: 26, background: c.accent, color: c.bg, border: 'none',
          padding: '12px 26px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          cursor: pending ? 'wait' : 'pointer',
        }}
      >
        {pending ? 'SAVING…' : 'SAVE SETTINGS'}
      </button>
    </div>
  );
}

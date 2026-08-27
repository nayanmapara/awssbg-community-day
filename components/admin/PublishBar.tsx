'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { c } from '@/lib/tokens';
import { publishAll } from '@/lib/actions';

export interface DiffEntry { label: string; section: string }

export function PublishBar({
  breadcrumb, diff, canPublish,
}: {
  breadcrumb: string;
  diff: DiffEntry[];
  canPublish: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const count = diff.length;
  const enabled = count > 0 && canPublish;

  const confirm = () => {
    start(async () => {
      const res = await publishAll();
      if (!res.ok) { setError(res.error ?? 'Publish failed'); return; }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 20, background: 'rgba(10,15,28,0.94)',
          backdropFilter: 'blur(8px)', borderBottom: `1px solid ${c.line}`,
          padding: '14px 24px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 7, height: 7, background: c.accent, animation: 'blink 2s step-end infinite' }} />
          <span style={{ fontSize: 11, color: c.muted, letterSpacing: '0.05em' }}>{breadcrumb}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: count ? c.warn : c.faint }}>
            {count ? `${count} UNPUBLISHED` : 'ALL SYNCED'}
          </span>
          <button
            onClick={() => (enabled ? setOpen(true) : null)}
            disabled={!enabled}
            title={canPublish ? undefined : 'Your role cannot publish — ask an admin to review.'}
            style={{
              background: enabled ? c.accent : 'transparent',
              color: enabled ? c.bg : c.faint,
              border: `1px solid ${enabled ? c.accent : c.border}`,
              padding: '9px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              cursor: enabled ? 'pointer' : 'not-allowed',
            }}
          >
            PUBLISH TO SITE
          </button>
        </div>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(4,7,14,0.78)' }} />
          <div style={{ position: 'relative', width: 'min(520px,100%)', background: c.bgAlt, border: `1px solid ${c.border}`, padding: 28, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 10, color: c.accent, letterSpacing: '0.08em', fontWeight: 700 }}>
              REVIEW BEFORE GOING LIVE
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '10px 0 6px' }}>
              {count} change{count === 1 ? '' : 's'} will go live
            </h2>
            <p style={{ color: c.muted, fontSize: 12, lineHeight: 1.6, margin: '0 0 20px' }}>
              Publishing revalidates only the affected pages. Live in about two seconds, no redeploy.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: c.line, border: `1px solid ${c.line}`, marginBottom: 22 }}>
              {diff.map((d, i) => (
                <div key={i} style={{ background: c.panel, padding: '13px 16px', display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: c.textBright }}>{d.label}</span>
                  <span style={{ fontSize: 10, color: c.accent, letterSpacing: '0.05em', fontWeight: 700 }}>
                    {d.section.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            {error && <p style={{ color: c.danger, fontSize: 12, marginBottom: 16 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={confirm}
                disabled={pending}
                style={{ background: c.accent, color: c.bg, border: 'none', padding: '12px 24px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', cursor: pending ? 'wait' : 'pointer' }}
              >
                {pending ? 'PUBLISHING…' : 'PUBLISH NOW'}
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: `1px solid ${c.border}`, color: c.muted, padding: '12px 24px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer' }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

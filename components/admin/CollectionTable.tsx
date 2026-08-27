'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { c } from '@/lib/tokens';
import { archiveRecord, reorder, setStatus } from '@/lib/actions';
import { RecordDrawer } from './RecordDrawer';
import type { CollectionSpec } from '@/lib/collections';

type Row = Record<string, unknown> & { id: string; status?: string };

const fmtCell = (spec: CollectionSpec, row: Row, key: string): string => {
  const raw = row[key];
  if (raw == null || raw === '') return '—';
  if (key.endsWith('_at')) {
    return new Date(String(raw)).toLocaleString('en-CA', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }
  const s = String(raw);
  // Enum-ish columns render uppercase to match the design.
  const field = spec.fields.find((f) => f.key === key);
  return field?.type === 'select' ? s.toUpperCase() : s;
};

export function CollectionTable({
  spec, rows, canEdit, canPublish, isOwner,
}: {
  spec: CollectionSpec;
  rows: Row[];
  canEdit: boolean;
  canPublish: boolean;
  isOwner: boolean;
}) {
  const [drawer, setDrawer] = useState<{ record: Row | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();
  const router = useRouter();

  const grid = [...spec.columns.map((c2) => c2.width), '1fr'].join(' ');

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? 'Action failed');
      else { setError(null); router.refresh(); }
    });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>{spec.title}</h1>
          <p style={{ color: c.muted, margin: 0, fontSize: 13, maxWidth: 560 }}>{spec.desc}</p>
        </div>
        {canEdit && spec.newLabel && (
          <button
            onClick={() => setDrawer({ record: null })}
            style={{ background: c.accent, color: c.bg, border: 'none', padding: '10px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {spec.newLabel}
          </button>
        )}
      </div>

      {!canEdit && (
        <div style={{ background: c.warnBg, borderLeft: `2px solid ${c.warn}`, padding: '14px 18px', margin: '18px 0', fontSize: 12, color: c.warnText, lineHeight: 1.6 }}>
          Your role has read-only access to this section.
        </div>
      )}

      {error && (
        <div style={{ background: '#2a1318', borderLeft: '2px solid #5a2028', padding: '14px 18px', margin: '18px 0', fontSize: 12, color: '#f0b8b8', lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 22, border: `1px solid ${c.line}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: grid, gap: 12, padding: '12px 18px', background: c.card, borderBottom: `1px solid ${c.line}` }}>
          {spec.columns.map((col) => (
            <div key={col.key} style={{ fontSize: 9, color: c.muted, letterSpacing: '0.1em', fontWeight: 700 }}>
              {col.label}
            </div>
          ))}
          <div />
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: 44, textAlign: 'center', color: c.faint, fontSize: 12 }}>
            Nothing here yet.
          </div>
        ) : (
          rows.map((row, i) => {
            const published = row.status === 'published';
            return (
              <div
                key={row.id}
                style={{
                  display: 'grid', gridTemplateColumns: grid, gap: 12, padding: '14px 18px',
                  borderBottom: `1px solid ${c.lineSoft}`, alignItems: 'center',
                  background: published ? c.panel : '#111827',
                }}
              >
                {spec.columns.map((col, ci) => (
                  <div
                    key={col.key}
                    style={{
                      fontSize: 12, lineHeight: 1.5, overflowWrap: 'anywhere',
                      color: ci === 0 ? c.textBright : c.muted,
                      fontWeight: ci === 0 ? 600 : 500,
                    }}
                  >
                    {fmtCell(spec, row, col.key)}
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {row.status && (
                    <span
                      style={{
                        fontSize: 9, padding: '3px 7px', letterSpacing: '0.05em', fontWeight: 700,
                        whiteSpace: 'nowrap',
                        border: `1px solid ${published ? c.border : c.warnBorder}`,
                        color: published ? c.accent : c.warn,
                      }}
                    >
                      {published ? 'LIVE' : 'DRAFT'}
                    </span>
                  )}

                  {canEdit && spec.reorderable !== false && (
                    <>
                      <button onClick={() => run(() => reorder(spec.key, row.id, -1))} title="Move up" disabled={i === 0}
                        style={{ background: 'none', border: `1px solid ${c.border}`, color: c.muted, width: 24, height: 24, fontSize: 11, cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.4 : 1 }}>↑</button>
                      <button onClick={() => run(() => reorder(spec.key, row.id, 1))} title="Move down" disabled={i === rows.length - 1}
                        style={{ background: 'none', border: `1px solid ${c.border}`, color: c.muted, width: 24, height: 24, fontSize: 11, cursor: i === rows.length - 1 ? 'default' : 'pointer', opacity: i === rows.length - 1 ? 0.4 : 1 }}>↓</button>
                    </>
                  )}

                  {canEdit && (
                    <>

                      {row.status && canPublish && (
                        <button
                          onClick={() => run(() => setStatus(spec.key, row.id, published ? 'draft' : 'published'))}
                          style={{ background: 'none', border: `1px solid ${c.border}`, color: c.accent, padding: '0 8px', height: 24, fontSize: 10, cursor: 'pointer', letterSpacing: '0.04em' }}
                        >
                          {published ? 'UNPUBLISH' : 'PUBLISH'}
                        </button>
                      )}

                      <button
                        onClick={() => setDrawer({ record: row })}
                        style={{ background: c.accent, color: c.bg, border: 'none', padding: '0 10px', height: 24, fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}
                      >
                        EDIT
                      </button>

                      {row.status && (
                        <button
                          onClick={() => {
                            if (confirm('Archive this record? It stays recoverable.')) run(() => archiveRecord(spec.key, row.id));
                          }}
                          title="Archive"
                          style={{ background: 'none', border: '1px solid #4a2530', color: c.danger, width: 24, height: 24, fontSize: 12, cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {drawer && (
        <RecordDrawer
          spec={spec}
          record={drawer.record}
          canPublish={canPublish}
          onClose={() => setDrawer(null)}
        />
      )}
    </>
  );
}

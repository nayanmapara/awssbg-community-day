'use client';
import { useOptimistic, useState, useTransition } from 'react';
import { c } from '@/lib/tokens';
import { archiveRecord, reorder, setStatus, toggleUserActive } from '@/lib/actions';
import { RecordDrawer } from './RecordDrawer';
import type { CollectionSpec } from '@/lib/collections';
import { formatEventDateTime } from '@/lib/event-time';

type Row = Record<string, unknown> & { id: string; status?: string; role?: string; active?: boolean };

type RowAction =
  | { type: 'move'; id: string; dir: -1 | 1 }
  | { type: 'status'; id: string; status: string }
  | { type: 'active'; id: string; active: boolean };

const fmtCell = (spec: CollectionSpec, row: Row, key: string): string => {
  const raw = row[key];
  if (raw == null || raw === '') return '—';
  if (key.endsWith('_at')) {
    return formatEventDateTime(String(raw));
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
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();

  // Applies reorder/status changes to the row list the instant a button is
  // clicked, before the ~9 sequential network hops a click used to cost have
  // even started, instead of leaving the row looking frozen until they finish.
  const [optimisticRows, applyOptimistic] = useOptimistic(
    rows,
    (state: Row[], action: RowAction): Row[] => {
      if (action.type === 'move') {
        const next = [...state];
        const i = next.findIndex((r) => r.id === action.id);
        const j = i + action.dir;
        if (i < 0 || j < 0 || j >= next.length) return state;
        [next[i], next[j]] = [next[j], next[i]];
        return next;
      }
      if (action.type === 'active') {
        return state.map((r) => (r.id === action.id ? { ...r, active: action.active } : r));
      }
      return state.map((r) => (r.id === action.id ? { ...r, status: action.status } : r));
    }
  );

  const grid = [...spec.columns.map((c2) => c2.width), '1fr'].join(' ');

  // The server action's own revalidatePath() call refreshes this route's data
  // as part of the action response — an extra router.refresh() would just
  // trigger a second, redundant full round trip.
  const run = (id: string, fn: () => Promise<{ ok: boolean; error?: string }>, optimistic?: RowAction) => {
    setPendingId(id);
    start(async () => {
      if (optimistic) applyOptimistic(optimistic);
      const res = await fn();
      setPendingId(null);
      setError(res.ok ? null : (res.error ?? 'Action failed'));
    });
  };

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

        {optimisticRows.length === 0 ? (
          <div style={{ padding: 44, textAlign: 'center', color: c.faint, fontSize: 12 }}>
            Nothing here yet.
          </div>
        ) : (
          optimisticRows.map((row, i) => {
            const published = row.status === 'published';
            const isUserRow = spec.table === 'profiles';
            const rowBusy = pendingId === row.id;
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

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/*
                    Status is a pill with a dot — buttons below are sharp
                    rectangles. Before this, both used the same outlined-box
                    style (e.g. "ACTIVE" the label vs "ACTIVATE" the button),
                    which read as visually interchangeable.
                  */}
                  {row.status && (
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 9, padding: '4px 9px 4px 7px', letterSpacing: '0.05em', fontWeight: 700,
                        whiteSpace: 'nowrap', borderRadius: 999,
                        background: published ? `${c.accent}1f` : `${c.warn}1f`,
                        color: published ? c.accent : c.warn,
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                      {published ? 'LIVE' : 'DRAFT'}
                    </span>
                  )}

                  {isUserRow && (
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 9, padding: '4px 9px 4px 7px', letterSpacing: '0.05em', fontWeight: 700,
                        whiteSpace: 'nowrap', borderRadius: 999,
                        background: row.role === 'pending' ? `${c.warn}1f` : row.active ? `${c.accent}1f` : `${c.danger}1f`,
                        color: row.role === 'pending' ? c.warn : row.active ? c.accent : c.danger,
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                      {row.role === 'pending' ? 'PENDING' : row.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  )}

                  {canEdit && spec.reorderable !== false && (
                    <>
                      <button
                        onClick={() => run(row.id, () => reorder(spec.key, row.id, -1), { type: 'move', id: row.id, dir: -1 })}
                        title="Move up" disabled={i === 0 || rowBusy}
                        style={{ background: 'none', border: `1px solid ${c.border}`, color: c.muted, width: 24, height: 24, fontSize: 11, cursor: i === 0 || rowBusy ? 'default' : 'pointer', opacity: i === 0 || rowBusy ? 0.4 : 1 }}>↑</button>
                      <button
                        onClick={() => run(row.id, () => reorder(spec.key, row.id, 1), { type: 'move', id: row.id, dir: 1 })}
                        title="Move down" disabled={i === optimisticRows.length - 1 || rowBusy}
                        style={{ background: 'none', border: `1px solid ${c.border}`, color: c.muted, width: 24, height: 24, fontSize: 11, cursor: i === optimisticRows.length - 1 || rowBusy ? 'default' : 'pointer', opacity: i === optimisticRows.length - 1 || rowBusy ? 0.4 : 1 }}>↓</button>
                    </>
                  )}

                  {canEdit && (
                    <>

                      {row.status && canPublish && (
                        <button
                          onClick={() => run(
                            row.id,
                            () => setStatus(spec.key, row.id, published ? 'draft' : 'published'),
                            { type: 'status', id: row.id, status: published ? 'draft' : 'published' }
                          )}
                          disabled={rowBusy}
                          // Solid when it's the action that moves this record forward
                          // (going live); outlined when it's reversing that.
                          style={published
                            ? { background: 'none', border: `1px solid ${c.border}`, color: c.accent, padding: '0 8px', height: 24, fontSize: 10, cursor: rowBusy ? 'default' : 'pointer', letterSpacing: '0.04em', opacity: rowBusy ? 0.5 : 1 }
                            : { background: c.accent, border: '1px solid transparent', color: c.bg, padding: '0 8px', height: 24, fontSize: 10, fontWeight: 700, cursor: rowBusy ? 'default' : 'pointer', letterSpacing: '0.04em', opacity: rowBusy ? 0.5 : 1 }}
                        >
                          {published ? 'UNPUBLISH' : 'PUBLISH'}
                        </button>
                      )}

                      {isUserRow && isOwner && (
                        <button
                          onClick={() => run(
                            row.id,
                            () => toggleUserActive(row.id, !row.active),
                            { type: 'active', id: row.id, active: !row.active }
                          )}
                          disabled={rowBusy}
                          title={row.active ? 'Revoke access' : 'Accept and grant access'}
                          // Solid for ACTIVATE (moves the account forward, into access);
                          // outlined-danger for DEACTIVATE (a cautionary, reversing action).
                          style={row.active
                            ? { background: 'none', border: '1px solid #4a2530', color: c.danger, padding: '0 8px', height: 24, fontSize: 10, cursor: rowBusy ? 'default' : 'pointer', letterSpacing: '0.04em', opacity: rowBusy ? 0.5 : 1 }
                            : { background: c.accent, border: '1px solid transparent', color: c.bg, padding: '0 8px', height: 24, fontSize: 10, fontWeight: 700, cursor: rowBusy ? 'default' : 'pointer', letterSpacing: '0.04em', opacity: rowBusy ? 0.5 : 1 }}
                        >
                          {row.active ? 'DEACTIVATE' : 'ACTIVATE'}
                        </button>
                      )}

                      <button
                        onClick={() => setDrawer({ record: row })}
                        disabled={rowBusy}
                        style={{ background: c.accent, color: c.bg, border: 'none', padding: '0 10px', height: 24, fontSize: 10, fontWeight: 700, cursor: rowBusy ? 'default' : 'pointer', letterSpacing: '0.04em', opacity: rowBusy ? 0.5 : 1 }}
                      >
                        EDIT
                      </button>

                      {row.status && (
                        <button
                          onClick={() => {
                            if (confirm('Archive this record? It stays recoverable.')) run(row.id, () => archiveRecord(spec.key, row.id));
                          }}
                          title="Archive"
                          disabled={rowBusy}
                          style={{ background: 'none', border: '1px solid #4a2530', color: c.danger, width: 24, height: 24, fontSize: 12, cursor: rowBusy ? 'default' : 'pointer', opacity: rowBusy ? 0.5 : 1 }}
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

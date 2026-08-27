'use client';
import { useState, useTransition } from 'react';
import { c } from '@/lib/tokens';
import { upsertRecord } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';
import type { CollectionSpec } from '@/lib/collections';

/** ISO -> value for <input type="datetime-local"> in the browser's timezone. */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

export function RecordDrawer({
  spec, record, onClose, canPublish,
}: {
  spec: CollectionSpec;
  record: Record<string, unknown> | null;
  onClose: () => void;
  canPublish: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    spec.fields.forEach((f) => {
      const raw = record?.[f.key];
      if (f.type === 'datetime') init[f.key] = toLocalInput((raw as string) ?? null);
      else init[f.key] = raw == null ? (f.type === 'select' ? (f.options?.[0] ?? '') : '') : String(raw);
    });
    return init;
  });

  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const upload = async (fieldKey: string, bucket: string, file: File) => {
    setUploading(fieldKey);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    setUploading(null);
    if (error) { setError(error.message); return; }
    set(fieldKey, path);
  };

  const save = (publish: boolean) => {
    const missing = spec.fields.find((f) => f.required && !values[f.key]);
    if (missing) { setError(`${missing.label} is required.`); return; }

    const payload: Record<string, string> = {};
    spec.fields.forEach((f) => {
      const v = values[f.key];
      payload[f.key] = f.type === 'datetime' && v ? new Date(v).toISOString() : v;
    });

    start(async () => {
      const res = await upsertRecord(spec.key, (record?.id as string) ?? null, payload, publish);
      if (!res.ok) { setError(res.error ?? 'Save failed'); return; }
      onClose();
    });
  };

  const label = String(values[spec.labelField] || '') || 'Untitled';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(4,7,14,0.72)' }} />
      <div
        style={{
          position: 'relative', width: 'min(460px,100%)', background: c.bgAlt,
          borderLeft: `1px solid ${c.border}`, height: '100%', overflowY: 'auto', padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 10, color: c.accent, letterSpacing: '0.08em', fontWeight: 700 }}>
              {record ? 'EDITING' : 'NEW RECORD'} · {spec.title.toUpperCase()}
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 800, margin: '8px 0 0' }}>{label}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: `1px solid ${c.border}`, color: c.muted, width: 28, height: 28, fontSize: 14, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {spec.fields.map((f) => {
            const common = {
              value: values[f.key] ?? '',
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                set(f.key, e.target.value),
              style: {
                width: '100%', background: c.card, color: c.text,
                border: `1px solid ${c.border}`, padding: '10px 12px', fontSize: 12,
              } as React.CSSProperties,
            };

            return (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 10, color: c.muted, letterSpacing: '0.07em', fontWeight: 700, marginBottom: 6 }}>
                  {f.label}{f.required ? ' *' : ''}
                </label>

                {f.type === 'select' ? (
                  <select {...common}>
                    {f.options?.map((o) => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                  </select>
                ) : f.type === 'area' ? (
                  <textarea {...common} rows={4} placeholder={f.placeholder} style={{ ...common.style, lineHeight: 1.6, resize: 'vertical' }} />
                ) : f.type === 'upload' ? (
                  <label
                    style={{
                      display: 'block', border: `1px dashed ${c.borderStrong}`, padding: 22,
                      textAlign: 'center', color: c.faint, fontSize: 11, lineHeight: 1.6, cursor: 'pointer',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) upload(f.key, f.bucket ?? 'gallery', file);
                      }}
                    />
                    {uploading === f.key
                      ? 'Uploading…'
                      : values[f.key]
                        ? `Uploaded: ${values[f.key]} — click to replace`
                        : 'Click or drop an image here'}
                  </label>
                ) : f.type === 'datetime' ? (
                  <input {...common} type="datetime-local" />
                ) : (
                  <input {...common} type="text" placeholder={f.placeholder} />
                )}

                {f.hint && <div style={{ fontSize: 10, color: c.faint, marginTop: 5 }}>{f.hint}</div>}
              </div>
            );
          })}
        </div>

        {error && <p style={{ color: c.danger, fontSize: 12, marginTop: 18, lineHeight: 1.5 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 26, paddingTop: 20, borderTop: `1px solid ${c.line}`, flexWrap: 'wrap' }}>
          <button
            onClick={() => save(false)}
            disabled={pending}
            style={{ background: c.accent, color: c.bg, border: 'none', padding: '11px 22px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', cursor: pending ? 'wait' : 'pointer' }}
          >
            {pending ? 'SAVING…' : 'SAVE AS DRAFT'}
          </button>
          {canPublish && (
            <button
              onClick={() => save(true)}
              disabled={pending}
              style={{ background: 'none', border: `1px solid ${c.accent}`, color: c.accent, padding: '11px 22px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', cursor: pending ? 'wait' : 'pointer' }}
            >
              SAVE &amp; PUBLISH
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

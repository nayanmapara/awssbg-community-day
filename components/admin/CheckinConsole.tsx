'use client';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { c } from '@/lib/tokens';
import { checkIn } from '@/lib/actions';
import { QrScanner } from './QrScanner';
import type { Checkin } from '@/lib/types';

const QUEUE_KEY = 'sbg_checkin_queue_v1';

interface Queued { name: string; code: string; source: 'qr' | 'manual' }

/**
 * Door console. Every scan is written to a localStorage queue first, so a
 * dropped connection in a packed room never stalls the line — the queue drains
 * automatically when the network returns.
 */
export function CheckinConsole({
  recent, total, registered,
}: {
  recent: Checkin[];
  total: number;
  registered: number;
}) {
  const [scanning, setScanning] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [queue, setQueue] = useState<Queued[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [online, setOnline] = useState(true);
  const [, start] = useTransition();
  const router = useRouter();

  // Restore any queue left behind by a refresh or crash.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      if (raw) setQueue(JSON.parse(raw));
    } catch { /* ignore */ }
    setOnline(navigator.onLine);

    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch { /* ignore */ }
  }, [queue]);

  const flush = useCallback(() => {
    if (queue.length === 0 || !online) return;
    const [head, ...rest] = queue;
    start(async () => {
      const res = await checkIn(head.name, head.code, head.source);
      if (res.ok) {
        setQueue(rest);
        setFeedback({ ok: true, msg: `${head.name} checked in.` });
        router.refresh();
      } else if (/already/i.test(res.error ?? '')) {
        setQueue(rest);
        setFeedback({ ok: false, msg: `${head.name || head.code}: already checked in.` });
      } else {
        setFeedback({ ok: false, msg: res.error ?? 'Sync failed — will retry.' });
      }
    });
  }, [queue, online, router]);

  useEffect(() => { flush(); }, [flush]);

  const enqueue = (entry: Queued) => {
    setQueue((q) => [...q, entry]);
    setFeedback({ ok: true, msg: online ? 'Sending…' : 'Queued — offline.' });
  };

  const onScan = useCallback((text: string) => {
    // Accepts a raw ticket code or a JSON payload: {"name":"…","code":"…"}
    let entry: Queued = { name: '', code: text.trim(), source: 'qr' };
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        entry = { name: String(parsed.name ?? ''), code: String(parsed.code ?? text), source: 'qr' };
      }
    } catch { /* plain code */ }
    if (navigator.vibrate) navigator.vibrate(40);
    enqueue(entry);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  const manual = () => {
    if (!name.trim() && !code.trim()) {
      setFeedback({ ok: false, msg: 'Enter a name or a ticket code.' });
      return;
    }
    enqueue({ name: name.trim(), code: code.trim(), source: 'manual' });
    setName('');
    setCode('');
  };

  const turnout = registered ? Math.round((total / registered) * 100) : 0;

  const input: React.CSSProperties = {
    background: c.card, color: c.text, border: `1px solid ${c.border}`,
    padding: '10px 12px', fontSize: 12,
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>Door Check-in</h1>
      <p style={{ color: c.muted, margin: '0 0 24px', fontSize: 13, maxWidth: 620 }}>
        Scan a ticket QR or type the code. Scans queue locally if the campus wifi drops and sync
        automatically when it returns.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 1, background: c.line, border: `1px solid ${c.line}`, marginBottom: 24 }}>
        {[
          { v: total, l: 'CHECKED IN', color: c.accent },
          { v: registered, l: 'REGISTERED', color: c.textBright },
          { v: `${turnout}%`, l: 'TURNOUT', color: c.warn },
          { v: queue.length, l: 'PENDING SYNC', color: queue.length ? c.warn : c.textBright },
        ].map((k) => (
          <div key={k.l} style={{ background: c.panel, padding: 22 }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: k.color }}>{k.v}</div>
            <div style={{ fontSize: 10, color: c.muted, letterSpacing: '0.07em', marginTop: 6, fontWeight: 600 }}>{k.l}</div>
          </div>
        ))}
      </div>

      {!online && (
        <div style={{ background: c.warnBg, borderLeft: `2px solid ${c.warn}`, padding: '14px 18px', marginBottom: 20, fontSize: 12, color: c.warnText, lineHeight: 1.6 }}>
          Offline — scans are being queued on this device and will sync automatically.
        </div>
      )}

      {feedback && (
        <div
          role="status"
          style={{
            background: feedback.ok ? c.card : '#2a1318',
            borderLeft: `2px solid ${feedback.ok ? c.accent : '#5a2028'}`,
            padding: '14px 18px', marginBottom: 20, fontSize: 12,
            color: feedback.ok ? c.text : '#f0b8b8',
          }}
        >
          {feedback.msg}
        </div>
      )}

      <button
        onClick={() => setScanning((s) => !s)}
        style={{
          background: scanning ? 'transparent' : c.accent,
          color: scanning ? c.accent : c.bg,
          border: `1px solid ${c.accent}`,
          padding: '12px 24px', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.06em', cursor: 'pointer', marginBottom: 20,
        }}
      >
        {scanning ? 'STOP SCANNER' : 'START QR SCANNER'}
      </button>

      <QrScanner
        active={scanning}
        onScan={onScan}
        onError={(msg) => setFeedback({ ok: false, msg })}
      />

      <div style={{ background: c.panel, border: `1px solid ${c.borderMid}`, padding: 22, maxWidth: 560, marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: c.accent, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 14 }}>
          MANUAL ENTRY
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Attendee name" style={{ ...input, flex: '1 1 160px' }} />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') manual(); }}
            placeholder="Ticket code"
            style={{ ...input, flex: '1 1 120px' }}
          />
          <button
            onClick={manual}
            style={{ background: c.accent, color: c.bg, border: 'none', padding: '10px 20px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer' }}
          >
            CHECK IN
          </button>
        </div>
      </div>

      <div style={{ fontSize: 11, color: c.accent, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>
        RECENT SCANS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: c.line, border: `1px solid ${c.line}` }}>
        {recent.length === 0 ? (
          <div style={{ background: c.panel, padding: 32, textAlign: 'center', color: c.faint, fontSize: 12 }}>
            Nobody checked in yet.
          </div>
        ) : (
          recent.map((r) => (
            <div key={r.id} style={{ background: c.panel, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: c.textBright, fontWeight: 600 }}>{r.attendee_name}</span>
              <span style={{ fontSize: 11, color: c.mutedDim }}>
                {r.ticket_code ?? 'WALK-IN'} · {r.source.toUpperCase()} ·{' '}
                {new Date(r.checked_in_at).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

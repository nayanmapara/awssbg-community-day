'use client';
import { useEffect, useRef, useState } from 'react';
import { c } from '@/lib/tokens';

const REGION_ID = 'qr-reader-region';

/**
 * Camera QR scanner. html5-qrcode is imported dynamically so it never lands in
 * the server bundle, and the library is only fetched when scanning starts.
 */
export function QrScanner({
  active, onScan, onError,
}: {
  active: boolean;
  onScan: (text: string) => void;
  onError?: (msg: string) => void;
}) {
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const lastRef = useRef<{ text: string; at: number }>({ text: '', at: 0 });
  const [status, setStatus] = useState('Starting camera…');

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;

        const scanner = new Html5Qrcode(REGION_ID, { verbose: false });
        scannerRef.current = scanner as never;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded: string) => {
            // Debounce: the camera fires the same code many times per second.
            const now = Date.now();
            if (decoded === lastRef.current.text && now - lastRef.current.at < 3000) return;
            lastRef.current = { text: decoded, at: now };
            onScan(decoded);
          },
          () => { /* per-frame decode misses are normal — ignore */ }
        );
        if (!cancelled) setStatus('Point the camera at a ticket QR code.');
      } catch (e) {
        const msg = (e as Error).message || 'Camera unavailable';
        setStatus(msg);
        onError?.(msg);
      }
    };

    const stop = async () => {
      const s = scannerRef.current;
      scannerRef.current = null;
      if (!s) return;
      try { await s.stop(); s.clear(); } catch { /* already stopped */ }
    };

    if (active) start();
    else stop();

    return () => { cancelled = true; stop(); };
  }, [active, onScan, onError]);

  if (!active) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        id={REGION_ID}
        style={{
          width: '100%', maxWidth: 360, border: `1px solid ${c.border}`,
          background: '#000', overflow: 'hidden',
        }}
      />
      <div style={{ fontSize: 11, color: c.faint, marginTop: 8 }}>{status}</div>
    </div>
  );
}

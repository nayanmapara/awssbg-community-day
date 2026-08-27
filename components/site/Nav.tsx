'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { c, maxW, pad } from '@/lib/tokens';
import { ChipLogo } from './ChipLogo';

const LINKS = [
  { href: '/#about', label: 'ABOUT' },
  { href: '/#agenda', label: 'AGENDA' },
  { href: '/speakers', label: 'SPEAKERS' },
  { href: '/team', label: 'TEAM' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#location', label: 'LOCATION' },
];

export function Nav({
  registrationUrl, registrationOpen, active,
}: {
  registrationUrl: string | null;
  registrationOpen: boolean;
  active?: string;
}) {
  const clicks = useRef<number[]>([]);
  const [egg, setEgg] = useState(false);

  // Easter egg: five fast clicks on the logo.
  useEffect(() => {
    if (!egg) return;
    const t = setTimeout(() => setEgg(false), 4000);
    return () => clearTimeout(t);
  }, [egg]);

  const onLogo = () => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 2000), now];
    if (clicks.current.length >= 5) { clicks.current = []; setEgg(true); }
  };

  return (
    <>
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(10,15,28,0.88)', backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${c.line}`,
        }}
      >
        <div
          style={{
            maxWidth: maxW, margin: '0 auto', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: `16px ${pad}`, gap: 24, flexWrap: 'wrap',
          }}
        >
          <Link
            href="/"
            onClick={onLogo}
            style={{ display: 'flex', alignItems: 'center', gap: 14, color: c.textBright }}
          >
            <ChipLogo />
            <span style={{ fontWeight: 700, letterSpacing: '0.06em', fontSize: 14, whiteSpace: 'nowrap' }}>
              AWS STUDENT BUILDER GROUP
            </span>
          </Link>

          <nav style={{ display: 'flex', gap: 'clamp(12px,2vw,28px)', alignItems: 'center', flexWrap: 'wrap' }}>
            {LINKS.map((l) => {
              const on = active && l.href.endsWith(active);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    color: on ? c.accent : '#b8c2d6',
                    fontSize: 13, letterSpacing: '0.05em', fontWeight: on ? 700 : 500,
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
            {registrationOpen && registrationUrl ? (
              <a
                href={registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: c.accent, color: c.bg, padding: '10px 20px',
                  fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
                }}
              >
                REGISTER FREE
              </a>
            ) : (
              <span
                style={{
                  border: `1px solid ${c.border}`, color: c.muted, padding: '10px 20px',
                  fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
                }}
              >
                REGISTRATION CLOSED
              </span>
            )}
          </nav>
        </div>
      </header>

      {egg && (
        <>
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 300, pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ animation: 'trailFade 1.6s ease forwards' }}>
              <ChipLogo size={90} />
            </div>
          </div>
          <div
            role="status"
            style={{
              position: 'fixed', top: 90, left: '50%', transform: 'translateX(-50%)',
              zIndex: 310, background: c.card, border: `1px solid ${c.accent}`,
              padding: '14px 24px', fontSize: 13, fontWeight: 600, maxWidth: '90vw', textAlign: 'center',
            }}
          >
            SECRET UNLOCKED — you clicked like someone who reads changelogs. Hi, fellow builder.
          </div>
        </>
      )}
    </>
  );
}

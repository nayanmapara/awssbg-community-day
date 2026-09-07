'use client';
import { useEffect, useState } from 'react';
import { c } from '@/lib/tokens';
import { SbgIcon } from '@/components/site/SbgIcon';
import type { Faq } from '@/lib/types';

/** Answers type out like a terminal readout when opened. */
export function FaqList({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (!open) return;
    const answer = items.find((i) => i.id === open)?.answer ?? '';
    setTyped(0);
    const t = setInterval(() => {
      setTyped((n) => {
        if (n >= answer.length) { clearInterval(t); return n; }
        return Math.min(answer.length, n + 3);
      });
    }, 12);
    return () => clearInterval(t);
  }, [open, items]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: c.line, border: `1px solid ${c.line}` }}>
      {items.map((f) => {
        const isOpen = open === f.id;
        const shown = isOpen ? f.answer.slice(0, typed) : '';
        return (
          <div key={f.id} className={`faq-item${isOpen ? ' faq-item--open' : ''}`} style={{ background: c.panel }}>
            <button
              onClick={() => setOpen(isOpen ? null : f.id)}
              aria-expanded={isOpen}
              style={{
                width: '100%', padding: '20px 24px', cursor: 'pointer', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center', gap: 16,
                background: 'none', border: 'none', color: 'inherit', textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <SbgIcon name="Key" color={isOpen ? 'Amber' : 'Blue'} size={18} animate={isOpen ? 'glow' : false} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: c.textBright }}>{f.question}</span>
              </span>
              <span
                style={{
                  color: c.accent, fontSize: 18, fontWeight: 700,
                  transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform .2s ease',
                }}
              >
                +
              </span>
            </button>
            <div className={`faq-answer-wrap${isOpen ? ' faq-answer-wrap--open' : ''}`}>
              <div className="faq-answer-inner">
                {isOpen && (
                  <p className="faq-answer-text">
                    {shown}
                    {typed < f.answer.length && (
                      <span style={{ color: c.accent, animation: 'blink .8s step-end infinite' }}>█</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

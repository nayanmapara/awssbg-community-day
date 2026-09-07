'use client';
import { useEffect, useState } from 'react';
import { c } from '@/lib/tokens';
import { SbgIcon } from '@/components/site/SbgIcon';
import type { Faq } from '@/lib/types';

function FaqItem({ item }: { item: Faq }) {
  const [isOpen, setIsOpen] = useState(false);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setTyped(0);
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setTyped(item.answer.length);
      return;
    }

    setTyped(0);
    const t = setInterval(() => {
      setTyped((n) => {
        if (n >= item.answer.length) { clearInterval(t); return n; }
        return Math.min(item.answer.length, n + 3);
      });
    }, 12);
    return () => clearInterval(t);
  }, [isOpen, item.answer]);

  const shown = isOpen ? item.answer.slice(0, typed) : '';

  return (
    <div className={`faq-item${isOpen ? ' faq-item--open' : ''}`} style={{ background: c.panel }}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        style={{
          width: '100%', padding: '20px 24px', cursor: 'pointer', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', gap: 16,
          background: 'none', border: 'none', color: 'inherit', textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <SbgIcon name="Key" color={isOpen ? 'Amber' : 'Blue'} size={18} animate={isOpen ? 'glow' : false} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: c.textBright }}>{item.question}</span>
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
              {typed < item.answer.length && (
                <span style={{ color: c.accent, animation: 'blink .8s step-end infinite' }}>█</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Answers type out like a terminal readout when opened. Multiple items can stay open. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: c.line, border: `1px solid ${c.line}` }}>
      {items.map((f) => (
        <FaqItem key={f.id} item={f} />
      ))}
    </div>
  );
}

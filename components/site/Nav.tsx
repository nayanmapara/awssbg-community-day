'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { c, gridBg, maxW, pad } from '@/lib/tokens';
import { missionCopy } from '@/lib/mission-theme';
import { ChipLogo } from './ChipLogo';
import { RegisterButton } from './RegisterButton';

const LINKS = [
  { href: '/#about', label: 'ABOUT', section: 'about' },
  { href: '/#agenda', label: missionCopy.nav.agenda, section: 'agenda' },
  { href: '/speakers', label: 'SPEAKERS' },
  { href: '/team', label: 'TEAM' },
  { href: '/#faq', label: missionCopy.nav.faq, section: 'faq' },
  { href: '/#location', label: missionCopy.nav.location, section: 'location' },
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
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight home section anchors as user scrolls.
  useEffect(() => {
    if (pathname !== '/') {
      setActiveSection(null);
      return;
    }

    const sections = LINKS.filter((l) => 'section' in l && l.section).map((l) => l.section!);
    const nodes = sections
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: [0, 0.25, 0.5] },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Lock page scroll while the drawer is open, and let Escape close it.
  useEffect(() => {
    if (!drawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  // A drawer left open when the viewport grows past mobile would sit there
  // invisibly (its markup only renders while isMobile), so close it too.
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

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

  const registerAction = registrationOpen && registrationUrl ? (
    <RegisterButton href={registrationUrl} size="sm">
      REGISTER FREE
    </RegisterButton>
  ) : (
    <span
      style={{
        border: `1px solid ${c.border}`, color: c.muted, padding: '10px 20px',
        fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
      }}
    >
      REGISTRATION CLOSED
    </span>
  );

  return (
    <>
      <header
        className={`nav-header${scrolled ? ' nav-header--scrolled' : ''}`}
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(10,15,28,0.88)', backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${c.line}`,
        }}
      >
        <div
          className="nav-inner"
          style={{
            maxWidth: maxW, margin: '0 auto', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: `16px ${pad}`, gap: 24,
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

          {isMobile ? (
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              style={{
                background: 'none', border: `1px solid ${c.border}`, color: c.text,
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ width: 16, height: 2, background: c.text, display: 'block' }} />
                <span style={{ width: 16, height: 2, background: c.text, display: 'block' }} />
                <span style={{ width: 16, height: 2, background: c.text, display: 'block' }} />
              </span>
            </button>
          ) : (
            <nav style={{ display: 'flex', gap: 'clamp(12px,2vw,28px)', alignItems: 'center' }}>
              {LINKS.map((l) => {
                const on = active && l.href.endsWith(active);
                const sectionOn = pathname === '/' && 'section' in l && l.section === activeSection;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`nav-link${on || sectionOn ? ' nav-link--active' : ''}`}
                    style={{
                      fontSize: 13, letterSpacing: '0.05em', fontWeight: on ? 700 : 500,
                    }}
                  >
                    {l.label}
                  </Link>
                );
              })}
              {registerAction}
            </nav>
          )}
        </div>
      </header>

      {isMobile && drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            aria-hidden
            className="nav-drawer-backdrop"
            style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(4,7,14,0.72)' }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="nav-drawer-panel"
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 95,
              width: 'min(78vw,320px)', overflowY: 'auto',
              backgroundColor: c.bgAlt, backgroundImage: gridBg, backgroundSize: '18px 18px',
              borderLeft: `1px solid ${c.border}`, boxShadow: '-16px 0 30px rgba(0,0,0,0.5)',
              padding: 20, display: 'flex', flexDirection: 'column', gap: 20,
            }}
          >
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              style={{
                alignSelf: 'flex-end', background: 'none', border: `1px solid ${c.border}`,
                color: c.muted, width: 28, height: 28, fontSize: 14, cursor: 'pointer',
              }}
            >
              ×
            </button>

            {LINKS.map((l) => {
              const on = active && l.href.endsWith(active);
              const sectionOn = pathname === '/' && 'section' in l && l.section === activeSection;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`nav-link nav-drawer-link${on || sectionOn ? ' nav-link--active' : ''}`}
                  style={{
                    fontSize: 15, letterSpacing: '0.05em', fontWeight: on ? 700 : 600,
                    borderLeft: `2px solid ${on ? c.accent : 'transparent'}`,
                    paddingLeft: 10, marginLeft: -12,
                  }}
                >
                  {l.label}
                </Link>
              );
            })}

            <div style={{ marginTop: 8, display: 'flex' }}>
              {registrationOpen && registrationUrl ? (
                <RegisterButton
                  href={registrationUrl}
                  size="sm"
                  fullWidth
                  onClick={() => setDrawerOpen(false)}
                >
                  REGISTER FREE
                </RegisterButton>
              ) : (
                <span
                  style={{
                    border: `1px solid ${c.border}`, color: c.muted, padding: '12px 20px',
                    fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
                    textAlign: 'center', width: '100%',
                  }}
                >
                  REGISTRATION CLOSED
                </span>
              )}
            </div>
          </div>
        </>
      )}

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

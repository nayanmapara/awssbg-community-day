import Image from 'next/image';
import { c, maxW, pad } from '@/lib/tokens';
import {
  getAgenda, getFaqs, getGallery, getHighlights, getSettings, getSponsors, getStats, mediaUrl,
} from '@/lib/queries';
import { GridBackdrop } from '@/components/site/GridBackdrop';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { AnnouncementBanner } from '@/components/site/AnnouncementBanner';
import { CnTower } from '@/components/site/CnTower';
import { Countdown } from '@/components/site/Countdown';
import { AgendaFlightPath } from '@/components/site/AgendaFlightPath';
import { FaqList } from '@/components/site/FaqList';
import { Reveal } from '@/components/site/Reveal';
import { TiltCard } from '@/components/site/TiltCard';
import { ConsoleEgg } from '@/components/site/ConsoleEgg';

/** Statically rendered; refreshed by revalidatePath('/') when an editor publishes. */
export const revalidate = 3600;

const kicker = { fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700 } as const;
const h2 = { fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, margin: '12px 0 0' } as const;

export default async function HomePage() {
  const [settings, agenda, highlights, faqs, sponsors, gallery, stats] = await Promise.all([
    getSettings(), getAgenda(), getHighlights(), getFaqs(), getSponsors(), getGallery(), getStats(),
  ]);

  if (!settings) {
    return <main style={{ padding: 80, textAlign: 'center' }}>Event settings have not been created yet.</main>;
  }

  const dateLabel = new Date(settings.starts_at).toLocaleDateString('en-CA', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
  const timeLabel =
    new Date(settings.starts_at).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }) +
    ' – ' +
    new Date(settings.ends_at).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });

  const quickInfo = [
    { label: 'DATE', value: dateLabel.toUpperCase() },
    { label: 'TIME', value: timeLabel },
    { label: 'LOCATION', value: (settings.venue_name ?? '').split('—').pop()?.trim().toUpperCase() ?? '' },
    { label: 'COST', value: settings.cost_label ?? 'FREE' },
  ];

  const gallerySlots = gallery.length > 0 ? gallery : null;
  const sponsorTiles = sponsors.length > 0 ? sponsors : null;

  // Wraps the last two words ("Toronto 2026") onto their own line.
  const headlineWords = (settings.hero_headline ?? settings.name).trim().split(/\s+/);
  const headlineLine1 = headlineWords.slice(0, -2).join(' ');
  const headlineLine2 = headlineWords.slice(-2).join(' ');

  return (
    <>
      <ConsoleEgg />
      <AnnouncementBanner />
      <Nav registrationUrl={settings.registration_url} registrationOpen={settings.registration_open} />
      <GridBackdrop />

      <main style={{ position: 'relative', overflowX: 'hidden' }}>
        {/* ---------------- HERO ---------------- */}
        <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `96px ${pad} 64px` }}>
          <CnTower />

          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, background: c.card,
              border: `1px solid ${c.border}`, padding: '8px 16px', marginBottom: 28,
            }}
          >
            <span style={{ width: 8, height: 8, background: c.accent, animation: 'blink 1.6s step-end infinite' }} />
            <span style={{ fontSize: 12, letterSpacing: '0.08em', color: c.muted, fontWeight: 600 }}>
              {settings.name.toUpperCase()} · SHERIDAN COLLEGE
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(42px,7vw,86px)', lineHeight: 1.02, margin: '0 0 24px', fontWeight: 800, letterSpacing: '-0.01em' }}>
            {headlineLine1}
            <br />
            {headlineLine2}
          </h1>

          <p style={{ maxWidth: 640, fontSize: 'clamp(16px,2vw,19px)', lineHeight: 1.6, color: '#a7b1c6', margin: '0 0 36px' }}>
            {settings.hero_subline}
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
            {settings.registration_open && settings.registration_url && (
              <a
                href={settings.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: c.accent, color: c.bg, padding: '16px 32px', fontWeight: 700, letterSpacing: '0.05em', fontSize: 14 }}
              >
                REGISTER FREE →
              </a>
            )}
            <a
              href="#agenda"
              style={{ border: `1px solid ${c.borderStrong}`, color: c.text, padding: '16px 32px', fontWeight: 700, letterSpacing: '0.05em', fontSize: 14 }}
            >
              VIEW AGENDA
            </a>
          </div>

          <div
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(128px,max-content))',
              justifyContent: 'space-between', gap: '12px 20px', fontSize: 13, padding: '18px 22px',
              background: c.panel, border: `1px solid ${c.line}`, marginBottom: 40,
            }}
          >
            {quickInfo.map((q) => (
              <span key={q.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 10, letterSpacing: '0.08em', color: c.accent, fontWeight: 700 }}>{q.label}</span>
                <span style={{ color: c.text, fontWeight: 600 }}>{q.value}</span>
              </span>
            ))}
          </div>

          <Countdown startsAt={settings.starts_at} endsAt={settings.ends_at} />
        </section>

        {/* ---------------- ABOUT + STATS ---------------- */}
        <section id="about" style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `64px ${pad}` }}>
          <Reveal>
            <span style={kicker}>ABOUT THE CLUB</span>
            <h2 style={{ ...h2, marginBottom: 20 }}>Built by students, for students</h2>
            <p style={{ maxWidth: 680, color: '#a7b1c6', lineHeight: 1.7, fontSize: 16, margin: '0 0 40px' }}>
              The AWS Student Builder Group at Sheridan College helps students learn cloud computing,
              build real projects, and connect with the AWS community. Community Day is our biggest
              event of the year — a chance to bring that whole community into one room.
            </p>
          </Reveal>
          {stats.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 1, background: c.line, border: `1px solid ${c.line}` }}>
              {stats.map((s) => (
                <div key={s.id} style={{ background: c.panel, padding: '28px 24px' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: c.accent }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: c.muted, letterSpacing: '0.08em', marginTop: 8, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---------------- HIGHLIGHTS ---------------- */}
        {highlights.length > 0 && (
          <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `64px ${pad}` }}>
            <Reveal style={{ marginBottom: 40, textAlign: 'center' }}>
              <span style={kicker}>WHY ATTEND</span>
              <h2 style={h2}>What to expect</h2>
            </Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
              {highlights.map((h, i) => (
                <Reveal key={h.id} delay={i * 60} style={{ flex: '1 1 260px', maxWidth: 340 }}>
                  <TiltCard
                    style={{
                      background: c.card, border: `1px solid ${c.border}`, padding: 28,
                      textAlign: 'center', height: '100%',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: c.accent, marginBottom: 16 }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: c.textBright, marginBottom: 10 }}>{h.title}</div>
                    <div style={{ fontSize: 14, color: c.muted, lineHeight: 1.6 }}>{h.description}</div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- AGENDA ---------------- */}
        <section id="agenda" style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `64px ${pad}` }}>
          <Reveal style={{ marginBottom: 12 }}>
            <span style={kicker}>AGENDA</span>
            <h2 style={h2}>A full day, start to finish</h2>
          </Reveal>
          <p style={{ color: c.muted, margin: '12px 0 48px', fontSize: 14 }}>
            Scroll down — the mission launches at doors-open, and the flight path carries you through the day.
          </p>
          <AgendaFlightPath items={agenda} />
        </section>

        {/* ---------------- GALLERY ---------------- */}
        <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `64px ${pad}` }}>
          <Reveal style={{ marginBottom: 40 }}>
            <span style={kicker}>FROM PAST EVENTS</span>
            <h2 style={h2}>The community, in the room</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {(gallerySlots ?? Array.from({ length: 6 })).map((item, i) => {
              const g = gallerySlots ? gallery[i] : null;
              const url = g ? mediaUrl('gallery', g.image_path) : null;
              return (
                <Reveal key={g?.id ?? i} delay={i * 50}>
                  <TiltCard
                    strength={10}
                    style={{
                      height: 220, position: 'relative', overflow: 'hidden',
                      border: `1px ${url ? 'solid' : 'dashed'} ${url ? c.border : c.borderStrong}`,
                      background: c.panel, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {url ? (
                      <Image src={url} alt={g?.alt_text ?? g?.caption ?? 'Past event photo'} fill sizes="(max-width:720px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: c.faint, fontSize: 11, letterSpacing: '0.06em' }}>PHOTO COMING SOON</span>
                    )}
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ---------------- SPONSORS ---------------- */}
        <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `64px ${pad}` }}>
          <Reveal style={{ marginBottom: 40 }}>
            <span style={kicker}>SPONSORS</span>
            <h2 style={{ ...h2, marginBottom: 12 }}>Backed by the community</h2>
            <p style={{ color: c.muted, fontSize: 14, maxWidth: 560, margin: 0 }}>
              {sponsorTiles
                ? 'Thank you to the organisations supporting Community Day.'
                : 'No sponsors confirmed yet — if your company wants to support Community Day, we would love to talk.'}
            </p>
          </Reveal>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 28 }}>
            {(sponsorTiles ?? Array.from({ length: 4 })).map((_, i) => {
              const sp = sponsorTiles ? sponsors[i] : null;
              const url = sp ? mediaUrl('logos', sp.logo_path) : null;
              const inner = (
                <div
                  style={{
                    border: `1px ${sp ? 'solid' : 'dashed'} ${sp ? c.border : c.borderStrong}`,
                    height: 96, width: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: c.faint, fontSize: 12, letterSpacing: '0.06em', fontWeight: 600,
                    background: sp ? c.panel : 'transparent', position: 'relative', padding: 16,
                  }}
                >
                  {url ? (
                    <Image src={url} alt={sp!.name} fill sizes="200px" style={{ objectFit: 'contain', padding: 16 }} />
                  ) : sp ? sp.name : 'YOUR LOGO HERE'}
                </div>
              );
              return (
                <Reveal key={sp?.id ?? i} delay={i * 50}>
                  {sp?.website_url ? (
                    <a href={sp.website_url} target="_blank" rel="noopener noreferrer">{inner}</a>
                  ) : inner}
                </Reveal>
              );
            })}
          </div>
          <div style={{ textAlign: 'center' }}>
            <a
              href="mailto:awssbg.sheridan@gmail.com?subject=Sponsoring%20AWS%20Community%20Day"
              style={{ border: `1px solid ${c.accent}`, color: c.accent, padding: '14px 28px', fontWeight: 700, letterSpacing: '0.05em', fontSize: 13, display: 'inline-block' }}
            >
              BECOME A SPONSOR
            </a>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        {faqs.length > 0 && (
          <section id="faq" style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: `64px ${pad}` }}>
            <Reveal style={{ marginBottom: 32 }}>
              <span style={kicker}>FAQ</span>
              <h2 style={h2}>Good to know</h2>
            </Reveal>
            <FaqList items={faqs} />
          </section>
        )}

        {/* ---------------- LOCATION ---------------- */}
        <section id="location" style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `64px ${pad}` }}>
          <Reveal style={{ marginBottom: 32 }}>
            <span style={kicker}>LOCATION</span>
            <h2 style={h2}>Find us on the day</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
            <div style={{ minHeight: 320, border: `1px solid ${c.border}`, overflow: 'hidden' }}>
              <iframe
                title="Venue map"
                src={`https://www.google.com/maps?q=${encodeURIComponent(settings.map_query ?? settings.venue_name ?? '')}&output=embed`}
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, minHeight: 320, filter: 'invert(0.9) hue-rotate(180deg) contrast(0.9)' }}
              />
            </div>
            <div style={{ background: c.card, border: `1px solid ${c.border}`, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
              <div>
                <div style={{ ...kicker, fontSize: 11, marginBottom: 6 }}>VENUE</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: c.textBright }}>{settings.venue_name}</div>
                <div style={{ fontSize: 14, color: c.muted, marginTop: 4 }}>{settings.venue_address}</div>
              </div>
              <div>
                <div style={{ ...kicker, fontSize: 11, marginBottom: 6 }}>WHEN</div>
                <div style={{ fontSize: 14, color: c.text }}>{dateLabel} · {timeLabel}</div>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.map_query ?? '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ border: `1px solid ${c.accent}`, color: c.accent, padding: '12px 24px', fontWeight: 700, letterSpacing: '0.05em', fontSize: 13, width: 'fit-content' }}
              >
                GET DIRECTIONS →
              </a>
            </div>
          </div>
        </section>

        {/* ---------------- REGISTER CTA ---------------- */}
        {settings.registration_open && settings.registration_url && (
          <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `32px ${pad} 96px` }}>
            <Reveal>
              <div style={{ background: `linear-gradient(135deg,#122036,${c.panel})`, border: `1px solid ${c.borderStrong}`, padding: 'clamp(26px,5vw,56px)', textAlign: 'center' }}>
                <div style={{ ...kicker, marginBottom: 16 }}>{settings.capacity_note?.toUpperCase() ?? 'SEATS ARE LIMITED'}</div>
                <h2 style={{ fontSize: 'clamp(28px,4.5vw,44px)', fontWeight: 800, margin: '0 0 16px' }}>
                  Reserve your spot — it&apos;s free
                </h2>
                <p style={{ color: '#a7b1c6', fontSize: 15, margin: '0 0 32px' }}>
                  Sheridan College students of every skill level are welcome. Bring a laptop and a friend.
                </p>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div aria-hidden style={{ position: 'absolute', inset: -6, border: `2px solid ${c.accent}`, pointerEvents: 'none', animation: 'pulseRing 1.8s ease-out infinite' }} />
                  <a
                    href={settings.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ position: 'relative', background: c.accent, color: c.bg, padding: '18px 40px', fontWeight: 700, letterSpacing: '0.05em', fontSize: 15, display: 'inline-block' }}
                  >
                    REGISTER NOW →
                  </a>
                </div>
              </div>
            </Reveal>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

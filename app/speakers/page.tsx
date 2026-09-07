import Image from 'next/image';
import type { Metadata } from 'next';
import { c, maxW, pad } from '@/lib/tokens';
import { getSettings, getSpeakers, mediaUrl } from '@/lib/queries';
import { GridBackdrop } from '@/components/site/GridBackdrop';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { AnnouncementBanner } from '@/components/site/AnnouncementBanner';
import { Reveal } from '@/components/site/Reveal';
import { TiltCard } from '@/components/site/TiltCard';

export const revalidate = 3600;
export const metadata: Metadata = { title: 'Speakers' };

export default async function SpeakersPage() {
  const [settings, speakers] = await Promise.all([getSettings(), getSpeakers()]);
  const empty = speakers.length === 0;

  return (
    <>
      <AnnouncementBanner />
      <Nav registrationUrl={settings?.registration_url ?? null} registrationOpen={settings?.registration_open ?? true} active="/speakers" />
      <GridBackdrop />

      <main style={{ position: 'relative', overflowX: 'hidden' }}>
        <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `88px ${pad} 24px` }}>
          <span style={{ fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700 }}>SPEAKERS</span>
          <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 800, margin: '14px 0 20px' }}>Taking the stage</h1>
          <p style={{ maxWidth: 640, color: '#a7b1c6', fontSize: 16, lineHeight: 1.6, margin: '0 0 20px' }}>
            {empty
              ? 'Speaker lineup is coming together. Check back soon — or follow our socials for the announcement.'
              : 'The builders and professionals joining us for Community Day.'}
          </p>
          {empty && (
            <span style={{ display: 'inline-flex', background: c.warnBg, border: `1px solid ${c.warnBorder}`, padding: '8px 16px' }}>
              <span style={{ fontSize: 12, letterSpacing: '0.06em', color: c.warn, fontWeight: 700 }}>LINEUP TO BE ANNOUNCED</span>
            </span>
          )}
        </section>

        <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `40px ${pad} 64px` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
            {(empty ? Array.from({ length: 6 }) : speakers).map((_, i) => {
              const sp = empty ? null : speakers[i];
              const url = sp ? mediaUrl('headshots', sp.headshot_path) : null;
              return (
                <Reveal key={sp?.id ?? i} delay={i * 60} style={{ flex: '1 1 240px', maxWidth: 320 }}>
                  <TiltCard
                    style={{
                      background: c.card,
                      border: `1px ${sp ? 'solid' : 'dashed'} ${sp ? c.border : c.borderStrong}`,
                      padding: 32, textAlign: 'center', height: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 18px',
                        background: c.panel, border: `1px solid ${c.border}`,
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      {url ? (
                        <Image src={url} alt={sp!.name} fill sizes="64px" style={{ objectFit: 'cover' }} />
                      ) : (
                        <>
                          <div style={{ position: 'absolute', inset: 0, background: 'conic-gradient(from 0deg,rgba(77,168,255,0.4),transparent 45%)', animation: 'radarSweep 2.4s linear infinite' }} />
                          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 4, height: 4, background: c.accent, borderRadius: '50%', transform: 'translate(-50%,-50%)', boxShadow: `0 0 6px ${c.accent}` }} />
                        </>
                      )}
                    </div>

                    {sp ? (
                      <>
                        <div style={{ fontSize: 16, fontWeight: 700, color: c.textBright, marginBottom: 6 }}>{sp.name}</div>
                        <div style={{ fontSize: 12, color: c.accent, fontWeight: 700, letterSpacing: '0.04em' }}>
                          {[sp.title, sp.company].filter(Boolean).join(' · ')}
                        </div>
                        {sp.topic && <div style={{ fontSize: 13, color: c.text, marginTop: 12, fontWeight: 600 }}>{sp.topic}</div>}
                        {sp.bio && <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.6, marginTop: 10 }}>{sp.bio}</p>}
                        {sp.linkedin_url && (
                          <a href={sp.linkedin_url} target="_blank" rel="noopener noreferrer" className="link-arrow" style={{ fontSize: 11, letterSpacing: '0.05em', fontWeight: 700, display: 'inline-flex', marginTop: 12 }}>
                            LINKEDIN <span className="link-arrow__icon">→</span>
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#5b6885', letterSpacing: '0.04em', marginBottom: 6 }}>
                          SPEAKER {i + 1}
                        </div>
                        <div style={{ fontSize: 12, color: c.faint }}>Announcement coming soon</div>
                      </>
                    )}
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `24px ${pad} 96px` }}>
          <Reveal>
            <div style={{ background: `linear-gradient(135deg,#122036,${c.panel})`, border: `1px solid ${c.borderStrong}`, padding: 'clamp(24px,4vw,44px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700, marginBottom: 10 }}>
                  GOT SOMETHING TO SHARE?
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: c.textBright }}>Want to speak at Community Day?</div>
              </div>
              <a
                href="mailto:awssbg.sheridan@gmail.com?subject=Speaking%20at%20AWS%20Community%20Day"
                style={{ border: `1px solid ${c.accent}`, color: c.accent, padding: '14px 28px', fontWeight: 700, letterSpacing: '0.05em', fontSize: 13, whiteSpace: 'nowrap' }}
              >
                GET IN TOUCH →
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}

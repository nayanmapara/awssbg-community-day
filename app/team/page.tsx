import Image from 'next/image';
import type { Metadata } from 'next';
import { c, maxW, pad } from '@/lib/tokens';
import { getSettings, getTeam, mediaUrl } from '@/lib/queries';
import { GridBackdrop } from '@/components/site/GridBackdrop';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { AnnouncementBanner } from '@/components/site/AnnouncementBanner';
import { Reveal } from '@/components/site/Reveal';
import { TiltCard } from '@/components/site/TiltCard';
import { PageHero } from '@/components/site/PageHero';

export const revalidate = 3600;
export const metadata: Metadata = { title: 'Team' };

const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export default async function TeamPage() {
  const [settings, people] = await Promise.all([getSettings(), getTeam()]);
  const team = people.filter((m) => m.tier !== 'alumni');

  return (
    <>
      <AnnouncementBanner />
      <Nav registrationUrl={settings?.registration_url ?? null} registrationOpen={settings?.registration_open ?? true} active="/team" />
      <GridBackdrop />

      <main style={{ position: 'relative', overflowX: 'hidden' }}>
        <PageHero kicker="TEAM" title="The people behind Community Day">
          The AWS Student Builder Group at Sheridan College is organising this year&apos;s Community Day.
        </PageHero>

        <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `40px ${pad} 96px` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
            {team.map((m, i) => {
              const url = mediaUrl('headshots', m.headshot_path);
              return (
                <Reveal key={m.id} delay={i * 60} style={{ flex: '1 1 260px', maxWidth: 340 }}>
                  <TiltCard style={{ background: c.card, border: `1px solid ${c.border}`, padding: 28, height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div
                        style={{
                          width: 56, height: 56, background: url ? c.panel : c.accent, color: c.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 18, position: 'relative', overflow: 'hidden',
                        }}
                      >
                        {url
                          ? <Image src={url} alt={m.name} fill sizes="56px" style={{ objectFit: 'cover' }} />
                          : (m.initials || initials(m.name))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.accent, animation: 'blink 1.8s step-end infinite' }} />
                        <span style={{ fontSize: 10, color: c.faint, letterSpacing: '0.06em', fontWeight: 700 }}>
                          CREW-{String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: c.textBright, marginBottom: 6 }}>{m.name}</div>
                    {m.role_label && (
                      <div style={{ fontSize: 12, color: c.accent, fontWeight: 700, letterSpacing: '0.04em' }}>{m.role_label}</div>
                    )}
                    {m.title_label && (
                      <div style={{ fontSize: 11, color: c.mutedDim, letterSpacing: '0.06em', marginBottom: 14 }}>{m.title_label}</div>
                    )}
                    {m.bio && <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.6 }}>{m.bio}</div>}
                    {m.linkedin_url && (
                      <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" className="link-arrow" style={{ fontSize: 11, letterSpacing: '0.05em', fontWeight: 700, display: 'inline-flex', marginTop: 14 }}>
                        LINKEDIN <span className="link-arrow__icon">→</span>
                      </a>
                    )}
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { c, maxW, pad } from '@/lib/tokens';
import { getSettings, getTeam, mediaUrl } from '@/lib/queries';
import { GridBackdrop } from '@/components/site/GridBackdrop';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { AnnouncementBanner } from '@/components/site/AnnouncementBanner';
import { Reveal } from '@/components/site/Reveal';

export const revalidate = 3600;
export const metadata: Metadata = { title: 'Members' };

const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export default async function MembersPage() {
  const [settings, members] = await Promise.all([getSettings(), getTeam('member')]);
  const empty = members.length === 0;

  return (
    <>
      <AnnouncementBanner />
      <Nav registrationUrl={settings?.registration_url ?? null} registrationOpen={settings?.registration_open ?? true} />
      <GridBackdrop />

      <main style={{ position: 'relative', overflowX: 'hidden' }}>
        <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `88px ${pad} 24px` }}>
          <Link href="/team" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>← BACK TO TEAM</Link>
          <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 800, margin: '18px 0 20px' }}>
            {members.length > 0 ? `${members.length} members strong` : 'Our members'}
          </h1>
          <p style={{ maxWidth: 640, color: '#a7b1c6', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
            Beyond our leads, the AWS Student Builder Group is powered by a growing community of
            Sheridan College members.
          </p>
        </section>

        <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `40px ${pad} 64px` }}>
          {empty ? (
            <Reveal>
              <div style={{ background: c.card, border: `1px dashed ${c.borderStrong}`, padding: 'clamp(26px,5vw,56px)', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: c.faint, letterSpacing: '0.06em', fontWeight: 700, marginBottom: 12 }}>MEMBER DIRECTORY</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: c.mutedDim }}>Coming soon</div>
              </div>
            </Reveal>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }}>
              {members.map((m, i) => {
                const url = mediaUrl('headshots', m.headshot_path);
                return (
                  <Reveal key={m.id} delay={i * 30}>
                    <div style={{ background: c.panel, border: `1px solid ${c.borderMid}`, padding: 18, textAlign: 'center' }}>
                      <div
                        style={{
                          width: 44, height: 44, margin: '0 auto 12px',
                          background: url ? c.card : c.accent, color: c.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 14, position: 'relative', overflow: 'hidden',
                        }}
                      >
                        {url
                          ? <Image src={url} alt={m.name} fill sizes="44px" style={{ objectFit: 'cover' }} />
                          : (m.initials || initials(m.name))}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: c.textBright }}>{m.name}</div>
                      {m.role_label && (
                        <div style={{ fontSize: 10, color: c.mutedDim, letterSpacing: '0.05em', marginTop: 4 }}>{m.role_label}</div>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>

        <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `24px ${pad} 96px` }}>
          <Reveal>
            <div style={{ background: `linear-gradient(135deg,#122036,${c.panel})`, border: `1px solid ${c.borderStrong}`, padding: 'clamp(24px,4vw,44px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700, marginBottom: 10 }}>JOIN THE COMMUNITY</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: c.textBright }}>Want to become a member?</div>
              </div>
              <a href="https://discord.com/invite/TfzbXUCp3y" target="_blank" rel="noopener noreferrer" style={{ border: `1px solid ${c.accent}`, color: c.accent, padding: '14px 28px', fontWeight: 700, letterSpacing: '0.05em', fontSize: 13, whiteSpace: 'nowrap' }}>
                JOIN OUR DISCORD →
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}

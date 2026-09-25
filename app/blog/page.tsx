import type { Metadata } from 'next';
import { c, maxW, pad } from '@/lib/tokens';
import { getSettings } from '@/lib/queries';
import { GridBackdrop } from '@/components/site/GridBackdrop';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { AnnouncementBanner } from '@/components/site/AnnouncementBanner';
import { Reveal } from '@/components/site/Reveal';
import { PageHero } from '@/components/site/PageHero';

export const revalidate = 3600;
export const metadata: Metadata = { title: 'Blog' };

export default async function BlogPage() {
  const settings = await getSettings();

  return (
    <>
      <AnnouncementBanner />
      <Nav registrationUrl={settings?.registration_url ?? null} registrationOpen={settings?.registration_open ?? true} active="/blog" />
      <GridBackdrop />

      <main style={{ position: 'relative', overflowX: 'hidden' }}>
        <PageHero kicker="BLOG" title="Stories from the builders">
          Articles and updates from the AWS Student Builder Group at Sheridan College.
        </PageHero>

        <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `40px ${pad} 96px` }}>
          <Reveal>
            <div style={{ background: c.card, border: `1px dashed ${c.borderStrong}`, padding: 'clamp(26px,5vw,56px)', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: c.faint, letterSpacing: '0.06em', fontWeight: 700, marginBottom: 12 }}>COMING SOON</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c.mutedDim }}>Posts will land here shortly.</div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import { maxW, pad } from '@/lib/tokens';
import { getSettings } from '@/lib/queries';
import { GridBackdrop } from '@/components/site/GridBackdrop';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { AnnouncementBanner } from '@/components/site/AnnouncementBanner';
import { PageHero } from '@/components/site/PageHero';
import { BuilderProfileForm } from '@/components/site/BuilderProfileForm';

export const metadata: Metadata = { title: 'Builder Profile' };

export default async function BuilderProfilePage() {
  const settings = await getSettings();

  return (
    <>
      <AnnouncementBanner />
      <Nav
        registrationUrl={settings?.registration_url ?? null}
        registrationOpen={settings?.registration_open ?? true}
        active="/builder-profile"
      />
      <GridBackdrop />

      <main style={{ position: 'relative', overflowX: 'hidden' }}>
        <PageHero kicker="BUILDER PROFILE" title="Join the builder roster">
          Enter your name and email so we can keep a roster of student builders.
        </PageHero>

        <section
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: maxW,
            margin: '0 auto',
            padding: `24px ${pad} 96px`,
          }}
        >
          <BuilderProfileForm />
        </section>
      </main>

      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import { getSettings } from '@/lib/queries';
import { createPublicClient } from '@/lib/supabase/server';
import { GridBackdrop } from '@/components/site/GridBackdrop';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { AnnouncementBanner } from '@/components/site/AnnouncementBanner';
import { LuckyDrawLaunch, type LuckyDrawEntrant } from '@/components/site/LuckyDrawLaunch';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Lucky Draw',
  robots: { index: false, follow: false },
};

export default async function LuckyDrawPage() {
  const settings = await getSettings();
  const supabase = createPublicClient();

  const { data } = await supabase
    .from('lucky_draw_roster')
    .select('id, display_name')
    .order('display_name', { ascending: true });

  return (
    <>
      <AnnouncementBanner />
      <Nav
        registrationUrl={settings?.registration_url ?? null}
        registrationOpen={settings?.registration_open ?? true}
      />
      <GridBackdrop />

      <main style={{ position: 'relative', overflowX: 'hidden', paddingTop: 24 }}>
        <LuckyDrawLaunch entrants={(data ?? []) as LuckyDrawEntrant[]} />
      </main>

      <Footer />
    </>
  );
}

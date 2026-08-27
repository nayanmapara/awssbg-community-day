import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getSettings } from '@/lib/queries';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s?.name ?? 'AWS Community Day @ Sheridan College';
  const description =
    s?.hero_subline ??
    'A full day of AWS learning, hands-on labs, and community for Sheridan College students.';

  return {
    title: { default: title, template: '%s · ' + title },
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0f1c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

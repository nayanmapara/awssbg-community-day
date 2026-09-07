import Link from 'next/link';
import { c, maxW, pad } from '@/lib/tokens';
import { ChipLogo } from '@/components/site/ChipLogo';
import { SbgIcon } from '@/components/site/SbgIcon';

const SOCIALS = [
  { href: 'https://discord.com/invite/TfzbXUCp3y', label: 'Discord' },
  { href: 'https://linkedin.com/company/aws-cloud-club-sc', label: 'LinkedIn' },
  { href: 'https://www.instagram.com/awssbg.sheridan/', label: 'Instagram' },
];

const PAGES = [
  { href: '/#about', label: 'About' },
  { href: '/#agenda', label: 'Agenda' },
  { href: '/speakers', label: 'Speakers' },
  { href: '/team', label: 'Team' },
  { href: '/members', label: 'Members' },
];

export function Footer() {
  return (
    <footer style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${c.line}` }}>
      <div
        style={{
          maxWidth: maxW, margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
          gap: 40, padding: `56px ${pad} 40px`,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <ChipLogo size={28} />
            <div>
              <div style={{ fontWeight: 700, letterSpacing: '0.06em', fontSize: 13, color: c.textBright, lineHeight: 1.35 }}>
                AWS STUDENT BUILDER GROUP
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.08em', color: c.accent, fontWeight: 600, marginTop: 4 }}>
                SHERIDAN COLLEGE
              </div>
            </div>
          </div>
          <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.7, maxWidth: 320, margin: 0 }}>
            The AWS Student Builder Group at Sheridan College helps students learn cloud computing,
            build real projects, and connect with the AWS community.
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, letterSpacing: '0.05em', color: c.text, fontSize: 12, marginBottom: 14 }}>
            <SbgIcon name="Key" color="Blue" size={16} />
            PAGES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PAGES.map((p) => (
              <Link key={p.href} href={p.href} className="footer-link" style={{ fontSize: 13 }}>{p.label}</Link>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, letterSpacing: '0.05em', color: c.text, fontSize: 12, marginBottom: 14 }}>
            <SbgIcon name="Teams" color="Mint" size={16} />
            CONNECT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SOCIALS.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="footer-link" style={{ fontSize: 13 }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div
        className="footer-energy"
        style={{
          color: c.bg, textAlign: 'center', padding: 14,
          fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
        }}
      >
        AWS STUDENT BUILDER GROUP AT SHERIDAN COLLEGE
      </div>
    </footer>
  );
}

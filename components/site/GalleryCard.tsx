import Image from 'next/image';
import { c } from '@/lib/tokens';
import { TiltCard } from '@/components/site/TiltCard';

/** Gallery tile with Ken Burns zoom on hover when a photo is present. */
export function GalleryCard({
  url,
  alt,
}: {
  url: string | null;
  alt: string;
}) {
  return (
    <TiltCard
      strength={10}
      style={{
        height: 220,
        position: 'relative',
        overflow: 'hidden',
        border: `1px ${url ? 'solid' : 'dashed'} ${url ? c.border : c.borderStrong}`,
        background: c.panel,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {url ? (
        <div className="gallery-photo">
          <Image src={url} alt={alt} fill sizes="(max-width:720px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
        </div>
      ) : (
        <span style={{ color: c.faint, fontSize: 11, letterSpacing: '0.06em' }}>PHOTO COMING SOON</span>
      )}
    </TiltCard>
  );
}

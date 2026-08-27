import type { Metadata } from 'next';
import { CollectionScreen } from '@/components/admin/CollectionScreen';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Team & Members · Admin' };

export default function Page() {
  return <CollectionScreen collection="team" />;
}

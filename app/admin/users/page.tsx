import type { Metadata } from 'next';
import { CollectionScreen } from '@/components/admin/CollectionScreen';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Users & Roles · Admin' };

export default function Page() {
  return <CollectionScreen collection="users" />;
}

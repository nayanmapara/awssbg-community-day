import { notFound } from 'next/navigation';
import { requireProfile, can, CAN_PUBLISH } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { COLLECTIONS } from '@/lib/collections';
import { CollectionTable } from '@/components/admin/CollectionTable';

/**
 * One screen serves every content collection. Each /admin/<section>/page.tsx is
 * a three-line wrapper around this, so sections are explicit static routes
 * rather than one dynamic segment.
 */
export async function CollectionScreen({ collection }: { collection: string }) {
  const spec = COLLECTIONS[collection];
  if (!spec) notFound();

  const profile = await requireProfile();
  if (!can(profile.role, collection)) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from(spec.table)
    .select('*')
    .neq('status', 'archived')
    .order('sort_order', { ascending: true });

  return (
    <CollectionTable
      spec={spec}
      rows={(data ?? []) as never}
      canEdit={spec.roles.includes(profile.role)}
      canPublish={CAN_PUBLISH.includes(profile.role)}
      isOwner={profile.role === 'owner'}
    />
  );
}

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
  // profiles (the "users" collection) has neither a status nor a sort_order
  // column — content collections are the ones with the draft/publish/archive
  // and manual-ordering model, users are access control instead.
  let query = supabase.from(spec.table).select('*');
  if (spec.table !== 'profiles') query = query.neq('status', 'archived');
  query = spec.reorderable === false
    ? query.order(spec.labelField, { ascending: true })
    : query.order('sort_order', { ascending: true });
  const { data } = await query;

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

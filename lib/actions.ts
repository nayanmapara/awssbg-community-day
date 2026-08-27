'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from './supabase/server';
import { requireProfile } from './auth';
import { can, CAN_PUBLISH } from './auth';
import { COLLECTIONS, PUBLISHABLE } from './collections';

function specOf(key: string) {
  const spec = COLLECTIONS[key];
  if (!spec) throw new Error('Unknown collection: ' + key);
  return spec;
}

async function guard(key: string) {
  const profile = await requireProfile();
  if (!can(profile.role, key)) throw new Error('Not permitted');
  return profile;
}

function revalidate(paths: string[]) {
  paths.forEach((p) => revalidatePath(p));
}

/** Create or update one record. Empty strings are stored as NULL. */
export async function upsertRecord(
  key: string,
  id: string | null,
  values: Record<string, string>,
  publish: boolean
) {
  await guard(key);
  const spec = specOf(key);
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};
  for (const field of spec.fields) {
    const raw = values[field.key];
    if (raw === undefined) continue;
    payload[field.key] = raw === '' ? null : raw;
  }
  if (spec.table !== 'profiles') payload.status = publish ? 'published' : 'draft';

  if (id) {
    const { error } = await supabase.from(spec.table).update(payload).eq('id', id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { count } = await supabase
      .from(spec.table).select('id', { count: 'exact', head: true });
    payload.sort_order = (count ?? 0) + 1;
    const { error } = await supabase.from(spec.table).insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidate(spec.revalidate);
  revalidatePath('/admin/' + key);
  return { ok: true };
}

export async function setStatus(key: string, id: string, status: 'draft' | 'published') {
  const profile = await guard(key);
  if (status === 'published' && !CAN_PUBLISH.includes(profile.role)) {
    return { ok: false, error: 'Your role cannot publish — ask an admin to review.' };
  }
  const spec = specOf(key);
  const supabase = await createClient();
  const { error } = await supabase.from(spec.table).update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidate(spec.revalidate);
  revalidatePath('/admin/' + key);
  return { ok: true };
}

/** Editors archive; only the owner can hard-delete (enforced again by RLS). */
export async function archiveRecord(key: string, id: string) {
  await guard(key);
  const spec = specOf(key);
  const supabase = await createClient();
  const { error } = await supabase.from(spec.table).update({ status: 'archived' }).eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidate(spec.revalidate);
  revalidatePath('/admin/' + key);
  return { ok: true };
}

export async function deleteRecord(key: string, id: string) {
  const profile = await guard(key);
  if (profile.role !== 'owner') return { ok: false, error: 'Only the owner can delete.' };
  const spec = specOf(key);
  const supabase = await createClient();
  const { error } = await supabase.from(spec.table).delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidate(spec.revalidate);
  revalidatePath('/admin/' + key);
  return { ok: true };
}

/** Swap sort_order with the neighbour above/below. */
export async function reorder(key: string, id: string, direction: -1 | 1) {
  await guard(key);
  const spec = specOf(key);
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from(spec.table).select('id, sort_order')
    .neq('status', 'archived').order('sort_order');
  if (!rows) return { ok: false, error: 'Could not load order' };

  const i = rows.findIndex((r) => r.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= rows.length) return { ok: true };

  await supabase.from(spec.table).update({ sort_order: rows[j].sort_order }).eq('id', rows[i].id);
  await supabase.from(spec.table).update({ sort_order: rows[i].sort_order }).eq('id', rows[j].id);

  revalidate(spec.revalidate);
  revalidatePath('/admin/' + key);
  return { ok: true };
}

/** Publish every pending draft across all content tables. */
export async function publishAll() {
  const profile = await requireProfile();
  if (!CAN_PUBLISH.includes(profile.role)) {
    return { ok: false, error: 'Your role cannot publish.' };
  }
  const supabase = await createClient();
  const paths = new Set<string>(['/']);

  for (const key of PUBLISHABLE) {
    if (!can(profile.role, key)) continue;
    const spec = COLLECTIONS[key];
    const { error } = await supabase
      .from(spec.table).update({ status: 'published' }).eq('status', 'draft');
    if (error) return { ok: false, error: error.message };
    spec.revalidate.forEach((p) => paths.add(p));
  }

  revalidate([...paths]);
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

export async function updateSettings(values: Record<string, string>) {
  const profile = await requireProfile();
  if (!can(profile.role, 'settings')) throw new Error('Not permitted');

  const supabase = await createClient();
  const payload: Record<string, unknown> = { ...values };
  if ('registration_open' in payload) {
    payload.registration_open = payload.registration_open === 'true';
  }
  const { error } = await supabase.from('event_settings').update(payload).eq('id', true);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/');
  revalidatePath('/admin/settings');
  return { ok: true };
}

export async function toggleUserActive(id: string, active: boolean) {
  const profile = await requireProfile();
  if (profile.role !== 'owner') return { ok: false, error: 'Owner only.' };
  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ active }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/users');
  return { ok: true };
}

/** Door check-in. Duplicate ticket codes are rejected by a unique index. */
export async function checkIn(name: string, code: string, source: 'qr' | 'manual') {
  const profile = await requireProfile();
  if (!can(profile.role, 'checkin')) throw new Error('Not permitted');

  const supabase = await createClient();
  const { error } = await supabase.from('checkins').insert({
    attendee_name: name.trim() || 'Walk-in',
    ticket_code: code.trim() || null,
    source,
    checked_in_by: profile.id,
  });

  if (error) {
    const duplicate = error.code === '23505' || /duplicate/i.test(error.message);
    return { ok: false, error: duplicate ? 'Already checked in.' : error.message };
  }
  revalidatePath('/admin/checkin');
  return { ok: true };
}

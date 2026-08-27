import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import type { Profile } from './types';

export { ROLE_ACCESS, ROLE_LABELS, CAN_PUBLISH, can } from './roles';
import { can } from './roles';

/** Server-side guard. Redirects to /login when there is no active profile. */
export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();

  // A 'pending' or deactivated account is treated exactly like no account.
  // /login itself derives the pending state from the database and renders
  // the "access pending" screen, so no query flag is needed here.
  if (!profile || !profile.active || profile.role === 'pending') {
    redirect('/login');
  }
  return profile as Profile;
}

export async function requireSection(section: string): Promise<Profile> {
  const profile = await requireProfile();
  if (!can(profile.role, section)) redirect('/admin');
  return profile;
}

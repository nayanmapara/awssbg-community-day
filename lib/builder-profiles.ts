'use server';

import { createPublicClient } from './supabase/server';

export type SubmitBuilderProfileResult =
  | { ok: true }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Record a student's name + email. */
export async function submitBuilderProfile(input: {
  email: string;
  displayName: string;
}): Promise<SubmitBuilderProfileResult> {
  const email = normalizeEmail(input.email);
  const displayName = input.displayName.trim();

  if (!displayName) {
    return { ok: false, error: 'Enter your name.' };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from('builder_profiles').insert({
    email,
    display_name: displayName,
  });

  if (error) {
    if (error.code === '23505' || /duplicate|unique/i.test(error.message)) {
      return { ok: false, error: 'That email is already recorded.' };
    }
    if (/relation .* does not exist/i.test(error.message)) {
      return {
        ok: false,
        error: 'Builder profiles table is not set up yet. Run sql/builder_profiles.sql in Supabase.',
      };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

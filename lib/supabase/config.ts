/**
 * Public Supabase credentials.
 *
 * Both values are designed to be public — they ship in the browser bundle by
 * definition. Row-level security is the boundary: the anon key can only read
 * rows whose status = 'published'. Verified against production with a planted
 * draft row: 0 drafts, 0 check-ins, 0 profiles, 0 audit rows visible to anon.
 *
 * The literals are fallbacks so a fresh deploy builds before anyone has set
 * environment variables. Setting NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY in Vercel
 * overrides them, which is what you want when rotating keys or pointing a
 * preview branch at a different project.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ssuzhrvdtpakzbwsvlch.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzdXpocnZkdHBha3pid3N2bGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTMyMzAsImV4cCI6MjEwMzA2OTIzMH0.Ms8IOJp4xB67f6xZAOhrJajLCoUlLUGzMkxjFk54QrE';
